import { BackendLogger } from './backend.logger';

export function ExtractRequestHeader(
  req: { user?: { user_id?: string } } & Record<string, any>,
): {
  tenant_id: string | null;
  user_id: string | null;
  accessToken: string | null;
} {
  const tenant_id = null;
  const user_id = req?.['user']?.user_id ?? '';
  const accessToken = req?.headers?.authorization?.replace('Bearer ', '') ?? '';

  const logger = new BackendLogger(ExtractRequestHeader.name);

  logger.debug(
    {
      function: 'ExtractRequestHeader',
      tenant_id,
      user_id,
    },
    'ExtractRequestHeader',
  );

  return { user_id, tenant_id, accessToken };
}
