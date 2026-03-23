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

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

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

export class ProductListResponseDto {
  @ApiProperty({ description: 'List of Product records', type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class ProductMutationResponseDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}

// ==================== Last Purchase Response ====================

export class LastPurchaseItemDto {
  @ApiProperty({ description: 'Detail item ID', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Received quantity', example: 12 })
  received_qty?: number;

  @ApiPropertyOptional({ description: 'Received unit name', example: 'BTL' })
  received_unit_name?: string;

  @ApiPropertyOptional({ description: 'Received base quantity', example: 12 })
  received_base_qty?: number;

  @ApiPropertyOptional({ description: 'Sub total price', example: 600 })
  sub_total_price?: number;

  @ApiPropertyOptional({ description: 'Net amount', example: 600 })
  net_amount?: number;

  @ApiPropertyOptional({ description: 'Total price', example: 642 })
  total_price?: number;

  @ApiPropertyOptional({ description: 'Base total price', example: 642 })
  base_total_price?: number;

  @ApiPropertyOptional({ description: 'Tax rate', example: 7 })
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 42 })
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Discount rate', example: 0 })
  discount_rate?: number;

  @ApiPropertyOptional({ description: 'Discount amount', example: 0 })
  discount_amount?: number;
}

export class LastPurchaseResponseDto {
  @ApiProperty({ description: 'GRN detail ID', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'GRN ID', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  grn_id: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN260301001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'GRN date', example: '2026-03-20T00:00:00.000Z' })
  grn_date?: Date;

  @ApiPropertyOptional({ description: 'Vendor ID', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'THB' })
  currency_code?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1 })
  exchange_rate?: number;

  @ApiProperty({ description: 'Product ID', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'NESTLE PURE LIFE Drinking Water 6L' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'น้ำดื่มเนสท์เล่ เพียวไลฟ์ 6 ลิตร' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Location ID', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiProperty({ description: 'Purchase detail items', type: [LastPurchaseItemDto] })
  items: LastPurchaseItemDto[];
}
