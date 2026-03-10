import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExchangeRateCreateRequest {
  @ApiPropertyOptional({ description: 'Source currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_currency_id?: string;

  @ApiPropertyOptional({ description: 'Target currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  to_currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate value', example: 34.50 })
  rate?: number;

  @ApiPropertyOptional({ description: 'Effective date of the exchange rate', example: '2026-03-10T00:00:00.000Z' })
  effective_date?: string;

  @ApiPropertyOptional({ description: 'Whether the exchange rate is active', example: true, default: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Daily rate from central bank' })
  note?: string;
}

export class ExchangeRateUpdateRequest {
  @ApiPropertyOptional({ description: 'Source currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  from_currency_id?: string;

  @ApiPropertyOptional({ description: 'Target currency ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  to_currency_id?: string;

  @ApiPropertyOptional({ description: 'Exchange rate value', example: 34.50 })
  rate?: number;

  @ApiPropertyOptional({ description: 'Effective date of the exchange rate', example: '2026-03-10T00:00:00.000Z' })
  effective_date?: string;

  @ApiPropertyOptional({ description: 'Whether the exchange rate is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Daily rate from central bank' })
  note?: string;
}
