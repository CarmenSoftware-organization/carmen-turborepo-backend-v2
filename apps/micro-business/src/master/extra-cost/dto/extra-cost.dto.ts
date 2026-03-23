import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const ExtraCostDetailItemSchema = z.object({
  extra_cost_type_id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  amount: z.number().optional(),
  tax_profile_id: z.string().uuid().optional().nullable(),
  tax_profile_name: z.string().optional().nullable(),
  tax_rate: z.number().optional(),
  tax_amount: z.number().optional(),
  is_tax_adjustment: z.boolean().optional(),
  info: z.any().optional(),
  dimension: z.any().optional(),
});

export const ExtraCostCreate = z.object({
  name: z.string().optional(),
  good_received_note_id: z.string().uuid().optional().nullable(),
  allocate_extra_cost_type: z.string().optional().nullable(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.any().optional(),
  details: z.array(ExtraCostDetailItemSchema).optional(),
});

export type ICreateExtraCost = z.infer<typeof ExtraCostCreate>;
export class ExtraCostCreateDto extends createZodDto(ExtraCostCreate) {}

const ExtraCostDetailUpdateItemSchema = ExtraCostDetailItemSchema.extend({
  id: z.string().uuid().optional(),
});

export const ExtraCostUpdate = z.object({
  name: z.string().optional(),
  good_received_note_id: z.string().uuid().optional().nullable(),
  allocate_extra_cost_type: z.string().optional().nullable(),
  description: z.string().optional(),
  note: z.string().optional(),
  info: z.any().optional(),
  details: z.object({
    add: z.array(ExtraCostDetailItemSchema).optional(),
    update: z.array(ExtraCostDetailUpdateItemSchema).optional(),
    delete: z.array(z.string().uuid()).optional(),
  }).optional(),
});

export type IUpdateExtraCost = z.infer<typeof ExtraCostUpdate> & { id: string };
export class ExtraCostUpdateDto extends createZodDto(ExtraCostUpdate) {}
