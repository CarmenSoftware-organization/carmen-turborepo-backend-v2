import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationRoleResponseDto {
  @ApiProperty({ description: 'Application role ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Role name', example: 'Admin' })
  name: string;

  @ApiPropertyOptional({ description: 'Role code', example: 'ADMIN' })
  code?: string;

  @ApiPropertyOptional({ description: 'Role description', example: 'Administrator role with full access' })
  description?: string;

  @ApiPropertyOptional({ description: 'Is role active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Deleted timestamp', example: null })
  deleted_at?: Date;
}

export class ApplicationRoleListResponseDto {
  @ApiProperty({ description: 'List of Application Role records', type: [ApplicationRoleResponseDto] })
  data: ApplicationRoleResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class ApplicationRoleMutationResponseDto {
  @ApiProperty({ description: 'Application Role ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
