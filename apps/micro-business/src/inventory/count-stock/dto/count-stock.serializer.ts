import { z } from 'zod';

export const CountStockDetailResponseSchema = z.object({
  id: z.string(),
  count_stock_id: z.string(),
  sequence_no: z.number().nullable().optional(),
  product_id: z.string(),
  product_code: z.string().nullable().optional(),
  product_name: z.string().nullable().optional(),
  product_local_name: z.string().nullable().optional(),
  product_sku: z.string().nullable().optional(),
  qty: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
  doc_version: z.number().nullable().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type CountStockDetailResponse = z.infer<typeof CountStockDetailResponseSchema>;

export const CountStockDetailWithProductResponseSchema = CountStockDetailResponseSchema.extend({
  tb_product: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
  }).nullable().optional(),
});

export const CountStockHeaderResponseSchema = z.object({
  id: z.string(),
  count_stock_no: z.string().nullable().optional(),
  start_date: z.coerce.date().nullable().optional(),
  end_date: z.coerce.date().nullable().optional(),
  location_id: z.string().nullable().optional(),
  location_code: z.string().nullable().optional(),
  location_name: z.string().nullable().optional(),
  doc_status: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
  doc_version: z.number().nullable().optional(),
  created_at: z.coerce.date().optional(),
  created_by_id: z.string().nullable().optional(),
  updated_at: z.coerce.date().optional(),
  updated_by_id: z.string().nullable().optional(),
});

export const CountStockDetailResponseSchemaFull = CountStockHeaderResponseSchema.extend({
  tb_count_stock_detail: z.array(CountStockDetailWithProductResponseSchema).optional(),
  tb_location: z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
  }).nullable().optional(),
});

export type CountStockDetailResponseFull = z.infer<typeof CountStockDetailResponseSchemaFull>;

export const CountStockListItemResponseSchema = CountStockHeaderResponseSchema;

export type CountStockListItemResponse = z.infer<typeof CountStockListItemResponseSchema>;

export const CountStockMutationResponseSchema = z.object({
  id: z.string(),
});

export type CountStockMutationResponse = z.infer<typeof CountStockMutationResponseSchema>;
