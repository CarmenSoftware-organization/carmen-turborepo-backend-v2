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

  @ApiPropertyOptional({ description: 'Document type', example: 'purchase_order' })
  doc_type?: string;

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

  @ApiPropertyOptional({ description: 'Exchange rate date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  exchange_rate_date?: string;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Is consignment', example: false })
  is_consignment?: boolean;

  @ApiPropertyOptional({ description: 'Is cash purchase', example: false })
  is_cash?: boolean;

  @ApiPropertyOptional({ description: 'Signature image URL', example: 'https://example.com/signature.png' })
  signature_image_url?: string;

  @ApiPropertyOptional({ description: 'Received by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  received_by_id?: string;

  @ApiPropertyOptional({ description: 'Received at date (ISO 8601)', example: '2026-03-10T10:30:00.000Z' })
  received_at?: string;

  @ApiPropertyOptional({ description: 'Credit term ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  credit_term_id?: string;

  @ApiPropertyOptional({ description: 'Payment due date (ISO 8601)', example: '2026-04-10T00:00:00.000Z' })
  payment_due_date?: string;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Note', example: 'Please verify item counts' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: unknown;

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

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Document type', example: 'purchase_order' })
  doc_type?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Is consignment', example: false })
  is_consignment?: boolean;

  @ApiPropertyOptional({ description: 'Is cash purchase', example: false })
  is_cash?: boolean;

  @ApiPropertyOptional({ description: 'Is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: unknown;

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
