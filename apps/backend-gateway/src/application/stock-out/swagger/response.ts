import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockOutDetailResponseDto {
  @ApiProperty({ description: 'Stock Out Detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Widget A' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'วิดเจ็ต A' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Product description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 5.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Note', example: 'Detail note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)' })
  info?: object;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)' })
  dimension?: object;
}

export class StockOutResponseDto {
  @ApiProperty({ description: 'Stock Out ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Stock Out number', example: 'SO-2026-0001' })
  so_no?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Stock adjustment - spoiled items' })
  description?: string;

  @ApiPropertyOptional({ description: 'Adjustment type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  adjustment_type_id?: string;

  @ApiPropertyOptional({ description: 'Adjustment type code', example: 'ADJ-OUT' })
  adjustment_type_code?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Warehouse' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Spoiled items' })
  note?: string;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Additional info (JSON)' })
  info?: object;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)' })
  dimension?: object;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Stock Out details (line items)', type: [StockOutDetailResponseDto] })
  stock_out_detail?: StockOutDetailResponseDto[];
}

export class StockOutListResponseDto {
  @ApiProperty({ description: 'List of Stock Out records', type: [StockOutResponseDto] })
  data: StockOutResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class StockOutMutationResponseDto {
  @ApiProperty({ description: 'Stock Out ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Stock Out number', example: 'SO-2026-0001' })
  so_no?: string;
}
