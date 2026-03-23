import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const JvDetailItemSchema = z.object({
  account_code: z.string().optional(),
  account_name: z.string().optional(),
  currency_id: z.string().uuid().optional().nullable(),
  currency_name: z.string().optional().nullable(),
  exchange_rate: z.number().optional(),
  debit: z.number().optional(),
  credit: z.number().optional(),
  base_currency_id: z.string().uuid().optional().nullable(),
  base_currency_name: z.string().optional().nullable(),
  base_debit: z.number().optional(),
  base_credit: z.number().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.any().optional(),
  dimension: z.any().optional(),
});

export const JournalVoucherCreate = z.object({
  currency_id: z.string().uuid().optional().nullable(),
  currency_name: z.string().optional().nullable(),
  exchange_rate: z.number().optional(),
  base_currency_id: z.string().uuid().optional().nullable(),
  base_currency_name: z.string().optional().nullable(),
  jv_type: z.string(),
  jv_no: z.string(),
  jv_date: z.string(),
  description: z.string().optional(),
  note: z.string().optional(),
  jv_status: z.string().optional(),
  info: z.any().optional(),
  dimension: z.any().optional(),
  details: z.array(JvDetailItemSchema).optional(),
});

export type ICreateJournalVoucher = z.infer<typeof JournalVoucherCreate>;
export class JournalVoucherCreateDto extends createZodDto(JournalVoucherCreate) {}

const JvDetailUpdateItemSchema = JvDetailItemSchema.extend({
  id: z.string().uuid().optional(),
});

export const JournalVoucherUpdate = z.object({
  currency_id: z.string().uuid().optional().nullable(),
  currency_name: z.string().optional().nullable(),
  exchange_rate: z.number().optional(),
  base_currency_id: z.string().uuid().optional().nullable(),
  base_currency_name: z.string().optional().nullable(),
  jv_type: z.string().optional(),
  jv_date: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  jv_status: z.string().optional(),
  info: z.any().optional(),
  dimension: z.any().optional(),
  details: z.object({
    add: z.array(JvDetailItemSchema).optional(),
    update: z.array(JvDetailUpdateItemSchema).optional(),
    delete: z.array(z.string().uuid()).optional(),
  }).optional(),
});

export type IUpdateJournalVoucher = z.infer<typeof JournalVoucherUpdate> & { id: string };
export class JournalVoucherUpdateDto extends createZodDto(JournalVoucherUpdate) {}
