import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreRequisitionSwaggerDto {
  @ApiPropertyOptional({ description: 'Store requisition date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  sr_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date (ISO 8601)', example: '2026-03-12T00:00:00.000Z' })
  expected_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Weekly store replenishment' })
  description?: string;

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

  @ApiPropertyOptional({ description: 'Store requisition details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdateStoreRequisitionSwaggerDto {
  @ApiPropertyOptional({ description: 'Store requisition date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  sr_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date (ISO 8601)', example: '2026-03-12T00:00:00.000Z' })
  expected_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated store requisition' })
  description?: string;

  @ApiPropertyOptional({ description: 'From location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_location_id?: string;

  @ApiPropertyOptional({ description: 'To location ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  to_location_id?: string;

  @ApiPropertyOptional({ description: 'Store requisition details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class SubmitStoreRequisitionSwaggerDto {
  @ApiPropertyOptional({ description: 'Message for submission', example: 'Submitting for approval' })
  message?: string;
}

export class ApproveStoreRequisitionSwaggerDto {
  @ApiProperty({ description: 'Stage role for approval', example: 'approve' })
  stage_role: string;

  @ApiPropertyOptional({ description: 'Approval message', example: 'Approved' })
  message?: string;
}

export class RejectStoreRequisitionSwaggerDto {
  @ApiPropertyOptional({ description: 'Rejection reason', example: 'Insufficient stock' })
  message?: string;

  @ApiPropertyOptional({ description: 'Stage role for rejection', example: 'approve' })
  stage_role?: string;
}

export class ReviewStoreRequisitionSwaggerDto {
  @ApiPropertyOptional({ description: 'Review message', example: 'Please check quantities' })
  message?: string;

  @ApiPropertyOptional({ description: 'Stage role for review', example: 'approve' })
  stage_role?: string;

  @ApiPropertyOptional({ description: 'Target stage to send back to', example: 'draft' })
  target_stage?: string;
}
