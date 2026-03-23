import { z } from 'zod';

export const DimensionDisplayInResponseSchema = z.object({
  id: z.string(),
  dimension_id: z.string(),
  display_in: z.string(),
  default_value: z.any().nullable().optional(),
  note: z.string().nullable().optional(),
  info: z.any().nullable().optional(),
  doc_version: z.number().nullable().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type DimensionDisplayInResponse = z.infer<typeof DimensionDisplayInResponseSchema>;

export const DimensionDetailResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.string(),
  value: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  default_value: z.any().nullable().optional(),
  is_active: z.boolean(),
  info: z.any().nullable().optional(),
  doc_version: z.number().nullable().optional(),
  tb_dimension_display_in: z.array(DimensionDisplayInResponseSchema).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type DimensionDetailResponse = z.infer<typeof DimensionDetailResponseSchema>;

export const DimensionListItemResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.string(),
  value: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type DimensionListItemResponse = z.infer<typeof DimensionListItemResponseSchema>;

export const DimensionMutationResponseSchema = z.object({
  id: z.string(),
});

export type DimensionMutationResponse = z.infer<typeof DimensionMutationResponseSchema>;
