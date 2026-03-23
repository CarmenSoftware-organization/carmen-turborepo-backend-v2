import { z } from 'zod';

export const ApplicationConfigDetailResponseSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.any().nullable().optional(),
  created_at: z.coerce.date().optional(),
  created_by_id: z.string().nullable().optional(),
  updated_at: z.coerce.date().optional(),
  updated_by_id: z.string().nullable().optional(),
});

export type ApplicationConfigDetailResponse = z.infer<typeof ApplicationConfigDetailResponseSchema>;

export const ApplicationConfigListItemResponseSchema = ApplicationConfigDetailResponseSchema;

export type ApplicationConfigListItemResponse = z.infer<typeof ApplicationConfigListItemResponseSchema>;

export const ApplicationConfigMutationResponseSchema = z.object({
  id: z.string(),
});

export type ApplicationConfigMutationResponse = z.infer<typeof ApplicationConfigMutationResponseSchema>;

export const UserConfigResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  key: z.string(),
  value: z.any().nullable().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type UserConfigResponse = z.infer<typeof UserConfigResponseSchema>;
