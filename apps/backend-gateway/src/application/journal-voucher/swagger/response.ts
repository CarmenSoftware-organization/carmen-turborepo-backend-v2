import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class JvDetailResponseDto {
  @ApiProperty({ description: 'Detail line ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Journal voucher header ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  jv_header_id?: string;

  @ApiPropertyOptional({ description: 'Account code', example: '1100-001' })
  account_code?: string;

  @ApiPropertyOptional({ description: 'Account name', example: 'Cash in Bank' })
  account_name?: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Currency ID' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency name', example: 'THB' })
  currency_name?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Debit amount', example: 1000.00 })
  debit?: number;

  @ApiPropertyOptional({ description: 'Credit amount', example: 0 })
  credit?: number;

  @ApiPropertyOptional({ description: 'Base currency ID' })
  base_currency_id?: string;

  @ApiPropertyOptional({ description: 'Base currency name', example: 'THB' })
  base_currency_name?: string;

  @ApiPropertyOptional({ description: 'Base debit amount', example: 1000.00 })
  base_debit?: number;

  @ApiPropertyOptional({ description: 'Base credit amount', example: 0 })
  base_credit?: number;

  @ApiPropertyOptional({ description: 'Line description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string;
}

export class JournalVoucherResponseDto {
  @ApiProperty({ description: 'Journal voucher ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Journal voucher type', example: 'JV' })
  jv_type?: string;

  @ApiPropertyOptional({ description: 'Journal voucher number', example: 'JV-2026-0001' })
  jv_no?: string;

  @ApiPropertyOptional({ description: 'Journal voucher date', example: '2026-03-23T00:00:00.000Z' })
  jv_date?: Date;

  @ApiPropertyOptional({ description: 'Journal voucher status', example: 'draft' })
  jv_status?: string;

  @ApiPropertyOptional({ description: 'Currency ID' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency name', example: 'THB' })
  currency_name?: string;

  @ApiPropertyOptional({ description: 'Exchange rate', example: 1.0 })
  exchange_rate?: number;

  @ApiPropertyOptional({ description: 'Base currency ID' })
  base_currency_id?: string;

  @ApiPropertyOptional({ description: 'Base currency name', example: 'THB' })
  base_currency_name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string;

  @ApiPropertyOptional({ description: 'Detail lines', type: [JvDetailResponseDto] })
  tb_jv_detail?: JvDetailResponseDto[];

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-23T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who created the record' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-23T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who last updated the record' })
  updated_by_id?: string;
}

export class JournalVoucherListResponseDto {
  @ApiProperty({ description: 'List of journal voucher records', type: [JournalVoucherResponseDto] })
  data: JournalVoucherResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class JournalVoucherMutationResponseDto {
  @ApiProperty({ description: 'Journal voucher ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
