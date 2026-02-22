export interface IPaginate {
  page?: number;
  perpage?: number;
  search?: string;
  searchfields?: string[];
  filter?: string | string[] | Record<string, string>;
  sort?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  advance?: any;
}

