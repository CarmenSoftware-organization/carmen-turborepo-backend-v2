export interface IJvDetailItem {
  account_code?: string;
  account_name?: string;
  currency_id?: string | null;
  currency_name?: string | null;
  exchange_rate?: number;
  debit?: number;
  credit?: number;
  base_currency_id?: string | null;
  base_currency_name?: string | null;
  base_debit?: number;
  base_credit?: number;
  description?: string;
  note?: string;
  info?: object;
  dimension?: object;
}

export interface IJvDetailUpdateItem extends IJvDetailItem {
  id?: string;
}

export interface ICreateJournalVoucher {
  currency_id?: string | null;
  currency_name?: string | null;
  exchange_rate?: number;
  base_currency_id?: string | null;
  base_currency_name?: string | null;
  jv_type: string;
  jv_no: string;
  jv_date: string;
  description?: string;
  note?: string;
  jv_status?: string;
  info?: object;
  dimension?: object;
  details?: IJvDetailItem[];
}

export interface IUpdateJournalVoucher {
  id: string;
  currency_id?: string | null;
  currency_name?: string | null;
  exchange_rate?: number;
  base_currency_id?: string | null;
  base_currency_name?: string | null;
  jv_type?: string;
  jv_date?: string;
  description?: string;
  note?: string;
  jv_status?: string;
  info?: object;
  dimension?: object;
  details?: {
    add?: IJvDetailItem[];
    update?: IJvDetailUpdateItem[];
    delete?: string[];
  };
}
