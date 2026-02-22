export interface IPaginate {
  page?: number;
  perpage?: number;
  search?: string;
  searchfields?: string[];
  filter?: Record<string, string>;
  sort?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  advance?: any;
}

