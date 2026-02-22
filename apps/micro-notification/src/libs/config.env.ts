import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NOTIFICATION_SERVICE_HOST: z.string().default('localhost'),
  NOTIFICATION_SERVICE_PORT: z.coerce.number().default(5006),
  NOTIFICATION_SERVICE_HTTP_PORT: z.coerce.number().default(6006),
  SYSTEM_DATABASE_URL: z.string().min(1, 'SYSTEM_DATABASE_URL is required'),
  NODE_ENV: z.string().default('development'),
  SENTRY_DSN: z.string().optional(),
});

// Apply DATABASE_URL fallback before parsing
const parsed = envSchema.safeParse({
  ...process.env,
  SYSTEM_DATABASE_URL:
    process.env.SYSTEM_DATABASE_URL ?? process.env.DATABASE_URL,
});

if (!parsed.success) {
  const missing = parsed.error.issues.map(
    (i) => `  - ${i.path.join('.')}: ${i.message}`,
  );
  console.error(
    `\n❌ Missing/invalid environment variables:\n${missing.join('\n')}\n`,
  );
  process.exit(1);
}

export const envConfig = parsed.data;
