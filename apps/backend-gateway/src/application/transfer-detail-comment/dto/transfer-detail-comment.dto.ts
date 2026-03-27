import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const AttachmentSchema = z.object({
  fileName: z.string(),
  fileToken: z.string(),
  fileUrl: z.string().optional(),
  contentType: z.string(),
  size: z.number().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const CreateTransferDetailCommentSchema = z.object({
  transfer_detail_id: z.string().uuid(),
  message: z.string().optional().nullable(),
  type: z.enum(['user', 'system']).default('user'),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export class CreateTransferDetailCommentDto extends createZodDto(CreateTransferDetailCommentSchema) {
  @ApiProperty({
    description: 'The ID of the transfer-detail',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  transfer_detail_id: string;

  @ApiPropertyOptional({
    description: 'Comment message',
    example: 'This is a comment',
  })
  message?: string | null;

  @ApiPropertyOptional({
    description: 'Comment type',
    enum: ['user', 'system'],
    default: 'user',
  })
  type?: 'user' | 'system';

  @ApiPropertyOptional({
    description: 'File attachments',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        fileName: { type: 'string' },
        fileToken: { type: 'string' },
        contentType: { type: 'string' },
      },
    },
  })
  attachments?: Attachment[];
}

export const UpdateTransferDetailCommentSchema = z.object({
  message: z.string().optional().nullable(),
  attachments: z.array(AttachmentSchema).optional(),
});

export class UpdateTransferDetailCommentDto extends createZodDto(UpdateTransferDetailCommentSchema) {
  @ApiPropertyOptional({
    description: 'Updated comment message',
    example: 'Updated comment',
  })
  message?: string | null;

  @ApiPropertyOptional({
    description: 'Updated file attachments',
    type: 'array',
    items: { type: 'object' },
  })
  attachments?: Attachment[];
}

export class AddAttachmentDto {
  @ApiProperty({
    description: 'Original file name',
    example: 'document.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'File token (format: bu_code/uuid)',
    example: 'bu-code/uuid-here',
  })
  fileToken: string;

  @ApiPropertyOptional({
    description: 'Presigned URL',
    example: 'https://minio.example.com/url',
  })
  fileUrl?: string;

  @ApiProperty({
    description: 'Content type',
    example: 'application/pdf',
  })
  contentType: string;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 1024,
  })
  size?: number;
}
