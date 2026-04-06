import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export { AddAttachmentDto } from 'src/shared-dto/add-attachment.dto';

export const AttachmentSchema = z.object({ fileName: z.string(), fileToken: z.string(), fileUrl: z.string().optional(), contentType: z.string(), size: z.number().optional() });
export type Attachment = z.infer<typeof AttachmentSchema>;

export const CreateVendorBusinessTypeCommentSchema = z.object({ vendor_business_type_id: z.string().uuid(), message: z.string().optional().nullable(), type: z.enum(['user', 'system']).default('user'), attachments: z.array(AttachmentSchema).optional().default([]) });

export class CreateVendorBusinessTypeCommentDto extends createZodDto(CreateVendorBusinessTypeCommentSchema) {
  @ApiProperty({ description: 'The ID of the vendor-business-type', example: '123e4567-e89b-12d3-a456-426614174000' }) vendor_business_type_id: string;
  @ApiPropertyOptional({ description: 'Comment message', example: 'This is a comment' }) message?: string | null;
  @ApiPropertyOptional({ description: 'Comment type', enum: ['user', 'system'], default: 'user' }) type?: 'user' | 'system';
  @ApiPropertyOptional({ description: 'File attachments', type: 'array', items: { type: 'object' } }) attachments?: Attachment[];
}

export const UpdateVendorBusinessTypeCommentSchema = z.object({ message: z.string().optional().nullable(), attachments: z.array(AttachmentSchema).optional() });

export class UpdateVendorBusinessTypeCommentDto extends createZodDto(UpdateVendorBusinessTypeCommentSchema) {
  @ApiPropertyOptional({ description: 'Updated message', example: 'Updated comment' }) message?: string | null;
  @ApiPropertyOptional({ description: 'Updated attachments', type: 'array', items: { type: 'object' } }) attachments?: Attachment[];
}
