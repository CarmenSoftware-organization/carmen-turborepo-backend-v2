import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoodReceivedNoteResponseDto {
  @ApiProperty({ description: 'Good Received Note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN-2026-0001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'GRN date', example: '2026-03-10T00:00:00.000Z' })
  grn_date?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV-2026-0100' })
  invoice_no?: string;

  @ApiPropertyOptional({ description: 'Invoice date', example: '2026-03-09T00:00:00.000Z' })
  invoice_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Goods received from ABC Supplies' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Document type', example: 'purchase_order' })
  doc_type?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Supplies Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'THB' })
  currency_code?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Exchange rate date', example: '2026-03-10T00:00:00.000Z' })
  exchange_rate_date?: string;

  @ApiPropertyOptional({ description: 'Is consignment', example: false })
  is_consignment?: boolean;

  @ApiPropertyOptional({ description: 'Is cash purchase', example: false })
  is_cash?: boolean;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'GRN Workflow' })
  workflow_name?: string;

  @ApiPropertyOptional({ description: 'Workflow current stage', example: 'draft' })
  workflow_current_stage?: string;

  @ApiPropertyOptional({ description: 'Last action performed', example: 'submitted' })
  last_action?: string;

  @ApiPropertyOptional({ description: 'Last action date', example: '2026-03-10T10:30:00.000Z' })
  last_action_at_date?: string;

  @ApiPropertyOptional({ description: 'Last action by user name', example: 'John Doe' })
  last_action_by_name?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: string;

  @ApiPropertyOptional({ description: 'GRN details (line items)', type: 'array' })
  details?: unknown[];
}

export class GoodReceivedNoteListResponseDto {
  @ApiProperty({ description: 'List of Good Received Notes', type: [GoodReceivedNoteResponseDto] })
  data: GoodReceivedNoteResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class GoodReceivedNoteMutationResponseDto {
  @ApiProperty({ description: 'Good Received Note ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'GRN number', example: 'GRN-2026-0001' })
  grn_no?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;
}

export class GrnCommentResponseDto {
  @ApiProperty({ description: 'Comment ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Comment text', example: 'Items verified and accepted' })
  comment?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T10:30:00.000Z' })
  created_at?: string;
}
