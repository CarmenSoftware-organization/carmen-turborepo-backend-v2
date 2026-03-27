import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  AttachmentSchema,
  Attachment,
} from '../../../common/dto/attachment.schema';

export const CreateTransferDetailCommentSchema = z.object({
  transfer_detail_id: z.string().uuid(),
  message: z.string().optional().nullable(),
  type: z.enum(['user', 'system']).default('user'),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export type CreateTransferDetailComment = z.infer<typeof CreateTransferDetailCommentSchema>;

export class CreateTransferDetailCommentDto extends createZodDto(CreateTransferDetailCommentSchema) {}

export const UpdateTransferDetailCommentSchema = z.object({
  message: z.string().optional().nullable(),
  attachments: z.array(AttachmentSchema).optional(),
});

export type UpdateTransferDetailComment = z.infer<typeof UpdateTransferDetailCommentSchema>;

export class UpdateTransferDetailCommentDto extends createZodDto(UpdateTransferDetailCommentSchema) {}

export interface TransferDetailCommentResponse {
  id: string;
  transfer_detail_id: string;
  type: 'user' | 'system';
  user_id: string | null;
  message: string | null;
  attachments: Attachment[];
  created_at: string;
  created_by_id: string | null;
  updated_at: string;
  updated_by_id: string | null;
}
