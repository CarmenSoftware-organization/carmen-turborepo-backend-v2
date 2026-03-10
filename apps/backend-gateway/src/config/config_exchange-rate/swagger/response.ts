import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty({ description: 'Exchange rate ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

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

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who created the record', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who last updated the record', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
