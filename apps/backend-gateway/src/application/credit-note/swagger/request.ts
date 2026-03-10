import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCreditNoteRequestDto {
  @ApiProperty({ description: 'Credit note type', enum: ['quantity_return', 'amount_discount'], example: 'quantity_return' })
  credit_note_type: string;

  @ApiPropertyOptional({ description: 'Credit note number', example: 'CN-2026-001' })
  cn_no?: string;

  @ApiPropertyOptional({ description: 'Credit note date', example: '2026-03-10T00:00:00.000Z' })
  cn_date?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  currency_code?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'GRN ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  grn_id?: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN-2026-001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'Credit note reason ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  cn_reason_id?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-001' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Invoice date', example: '2026-03-01T00:00:00.000Z' })
  invoice_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Credit note for damaged goods' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Items returned to vendor' })
  note?: string;
}

export class UpdateCreditNoteRequestDto {
  @ApiPropertyOptional({ description: 'Credit note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id?: string;

  @ApiPropertyOptional({ description: 'Credit note type', enum: ['quantity_return', 'amount_discount'], example: 'quantity_return' })
  credit_note_type?: string;

  @ApiPropertyOptional({ description: 'Credit note number', example: 'CN-2026-001' })
  cn_no?: string;

  @ApiPropertyOptional({ description: 'Credit note date', example: '2026-03-10T00:00:00.000Z' })
  cn_date?: string;

  @ApiPropertyOptional({ description: 'Document status', enum: ['draft', 'in_progress', 'completed', 'cancelled', 'voided'], example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  currency_code?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'GRN ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  grn_id?: string;

  @ApiPropertyOptional({ description: 'Credit note reason ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  cn_reason_id?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated credit note for damaged goods' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Items returned to vendor' })
  note?: string;
}
