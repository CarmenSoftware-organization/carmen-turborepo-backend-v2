import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export class AuditUserDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' }) id!: string;
  @ApiProperty({ example: 'John Doe' }) name!: string;
}

export class AuditDto {
  @ApiProperty({ type: String, format: 'date-time', nullable: true, example: '2026-04-01T10:00:00Z' })
  created_at!: string | null;
  @ApiProperty({ type: AuditUserDto, nullable: true })
  created_by!: AuditUserDto | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true, example: '2026-04-15T08:30:00Z' })
  updated_at!: string | null;
  @ApiProperty({ type: AuditUserDto, nullable: true })
  updated_by!: AuditUserDto | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true, example: null })
  deleted_at!: string | null;
  @ApiProperty({ type: AuditUserDto, nullable: true })
  deleted_by!: AuditUserDto | null;
}

const AuditUserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AuditSchema = z.object({
  created_at: z.union([z.string(), z.date()]).nullable(),
  created_by: AuditUserSchema.nullable(),
  updated_at: z.union([z.string(), z.date()]).nullable(),
  updated_by: AuditUserSchema.nullable(),
  deleted_at: z.union([z.string(), z.date()]).nullable(),
  deleted_by: AuditUserSchema.nullable(),
});

export type Audit = z.infer<typeof AuditSchema>;
