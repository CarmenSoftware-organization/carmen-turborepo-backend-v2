import { z } from 'zod';
import { AuditSchema } from '../audit/audit.dto';

// Department user detail response schema (for findOne with audit enrichment)
export const DepartmentUserDetailResponseSchema = z.object({
  id: z.string(),
  department_id: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  doc_version: z.number().nullable().optional(),
  audit: AuditSchema.optional(),
}).passthrough();

export type DepartmentUserDetailResponse = z.infer<typeof DepartmentUserDetailResponseSchema>;
