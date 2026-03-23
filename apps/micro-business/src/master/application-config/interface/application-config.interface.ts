export interface ICreateApplicationConfig {
  key: string;
  value: unknown;
}

export interface IUpdateApplicationConfig {
  id: string;
  value: unknown;
}

export interface IUserConfigUpsert {
  user_id: string;
  key: string;
  value: unknown;
}
