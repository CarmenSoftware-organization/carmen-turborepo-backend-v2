import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CountStockDetailCreateSchema = z.object({
  sequence_no: z.number().optional(),
  product_id: z.string().uuid(),
  product_code: z.string().optional(),
  product_name: z.string().optional(),
  product_local_name: z.string().optional(),
  product_sku: z.string().optional(),
  qty: z.number().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.record(z.string(), z.any()).optional(),
  dimension: z.array(z.any()).optional(),
});

export const CountStockDetailUpdateSchema = z.object({
  id: z.string().uuid(),
  sequence_no: z.number().optional(),
  product_id: z.string().uuid().optional(),
  product_code: z.string().optional(),
  product_name: z.string().optional(),
  product_local_name: z.string().optional(),
  product_sku: z.string().optional(),
  qty: z.number().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.record(z.string(), z.any()).optional(),
  dimension: z.array(z.any()).optional(),
});

export const CountStockCreate = z.object({
  location_id: z.string().uuid(),
  location_code: z.string().optional(),
  location_name: z.string().optional(),
  count_stock_no: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.record(z.string(), z.any()).optional(),
  dimension: z.array(z.any()).optional(),
  details: z.array(CountStockDetailCreateSchema).optional(),
});

export type ICreateCountStock = z.infer<typeof CountStockCreate>;
export class CountStockCreateDto extends createZodDto(CountStockCreate) {}

export const CountStockUpdate = z.object({
  location_id: z.string().uuid().optional(),
  location_code: z.string().optional(),
  location_name: z.string().optional(),
  count_stock_no: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.record(z.string(), z.any()).optional(),
  dimension: z.array(z.any()).optional(),
  details: z.object({
    add: z.array(CountStockDetailCreateSchema).optional(),
    update: z.array(CountStockDetailUpdateSchema).optional(),
    delete: z.array(z.string().uuid()).optional(),
  }).optional(),
});

export type IUpdateCountStock = z.infer<typeof CountStockUpdate> & { id: string };
export class CountStockUpdateDto extends createZodDto(CountStockUpdate) {}
