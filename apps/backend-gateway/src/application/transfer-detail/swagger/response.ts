import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferDetailResponseDto {
  @ApiProperty({ description: 'Transfer detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Inventory transaction ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  inventory_transaction_id?: string;

  @ApiProperty({ description: 'Transfer ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  transfer_id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Transfer of kitchen supplies' })
  description?: string;

  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'อกไก่' })
  product_local_name?: string;

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

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
