import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferSwaggerDto {
  @ApiPropertyOptional({ description: 'Transfer date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  tr_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Transfer items from main store to kitchen' })
  description?: string;

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

  @ApiPropertyOptional({ description: 'Transfer details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdateTransferSwaggerDto {
  @ApiPropertyOptional({ description: 'Transfer date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  tr_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated transfer description' })
  description?: string;

  @ApiPropertyOptional({ description: 'From location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_location_id?: string;

  @ApiPropertyOptional({ description: 'To location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  to_location_id?: string;

  @ApiPropertyOptional({ description: 'Transfer details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class CreateTransferDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  unit_id?: string;

  @ApiPropertyOptional({ description: 'Quantity to transfer', example: 20.0 })
  qty?: number;
}

export class UpdateTransferDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Quantity to transfer', example: 25.0 })
  qty?: number;
}
