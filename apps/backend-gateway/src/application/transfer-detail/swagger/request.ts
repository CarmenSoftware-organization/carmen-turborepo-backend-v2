import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDetailCreateRequestDto {
  @ApiProperty({ description: 'Transfer ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  transfer_id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Transfer of kitchen supplies' })
  description?: string;

  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 25 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Cost per unit', example: 120.00 })
  cost_per_unit?: number;

  @ApiPropertyOptional({ description: 'Total cost', example: 3000.00 })
  total_cost?: number;

  @ApiPropertyOptional({ description: 'Notes', example: 'Transfer from main store to kitchen' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown;
}

export class TransferDetailUpdateRequestDto {
  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated transfer description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 25 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Cost per unit', example: 120.00 })
  cost_per_unit?: number;

  @ApiPropertyOptional({ description: 'Total cost', example: 3000.00 })
  total_cost?: number;

  @ApiPropertyOptional({ description: 'Notes', example: 'Updated notes' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON array)', example: [] })
  dimension?: unknown;
}
