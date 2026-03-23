import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const DimensionDisplayInCreateSchema = z.object({
  display_in: z.string(),
  default_value: z.any().optional(),
  note: z.string().optional(),
});

export const DimensionDisplayInUpdateSchema = z.object({
  id: z.string().uuid(),
  display_in: z.string().optional(),
  default_value: z.any().optional(),
  note: z.string().optional(),
});

export const DimensionCreate = z.object({
  key: z.string(),
  type: z.string(),
  value: z.any().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  default_value: z.any().optional(),
  is_active: z.boolean().default(true).nullable().optional(),
  info: z.record(z.any()).optional(),
  display_in: z.array(DimensionDisplayInCreateSchema).optional(),
});

export type ICreateDimension = z.infer<typeof DimensionCreate>;
export class DimensionCreateDto extends createZodDto(DimensionCreate) {}

export const DimensionUpdate = z.object({
  key: z.string().optional(),
  type: z.string().optional(),
  value: z.any().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  default_value: z.any().optional(),
  is_active: z.boolean().optional(),
  info: z.record(z.any()).optional(),
  display_in: z.object({
    add: z.array(DimensionDisplayInCreateSchema).optional(),
    update: z.array(DimensionDisplayInUpdateSchema).optional(),
    delete: z.array(z.string().uuid()).optional(),
  }).optional(),
});

export type IUpdateDimension = z.infer<typeof DimensionUpdate> & { id: string };
export class DimensionUpdateDto extends createZodDto(DimensionUpdate) {}
