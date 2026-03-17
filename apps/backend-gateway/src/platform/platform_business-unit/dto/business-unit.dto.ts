import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const BusinessUnitCreateSchema = z
  .object({
    cluster_id: z
      .string({
        required_error: 'cluster_id field is required',
      })
      .uuid({ message: 'cluster_id must be a valid UUID' }),
    code: z
      .string({
        required_error: 'code field is required',
      })
      .min(3, 'code must be at least 3 characters'),
    name: z
      .string({
        required_error: 'name field is required',
      })
      .min(3, 'name must be at least 3 characters'),
    alias_name: z
      .string({
        required_error: 'alias_name field is required',
      })
      .min(3, 'alias_name must be at least 3 characters')
      .optional(),
    default_currency_id: z.string().uuid().optional(),
    max_license_users: z.number().int().nullable().optional(),
    is_hq: z.boolean({
      required_error: 'is_hq field is required',
    }),
    is_active: z.boolean({
      required_error: 'is_active field is required',
    }),
  })

export type IBusinessUnitCreate = z.infer<typeof BusinessUnitCreateSchema>;
export class BusinessUnitCreateDto extends createZodDto(BusinessUnitCreateSchema) {}

export const BusinessUnitUpdateSchema = z.object({
    id: z.string().optional(),
    cluster_id: z
      .string({
        required_error: 'cluster_id field is required',
      })
      .min(1, 'cluster_id must be at least 1 characters')
      .optional(),
    code: z
      .string({
        required_error: 'code field is required',
      })
      .min(3, 'code must be at least 3 characters')
      .optional(),
    name: z
      .string({
        required_error: 'name field is required',
      })
      .min(3, 'name must be at least 3 characters')
      .optional(),
    alias_name: z
      .string({
        required_error: 'alias_name field is required',
      })
      .min(3, 'alias_name must be at least 3 characters')
      .optional(),
    default_currency_id: z.string().uuid().optional(),
    max_license_users: z.number().int().nullable().optional(),
    is_hq: z
      .boolean({
        required_error: 'is_hq field is required',
      })
      .optional(),
    is_active: z
      .boolean({
        required_error: 'is_active field is required',
      })
      .optional(),
  });

export type IBusinessUnitUpdate = z.infer<typeof BusinessUnitUpdateSchema>;
export class BusinessUnitUpdateDto extends createZodDto(BusinessUnitUpdateSchema) {}
