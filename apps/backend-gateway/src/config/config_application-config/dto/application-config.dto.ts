import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ApplicationConfigCreate = z.object({
  key: z.string(),
  value: z.any(),
});

export type ICreateApplicationConfig = z.infer<typeof ApplicationConfigCreate>;
export class ApplicationConfigCreateDto extends createZodDto(ApplicationConfigCreate) {}

export const ApplicationConfigUpdate = z.object({
  value: z.any(),
});

export type IUpdateApplicationConfig = z.infer<typeof ApplicationConfigUpdate> & { id: string };
export class ApplicationConfigUpdateDto extends createZodDto(ApplicationConfigUpdate) {}

export const UserConfigUpsert = z.object({
  value: z.any(),
});

export type IUserConfigUpsert = z.infer<typeof UserConfigUpsert>;
export class UserConfigUpsertDto extends createZodDto(UserConfigUpsert) {}
