import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RecipeCategoryCreate = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  level: z.number().int().optional(),
  default_cost_settings: z.any().optional(),
  default_margins: z.any().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
});

export type ICreateRecipeCategory = z.infer<typeof RecipeCategoryCreate>;
export class RecipeCategoryCreateDto extends createZodDto(RecipeCategoryCreate) {}

export const RecipeCategoryUpdate = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  level: z.number().int().optional(),
  default_cost_settings: z.any().optional(),
  default_margins: z.any().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
});

export type IUpdateRecipeCategory = z.infer<typeof RecipeCategoryUpdate> & { id: string };
export class RecipeCategoryUpdateDto extends createZodDto(RecipeCategoryUpdate) {}

export const RecipeCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  parent_name: z.string().nullable().optional(),
  level: z.number().int(),
  default_cost_settings: z.any().optional(),
  default_margins: z.any().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
  doc_version: z.number().optional(),
  created_at: z.string().or(z.date()).nullable().optional(),
  created_by_id: z.string().uuid().nullable().optional(),
  updated_at: z.string().or(z.date()).nullable().optional(),
  updated_by_id: z.string().uuid().nullable().optional(),
});
