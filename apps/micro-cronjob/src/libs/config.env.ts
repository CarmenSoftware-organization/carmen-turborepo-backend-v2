import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  // Cronjob service
  CRONJOB_SERVICE_HOST: z.string().default('localhost'),
  CRONJOB_SERVICE_PORT: z.coerce.number().default(5012),

  // Notification service (for sending notifications)
  NOTIFICATION_SERVICE_HOST: z.string().default('localhost'),
  NOTIFICATION_SERVICE_PORT: z.coerce.number().default(5006),
});

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

export const envConfig = parsed.data;
