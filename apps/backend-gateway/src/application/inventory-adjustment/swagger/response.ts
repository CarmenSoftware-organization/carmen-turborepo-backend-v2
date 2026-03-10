import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryAdjustmentListItemResponseDto {
  @ApiProperty({ description: 'Adjustment record ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Adjustment type', enum: ['stock-in', 'stock-out'], example: 'stock-in' })
  type: string;

  @ApiPropertyOptional({ description: 'Document number', example: 'SI-2026-001' })
  doc_no?: string;

  @ApiPropertyOptional({ description: 'Document date', example: '2026-03-10T00:00:00.000Z' })
  doc_date?: Date;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'WH-01' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Warehouse' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Monthly inventory adjustment' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Approved by warehouse manager' })
  note?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class InventoryAdjustmentDetailResponseDto extends InventoryAdjustmentListItemResponseDto {
  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
