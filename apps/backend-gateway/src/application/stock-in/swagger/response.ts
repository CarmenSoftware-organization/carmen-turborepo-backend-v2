import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockInResponseDto {
  @ApiProperty({ description: 'Stock In ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Stock In number', example: 'SI-2026-0001' })
  si_no?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Stock adjustment - items found during count' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Adjustment type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  adjustment_type_id?: string;

  @ApiPropertyOptional({ description: 'Adjustment type code', example: 'ADJ-IN' })
  adjustment_type_code?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Found during physical count' })
  note?: string;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'Stock In Workflow' })
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

  @ApiPropertyOptional({ description: 'Stock In details (line items)', type: 'array' })
  details?: unknown[];
}

export class StockInListResponseDto {
  @ApiProperty({ description: 'List of Stock In records', type: [StockInResponseDto] })
  data: StockInResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class StockInMutationResponseDto {
  @ApiProperty({ description: 'Stock In ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Stock In number', example: 'SI-2026-0001' })
  si_no?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;
}

export class StockInDetailResponseDto {
  @ApiProperty({ description: 'Stock In Detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  unit_id?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 10.0 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Unit price', example: 50.0 })
  unit_price?: number;
}
