import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  AttachmentSchema,
  Attachment,
} from '../../../common/dto/attachment.schema';

export const CreateCountStockDetailCommentSchema = z.object({
  count_stock_detail_id: z.string().uuid(),
  message: z.string().optional().nullable(),
  type: z.enum(['user', 'system']).default('user'),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export type CreateCountStockDetailComment = z.infer<typeof CreateCountStockDetailCommentSchema>;

export class CreateCountStockDetailCommentDto extends createZodDto(CreateCountStockDetailCommentSchema) {}

export const UpdateCountStockDetailCommentSchema = z.object({
  message: z.string().optional().nullable(),
  attachments: z.array(AttachmentSchema).optional(),
});

export type UpdateCountStockDetailComment = z.infer<typeof UpdateCountStockDetailCommentSchema>;

export class UpdateCountStockDetailCommentDto extends createZodDto(UpdateCountStockDetailCommentSchema) {}

export interface CountStockDetailCommentResponse {
  id: string;
  count_stock_detail_id: string;
  type: 'user' | 'system';
  user_id: string | null;
  message: string | null;
  attachments: Attachment[];
  created_at: string;
  created_by_id: string | null;
  updated_at: string;
  updated_by_id: string | null;
}
