import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClusterResponseDto {
  @ApiProperty({ description: 'Cluster ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Cluster code', example: 'CLU001' })
  code: string;

  @ApiProperty({ description: 'Cluster name', example: 'Main Cluster' })
  name: string;

  @ApiPropertyOptional({ description: 'Alias name', example: 'MC' })
  alias_name?: string;

  @ApiPropertyOptional({ description: 'Logo URL', example: 'https://example.com/logo.png' })
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Is cluster active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

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
