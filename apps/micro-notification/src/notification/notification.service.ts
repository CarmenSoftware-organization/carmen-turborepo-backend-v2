import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient_SYSTEM_CUSTOM } from '@repo/prisma-shared-schema-platform';
import type { PrismaClient } from '@repo/prisma-shared-schema-platform';
import { EmailService, type EmailConfig } from '../email/email.service';

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
   * Email config comes from tb_application_config (key: 'report_email')
   */
  private async trySendEmail(
    data: { title: string; message: string; metadata?: Record<string, unknown> },
    recipientEmails: string[],
  ) {
    try {
      const emailConfig = this.extractEmailConfig(data.metadata);
      if (!emailConfig) return;

      const isReport = data.metadata?.source === 'micro-report';
      const html = isReport
        ? this.emailService.buildReportEmailHtml({
            title: data.title,
            message: data.message,
            jobId: data.metadata?.job_id as string,
            fileUrl: data.metadata?.file_url as string,
            status: data.title.includes('Failed') ? 'failure' : 'success',
          })
        : this.emailService.buildNotificationEmailHtml(data.title, data.message);

      // Use recipients from config, fallback to user emails
      const to = emailConfig.recipients?.length > 0
        ? emailConfig.recipients
        : recipientEmails;

      if (to.length === 0) return;

      await this.emailService.sendEmail(emailConfig.smtp, {
        to,
        cc: emailConfig.cc,
        subject: data.title,
        subjectPrefix: emailConfig.subject_prefix,
        html,
        text: data.message,
      });
    } catch (error) {
      this.logger.warn(`Email send attempt failed: ${error.message}`);
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

      const to = config.recipients?.length > 0 ? config.recipients : recipientEmails;
      if (to.length === 0) return;

      await this.emailService.sendEmail(config.smtp, {
        to,
        cc: config.cc,
        subject: data.title,
        subjectPrefix: config.subject_prefix,
        html,
        text: data.message,
      });
    } catch (error) {
      this.logger.warn(`BU email send failed: ${error.message}`);
    }
  }

  /**
   * Load report_email config from tb_application_config for a BU
   */
  private async loadBUEmailConfig(buCode: string): Promise<any | null> {
    try {
      const prisma = await this.getPrisma();

      // Get tenant DB connection from tb_business_unit
      const bu = await prisma.tb_business_unit.findFirst({
        where: { code: buCode },
      });
      if (!bu) return null;

      // Query tb_application_config in tenant schema
      // Since we can't switch schema with Prisma, use raw query
      const dbConn = bu.db_connection as any;
      if (!dbConn) return null;

      const schema = typeof dbConn === 'object' ? dbConn.schema : null;
      if (!schema) return null;

      const result = await prisma.$queryRawUnsafe<any[]>(
        `SELECT value FROM "${schema}".tb_application_config WHERE key = 'report_email' AND deleted_at IS NULL LIMIT 1`,
      );

      if (result.length === 0) return null;
      return result[0].value;
    } catch (error) {
      this.logger.warn(`Load BU email config failed for ${buCode}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract email config from notification metadata (passed by micro-report)
   */
  private extractEmailConfig(metadata?: Record<string, unknown>): any | null {
    if (!metadata?.email_config) return null;
    return metadata.email_config as any;
  }
}
