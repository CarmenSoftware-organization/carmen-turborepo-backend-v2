import { z } from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

const envSchema = z.object({
  // Keycloak API service
  KEYCLOAK_API_SERVICE_HOST: z.string().default('localhost'),
  KEYCLOAK_API_SERVICE_PORT: z.coerce.number().default(5013),
  KEYCLOAK_API_SERVICE_HTTP_PORT: z.coerce.number().default(6013),

  // Keycloak Configuration (required)
  KEYCLOAK_BASE_URL: z.string().min(1, 'KEYCLOAK_BASE_URL is required'),
  KEYCLOAK_REALM: z.string().default('master'),
  KEYCLOAK_CLIENT_ID: z.string().default(''),
  KEYCLOAK_ADMIN_CLIENT_ID: z.string().default(''),
  KEYCLOAK_ADMIN_CLIENT_SECRET: z.string().default(''),
  KEYCLOAK_ADMIN_USERNAME: z.string().default('admin'),
  KEYCLOAK_ADMIN_PASSWORD: z
    .string()
    .min(1, 'KEYCLOAK_ADMIN_PASSWORD is required'),
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
