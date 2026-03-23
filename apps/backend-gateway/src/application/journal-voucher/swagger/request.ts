import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class JvDetailItemRequest {
  @ApiPropertyOptional({ description: 'Account code', example: '1100-001' })
  account_code?: string;

  @ApiPropertyOptional({ description: 'Account name', example: 'Cash in Bank' })
  account_name?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency name', example: 'THB' })
  currency_name?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Debit amount', example: 1000.00 })
  debit?: number;

  @ApiPropertyOptional({ description: 'Credit amount', example: 0 })
  credit?: number;

  @ApiPropertyOptional({ description: 'Base currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  base_currency_id?: string;

  @ApiPropertyOptional({ description: 'Base currency name', example: 'THB' })
  base_currency_name?: string;

  @ApiPropertyOptional({ description: 'Base debit amount', example: 1000.00 })
  base_debit?: number;

  @ApiPropertyOptional({ description: 'Base credit amount', example: 0 })
  base_credit?: number;

  @ApiPropertyOptional({ description: 'Line description', example: 'Payment for supplies' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string;
}

class JvDetailUpdateItemRequest extends JvDetailItemRequest {
  @ApiPropertyOptional({ description: 'Detail line ID (required for update)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id?: string;
}

class JvDetailOperationsRequest {
  @ApiPropertyOptional({ description: 'New detail lines to add', type: [JvDetailItemRequest] })
  add?: JvDetailItemRequest[];

  @ApiPropertyOptional({ description: 'Existing detail lines to update', type: [JvDetailUpdateItemRequest] })
  update?: JvDetailUpdateItemRequest[];

  @ApiPropertyOptional({ description: 'Detail line IDs to delete', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  delete?: string[];
}

export class JournalVoucherCreateRequest {
  @ApiProperty({ description: 'Journal voucher type', example: 'JV' })
  jv_type: string;

  @ApiProperty({ description: 'Journal voucher number', example: 'JV-2026-0001' })
  jv_no: string;

  @ApiProperty({ description: 'Journal voucher date (ISO string)', example: '2026-03-23' })
  jv_date: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency name', example: 'THB' })
  currency_name?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Base currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  base_currency_id?: string;

  @ApiPropertyOptional({ description: 'Base currency name', example: 'THB' })
  base_currency_name?: string;

  @ApiPropertyOptional({ description: 'Description of the journal voucher', example: 'Monthly adjustments' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string;

  @ApiPropertyOptional({ description: 'Journal voucher status', example: 'draft' })
  jv_status?: string;

  @ApiPropertyOptional({ description: 'Detail lines', type: [JvDetailItemRequest] })
  details?: JvDetailItemRequest[];
}

export class JournalVoucherUpdateRequest {
  @ApiPropertyOptional({ description: 'Journal voucher type', example: 'JV' })
  jv_type?: string;

  @ApiPropertyOptional({ description: 'Journal voucher date (ISO string)', example: '2026-03-23' })
  jv_date?: string;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency name', example: 'THB' })
  currency_name?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Base currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  base_currency_id?: string;

  @ApiPropertyOptional({ description: 'Base currency name', example: 'THB' })
  base_currency_name?: string;

  @ApiPropertyOptional({ description: 'Description of the journal voucher', example: 'Monthly adjustments' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string;

  @ApiPropertyOptional({ description: 'Journal voucher status', example: 'draft' })
  jv_status?: string;

  @ApiPropertyOptional({ description: 'Detail line operations (add/update/delete)', type: JvDetailOperationsRequest })
  details?: JvDetailOperationsRequest;
}
