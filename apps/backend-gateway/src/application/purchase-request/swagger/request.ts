import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: 'Purchase request date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  pr_date?: string;

  @ApiPropertyOptional({ description: 'Description of the purchase request', example: 'Monthly kitchen supplies order' })
  description?: string;

  @ApiPropertyOptional({ description: 'Department ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  department_id?: string;

  @ApiPropertyOptional({ description: 'Department name', example: 'Kitchen' })
  department_name?: string;

  @ApiPropertyOptional({ description: 'Requestor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  requestor_id?: string;

  @ApiPropertyOptional({ description: 'Requestor name', example: 'John Doe' })
  requestor_name?: string;

  @ApiPropertyOptional({ description: 'Note for the purchase request', example: 'Urgent order for next week' })
  note?: string;

  @ApiPropertyOptional({ description: 'Purchase request details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdatePurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: 'Purchase request date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  pr_date?: string;

  @ApiPropertyOptional({ description: 'Description of the purchase request', example: 'Updated kitchen supplies order' })
  description?: string;

  @ApiPropertyOptional({ description: 'Department ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  department_id?: string;

  @ApiPropertyOptional({ description: 'Department name', example: 'Kitchen' })
  department_name?: string;

  @ApiPropertyOptional({ description: 'Note for the purchase request', example: 'Updated note' })
  note?: string;

  @ApiPropertyOptional({ description: 'Purchase request details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class DuplicatePurchaseRequestSwaggerDto {
  @ApiProperty({ description: 'Array of purchase request IDs to duplicate', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  ids: string[];
}

export class SplitPurchaseRequestSwaggerDto {
  @ApiProperty({ description: 'Array of purchase request detail IDs to split into a new PR', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  detail_ids: string[];
}

export class SubmitPurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: 'Message for the submission', example: 'Submitting for approval' })
  message?: string;
}

export class ApprovePurchaseRequestSwaggerDto {
  @ApiProperty({ description: 'Stage role for approval (e.g., approve, purchase)', example: 'approve' })
  stage_role: string;

  @ApiPropertyOptional({ description: 'Message for the approval', example: 'Approved as requested' })
  message?: string;

  @ApiPropertyOptional({ description: 'Details with pricing info (used by purchase role)', type: 'array', example: [] })
  details?: unknown[];
}

export class RejectPurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: 'Reason for rejection', example: 'Budget exceeded for this period' })
  message?: string;

  @ApiPropertyOptional({ description: 'Stage role for rejection', example: 'approve' })
  stage_role?: string;
}

export class ReviewPurchaseRequestSwaggerDto {
  @ApiPropertyOptional({ description: 'Message for the review', example: 'Please update quantities' })
  message?: string;

  @ApiPropertyOptional({ description: 'Stage role for review', example: 'approve' })
  stage_role?: string;

  @ApiPropertyOptional({ description: 'Target stage to send back to', example: 'draft' })
  target_stage?: string;
}

export class CalculatePurchaseRequestDetailSwaggerDto {
  @ApiPropertyOptional({ description: 'Pricelist type', example: 'contract' })
  pricelist_type?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Quantity', example: 10 })
  qty?: number;
}
