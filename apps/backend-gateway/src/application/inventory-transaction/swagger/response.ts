import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryTransactionResponseDto {
  @ApiProperty({ description: 'Inventory transaction ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Inventory document type', enum: ['good_received_note', 'credit_note', 'store_requisition', 'stock_in', 'stock_out'], example: 'good_received_note' })
  inventory_doc_type: string;

  @ApiProperty({ description: 'Inventory document number (UUID reference)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  inventory_doc_no: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Transaction created from GRN approval' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;
}

export class InventoryTransactionMutationResponseDto {
  @ApiProperty({ description: 'Inventory transaction ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Inventory document type', example: 'good_received_note' })
  inventory_doc_type: string;

  @ApiProperty({ description: 'Inventory document number', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  inventory_doc_no: string;
}
