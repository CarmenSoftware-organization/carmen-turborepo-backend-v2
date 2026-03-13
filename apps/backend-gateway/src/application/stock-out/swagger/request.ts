import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockOutSwaggerDto {
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

  @ApiPropertyOptional({ description: 'Note', example: 'Spoiled items removed from inventory' })
  note?: string;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: object;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: object;

  @ApiPropertyOptional({ description: 'Stock Out details (line items)', example: { add: [] } })
  stock_out_detail?: object;
}

export class UpdateStockOutSwaggerDto {
  @ApiPropertyOptional({ description: 'Description', example: 'Updated stock out adjustment' })
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

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: object;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: object;

  @ApiPropertyOptional({
    description: 'Stock Out details (add/update/remove)',
    example: { add: [], update: [], remove: [] },
  })
  stock_out_detail?: object;
}

export class CreateStockOutDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Product description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 5.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Note', example: 'Detail note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Product name (denormalized)', example: 'Widget A' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name (denormalized)', example: 'วิดเจ็ต A' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: object;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: object;
}

export class UpdateStockOutDetailSwaggerDto {
  @ApiProperty({ description: 'Stock Out Detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Quantity', example: 8.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated detail note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Product name (denormalized)', example: 'Widget A' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name (denormalized)', example: 'วิดเจ็ต A' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: object;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: object;
}
