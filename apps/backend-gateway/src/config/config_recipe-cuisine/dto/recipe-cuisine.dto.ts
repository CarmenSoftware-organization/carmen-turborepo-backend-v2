import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { enum_cuisine_region } from '@repo/prisma-shared-schema-tenant';

export const RecipeCuisineCreate = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  region: z.enum(Object.values(enum_cuisine_region) as [string, ...string[]]),
  popular_dishes: z.any().optional(),
  key_ingredients: z.any().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
});

export type ICreateRecipeCuisine = z.infer<typeof RecipeCuisineCreate>;
export class RecipeCuisineCreateDto extends createZodDto(RecipeCuisineCreate) {}

export const RecipeCuisineUpdate = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  region: z.enum(Object.values(enum_cuisine_region) as [string, ...string[]]).optional(),
  popular_dishes: z.any().optional(),
  key_ingredients: z.any().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
});

export type IUpdateRecipeCuisine = z.infer<typeof RecipeCuisineUpdate> & { id: string };
export class RecipeCuisineUpdateDto extends createZodDto(RecipeCuisineUpdate) {}

export const RecipeCuisineResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  region: z.enum(Object.values(enum_cuisine_region) as [string, ...string[]]),
  popular_dishes: z.any().optional(),
  key_ingredients: z.any().optional(),
  info: z.any().nullable().optional(),
  dimension: z.any().nullable().optional(),
  doc_version: z.number().optional(),
  created_at: z.string().or(z.date()).nullable().optional(),
  created_by_id: z.string().uuid().nullable().optional(),
  updated_at: z.string().or(z.date()).nullable().optional(),
  updated_by_id: z.string().uuid().nullable().optional(),
});
