export interface ICreateExtraCost {
  name?: string;
  good_received_note_id?: string;
  allocate_extra_cost_type?: string;
  description?: string;
  note?: string;
  info?: object;
  details?: {
    extra_cost_type_id: string;
    name?: string;
    description?: string;
    note?: string;
    amount?: number;
    tax_profile_id?: string;
    tax_profile_name?: string;
    tax_rate?: number;
    tax_amount?: number;
    is_tax_adjustment?: boolean;
    info?: object;
    dimension?: object;
  }[];
}

export interface IUpdateExtraCost {
  id: string;
  name?: string;
  good_received_note_id?: string;
  allocate_extra_cost_type?: string;
  description?: string;
  note?: string;
  info?: object;
  details?: {
    add?: {
      extra_cost_type_id: string;
      name?: string;
      description?: string;
      note?: string;
      amount?: number;
      tax_profile_id?: string;
      tax_profile_name?: string;
      tax_rate?: number;
      tax_amount?: number;
      is_tax_adjustment?: boolean;
      info?: object;
      dimension?: object;
    }[];
    update?: {
      id?: string;
      extra_cost_type_id: string;
      name?: string;
      description?: string;
      note?: string;
      amount?: number;
      tax_profile_id?: string;
      tax_profile_name?: string;
      tax_rate?: number;
      tax_amount?: number;
      is_tax_adjustment?: boolean;
      info?: object;
      dimension?: object;
    }[];
    delete?: string[];
  };
}
