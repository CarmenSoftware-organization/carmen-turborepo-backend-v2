import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export { AddAttachmentDto } from 'src/shared-dto/add-attachment.dto';

export const AttachmentSchema = z.object({
  fileName: z.string(),
  fileToken: z.string(),
  fileUrl: z.string().optional(),
  contentType: z.string(),
  size: z.number().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const CreatePhysicalCountPeriodCommentSchema = z.object({
  physical_count_period_id: z.string().uuid(),
  message: z.string().optional().nullable(),
  type: z.enum(['user', 'system']).default('user'),
  attachments: z.array(AttachmentSchema).optional().default([]),
});

export class CreatePhysicalCountPeriodCommentDto extends createZodDto(CreatePhysicalCountPeriodCommentSchema) {
  @ApiProperty({
    description: 'The ID of the physical-count-period',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  physical_count_period_id: string;

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

export const UpdatePhysicalCountPeriodCommentSchema = z.object({
  message: z.string().optional().nullable(),
  attachments: z.array(AttachmentSchema).optional(),
});

export class UpdatePhysicalCountPeriodCommentDto extends createZodDto(UpdatePhysicalCountPeriodCommentSchema) {
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
