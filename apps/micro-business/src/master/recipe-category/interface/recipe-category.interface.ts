export interface ICreateRecipeCategory {
  code: string;
  name: string;
  description?: string | null;
  note?: string | null;
  is_active?: boolean;
  parent_id?: string | null;
  level?: number;
  default_cost_settings?: any;
  default_margins?: any;
  info?: any | null;
  dimension?: any | null;
}

export interface IUpdateRecipeCategory {
  id: string;
  code?: string;
  name?: string;
  description?: string | null;
  note?: string | null;
  is_active?: boolean;
  parent_id?: string | null;
  level?: number;
  default_cost_settings?: any;
  default_margins?: any;
  info?: any | null;
  dimension?: any | null;
}
