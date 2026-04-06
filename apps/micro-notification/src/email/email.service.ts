import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  enabled: boolean;
}

export interface SendEmailOptions {
  to: string | string[];
  cc?: string[];
  subject: string;
  html: string;
  text?: string;
  subjectPrefix?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Send email using SMTP config
   * @param config - SMTP configuration from tb_application_config
   * @param options - Email options (to, subject, html, etc.)
   */
  async sendEmail(config: EmailConfig, options: SendEmailOptions): Promise<boolean> {
    if (!config.enabled) {
      this.logger.debug('Email sending is disabled');
      return false;
    }

    if (!config.host || !config.username || !config.password) {
      this.logger.warn('Email SMTP config incomplete, skipping');
      return false;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.port === 465,
        auth: {
          user: config.username,
          pass: config.password,
        },
      });

      const subject = options.subjectPrefix
        ? `${options.subjectPrefix} ${options.subject}`
        : options.subject;

      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

      const info = await transporter.sendMail({
        from: config.from || config.username,
        to: recipients,
        cc: options.cc?.join(', '),
        subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent: ${info.messageId} → ${recipients}`);
      return true;
    } catch (error) {
      this.logger.error(`Email send failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Build HTML for report notification email
   */
  buildReportEmailHtml(params: {
    title: string;
    message: string;
    jobId?: string;
    fileUrl?: string;
    status: 'success' | 'failure';
  }): string {
    const statusColor = params.status === 'success' ? '#28a745' : '#dc3545';
    const statusLabel = params.status === 'success' ? 'Completed' : 'Failed';

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background: ${statusColor}; color: white; padding: 16px 24px;">
      <h2 style="margin: 0;">${params.title}</h2>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px; line-height: 1.6;">${params.message}</p>
      <table style="margin-top: 16px; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #666;">Status:</td><td><strong style="color: ${statusColor};">${statusLabel}</strong></td></tr>
        ${params.jobId ? `<tr><td style="padding: 4px 12px 4px 0; color: #666;">Job ID:</td><td><code>${params.jobId}</code></td></tr>` : ''}
      </table>
      ${params.fileUrl ? `<div style="margin-top: 20px;"><a href="${params.fileUrl}" style="background: #2F5496; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px;">Download Report</a></div>` : ''}
    </div>
    <div style="background: #f8f9fa; padding: 12px 24px; font-size: 12px; color: #999;">
      Carmen ERP — Automated Report Notification
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Build HTML for generic notification email
   */
  buildNotificationEmailHtml(title: string, message: string): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background: #2F5496; color: white; padding: 16px 24px;">
      <h2 style="margin: 0;">${title}</h2>
    </div>
    <div style="padding: 24px;">
      <p style="font-size: 15px; line-height: 1.6;">${message}</p>
    </div>
    <div style="background: #f8f9fa; padding: 12px 24px; font-size: 12px; color: #999;">
      Carmen ERP — Notification
    </div>
  </div>
</body>
</html>`;
  }
}
