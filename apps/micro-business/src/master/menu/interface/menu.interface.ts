export interface ICreateMenu {
  module_id: string;
  name: string;
  url: string;
  description?: string;
  is_visible?: boolean;
  is_active?: boolean;
  is_lock?: boolean;
}

export interface IUpdateMenu {
  id: string;
  module_id?: string;
  name?: string;
  url?: string;
  description?: string;
  is_visible?: boolean;
  is_active?: boolean;
  is_lock?: boolean;
}
