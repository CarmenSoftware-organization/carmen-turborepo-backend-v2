import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockOutSwaggerDto {
  @ApiPropertyOptional({ description: 'Description', example: 'Stock adjustment - spoiled items' })
  description?: string;

  @ApiPropertyOptional({ description: 'Adjustment type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  adjustment_type_id?: string;

  @ApiPropertyOptional({ description: 'Adjustment type code', example: 'ADJ-OUT' })
  adjustment_type_code?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Spoiled items removed from inventory' })
  note?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Stock Out details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdateStockOutSwaggerDto {
  @ApiPropertyOptional({ description: 'Description', example: 'Updated stock out adjustment' })
  description?: string;

  @ApiPropertyOptional({ description: 'Adjustment type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  adjustment_type_id?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Stock Out details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class CreateStockOutDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  unit_id?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 5.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Unit price', example: 50.0 })
  unit_price?: number;
}

export class UpdateStockOutDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Quantity', example: 8.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Unit price', example: 55.0 })
  unit_price?: number;
}
