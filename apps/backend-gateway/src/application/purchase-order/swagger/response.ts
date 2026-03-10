import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseOrderResponseDto {
  @ApiProperty({ description: 'Purchase order ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Purchase order number', example: 'PO-2026-0001' })
  po_no?: string;

  @ApiPropertyOptional({ description: 'Purchase order status', example: 'draft' })
  po_status?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'PO for kitchen supplies' })
  description?: string;

  @ApiPropertyOptional({ description: 'Order date', example: '2026-03-10T00:00:00.000Z' })
  order_date?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date', example: '2026-03-17T00:00:00.000Z' })
  delivery_date?: string;

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

  @ApiPropertyOptional({ description: 'Approval date', example: '2026-03-15T00:00:00.000Z' })
  approval_date?: string;

  @ApiPropertyOptional({ description: 'Vendor email', example: 'vendor@example.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Buyer ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  buyer_id?: string;

  @ApiPropertyOptional({ description: 'Buyer name', example: 'Jane Smith' })
  buyer_name?: string;

  @ApiPropertyOptional({ description: 'Credit term ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  credit_term_id?: string;

  @ApiPropertyOptional({ description: 'Credit term name', example: 'Net 30' })
  credit_term_name?: string;

  @ApiPropertyOptional({ description: 'Credit term value (days)', example: 30 })
  credit_term_value?: number;

  @ApiPropertyOptional({ description: 'Workflow ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workflow_id?: string;

  @ApiPropertyOptional({ description: 'Workflow name', example: 'PO Approval Workflow' })
  workflow_name?: string;

  @ApiPropertyOptional({ description: 'Workflow current stage', example: 'draft' })
  workflow_current_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow previous stage', example: null })
  workflow_previous_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow next stage', example: 'approval' })
  workflow_next_stage?: string;

  @ApiPropertyOptional({ description: 'Workflow history (JSON)', example: [] })
  workflow_history?: unknown;

  @ApiPropertyOptional({ description: 'User action permissions (JSON)', example: {} })
  user_action?: unknown;

  @ApiPropertyOptional({ description: 'Last action performed', example: 'submitted' })
  last_action?: string;

  @ApiPropertyOptional({ description: 'Last action date', example: '2026-03-10T10:30:00.000Z' })
  last_action_at_date?: string;

  @ApiPropertyOptional({ description: 'Last action by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  last_action_by_id?: string;

  @ApiPropertyOptional({ description: 'Last action by user name', example: 'Jane Smith' })
  last_action_by_name?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: string;

  @ApiPropertyOptional({ description: 'Purchase order details (line items)', type: 'array' })
  details?: unknown[];
}

export class PurchaseOrderListResponseDto {
  @ApiProperty({ description: 'List of purchase orders', type: [PurchaseOrderResponseDto] })
  data: PurchaseOrderResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class PurchaseOrderMutationResponseDto {
  @ApiProperty({ description: 'Purchase order ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Purchase order number', example: 'PO-2026-0001' })
  po_no?: string;

  @ApiPropertyOptional({ description: 'Purchase order status', example: 'draft' })
  po_status?: string;
}
