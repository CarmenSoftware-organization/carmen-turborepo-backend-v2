import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Product code', example: 'PRD-001' })
  code: string;

  @ApiProperty({ description: 'Product name', example: 'Olive Oil Extra Virgin' })
  name: string;

  @ApiPropertyOptional({ description: 'Local name of the product', example: 'น้ำมันมะกอก' })
  local_name?: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'Premium extra virgin olive oil' })
  description?: string;

  @ApiProperty({ description: 'Inventory unit ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  inventory_unit_id: string;

  @ApiPropertyOptional({ description: 'Inventory unit name', example: 'Liter' })
  inventory_unit_name?: string;

  @ApiPropertyOptional({ description: 'Product status type', example: 'active' })
  product_status_type?: string;

  @ApiPropertyOptional({ description: 'Product item group ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_item_group_id?: string;

  @ApiPropertyOptional({ description: 'Whether the product is used in recipes', example: true })
  is_used_in_recipe?: boolean;

  @ApiPropertyOptional({ description: 'Whether the product is sold directly', example: false })
  is_sold_directly?: boolean;

  @ApiPropertyOptional({ description: 'Product barcode', example: '8850000000001' })
  barcode?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'SKU-OIL-001' })
  sku?: string;

  @ApiPropertyOptional({ description: 'Price deviation limit', example: 10.0 })
  price_deviation_limit?: number;

  @ApiPropertyOptional({ description: 'Quantity deviation limit', example: 5.0 })
  qty_deviation_limit?: number;

  @ApiPropertyOptional({ description: 'Tax profile ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  tax_profile_id?: string;

  @ApiPropertyOptional({ description: 'Tax profile name', example: 'VAT 7%' })
  tax_profile_name?: string;

  @ApiPropertyOptional({ description: 'Tax rate', example: 7.0 })
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Whether the product is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Imported from Italy' })
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

export class ProductItemGroupResponseDto {
  @ApiProperty({ description: 'Item group ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Item group code', example: 'IG-001' })
  code: string;

  @ApiProperty({ description: 'Item group name', example: 'Cooking Oils' })
  name: string;

  @ApiPropertyOptional({ description: 'Item group description', example: 'All cooking oils and fats' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the item group is active', example: true })
  is_active?: boolean;
}
