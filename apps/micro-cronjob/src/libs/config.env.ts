import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_PORTS = {
  CRONJOB_TCP: 5012,
  NOTIFICATION_TCP: 5006,
} as const;

// ─── Zod helpers ─────────────────────────────────────────────────────────────

const host = () => z.string().min(1);
const port = (defaultValue: number) => z.coerce.number().default(defaultValue);

// ─── Schema ──────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // Cronjob (this service)
  CRONJOB_SERVICE_HOST: host(),
  CRONJOB_SERVICE_PORT: port(DEFAULT_PORTS.CRONJOB_TCP),

  // Database
  CRONJOB_DB_URL: z.string().min(1, 'CRONJOB_DB_URL is required'),

  // Notification service (for sending notifications)
  NOTIFICATION_SERVICE_HOST: z.string().default('127.0.0.1'),
  NOTIFICATION_SERVICE_PORT: port(DEFAULT_PORTS.NOTIFICATION_TCP),

  // Logging (Loki)
  LOKI_HOST: z.string().default('dev.blueledgers.com'),
  LOKI_PORT: z.coerce.number().default(3998),
  LOKI_PROTOCOL: z.string().default('http'),
  LOKI_USERNAME: z.string().default(''),
  LOKI_PASSWORD: z.string().default(''),
  APP_NAME: z.string().default('micro-cronjob'),
  NODE_ENV: z.string().default('development'),
});

// ─── Parse & validate ────────────────────────────────────────────────────────

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map(
    (i) => `  - ${i.path.join('.')}: ${i.message}`,
  );
  console.error(
    `\n❌ Missing/invalid environment variables:\n${missing.join('\n')}\n`,
  );
  process.exit(1);
}

const env = parsed.data;

// ─── Export ──────────────────────────────────────────────────────────────────

export const envConfig = {
  // Cronjob (this service)
  CRONJOB_SERVICE_HOST: env.CRONJOB_SERVICE_HOST,
  CRONJOB_SERVICE_PORT: env.CRONJOB_SERVICE_PORT,

  // Database
  CRONJOB_DB_URL: env.CRONJOB_DB_URL,

  // Notification service
  NOTIFICATION_SERVICE_HOST: env.NOTIFICATION_SERVICE_HOST,
  NOTIFICATION_SERVICE_PORT: env.NOTIFICATION_SERVICE_PORT,

  // Logging
  LOKI_HOST: env.LOKI_HOST,
  LOKI_PORT: env.LOKI_PORT,
  LOKI_PROTOCOL: env.LOKI_PROTOCOL,
  LOKI_USERNAME: env.LOKI_USERNAME,
  LOKI_PASSWORD: env.LOKI_PASSWORD,
  APP_NAME: env.APP_NAME,
  NODE_ENV: env.NODE_ENV,
};
