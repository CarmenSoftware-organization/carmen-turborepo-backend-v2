import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentListItemResponseDto {
  @ApiProperty({ description: 'Department ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Department code', example: 'FNB' })
  code: string;

  @ApiProperty({ description: 'Department name', example: 'Food & Beverage' })
  name: string;

  @ApiPropertyOptional({ description: 'Department description', example: 'Handles all food and beverage operations' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the department is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class DepartmentDetailResponseDto extends DepartmentListItemResponseDto {
  @ApiPropertyOptional({ description: 'Additional notes', example: 'Main department for restaurant' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
