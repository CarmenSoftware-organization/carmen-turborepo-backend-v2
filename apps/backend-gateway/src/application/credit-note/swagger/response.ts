import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditNoteListItemResponseDto {
  @ApiProperty({ description: 'Credit note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Credit note number', example: 'CN-2026-001' })
  cn_no?: string;

  @ApiPropertyOptional({ description: 'Credit note date', example: '2026-03-10T00:00:00.000Z' })
  cn_date?: Date;

  @ApiProperty({ description: 'Document status', enum: ['draft', 'in_progress', 'completed', 'cancelled', 'voided'], example: 'draft' })
  doc_status: string;

  @ApiProperty({ description: 'Credit note type', enum: ['quantity_return', 'amount_discount'], example: 'quantity_return' })
  credit_note_type: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  currency_code?: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN-2026-001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-001' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class CreditNoteDetailResponseDto extends CreditNoteListItemResponseDto {
  @ApiPropertyOptional({ description: 'Pricelist detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  pricelist_detail_id?: string;

  @ApiPropertyOptional({ description: 'Pricelist number', example: 'PL-2026-001' })
  pricelist_no?: string;

  @ApiPropertyOptional({ description: 'Pricelist unit', example: 'kg' })
  pricelist_unit?: string;

  @ApiPropertyOptional({ description: 'Pricelist price', example: 25.5 })
  pricelist_price?: number;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Exchange rate date', example: '2026-03-10T00:00:00.000Z' })
  exchange_rate_date?: Date;

  @ApiPropertyOptional({ description: 'GRN ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  grn_id?: string;

  @ApiPropertyOptional({ description: 'GRN date', example: '2026-03-08T00:00:00.000Z' })
  grn_date?: Date;

  @ApiPropertyOptional({ description: 'Credit note reason ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  cn_reason_id?: string;

  @ApiPropertyOptional({ description: 'Credit note reason name', example: 'Damaged Goods' })
  cn_reason_name?: string;

  @ApiPropertyOptional({ description: 'Credit note reason description', example: 'Items arrived damaged' })
  cn_reason_description?: string;

  @ApiPropertyOptional({ description: 'Invoice date', example: '2026-03-05T00:00:00.000Z' })
  invoice_date?: Date;

  @ApiPropertyOptional({ description: 'Tax invoice number', example: 'TAXINV-2026-001' })
  tax_invoice_no?: string;

  @ApiPropertyOptional({ description: 'Tax invoice date', example: '2026-03-05T00:00:00.000Z' })
  tax_invoice_date?: Date;

  @ApiPropertyOptional({ description: 'Description', example: 'Credit note for damaged goods' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Items returned to vendor' })
  note?: string;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'Credit Note Approval' })
  workflow_name?: string;

  @ApiPropertyOptional({ description: 'Current workflow stage', example: 'draft' })
  workflow_current_stage?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class CreditNoteMutationResponseDto {
  @ApiProperty({ description: 'Credit note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Credit note number', example: 'CN-2026-001' })
  cn_no?: string;

  @ApiProperty({ description: 'Document status', enum: ['draft', 'in_progress', 'completed', 'cancelled', 'voided'], example: 'draft' })
  doc_status: string;
}
