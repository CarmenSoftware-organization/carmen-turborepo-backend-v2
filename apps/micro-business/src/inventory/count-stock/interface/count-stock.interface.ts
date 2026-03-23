export interface ICountStockDetailCreate {
  sequence_no?: number;
  product_id: string;
  product_code?: string;
  product_name?: string;
  product_local_name?: string;
  product_sku?: string;
  qty?: number;
  description?: string;
  note?: string;
  info?: Record<string, unknown>;
  dimension?: unknown[];
}

export interface ICountStockDetailUpdate {
  id: string;
  sequence_no?: number;
  product_id?: string;
  product_code?: string;
  product_name?: string;
  product_local_name?: string;
  product_sku?: string;
  qty?: number;
  description?: string;
  note?: string;
  info?: Record<string, unknown>;
  dimension?: unknown[];
}

export interface ICreateCountStock {
  location_id: string;
  location_code?: string;
  location_name?: string;
  count_stock_no?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  note?: string;
  info?: Record<string, unknown>;
  dimension?: unknown[];
  details?: ICountStockDetailCreate[];
}

export interface IUpdateCountStock {
  id: string;
  location_id?: string;
  location_code?: string;
  location_name?: string;
  count_stock_no?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  note?: string;
  info?: Record<string, unknown>;
  dimension?: unknown[];
  details?: {
    add?: ICountStockDetailCreate[];
    update?: ICountStockDetailUpdate[];
    delete?: string[];
  };
}
