import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductLocationResponseDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  name?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'SKU-OIL-001' })
  sku?: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'Premium Italian olive oil' })
  description?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'On-hand quantity', example: 50.0 })
  on_hand_qty?: number;

  @ApiPropertyOptional({ description: 'Inventory unit ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  inventory_unit_id?: string;

  @ApiPropertyOptional({ description: 'Inventory unit name', example: 'Bottle' })
  inventory_unit_name?: string;

  @ApiPropertyOptional({ description: 'Whether the product is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;
}
