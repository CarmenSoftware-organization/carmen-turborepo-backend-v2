import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const MenuCreate = z.object({
  module_id: z.string().uuid(),
  name: z.string(),
  url: z.string().optional(),
  description: z.string().optional(),
  is_visible: z.boolean().default(true).nullable().optional(),
  is_active: z.boolean().default(true).nullable().optional(),
  is_lock: z.boolean().default(false).nullable().optional(),
});

export type ICreateMenu = z.infer<typeof MenuCreate>;
export class MenuCreateDto extends createZodDto(MenuCreate) {}

export const MenuUpdate = z.object({
  module_id: z.string().uuid().optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  is_visible: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_lock: z.boolean().optional(),
});

export type IUpdateMenu = z.infer<typeof MenuUpdate> & { id: string };
export class MenuUpdateDto extends createZodDto(MenuUpdate) {}
