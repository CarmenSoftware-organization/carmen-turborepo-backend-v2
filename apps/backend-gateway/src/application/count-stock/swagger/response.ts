import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountStockDetailResponseDto {
  @ApiProperty({ description: 'Detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Count stock ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  count_stock_id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiProperty({ description: 'Product ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
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
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class CountStockResponseDto {
  @ApiProperty({ description: 'Count stock ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Count stock number', example: 'CS-2026-0001' })
  count_stock_no?: string;

  @ApiPropertyOptional({ description: 'Start date', example: '2026-03-10T00:00:00.000Z' })
  start_date?: Date;

  @ApiPropertyOptional({ description: 'End date', example: '2026-03-10T23:59:59.000Z' })
  end_date?: Date;

  @ApiPropertyOptional({ description: 'Location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'pending' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Monthly stock count' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Count all items' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Count stock detail items', type: [CountStockDetailResponseDto] })
  tb_count_stock_detail?: CountStockDetailResponseDto[];
}

export class CountStockListResponseDto {
  @ApiProperty({ description: 'List of Count Stock records', type: [CountStockResponseDto] })
  data: CountStockResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class CountStockMutationResponseDto {
  @ApiProperty({ description: 'Count Stock ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
