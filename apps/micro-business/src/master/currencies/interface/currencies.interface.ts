export interface ICreateCurrencies {
  code: string;
  name: string;
  symbol?: string;
  description?: string;
  is_active?: boolean;
  exchange_rate?: number;
}

export interface IUpdateCurrencies {
  id: string;
  code?: string;
  name?: string;
  symbol?: string;
  description?: string;
  is_active?: boolean;
  exchange_rate?: number;
}