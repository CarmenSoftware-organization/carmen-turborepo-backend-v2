import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { enum_period_status } from '@repo/prisma-shared-schema-tenant';

export const PeriodCreate = z.object({
  period: z.string(), // YYMM
  fiscal_year: z.number().int(),
  fiscal_month: z.number().int().min(1).max(12),
  start_at: z.coerce.date(),
  end_at: z.coerce.date(),
  status: z
    .enum(Object.values(enum_period_status) as [string, ...string[]])
    .optional()
    .default('open'),
  note: z.string().optional().nullable(),
  info: z.any().optional().nullable(),
  dimension: z.any().optional().nullable(),
});

export type IPeriodCreate = z.infer<typeof PeriodCreate>;
export class PeriodCreateDto extends createZodDto(PeriodCreate) {}

// ==================== Period Update ====================

export const PeriodUpdate = z.object({
  period: z.string().optional(),
  fiscal_year: z.number().int().optional(),
  fiscal_month: z.number().int().min(1).max(12).optional(),
  start_at: z.coerce.date().optional(),
  end_at: z.coerce.date().optional(),
  status: z
    .enum(Object.values(enum_period_status) as [string, ...string[]])
    .optional(),
  note: z.string().optional().nullable(),
  info: z.any().optional().nullable(),
  dimension: z.any().optional().nullable(),
});

export type IPeriodUpdate = z.infer<typeof PeriodUpdate>;
export class PeriodUpdateDto extends createZodDto(PeriodUpdate) {}
