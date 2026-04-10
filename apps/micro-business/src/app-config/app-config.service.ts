import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { TenantService } from '@/tenant/tenant.service';
import { encryptSecret, isEncrypted } from '@/common/crypto.util';
import { NotificationService } from '@/common/services/notification.service';

const KEY_REGEX = /^[a-zA-Z0-9_.-]+$/;
const MASK = '***ENCRYPTED***';

// Per-key Zod schemas. Unknown keys are accepted as-is (passthrough JSON).
const ReportEmailSchema = z.object({
  smtp: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    username: z.string().min(1),
    password: z.string().min(1),
    from: z.string(),
    enabled: z.boolean(),
  }),
  recipients: z.array(z.string().email()).optional(),
  cc: z.array(z.string().email()).optional(),
  subject_prefix: z.string().optional(),
});

/**
 * Approval flow for PR/PO documents.
 *
 * `approvers` is an ordered list of approval stages. Each stage has one or
 * more candidate user_ids — any one of them approving satisfies the stage.
 *
 * `min_required_last_n` (optional): if set, only the LAST N stages (by order
 * descending) are required for the document to pass — earlier stages become
 * optional shortcuts. Example: 5 stages with min_required_last_n=2 means
 * approving just stages 4 and 5 is enough. Omit (or set to total stage count)
 * to require every stage in sequence.
 */
const ApprovalFlowSchema = z
  .object({
    approvers: z
      .array(
        z.object({
          order: z.number().int().min(1),
          name: z.string().min(1),
          user_ids: z.array(z.string().uuid()).min(1),
        }),
      )
      .min(1),
    min_required_last_n: z.number().int().min(1).optional(),
  })
  .refine(
    (v) => v.min_required_last_n === undefined || v.min_required_last_n <= v.approvers.length,
    { message: 'min_required_last_n must be <= approvers.length' },
  )
  .refine(
    (v) => {
      const orders = v.approvers.map((a) => a.order);
      return new Set(orders).size === orders.length;
    },
    { message: 'approvers.order must be unique' },
  );

/**
 * Print config per document type (PR/PO).
 * Stored in tb_application_config with key pr_print_config / po_print_config.
 */
const PrintConfigSchema = z.object({
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
});

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly notificationService: NotificationService,
  ) {}

  /** Mask password field(s) inside a config value before returning to caller. */
  private maskSensitiveFields(key: string, value: unknown): unknown {
    if (key !== 'report_email' || !value || typeof value !== 'object') return value;
    const v = value as { smtp?: { password?: string } };
    if (v.smtp?.password) {
      return { ...v, smtp: { ...v.smtp, password: MASK } };
    }
    return value;
  }

  /** Encrypt password field(s) before persisting. Skip if already encrypted. */
  private encryptSensitiveFields(key: string, value: unknown): unknown {
    if (key !== 'report_email' || !value || typeof value !== 'object') return value;
    const v = value as { smtp?: { password?: string } };
    if (v.smtp?.password && !isEncrypted(v.smtp.password)) {
      return { ...v, smtp: { ...v.smtp, password: encryptSecret(v.smtp.password) } };
    }
    return value;
  }

  /** Validate value with per-key Zod schema. Unknown keys are accepted as-is. */
  private validateValue(key: string, value: unknown): unknown {
    const schemaByKey: Record<string, z.ZodTypeAny> = {
      report_email: ReportEmailSchema,
      pr_approval_flow: ApprovalFlowSchema,
      po_approval_flow: ApprovalFlowSchema,
      pr_print_config: PrintConfigSchema,
      po_print_config: PrintConfigSchema,
    };

    const schema = schemaByKey[key];
    if (!schema) return value;

    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      throw new Error(
        `Invalid ${key} value: ${parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
      );
    }
    return parsed.data;
  }

  // ─── Endpoints ───

  async list(bu_code: string, user_id: string) {
    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const rows = await prisma.tb_application_config.findMany({
      where: { deleted_at: null },
      orderBy: { key: 'asc' },
      select: {
        id: true,
        key: true,
        value: true,
        created_at: true,
        created_by_id: true,
        updated_at: true,
        updated_by_id: true,
      },
    });
    return rows.map((r) => ({ ...r, value: this.maskSensitiveFields(r.key, r.value) }));
  }

  async get(bu_code: string, user_id: string, key: string) {
    if (!KEY_REGEX.test(key)) throw new Error('Invalid key format');
    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const row = await prisma.tb_application_config.findFirst({
      where: { key, deleted_at: null },
      select: {
        id: true,
        key: true,
        value: true,
        created_at: true,
        created_by_id: true,
        updated_at: true,
        updated_by_id: true,
      },
    });
    if (!row) return null;
    return { ...row, value: this.maskSensitiveFields(row.key, row.value) };
  }

  async upsert(bu_code: string, user_id: string, key: string, value: unknown) {
    if (!KEY_REGEX.test(key)) throw new Error('Invalid key format');
    if (!user_id) throw new Error('user_id is required');

    const validated = this.validateValue(key, value);
    const toStore = this.encryptSensitiveFields(key, validated) as object;

    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);

    const existing = await prisma.tb_application_config.findFirst({
      where: { key, deleted_at: null },
      select: { id: true },
    });

    const row = existing
      ? await prisma.tb_application_config.update({
          where: { id: existing.id },
          data: {
            value: toStore,
            updated_at: new Date(),
            updated_by_id: user_id,
          },
          select: {
            id: true,
            key: true,
            value: true,
            created_at: true,
            created_by_id: true,
            updated_at: true,
            updated_by_id: true,
          },
        })
      : await prisma.tb_application_config.create({
          data: {
            key,
            value: toStore,
            created_at: new Date(),
            created_by_id: user_id,
          },
          select: {
            id: true,
            key: true,
            value: true,
            created_at: true,
            created_by_id: true,
            updated_at: true,
            updated_by_id: true,
          },
        });

    return { ...row, value: this.maskSensitiveFields(row.key, row.value) };
  }

  async delete(bu_code: string, user_id: string, key: string) {
    if (!KEY_REGEX.test(key)) throw new Error('Invalid key format');
    if (!user_id) throw new Error('user_id is required');

    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const result = await prisma.tb_application_config.updateMany({
      where: { key, deleted_at: null },
      data: { deleted_at: new Date(), deleted_by_id: user_id },
    });

    return { deleted: result.count > 0, count: result.count };
  }

  /**
   * Send a test email using the current report_email config for this BU.
   * Forwards to micro-notification via the existing HTTP NotificationService client,
   * which loads tb_application_config (report_email), decrypts the SMTP password,
   * and sends the mail through the same flow used in production.
   */
  async testEmail(bu_code: string, user_id: string) {
    try {
      const result = await this.notificationService.sendToBusinessUnit({
        bu_code,
        from_user_id: user_id,
        title: 'Test Email',
        message: `This is a test email from Carmen for business unit ${bu_code}.`,
        type: 'BU_INFO',
        metadata: { source: 'app-config.testEmail' },
      });
      return { sent: result !== null, recipients_count: Array.isArray(result) ? result.length : 0 };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Test email failed for ${bu_code}: ${msg}`);
      return { sent: false, error: msg };
    }
  }
}
