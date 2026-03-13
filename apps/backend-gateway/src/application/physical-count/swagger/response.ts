import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhysicalCountDetailResponseDto {
  @ApiProperty({ description: 'Physical count detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Physical count ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  physical_count_id: string;

  @ApiProperty({ description: 'Product ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  product_id: string;

  @ApiProperty({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name: string;

  @ApiProperty({ description: 'Product code', example: 'PRD-001' })
  product_code: string;

  @ApiProperty({ description: 'Product SKU', example: 'SKU-OIL-001' })
  product_sku: string;

  @ApiProperty({ description: 'Inventory unit ID', example: 'd4e5f6a7-b8c9-0123-def0-1234567890ab' })
  inventory_unit_id: string;

  @ApiProperty({ description: 'On-hand quantity', example: 100.0 })
  on_hand_qty: number;

  @ApiProperty({ description: 'Counted quantity', example: 95.0 })
  counted_qty: number;

  @ApiProperty({ description: 'Difference quantity', example: -5.0 })
  diff_qty: number;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-01T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class PhysicalCountResponseDto {
  @ApiProperty({ description: 'Physical count ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Physical count period ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  period_id: string;

  @ApiProperty({ description: 'Location ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  location_id: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Kitchen Storage' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Physical count type', example: 'yes' })
  physical_count_type?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Monthly stock count for kitchen storage' })
  description?: string;

  @ApiProperty({ description: 'Physical count status', example: 'pending' })
  status: string;

  @ApiPropertyOptional({ description: 'Start counting timestamp', example: '2026-03-01T08:00:00.000Z' })
  start_counting_at?: Date;

  @ApiPropertyOptional({ description: 'Start counting user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  start_counting_by_id?: string;

  @ApiPropertyOptional({ description: 'Completed timestamp', example: '2026-03-01T12:00:00.000Z' })
  completed_at?: Date;

  @ApiPropertyOptional({ description: 'Completed by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  completed_by_id?: string;

  @ApiProperty({ description: 'Number of products counted', example: 25 })
  product_counted: number;

  @ApiProperty({ description: 'Total number of products to count', example: 50 })
  product_total: number;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'Physical Count Workflow' })
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

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-01T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Physical count details (line items)', type: [PhysicalCountDetailResponseDto] })
  details?: PhysicalCountDetailResponseDto[];
}

export class PhysicalCountListResponseDto {
  @ApiProperty({ description: 'List of Physical Count records', type: [PhysicalCountResponseDto] })
  data: PhysicalCountResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class PhysicalCountMutationResponseDto {
  @ApiProperty({ description: 'Physical Count ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Physical count status', example: 'pending' })
  status?: string;
}

export class PhysicalCountPendingCountResponseDto {
  @ApiProperty({ description: 'Number of pending physical counts', example: 3 })
  count: number;
}
