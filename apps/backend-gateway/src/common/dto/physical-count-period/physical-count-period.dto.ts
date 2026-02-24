import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { enum_physical_count_period_status } from '@repo/prisma-shared-schema-tenant';

// ==================== Physical Count Period Create ====================

export const PhysicalCountPeriodCreate = z.object({
  counting_period_from_date: z.coerce.date(),
  counting_period_to_date: z.coerce.date(),
  status: z
    .enum(Object.values(enum_physical_count_period_status) as [string, ...string[]])
    .optional()
    .default('draft'),
});

export type IPhysicalCountPeriodCreate = z.infer<typeof PhysicalCountPeriodCreate>;
export class PhysicalCountPeriodCreateDto extends createZodDto(PhysicalCountPeriodCreate) {}

// ==================== Physical Count Period Update ====================

export const PhysicalCountPeriodUpdate = z.object({
  counting_period_from_date: z.coerce.date().optional(),
  counting_period_to_date: z.coerce.date().optional(),
  status: z
    .enum(Object.values(enum_physical_count_period_status) as [string, ...string[]])
    .optional(),
});

export type IPhysicalCountPeriodUpdate = z.infer<typeof PhysicalCountPeriodUpdate>;
export class PhysicalCountPeriodUpdateDto extends createZodDto(PhysicalCountPeriodUpdate) {}
