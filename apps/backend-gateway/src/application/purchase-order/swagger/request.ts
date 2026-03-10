import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderSwaggerDto {
  @ApiPropertyOptional({ description: 'Purchase order date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  order_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date (ISO 8601)', example: '2026-03-17T00:00:00.000Z' })
  delivery_date?: string;

  @ApiPropertyOptional({ description: 'Description of the purchase order', example: 'PO for kitchen supplies' })
  description?: string;

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

  @ApiPropertyOptional({ description: 'Buyer ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  buyer_id?: string;

  @ApiPropertyOptional({ description: 'Buyer name', example: 'Jane Smith' })
  buyer_name?: string;

  @ApiPropertyOptional({ description: 'Credit term ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  credit_term_id?: string;

  @ApiPropertyOptional({ description: 'Credit term name', example: 'Net 30' })
  credit_term_name?: string;

  @ApiPropertyOptional({ description: 'Vendor email', example: 'vendor@example.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Purchase order details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class UpdatePurchaseOrderSwaggerDto {
  @ApiPropertyOptional({ description: 'Purchase order date (ISO 8601)', example: '2026-03-10T00:00:00.000Z' })
  order_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date (ISO 8601)', example: '2026-03-17T00:00:00.000Z' })
  delivery_date?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Updated PO for kitchen supplies' })
  description?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Purchase order details (line items)', type: 'array', example: [] })
  details?: unknown[];
}

export class SavePurchaseOrderSwaggerDto {
  @ApiPropertyOptional({ description: 'Stage role for the save action', example: 'purchase' })
  stage_role?: string;

  @ApiPropertyOptional({ description: 'Message for the save action', example: 'Saving changes' })
  message?: string;

  @ApiPropertyOptional({ description: 'Header-level changes', example: {} })
  header?: unknown;

  @ApiPropertyOptional({ description: 'Details to add', type: 'array', example: [] })
  add?: unknown[];

  @ApiPropertyOptional({ description: 'Details to update', type: 'array', example: [] })
  update?: unknown[];

  @ApiPropertyOptional({ description: 'Detail IDs to remove', type: [String], example: [] })
  remove?: string[];
}

export class ApprovePurchaseOrderSwaggerDto {
  @ApiProperty({ description: 'Stage role for approval', example: 'approve' })
  stage_role: string;

  @ApiPropertyOptional({ description: 'Approval message', example: 'Approved' })
  message?: string;
}

export class RejectPurchaseOrderSwaggerDto {
  @ApiProperty({ description: 'Stage role for rejection', example: 'approve' })
  stage_role: string;

  @ApiPropertyOptional({ description: 'Rejection message', example: 'Budget exceeded' })
  message?: string;
}

export class ReviewPurchaseOrderSwaggerDto {
  @ApiProperty({ description: 'Stage role for review', example: 'approve' })
  stage_role: string;

  @ApiPropertyOptional({ description: 'Review message', example: 'Please revise quantities' })
  message?: string;

  @ApiPropertyOptional({ description: 'Target stage to return to', example: 'draft' })
  target_stage?: string;
}

export class GroupPrForPoSwaggerDto {
  @ApiProperty({ description: 'Array of PR IDs to group for PO creation', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  pr_ids: string[];
}

export class ConfirmPrToPoSwaggerDto {
  @ApiProperty({ description: 'Array of PR IDs to confirm and create POs from', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  pr_ids: string[];
}
