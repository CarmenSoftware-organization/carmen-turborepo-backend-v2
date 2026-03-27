import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  AttachmentSchema,
  Attachment,
} from '../../../common/dto/attachment.schema';

export const CreateTransferCommentSchema = z.object({
  transfer_id: z.string().uuid(),
  message: z.string().optional().nullable(),
  type: z.enum(['user', 'system']).default('user'),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export type CreateTransferComment = z.infer<typeof CreateTransferCommentSchema>;

export class CreateTransferCommentDto extends createZodDto(CreateTransferCommentSchema) {}

export const UpdateTransferCommentSchema = z.object({
  message: z.string().optional().nullable(),
  attachments: z.array(AttachmentSchema).optional(),
});

export type UpdateTransferComment = z.infer<typeof UpdateTransferCommentSchema>;

export class UpdateTransferCommentDto extends createZodDto(UpdateTransferCommentSchema) {}

export interface TransferCommentResponse {
  id: string;
  transfer_id: string;
  type: 'user' | 'system';
  user_id: string | null;
  message: string | null;
  attachments: Attachment[];
  created_at: string;
  created_by_id: string | null;
  updated_at: string;
  updated_by_id: string | null;
}
