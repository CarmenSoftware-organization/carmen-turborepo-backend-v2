export interface MicroservicePayload {
  // Auth context
  user_id?: string;
  tenant_id?: string;
  bu_code?: string;

  // Audit context
  request_id?: string;
  ip_address?: string;
  user_agent?: string;

  // Entity data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  id?: string;
  ids?: string[];

  // Query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paginate?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: any;
  version?: string;

  // Keycloak-specific fields
  email?: string;
  password?: string;
  realm?: string;
  refresh_token?: string;
  accessToken?: string;
  userId?: string;
  action?: 'add' | 'remove';
  bu?: { bu_id: string; bu_code?: string; role?: string };
  temporary?: boolean;

  // Allow additional domain-specific fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
