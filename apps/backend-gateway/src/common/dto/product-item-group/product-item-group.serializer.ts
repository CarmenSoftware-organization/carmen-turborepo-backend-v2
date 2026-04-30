import { z } from 'zod';
import { AuditSchema } from '../audit/audit.dto';

const dateField = z.coerce.date().nullable();

// Base schema for ProductItemGroup
const ProductItemGroupBaseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  created_at: dateField,
  updated_at: dateField,
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
});

// Detail response schema (for findOne)
export const ProductItemGroupDetailResponseSchema = ProductItemGroupBaseSchema.omit({
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
}).extend({
  audit: AuditSchema.optional(),
}).passthrough();

// List item response schema (for findAll)
export const ProductItemGroupListItemResponseSchema = ProductItemGroupBaseSchema.passthrough();

// Mutation response schema (for create, update, delete)
export const ProductItemGroupMutationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().optional(),
}).passthrough();
