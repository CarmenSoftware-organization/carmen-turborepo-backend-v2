import { z } from 'zod';
import { AuditSchema } from '../audit/audit.dto';

// Unit comment detail response schema (for findOne — uses enriched audit block)
export const UnitCommentDetailResponseSchema = z.object({
  id: z.string(),
  unit_id: z.string().optional(),
  message: z.string().nullable().optional(),
  attachments: z.any().nullable().optional(),
  audit: AuditSchema.optional(),
});

export type UnitCommentDetailResponse = z.infer<typeof UnitCommentDetailResponseSchema>;

// Unit comment list item response schema (for findAll)
export const UnitCommentListItemResponseSchema = z.object({
  id: z.string(),
  unit_id: z.string().optional(),
  message: z.string().nullable().optional(),
  created_at: z.coerce.date().optional(),
});

export type UnitCommentListItemResponse = z.infer<typeof UnitCommentListItemResponseSchema>;

// Mutation response schema
export const UnitCommentMutationResponseSchema = z.object({
  id: z.string(),
});

export type UnitCommentMutationResponse = z.infer<typeof UnitCommentMutationResponseSchema>;
