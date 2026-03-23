import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseOrderPrDetailDto {
  @ApiProperty({ description: 'PR Detail ID', format: 'uuid' })
  pr_detail_id: string;

  @ApiProperty({ description: 'Order quantity for this PR detail' })
  order_qty: number;

  @ApiProperty({ description: 'Order unit ID', format: 'uuid' })
  order_unit_id: string;

  @ApiPropertyOptional({ description: 'Order unit name' })
  order_unit_name?: string;

  @ApiProperty({ description: 'Order base quantity (calculated: order_qty * conversion_factor)' })
  order_base_qty: number;

  @ApiPropertyOptional({ description: 'Order base unit ID', format: 'uuid' })
  order_base_unit_id?: string;

  @ApiPropertyOptional({ description: 'Order base unit name' })
  order_base_unit_name?: string;
}

export class PurchaseOrderDetailDto {
  @ApiPropertyOptional({ description: 'Name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Product ID', format: 'uuid' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product code' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Exchange rate' })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Order quantity' })
  order_qty?: number;

  @ApiPropertyOptional({ description: 'Order unit ID', format: 'uuid' })
  order_unit_id?: string;

  @ApiPropertyOptional({ description: 'Base quantity' })
  base_qty?: number;

  @ApiPropertyOptional({ description: 'Base unit ID', format: 'uuid' })
  base_unit_id?: string;

  @ApiPropertyOptional({ description: 'Unit price' })
  unit_price?: number;

  @ApiPropertyOptional({ description: 'Sub total price' })
  sub_total_price?: number;

  @ApiPropertyOptional({ description: 'Base sub total price' })
  base_sub_total_price?: number;

  @ApiPropertyOptional({ description: 'Is FOC (Free of Charge)' })
  is_foc?: boolean;

  @ApiPropertyOptional({ description: 'Is tax included' })
  is_tax_included?: boolean;

  @ApiPropertyOptional({ description: 'Tax rate' })
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  tax_amount?: number;

  @ApiPropertyOptional({ description: 'Discount rate' })
  discount_rate?: number;

  @ApiPropertyOptional({ description: 'Discount amount' })
  discount_amount?: number;

  @ApiPropertyOptional({ description: 'Net amount' })
  net_amount?: number;

  @ApiPropertyOptional({ description: 'Base net amount' })
  base_net_amount?: number;

  @ApiPropertyOptional({ description: 'Total price' })
  total_price?: number;

  @ApiPropertyOptional({ description: 'Base total price' })
  base_total_price?: number;

  @ApiPropertyOptional({ description: 'Additional info (JSON)' })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Change history (JSON)' })
  history?: unknown;
}

export class PurchaseOrderDetailOperationsDto {
  @ApiPropertyOptional({
    description: 'Detail line items to add',
    type: [PurchaseOrderDetailDto],
  })
  add?: PurchaseOrderDetailDto[];
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Purchase order name' })
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Order date' })
  order_date?: Date;

  @ApiPropertyOptional({ description: 'Delivery date' })
  delivery_date?: Date;

  @ApiPropertyOptional({ description: 'Vendor ID', format: 'uuid' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Currency ID', format: 'uuid' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Base currency ID', format: 'uuid' })
  base_currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate' })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Email address', format: 'email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Buyer name' })
  buyer_name?: string;

  @ApiPropertyOptional({ description: 'Credit term (days)' })
  credit_term?: number;

  @ApiPropertyOptional({ description: 'Remarks' })
  remarks?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)' })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Change history (JSON)' })
  history?: unknown;

  @ApiPropertyOptional({ description: 'Document version' })
  doc_version?: number;

  @ApiPropertyOptional({
    description: 'Purchase order detail operations (add line items)',
    type: PurchaseOrderDetailOperationsDto,
  })
  details?: PurchaseOrderDetailOperationsDto;
}
