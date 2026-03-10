import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VendorEmbeddedDto {
  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  name?: string;

  @ApiPropertyOptional({ description: 'Vendor code', example: 'V-001' })
  code?: string;
}

class GoodReceivedNoteEmbeddedDto {
  @ApiPropertyOptional({ description: 'GRN ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id?: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN-2026-001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'GRN name', example: 'GRN for ABC Supplies' })
  name?: string;
}

class CreditNoteDetailEmbeddedDto {
  @ApiProperty({ description: 'Credit note detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Rice 5kg' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Damaged item' })
  description?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 5 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  unit_id?: string;

  @ApiPropertyOptional({ description: 'Unit name', example: 'kg' })
  unit_name?: string;

  @ApiPropertyOptional({ description: 'Unit price', example: 25.5 })
  unit_price?: number;

  @ApiPropertyOptional({ description: 'Total price', example: 127.5 })
  total_price?: number;

  @ApiPropertyOptional({ description: 'Reason ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  reason_id?: string;

  @ApiPropertyOptional({ description: 'Reason name', example: 'Damaged Goods' })
  reason_name?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;
}

export class CreditNoteListItemResponseDto {
  @ApiProperty({ description: 'Credit note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Credit note number', example: 'CN-2026-001' })
  cn_no?: string;

  @ApiPropertyOptional({ description: 'Credit note name', example: 'Credit Note for Damaged Goods' })
  name?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Credit note for damaged goods' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  status?: string;

  @ApiPropertyOptional({ description: 'Credit note date', example: '2026-03-10T00:00:00.000Z' })
  credit_note_date?: Date;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Good received note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  good_received_note_id?: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN-2026-001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'Total amount', example: 500.0 })
  total_amount?: number;

  @ApiPropertyOptional({ description: 'Whether the credit note is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class CreditNoteDetailResponseDto extends CreditNoteListItemResponseDto {
  @ApiPropertyOptional({ description: 'Vendor details (embedded)', type: VendorEmbeddedDto })
  vendor?: VendorEmbeddedDto;

  @ApiPropertyOptional({ description: 'Good received note details (embedded)', type: GoodReceivedNoteEmbeddedDto })
  good_received_note?: GoodReceivedNoteEmbeddedDto;

  @ApiPropertyOptional({ description: 'Sub-total amount', example: 450.0 })
  sub_total?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 50.0 })
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Items returned to vendor' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Credit note line items', type: [CreditNoteDetailEmbeddedDto] })
  credit_note_detail?: CreditNoteDetailEmbeddedDto[];
}

export class CreditNoteMutationResponseDto {
  @ApiProperty({ description: 'Credit note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
