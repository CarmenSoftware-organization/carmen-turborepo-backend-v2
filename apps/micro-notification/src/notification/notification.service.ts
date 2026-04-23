import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient_SYSTEM_CUSTOM } from '@repo/prisma-shared-schema-platform';
import type { PrismaClient } from '@repo/prisma-shared-schema-platform';
import { z } from 'zod';
import { EmailService, type EmailConfig } from '../email/email.service';
import { decryptSecret } from '../common/crypto.util';

// ─── Zod schema for report_email config in tb_application_config ───
const EmailSmtpSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1),
  password: z.string().min(1),
  from: z.string(),
  enabled: z.boolean(),
});

const NotificationEmailConfigSchema = z.object({
  smtp: EmailSmtpSchema,
  recipients: z.array(z.string().email()).optional(),
  cc: z.array(z.string().email()).optional(),
  subject_prefix: z.string().optional(),
});

export type NotificationEmailConfig = z.infer<typeof NotificationEmailConfigSchema>;

const SCHEMA_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// ─── In-memory config cache ───
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
  config: NotificationEmailConfig | null;
  expiresAt: number;
}
const buConfigCache = new Map<string, CacheEntry>();

function errMsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export interface CreateSystemNotificationData {
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  scheduled_at?: Date;
  userIds?: string[];
}

export interface CreateUserNotificationData {
  from_user_id: string;
  to_user_id: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  scheduled_at?: Date;
}

export interface CreateBusinessUnitNotificationData {
  bu_code: string;
  from_user_id?: string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
  scheduled_at?: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private prismaPromise: Promise<PrismaClient>;

  constructor(private readonly emailService: EmailService) {
    this.prismaPromise = PrismaClient_SYSTEM_CUSTOM(process.env.SYSTEM_DATABASE_URL!);
  }

  private async getPrisma() {
    return this.prismaPromise;
  }

  /**
   * Create a system-wide notification for all or specific users
   */
  async createSystemNotification(data: CreateSystemNotificationData) {
    const prisma = await this.getPrisma();

    let users;
    if (data.userIds && data.userIds.length > 0) {
      users = await prisma.tb_user.findMany({
        where: { id: { in: data.userIds } },
      });
    } else {
      users = await prisma.tb_user.findMany();
    }

    const notifications = [];

    for (const user of users) {
      const notification = await prisma.tb_notification.create({
        data: {
          to_user_id: user.id,
          from_user_id: null,
          title: data.title,
          message: data.message,
          type: data.type,
          category: 'system',
          scheduled_at: data.scheduled_at,
          metadata: data.metadata,
        },
      });
      notifications.push(notification);
    }

    // Send email if metadata has email config
    await this.trySendEmail(data, users.map((u) => u.email).filter(Boolean));

    return notifications;
  }

  /**
   * Create a user-to-user notification
   */
  async createUserNotification(data: CreateUserNotificationData) {
    const prisma = await this.getPrisma();

    const notification = await prisma.tb_notification.create({
      data: {
        to_user_id: data.to_user_id,
        from_user_id: data.from_user_id,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        type: data.type,
        category: 'user-to-user',
        scheduled_at: data.scheduled_at,
      },
    });

    // Send email to recipient
    const user = await prisma.tb_user.findFirst({ where: { id: data.to_user_id } });
    if (user?.email) {
      await this.trySendEmail(data, [user.email]);
    }

    return notification;
  }

  /**
   * Get users belonging to a specific business unit
   */
  async getUsersByBusinessUnitCode(bu_code: string) {
    const prisma = await this.getPrisma();

    const businessUnit = await prisma.tb_business_unit.findFirst({
      where: { code: bu_code },
    });

    if (!businessUnit) {
      return [];
    }

    const userBusinessUnits = await prisma.tb_user_tb_business_unit.findMany({
      where: { business_unit_id: businessUnit.id },
      include: {
        tb_user_tb_user_tb_business_unit_user_idTotb_user: true,
      },
    });

    const users = userBusinessUnits
      .filter((ub) => ub.tb_user_tb_user_tb_business_unit_user_idTotb_user !== null)
      .map((ub) => ub.tb_user_tb_user_tb_business_unit_user_idTotb_user!);

    return users;
  }

  /**
   * Create notifications for all users in a business unit
   */
  async createBusinessUnitNotification(data: CreateBusinessUnitNotificationData) {
    const prisma = await this.getPrisma();

    const users = await this.getUsersByBusinessUnitCode(data.bu_code);
    const notifications = [];

    for (const user of users) {
      const notification = await prisma.tb_notification.create({
        data: {
          to_user_id: user.id,
          from_user_id: data.from_user_id || null,
          title: data.title,
          message: data.message,
          type: data.type,
          category: 'business-unit',
          metadata: {
            ...data.metadata,
            bu_code: data.bu_code,
          },
          scheduled_at: data.scheduled_at,
        },
      });
      notifications.push(notification);
    }

    // Send email to BU users
    const emails = users.map((u) => u.email).filter(Boolean);
    if (emails.length > 0) {
      await this.trySendEmailForBU(data, emails);
    }

    return notifications;
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(user_id: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.findMany({
      where: { to_user_id: user_id, is_read: false },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Mark a single notification as read
   */
  async markNotificationAsRead(notificationId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });
  }

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllNotificationsAsRead(user_id: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.updateMany({
      where: { to_user_id: user_id, is_read: false },
      data: { is_read: true },
    });
  }

  /**
   * Get scheduled notifications that are due for sending
   */
  async getScheduledNotifications() {
    const prisma = await this.getPrisma();
    const now = new Date();
    return await prisma.tb_notification.findMany({
      where: { scheduled_at: { lte: now }, is_sent: false },
      include: { tb_user_tb_notification_to_user_idTotb_user: true },
    });
  }

  /**
   * Mark a notification as sent
   */
  async markNotificationAsSent(notificationId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.update({
      where: { id: notificationId },
      data: { is_sent: true },
    });
  }

  /**
   * Get all users who have unread notifications
   */
  async getUsersWithUnreadNotifications() {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.findMany({
      where: {
        tb_notification_tb_notification_to_user_idTotb_user: {
          some: { is_read: false },
        },
      },
      include: {
        tb_notification_tb_notification_to_user_idTotb_user: {
          where: { is_read: false },
        },
      },
    });
  }

  async getAllUsers() {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.findMany();
  }

  async getUserById(userId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_user.findFirst({ where: { id: userId } });
  }

  async getAllNotifications(userId: string) {
    const prisma = await this.getPrisma();
    return await prisma.tb_notification.findMany({
      where: { to_user_id: userId },
    });
  }

  async updateUserOnlineStatus(user_id: string, isOnline: boolean) {
    const prisma = await this.getPrisma();
    return await prisma.tb_user
      .update({
        where: { id: user_id },
        data: { is_online: isOnline },
      })
      .catch(() => {});
  }

  // ─── Email Integration ───

  /**
   * Try to send email notification using config from metadata
   * Email config comes from tb_application_config (key: 'report_email').
   * Priority:
   *   1. metadata.email_config — inline SMTP (legacy micro-report path)
   *   2. metadata.bu_code      — load report_email from that BU's tenant DB
   *
   * If metadata.notify_email is explicitly false, skip sending entirely so
   * callers can opt out even when a config is available.
   */
  private async trySendEmail(
    data: { title: string; message: string; metadata?: Record<string, unknown> },
    recipientEmails: string[],
  ) {
    try {
      if (data.metadata?.notify_email === false) return;

      let emailConfig = this.extractEmailConfig(data.metadata);
      if (!emailConfig && typeof data.metadata?.bu_code === 'string') {
        emailConfig = await this.loadBUEmailConfig(data.metadata.bu_code);
      }
      if (!emailConfig) return;

      const isReport = data.metadata?.source === 'micro-report';
      const metaStatus = data.metadata?.status;
      const status: 'success' | 'failure' =
        metaStatus === 'failure' || metaStatus === 'failed' ? 'failure' : 'success';

      const html = isReport
        ? this.emailService.buildReportEmailHtml({
            title: data.title,
            message: data.message,
            jobId: data.metadata?.job_id as string,
            fileUrl: data.metadata?.file_url as string,
            status,
          })
        : this.emailService.buildNotificationEmailHtml(data.title, data.message);

      // Use recipients from config, fallback to user emails
      const to =
        (emailConfig.recipients?.length ?? 0) > 0
          ? emailConfig.recipients!
          : recipientEmails;

      if (to.length === 0) return;

      await this.emailService.sendEmail(emailConfig.smtp as EmailConfig, {
        to,
        cc: emailConfig.cc,
        subject: data.title,
        subjectPrefix: emailConfig.subject_prefix,
        html,
        text: data.message,
      });
    } catch (error) {
      this.logger.warn(`Email send attempt failed: ${errMsg(error)}`);
    }
  }

  /**
   * Try to send email for BU notification — loads config from tb_application_config
   */
  private async trySendEmailForBU(
    data: CreateBusinessUnitNotificationData,
    recipientEmails: string[],
  ) {
    try {
      // Load email config from tenant DB (tb_application_config)
      const config = await this.loadBUEmailConfig(data.bu_code);
      if (!config) return;

      const html = this.emailService.buildNotificationEmailHtml(data.title, data.message);

      const to =
        (config.recipients?.length ?? 0) > 0 ? config.recipients! : recipientEmails;
      if (to.length === 0) return;

      await this.emailService.sendEmail(config.smtp as EmailConfig, {
        to,
        cc: config.cc,
        subject: data.title,
        subjectPrefix: config.subject_prefix,
        html,
        text: data.message,
      });
    } catch (error) {
      this.logger.warn(`BU email send failed: ${errMsg(error)}`);
    }
  }

  /**
   * Load report_email config from tb_application_config for a BU
   */
  private async loadBUEmailConfig(buCode: string): Promise<NotificationEmailConfig | null> {
    // Check cache first
    const cached = buConfigCache.get(buCode);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.config;
    }

    try {
      const prisma = await this.getPrisma();

      // Get tenant DB connection from tb_business_unit
      const bu = await prisma.tb_business_unit.findFirst({
        where: { code: buCode },
      });
      if (!bu) {
        buConfigCache.set(buCode, { config: null, expiresAt: now + CONFIG_CACHE_TTL_MS });
        return null;
      }

      const dbConn = bu.db_connection as { schema?: string } | null;
      if (!dbConn || typeof dbConn !== 'object') return null;

      const schema = dbConn.schema;
      if (!schema || !SCHEMA_NAME_REGEX.test(schema)) {
        this.logger.warn(`Invalid tenant schema name for BU ${buCode}: ${schema}`);
        return null;
      }

      const result = await prisma.$queryRawUnsafe<Array<{ value: unknown }>>(
        `SELECT value FROM "${schema}".tb_application_config WHERE key = 'report_email' AND deleted_at IS NULL LIMIT 1`,
      );

      if (result.length === 0) {
        buConfigCache.set(buCode, { config: null, expiresAt: now + CONFIG_CACHE_TTL_MS });
        return null;
      }

      const config = this.parseAndDecryptConfig(result[0].value, `BU:${buCode}`);
      buConfigCache.set(buCode, { config, expiresAt: now + CONFIG_CACHE_TTL_MS });
      return config;
    } catch (error) {
      this.logger.warn(`Load BU email config failed for ${buCode}: ${errMsg(error)}`);
      return null;
    }
  }

  /**
   * Invalidate cached config for a BU (call after admin updates config)
   */
  invalidateBUEmailConfigCache(buCode?: string) {
    if (buCode) {
      buConfigCache.delete(buCode);
    } else {
      buConfigCache.clear();
    }
  }

  /**
   * Extract email config from notification metadata (passed by micro-report)
   */
  private extractEmailConfig(
    metadata?: Record<string, unknown>,
  ): NotificationEmailConfig | null {
    if (!metadata?.email_config) return null;
    return this.parseAndDecryptConfig(metadata.email_config, 'metadata');
  }

  /**
   * Validate raw config with Zod and decrypt SMTP password if encrypted.
   */
  private parseAndDecryptConfig(
    raw: unknown,
    source: string,
  ): NotificationEmailConfig | null {
    const parsed = NotificationEmailConfigSchema.safeParse(raw);
    if (!parsed.success) {
      this.logger.warn(
        `Invalid email config from ${source}: ${parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
      );
      return null;
    }

    const config = parsed.data;
    try {
      config.smtp.password = decryptSecret(config.smtp.password);
    } catch (error) {
      this.logger.error(
        `Failed to decrypt SMTP password from ${source}: ${errMsg(error)}`,
      );
      return null;
    }
    return config;
  }
}
