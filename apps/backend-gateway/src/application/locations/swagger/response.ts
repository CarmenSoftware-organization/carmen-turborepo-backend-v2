import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationListItemResponseDto {
  @ApiProperty({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Location code', example: 'WH-01' })
  code: string;

  @ApiProperty({ description: 'Location name', example: 'Main Warehouse' })
  name: string;

  @ApiPropertyOptional({ description: 'Location type', enum: ['inventory', 'direct', 'consignment'], example: 'inventory' })
  location_type?: string;

  @ApiPropertyOptional({ description: 'Location description', example: 'Primary storage warehouse' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the location is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class LocationDetailResponseDto extends LocationListItemResponseDto {
  @ApiPropertyOptional({ description: 'Delivery point ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  delivery_point_id?: string;

  @ApiPropertyOptional({ description: 'Delivery point name', example: 'Loading Dock A' })
  delivery_point_name?: string;

  @ApiPropertyOptional({ description: 'Physical count type', enum: ['no', 'daily', 'weekly', 'monthly'], example: 'no' })
  physical_count_type?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Temperature-controlled area' })
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

export class ProductInventoryInfoResponseDto {
  @ApiProperty({ description: 'On-hand quantity', example: 150.0 })
  on_hand_qty: number;

  @ApiProperty({ description: 'On-order quantity', example: 50.0 })
  on_order_qty: number;

  @ApiProperty({ description: 'Reorder quantity threshold', example: 20.0 })
  re_order_qty: number;

  @ApiProperty({ description: 'Restock quantity', example: 100.0 })
  re_stock_qty: number;
}
