import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountStockDetailCreateRequest {
  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'น้ำมันมะกอก 1 ลิตร' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'OIL-OLV-1L' })
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 10.5 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Item description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Item note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown[];
}

export class CountStockDetailUpdateRequest {
  @ApiProperty({ description: 'Detail item ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'น้ำมันมะกอก 1 ลิตร' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'OIL-OLV-1L' })
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 10.5 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Item description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Item note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown[];
}

export class CountStockDetailUpdateGroup {
  @ApiPropertyOptional({ description: 'Details to add', type: [CountStockDetailCreateRequest] })
  add?: CountStockDetailCreateRequest[];

  @ApiPropertyOptional({ description: 'Details to update', type: [CountStockDetailUpdateRequest] })
  update?: CountStockDetailUpdateRequest[];

  @ApiPropertyOptional({ description: 'Detail IDs to delete', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  delete?: string[];
}

export class CountStockCreateRequest {
  @ApiProperty({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Count stock number', example: 'CS-2026-0001' })
  count_stock_no?: string;

  @ApiPropertyOptional({ description: 'Start date', example: '2026-03-10T00:00:00.000Z' })
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2026-03-10T23:59:59.000Z' })
  end_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Monthly stock count' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Count all items in main kitchen' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown[];

  @ApiPropertyOptional({ description: 'Count stock detail items', type: [CountStockDetailCreateRequest] })
  details?: CountStockDetailCreateRequest[];
}

export class CountStockUpdateRequest {
  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Count stock number', example: 'CS-2026-0001' })
  count_stock_no?: string;

  @ApiPropertyOptional({ description: 'Start date', example: '2026-03-10T00:00:00.000Z' })
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2026-03-10T23:59:59.000Z' })
  end_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Monthly stock count' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Count all items in main kitchen' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown[];

  @ApiPropertyOptional({ description: 'Details add/update/delete', type: CountStockDetailUpdateGroup })
  details?: CountStockDetailUpdateGroup;
}
