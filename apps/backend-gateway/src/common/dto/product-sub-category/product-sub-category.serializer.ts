import { z } from 'zod';
import { AuditSchema } from '../audit/audit.dto';

const dateField = z.coerce.date().nullable();

// Base schema for ProductSubCategory
const ProductSubCategoryBaseSchema = z.object({
  id: z.string().uuid(),
  code: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  created_at: dateField,
  updated_at: dateField,
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
});

// Detail response schema (for findOne)
export const ProductSubCategoryDetailResponseSchema = ProductSubCategoryBaseSchema.omit({
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
}).extend({
  category: z.any().nullable().optional(),
  audit: AuditSchema.optional(),
}).passthrough();

// List item response schema (for findAll)
export const ProductSubCategoryListItemResponseSchema = ProductSubCategoryBaseSchema.passthrough();

// Mutation response schema (for create, update, delete)
export const ProductSubCategoryMutationResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().optional(),
}).passthrough();
