import { z } from 'zod';

export const MenuDetailResponseSchema = z.object({
  id: z.string(),
  module_id: z.string(),
  name: z.string(),
  url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_visible: z.boolean(),
  is_active: z.boolean(),
  is_lock: z.boolean(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type MenuDetailResponse = z.infer<typeof MenuDetailResponseSchema>;

export const MenuListItemResponseSchema = MenuDetailResponseSchema;

export type MenuListItemResponse = z.infer<typeof MenuListItemResponseSchema>;

export const MenuMutationResponseSchema = z.object({
  id: z.string(),
});

export type MenuMutationResponse = z.infer<typeof MenuMutationResponseSchema>;
