import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserClusterResponseDto {
  @ApiProperty({ description: 'User-Cluster mapping ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id?: string;

  @ApiProperty({ description: 'Cluster ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  cluster_id: string;

  @ApiPropertyOptional({ description: 'Is mapping active', example: true })
  is_active?: boolean;

  @ApiProperty({ description: 'User role in cluster', example: 'user', enum: ['admin', 'user'] })
  role: string;

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

export class UserClusterListResponseDto {
  @ApiProperty({ description: 'List of User Cluster records', type: [UserClusterResponseDto] })
  data: UserClusterResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class UserClusterMutationResponseDto {
  @ApiProperty({ description: 'User Cluster ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
