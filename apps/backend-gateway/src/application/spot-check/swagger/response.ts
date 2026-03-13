import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpotCheckDetailResponseDto {
  @ApiProperty({ description: 'Spot check detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Spot check ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  spot_check_id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiProperty({ description: 'Product ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 42.5 })
  qty?: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Item description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Item note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class SpotCheckResponseDto {
  @ApiProperty({ description: 'Spot check ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Spot check number', example: 'SC-2026-0001' })
  spot_check_no?: string;

  @ApiProperty({ description: 'Start date', example: '2026-03-10T00:00:00.000Z' })
  start_date: Date;

  @ApiPropertyOptional({ description: 'End date', example: '2026-03-10T12:00:00.000Z' })
  end_date?: Date;

  @ApiProperty({ description: 'Location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  location_id: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiProperty({ description: 'Document status', example: 'pending' })
  doc_status: string;

  @ApiProperty({ description: 'Spot check method', example: 'random' })
  method: string;

  @ApiProperty({ description: 'Sample size', example: 10 })
  size: number;

  @ApiPropertyOptional({ description: 'Description', example: 'Weekly spot check' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Focus on high-value items' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'Spot Check Workflow' })
  workflow_name?: string;

  @ApiPropertyOptional({ description: 'Workflow current stage', example: 'draft' })
  workflow_current_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow previous stage', example: null })
  workflow_previous_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow next stage', example: 'approval' })
  workflow_next_stage?: string;

  @ApiPropertyOptional({ description: 'User action (JSON)', example: {} })
  user_action?: unknown;

  @ApiPropertyOptional({ description: 'Last action performed', example: 'submitted' })
  last_action?: string;

  @ApiPropertyOptional({ description: 'Last action date', example: '2026-03-10T10:30:00.000Z' })
  last_action_at_date?: string;

  @ApiPropertyOptional({ description: 'Last action by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  last_action_by_id?: string;

  @ApiPropertyOptional({ description: 'Last action by user name', example: 'John Doe' })
  last_action_by_name?: string;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Spot check details (line items)', type: [SpotCheckDetailResponseDto] })
  details?: SpotCheckDetailResponseDto[];
}

export class SpotCheckListResponseDto {
  @ApiProperty({ description: 'List of Spot Check records', type: [SpotCheckResponseDto] })
  data: SpotCheckResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class SpotCheckMutationResponseDto {
  @ApiProperty({ description: 'Spot Check ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Spot check number', example: 'SC-2026-0001' })
  spot_check_no?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;
}

export class SpotCheckPendingCountResponseDto {
  @ApiProperty({ description: 'Number of pending spot checks', example: 5 })
  count: number;
}
