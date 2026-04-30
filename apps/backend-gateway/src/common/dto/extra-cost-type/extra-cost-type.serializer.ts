import { z } from 'zod';
import { AuditSchema } from '../audit/audit.dto';

// Base schema for ExtraCostType
const ExtraCostTypeBaseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  created_at: z.coerce.date().nullable().optional(),
  updated_at: z.coerce.date().nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
});

// Detail response schema (for findOne with audit enrichment)
export const ExtraCostTypeDetailResponseSchema = ExtraCostTypeBaseSchema.omit({
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
}).extend({
  audit: AuditSchema.optional(),
}).passthrough();

// List item response schema (for findAll)
export const ExtraCostTypeListItemResponseSchema = ExtraCostTypeBaseSchema.omit({
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
}).extend({
  audit: AuditSchema.optional(),
}).passthrough();

// Mutation response schema (for create, update, delete)
export const ExtraCostTypeMutationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().optional(),
}).passthrough();
