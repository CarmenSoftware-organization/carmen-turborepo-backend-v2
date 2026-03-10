import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnitResponseDto {
  @ApiProperty({ description: 'Unit ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Unit name', example: 'Kilogram' })
  name: string;

  @ApiPropertyOptional({ description: 'Unit description', example: 'Standard metric unit of mass' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the unit is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Used for dry goods' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-01-15T10:30:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-01-15T10:30:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
