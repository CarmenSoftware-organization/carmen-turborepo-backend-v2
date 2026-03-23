import { z } from 'zod';

// Detail item schema for extra cost detail
const ExtraCostDetailSchema = z.object({
  id: z.string().uuid(),
  extra_cost_id: z.string().uuid().nullable().optional(),
  sequence_no: z.number().nullable().optional(),
  extra_cost_type_id: z.string().uuid().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  amount: z.any().nullable().optional(),
  tax_profile_id: z.string().nullable().optional(),
  tax_profile_name: z.string().nullable().optional(),
  tax_rate: z.any().nullable().optional(),
  tax_amount: z.any().nullable().optional(),
  is_tax_adjustment: z.boolean().nullable().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
}).passthrough();

// Base schema for ExtraCost
const ExtraCostBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable().optional(),
  good_received_note_id: z.string().nullable().optional(),
  allocate_extra_cost_type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  info: z.any().nullable().optional(),
  created_at: z.coerce.date().nullable().optional(),
  updated_at: z.coerce.date().nullable().optional(),
  created_by_id: z.string().nullable().optional(),
  updated_by_id: z.string().nullable().optional(),
});

// Detail response schema (for findOne) - includes detail items
export const ExtraCostDetailResponseSchema = ExtraCostBaseSchema.extend({
  tb_extra_cost_detail: z.array(ExtraCostDetailSchema).optional(),
}).passthrough();

// List item response schema (for findAll)
export const ExtraCostListItemResponseSchema = ExtraCostBaseSchema.passthrough();

// Mutation response schema (for create, update, delete)
export const ExtraCostMutationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().optional(),
}).passthrough();
