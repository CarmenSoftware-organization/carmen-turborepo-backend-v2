import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriceListTemplateResponseDto {
  @ApiProperty({ description: 'Template ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Template name', example: 'Monthly Food Supply Template' })
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Template for monthly food supply price collection' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Note', example: 'Use for all food vendors' })
  note?: string | null;

  @ApiPropertyOptional({ description: 'Status', example: 'active', enum: ['draft', 'active', 'inactive'] })
  status?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  currency_id?: string | null;

  @ApiPropertyOptional({ description: 'Currency code', example: 'THB' })
  currency_code?: string | null;

  @ApiPropertyOptional({ description: 'Validity period in days', example: 30 })
  validity_period?: number | null;

  @ApiPropertyOptional({ description: 'Instructions for vendors', example: 'Please provide unit prices excluding VAT' })
  vendor_instructions?: string | null;

  @ApiPropertyOptional({ description: 'Whether to send reminders', example: true })
  send_reminders?: boolean;

  @ApiPropertyOptional({ description: 'Reminder days before deadline', type: [Number], example: [7, 3, 1] })
  reminder_days?: number[];

  @ApiPropertyOptional({ description: 'Days after which to escalate', example: 14 })
  escalation_after_days?: number | null;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;
}

export class PriceListTemplateDetailResponseDto {
  @ApiProperty({ description: 'Template detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Template ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  pricelist_template_id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Product ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name?: string | null;

  @ApiPropertyOptional({
    description: 'Array of order units',
    example: [{ unit_id: 'd4e5f6a7-b8c9-0123-def0-1234567890ab', unit_name: 'Bottle' }],
  })
  array_order_unit?: unknown[];

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;
}
