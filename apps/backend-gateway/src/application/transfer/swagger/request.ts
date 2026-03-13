import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDetailSwaggerDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Transfer chicken breast' })
  description?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'อกไก่' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Quantity to transfer', example: 20.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Cost per unit', example: 150.50 })
  cost_per_unit?: number;

  @ApiPropertyOptional({ description: 'Total cost', example: 3010.00 })
  total_cost?: number;

  @ApiPropertyOptional({ description: 'Notes', example: 'Handle with care' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown;
}

export class UpdateTransferDetailSwaggerDto {
  @ApiProperty({ description: 'Detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated transfer item' })
  description?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'อกไก่' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Quantity to transfer', example: 25.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Cost per unit', example: 155.00 })
  cost_per_unit?: number;

  @ApiPropertyOptional({ description: 'Total cost', example: 3875.00 })
  total_cost?: number;

  @ApiPropertyOptional({ description: 'Notes', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown;
}

export class CreateTransferSwaggerDto {
  @ApiPropertyOptional({ description: 'Transfer date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  tr_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Transfer items from main store to kitchen' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'From location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_location_id?: string;

  @ApiPropertyOptional({ description: 'From location code', example: 'MAIN-STORE' })
  from_location_code?: string;

  @ApiPropertyOptional({ description: 'From location name', example: 'Main Store' })
  from_location_name?: string;

  @ApiPropertyOptional({ description: 'To location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  to_location_id?: string;

  @ApiPropertyOptional({ description: 'To location code', example: 'KITCHEN' })
  to_location_code?: string;

  @ApiPropertyOptional({ description: 'To location name', example: 'Kitchen Store' })
  to_location_name?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Urgent transfer for dinner service' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Transfer details (line items)', type: [CreateTransferDetailSwaggerDto] })
  details?: CreateTransferDetailSwaggerDto[];
}

export class UpdateTransferSwaggerDto {
  @ApiPropertyOptional({ description: 'Transfer date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  tr_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated transfer description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'From location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_location_id?: string;

  @ApiPropertyOptional({ description: 'From location code', example: 'MAIN-STORE' })
  from_location_code?: string;

  @ApiPropertyOptional({ description: 'From location name', example: 'Main Store' })
  from_location_name?: string;

  @ApiPropertyOptional({ description: 'To location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  to_location_id?: string;

  @ApiPropertyOptional({ description: 'To location code', example: 'KITCHEN' })
  to_location_code?: string;

  @ApiPropertyOptional({ description: 'To location name', example: 'Kitchen Store' })
  to_location_name?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown;
}
