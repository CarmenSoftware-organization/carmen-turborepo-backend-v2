import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'GRN date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  grn_date?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-0100' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Invoice date (ISO 8601)', example: '2026-03-09T00:00:00.000Z' })
  invoice_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Goods received from ABC Supplies' })
  description?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  vendor_name?: string;

  @ApiProperty({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'THB' })
  currency_code?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'GRN details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdateGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'GRN date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  grn_date?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-0100' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Invoice date (ISO 8601)', example: '2026-03-09T00:00:00.000Z' })
  invoice_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated GRN description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'GRN details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class RejectGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'Reason for rejection', example: 'Items damaged during transit' })
  reason?: string;
}

export class ConfirmGoodReceivedNoteSwaggerDto {
  @ApiPropertyOptional({ description: 'Confirmation data (JSON)', example: {} })
  data?: unknown;
}

export class CreateGrnCommentSwaggerDto {
  @ApiProperty({ description: 'Comment text', example: 'Checked all items, quantities match.' })
  comment: string;
}
