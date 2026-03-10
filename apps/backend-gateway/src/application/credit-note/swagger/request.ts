import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCreditNoteRequestDto {
  @ApiProperty({ description: 'Credit note type', enum: ['quantity_return', 'amount_discount'], example: 'quantity_return' })
  credit_note_type: string;

  @ApiPropertyOptional({ description: 'Credit note number', example: 'CN-2026-001' })
  cn_no?: string;

  @ApiPropertyOptional({ description: 'Credit note date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  cn_date?: string;

  @ApiPropertyOptional({ description: 'Document status', enum: ['draft', 'in_progress', 'completed', 'cancelled', 'voided'], example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Credit note for damaged goods' })
  description?: string;

  @ApiPropertyOptional({ description: 'Credit note reason ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  cn_reason_id?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Items returned to vendor' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Exchange rate date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  exchange_rate_date?: string;

  @ApiPropertyOptional({ description: 'GRN ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  grn_id?: string;
}

export class UpdateCreditNoteRequestDto extends CreateCreditNoteRequestDto {
  @ApiPropertyOptional({ description: 'Credit note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id?: string;
}
