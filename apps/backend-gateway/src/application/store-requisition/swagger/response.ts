import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreRequisitionResponseDto {
  @ApiProperty({ description: 'Store requisition ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Store requisition number', example: 'SR-2026-0001' })
  sr_no?: string;

  @ApiPropertyOptional({ description: 'Store requisition date', example: '2026-03-10T00:00:00.000Z' })
  sr_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date', example: '2026-03-12T00:00:00.000Z' })
  expected_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Weekly store replenishment' })
  description?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'From location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_location_id?: string;

  @ApiPropertyOptional({ description: 'From location code', example: 'MAIN-STORE' })
  from_location_code?: string;

  @ApiPropertyOptional({ description: 'From location name', example: 'Main Store' })
  from_location_name?: string;

  @ApiPropertyOptional({ description: 'To location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  to_location_id?: string;

  @ApiPropertyOptional({ description: 'To location code', example: 'KITCHEN' })
  to_location_code?: string;

  @ApiPropertyOptional({ description: 'To location name', example: 'Kitchen Store' })
  to_location_name?: string;

  @ApiPropertyOptional({ description: 'Requestor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  requestor_id?: string;

  @ApiPropertyOptional({ description: 'Requestor name', example: 'John Doe' })
  requestor_name?: string;

  @ApiPropertyOptional({ description: 'Department ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  department_id?: string;

  @ApiPropertyOptional({ description: 'Department name', example: 'Kitchen' })
  department_name?: string;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'SR Approval Workflow' })
  workflow_name?: string;

  @ApiPropertyOptional({ description: 'Workflow current stage', example: 'draft' })
  workflow_current_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow previous stage', example: null })
  workflow_previous_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow next stage', example: 'approval' })
  workflow_next_stage?: string;

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

  @ApiPropertyOptional({ description: 'Store requisition details (line items)', type: 'array' })
  details?: unknown[];
}

export class StoreRequisitionListResponseDto {
  @ApiProperty({ description: 'List of store requisitions', type: [StoreRequisitionResponseDto] })
  data: StoreRequisitionResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class StoreRequisitionMutationResponseDto {
  @ApiProperty({ description: 'Store requisition ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Store requisition number', example: 'SR-2026-0001' })
  sr_no?: string;

  @ApiPropertyOptional({ description: 'Document status', example: 'draft' })
  doc_status?: string;
}
