import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationPermissionResponseDto {
  @ApiProperty({ description: 'Permission ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Permission name', example: 'create_user' })
  name: string;

  @ApiPropertyOptional({ description: 'Permission code', example: 'user.create' })
  code?: string;

  @ApiProperty({ description: 'Permission resource', example: 'user' })
  resource: string;

  @ApiProperty({ description: 'Permission action', example: 'create' })
  action: string;

  @ApiPropertyOptional({ description: 'Permission description', example: 'Permission to create new users' })
  description?: string;

  @ApiPropertyOptional({ description: 'Is permission active', example: true })
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

export class ApplicationPermissionListResponseDto {
  @ApiProperty({ description: 'List of Application Permission records', type: [ApplicationPermissionResponseDto] })
  data: ApplicationPermissionResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class ApplicationPermissionMutationResponseDto {
  @ApiProperty({ description: 'Application Permission ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
