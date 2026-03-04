import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_HOST = 'localhost';

const envSchema = z.object({
  // Required
  SYSTEM_DATABASE_URL: z.string().min(1, 'SYSTEM_DATABASE_URL is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Cluster service
  CLUSTER_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  CLUSTER_SERVICE_PORT: z.coerce.number().default(5014),
  CLUSTER_SERVICE_HTTP_PORT: z.coerce.number().default(6014),

  // External services
  KEYCLOAK_API_SERVICE_HOST: z.string().default(DEFAULT_HOST),
  KEYCLOAK_API_SERVICE_PORT: z.coerce.number().default(5013),

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

export const envConfig = {
  // Cluster service
  CLUSTER_SERVICE_HOST: env.CLUSTER_SERVICE_HOST,
  CLUSTER_SERVICE_PORT: env.CLUSTER_SERVICE_PORT,
  CLUSTER_SERVICE_HTTP_PORT: env.CLUSTER_SERVICE_HTTP_PORT,

  // External services
  KEYCLOAK_API_SERVICE_HOST: env.KEYCLOAK_API_SERVICE_HOST,
  KEYCLOAK_API_SERVICE_PORT: env.KEYCLOAK_API_SERVICE_PORT,

  // JWT configuration
  SUPABASE_JWT_SECRET: env.SUPABASE_JWT_SECRET,
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
  JWT_INVITE_EXPIRES_IN: env.JWT_INVITE_EXPIRES_IN,

  // Database
  SYSTEM_DATABASE_URL: env.SYSTEM_DATABASE_URL,
  SYSTEM_DIRECT_URL: env.SYSTEM_DIRECT_URL,
};
