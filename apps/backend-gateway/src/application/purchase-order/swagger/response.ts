import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseOrderDetailResponseDto {
  @ApiProperty({ description: 'Detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Purchase order ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  purchase_order_id: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Fresh vegetables' })
  description?: string;

  @ApiPropertyOptional({ description: 'Line item sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Whether the detail is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Order quantity', example: 100 })
  order_qty?: number;

  @ApiPropertyOptional({ description: 'Order unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  order_unit_id?: string;

  @ApiPropertyOptional({ description: 'Order unit conversion factor', example: 1.0 })
  order_unit_conversion_factor?: number;

  @ApiPropertyOptional({ description: 'Order unit name', example: 'kg' })
  order_unit_name?: string;

  @ApiPropertyOptional({ description: 'Base quantity', example: 100 })
  base_qty?: number;

  @ApiPropertyOptional({ description: 'Base unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  base_unit_id?: string;

  @ApiPropertyOptional({ description: 'Base unit name', example: 'kg' })
  base_unit_name?: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Tomatoes' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'มะเขือเทศ' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'SKU-TOM-001' })
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Unit price', example: 50.0 })
  unit_price?: number;

  @ApiPropertyOptional({ description: 'Sub total price', example: 5000.0 })
  sub_total_price?: number;

  @ApiPropertyOptional({ description: 'Base sub total price', example: 5000.0 })
  base_sub_total_price?: number;

  @ApiPropertyOptional({ description: 'Whether the item is free of charge', example: false })
  is_foc?: boolean;

  @ApiPropertyOptional({ description: 'Whether tax is included in the price', example: true })
  is_tax_included?: boolean;

  @ApiPropertyOptional({ description: 'Tax profile ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  tax_profile_id?: string;

  @ApiPropertyOptional({ description: 'Tax profile name', example: 'VAT 7%' })
  tax_profile_name?: string;

  @ApiPropertyOptional({ description: 'Tax rate', example: 7.0 })
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 350.0 })
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Base tax amount', example: 350.0 })
  base_tax_amount?: number;

  @ApiPropertyOptional({ description: 'Discount rate', example: 5.0 })
  discount_rate?: number;

  @ApiPropertyOptional({ description: 'Discount amount', example: 250.0 })
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Base discount amount', example: 250.0 })
  base_discount_amount?: number;

  @ApiPropertyOptional({ description: 'Net amount', example: 5100.0 })
  net_amount?: number;

  @ApiPropertyOptional({ description: 'Base net amount', example: 5100.0 })
  base_net_amount?: number;

  @ApiPropertyOptional({ description: 'Total price', example: 5350.0 })
  total_price?: number;

  @ApiPropertyOptional({ description: 'Base total price', example: 5350.0 })
  base_total_price?: number;

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

  @ApiPropertyOptional({ description: 'Pricelist detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  pricelist_detail_id?: string;

  @ApiPropertyOptional({ description: 'Pricelist number', example: 'PL-2026-001' })
  pricelist_no?: string;

  @ApiPropertyOptional({ description: 'Pricelist unit', example: 'kg' })
  pricelist_unit?: string;

  @ApiPropertyOptional({ description: 'Pricelist price', example: 48.0 })
  pricelist_price?: number;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Change history (JSON)', example: [] })
  history?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

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

  @ApiPropertyOptional({ description: 'Remarks', example: 'Urgent order' })
  remarks?: string;

  @ApiPropertyOptional({ description: 'Total quantity', example: 500 })
  total_qty?: number;

  @ApiPropertyOptional({ description: 'Total price', example: 25000.0 })
  total_price?: number;

  @ApiPropertyOptional({ description: 'Total tax', example: 1750.0 })
  total_tax?: number;

  @ApiPropertyOptional({ description: 'Total amount', example: 26750.0 })
  total_amount?: number;

  @ApiPropertyOptional({ description: 'Whether the purchase order is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Note', example: 'Deliver to back entrance' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

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

  @ApiPropertyOptional({ description: 'Change history (JSON)', example: [] })
  history?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: string;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Purchase order details (line items)', type: [PurchaseOrderDetailResponseDto] })
  details?: PurchaseOrderDetailResponseDto[];
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
