import { z } from 'zod';

const JvDetailSchema = z.object({
  id: z.string().uuid(),
  jv_header_id: z.string().uuid().nullable().optional(),
  account_code: z.string().nullable().optional(),
  account_name: z.string().nullable().optional(),
  sequence_no: z.number().nullable().optional(),
  currency_id: z.string().nullable().optional(),
  currency_name: z.string().nullable().optional(),
  exchange_rate: z.any().nullable().optional(),
  debit: z.any().nullable().optional(),
  credit: z.any().nullable().optional(),
  base_currency_id: z.string().nullable().optional(),
  base_currency_name: z.string().nullable().optional(),
  base_debit: z.any().nullable().optional(),
  base_credit: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
}).passthrough();

const JournalVoucherBaseSchema = z.object({
  id: z.string().uuid(),
  jv_type: z.string().nullable().optional(),
  jv_no: z.string().nullable().optional(),
  jv_date: z.coerce.date().nullable().optional(),
  jv_status: z.string().nullable().optional(),
  currency_id: z.string().nullable().optional(),
  currency_name: z.string().nullable().optional(),
  exchange_rate: z.any().nullable().optional(),
  base_currency_id: z.string().nullable().optional(),
  base_currency_name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
  created_at: z.coerce.date().nullable().optional(),
  updated_at: z.coerce.date().nullable().optional(),
  created_by_id: z.string().nullable().optional(),
  updated_by_id: z.string().nullable().optional(),
});

// Detail response schema (for findOne) - includes tb_jv_detail
export const JournalVoucherDetailResponseSchema = JournalVoucherBaseSchema.extend({
  tb_jv_detail: z.array(JvDetailSchema).optional(),
}).passthrough();

// List item response schema (for findAll) - header only
export const JournalVoucherListItemResponseSchema = JournalVoucherBaseSchema.passthrough();

// Mutation response schema (for create, update, delete)
export const JournalVoucherMutationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().optional(),
}).passthrough();
