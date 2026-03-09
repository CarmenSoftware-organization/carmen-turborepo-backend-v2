import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreditNoteReasonCreate = z.object({
  name: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().default(true).nullable().optional(),
  note: z.string().optional(),
  info: z.any().optional(),
  dimension: z.any().optional(),
});

export type ICreateCreditNoteReason = z.infer<typeof CreditNoteReasonCreate>;
export class CreditNoteReasonCreateDto extends createZodDto(CreditNoteReasonCreate) {}
