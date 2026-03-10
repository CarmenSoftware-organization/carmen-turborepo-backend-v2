import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PeriodResponseDto {
  @ApiProperty({ description: 'Period ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Period code in YYMM format', example: '2603' })
  period: string;

  @ApiProperty({ description: 'Fiscal year', example: 2026 })
  fiscal_year: number;

  @ApiProperty({ description: 'Fiscal month (1-12)', example: 3 })
  fiscal_month: number;

  @ApiProperty({ description: 'Period start date', example: '2026-03-01T00:00:00.000Z' })
  start_at: Date;

  @ApiProperty({ description: 'Period end date', example: '2026-03-31T23:59:59.000Z' })
  end_at: Date;

  @ApiProperty({ description: 'Period status', example: 'open' })
  status: string;

  @ApiPropertyOptional({ description: 'Note', example: 'March 2026 period' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;
}
