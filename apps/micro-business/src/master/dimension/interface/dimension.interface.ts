export interface IDimensionDisplayInCreate {
  display_in: string;
  default_value?: unknown;
  note?: string;
}

export interface IDimensionDisplayInUpdate {
  id: string;
  display_in?: string;
  default_value?: unknown;
  note?: string;
}

export interface ICreateDimension {
  key: string;
  type: string;
  value?: unknown;
  description?: string;
  note?: string;
  default_value?: unknown;
  is_active?: boolean;
  info?: Record<string, unknown>;
  display_in?: IDimensionDisplayInCreate[];
}

export interface IUpdateDimension {
  id: string;
  key?: string;
  type?: string;
  value?: unknown;
  description?: string;
  note?: string;
  default_value?: unknown;
  is_active?: boolean;
  info?: Record<string, unknown>;
  display_in?: {
    add?: IDimensionDisplayInCreate[];
    update?: IDimensionDisplayInUpdate[];
    delete?: string[];
  };
}
