import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_HOST = 'localhost';

const envSchema = z.object({
  // Required
  SYSTEM_DATABASE_URL: z.string().min(1, 'SYSTEM_DATABASE_URL is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Business service (consolidated)
  BUSINESS_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  BUSINESS_SERVICE_PORT: z.coerce.number().default(5020),
  BUSINESS_SERVICE_HTTP_PORT: z.coerce.number().default(6020),

  // External services (not consolidated into micro-business)
  KEYCLOAK_API_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  KEYCLOAK_API_SERVICE_PORT: z.coerce.number().default(5013),
  FILE_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  FILE_SERVICE_PORT: z.coerce.number().default(5007),
  REPORT_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  REPORT_SERVICE_PORT: z.coerce.number().default(5004),
  CRONJOB_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  CRONJOB_SERVICE_PORT: z.coerce.number().default(5012),

  // JWT configuration
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_INVITE_EXPIRES_IN: z.string().default('1d'),

  // Database (optional)
  SYSTEM_DIRECT_URL: z.string().optional(),
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

const env = parsed.data;

// Since all services are consolidated, they all use the same business service port
const BUSINESS_PORT = env.BUSINESS_SERVICE_PORT;

export const envConfig = {
  // Business service (consolidated)
  BUSINESS_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  BUSINESS_SERVICE_PORT: BUSINESS_PORT,
  BUSINESS_SERVICE_HTTP_PORT: env.BUSINESS_SERVICE_HTTP_PORT,

  // Legacy service references (all point to consolidated business service for backward compatibility)
  AUTH_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  AUTH_SERVICE_PORT: BUSINESS_PORT,
  CLUSTER_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  CLUSTER_SERVICE_PORT: BUSINESS_PORT,
  MASTER_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  MASTER_SERVICE_PORT: BUSINESS_PORT,
  INVENTORY_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  INVENTORY_SERVICE_PORT: BUSINESS_PORT,
  PROCUREMENT_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  PROCUREMENT_SERVICE_PORT: BUSINESS_PORT,
  NOTIFICATION_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  NOTIFICATION_SERVICE_PORT: BUSINESS_PORT,
  LOG_SERVICE_HOST: env.BUSINESS_SERVICE_HOST,
  LOG_SERVICE_PORT: BUSINESS_PORT,

  // External services (services not consolidated into micro-business)
  KEYCLOAK_API_SERVICE_HOST: env.KEYCLOAK_API_SERVICE_HOST,
  KEYCLOAK_API_SERVICE_PORT: env.KEYCLOAK_API_SERVICE_PORT,
  FILE_SERVICE_HOST: env.FILE_SERVICE_HOST,
  FILE_SERVICE_PORT: env.FILE_SERVICE_PORT,
  REPORT_SERVICE_HOST: env.REPORT_SERVICE_HOST,
  REPORT_SERVICE_PORT: env.REPORT_SERVICE_PORT,
  CRONJOB_SERVICE_HOST: env.CRONJOB_SERVICE_HOST,
  CRONJOB_SERVICE_PORT: env.CRONJOB_SERVICE_PORT,

  // JWT configuration
  SUPABASE_JWT_SECRET: env.SUPABASE_JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
  JWT_INVITE_EXPIRES_IN: env.JWT_INVITE_EXPIRES_IN,

  // Database
  SYSTEM_DATABASE_URL: env.SYSTEM_DATABASE_URL,
  SYSTEM_DIRECT_URL: env.SYSTEM_DIRECT_URL,
};
