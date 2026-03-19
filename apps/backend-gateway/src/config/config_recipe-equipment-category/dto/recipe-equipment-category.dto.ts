import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RecipeEquipmentCategoryCreate = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
});

export type ICreateRecipeEquipmentCategory = z.infer<typeof RecipeEquipmentCategoryCreate>;
export class RecipeEquipmentCategoryCreateDto extends createZodDto(RecipeEquipmentCategoryCreate) {}

export const RecipeEquipmentCategoryUpdate = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
});

export type IUpdateRecipeEquipmentCategory = z.infer<typeof RecipeEquipmentCategoryUpdate> & { id: string };
export class RecipeEquipmentCategoryUpdateDto extends createZodDto(RecipeEquipmentCategoryUpdate) {}

export const RecipeEquipmentCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
  doc_version: z.number().optional(),
  created_at: z.string().or(z.date()).nullable().optional(),
  created_by_id: z.string().uuid().nullable().optional(),
  updated_at: z.string().or(z.date()).nullable().optional(),
  updated_by_id: z.string().uuid().nullable().optional(),
});
