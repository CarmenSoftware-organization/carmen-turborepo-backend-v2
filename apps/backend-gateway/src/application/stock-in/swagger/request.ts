import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStockInSwaggerDto {
  @ApiPropertyOptional({ description: 'Description', example: 'Stock adjustment - items found during count' })
  description?: string;

  @ApiPropertyOptional({ description: 'Adjustment type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  adjustment_type_id?: string;

  @ApiPropertyOptional({ description: 'Adjustment type code', example: 'ADJ-IN' })
  adjustment_type_code?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Found during physical count' })
  note?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Stock In details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdateStockInSwaggerDto {
  @ApiPropertyOptional({ description: 'Description', example: 'Updated stock adjustment' })
  description?: string;

  @ApiPropertyOptional({ description: 'Adjustment type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  adjustment_type_id?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Stock In details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class CreateStockInDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  unit_id?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 10.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Unit price', example: 50.0 })
  unit_price?: number;
}

export class UpdateStockInDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Quantity', example: 15.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Unit price', example: 55.0 })
  unit_price?: number;
}
