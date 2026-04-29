import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
export { AddAttachmentDto } from 'src/shared-dto/add-attachment.dto';

export const AttachmentSchema = z.object({
  fileName: z.string(),
  fileToken: z.string(),
  fileUrl: z.string().optional(),
  contentType: z.string(),
  size: z.number().optional(),
});
export type Attachment = z.infer<typeof AttachmentSchema>;

export const UpdatePhysicalCountDetailCommentSchema = z.object({
  message: z.string().optional().nullable(),
  attachments: z.array(AttachmentSchema).optional(),
});

export class UpdatePhysicalCountDetailCommentDto extends createZodDto(UpdatePhysicalCountDetailCommentSchema) {
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
