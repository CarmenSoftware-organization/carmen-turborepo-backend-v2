import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhysicalCountPeriodCreateRequestDto {
  @ApiProperty({ description: 'Counting period from date (ISO 8601)', example: '2026-03-01T00:00:00.000Z' })
  counting_period_from_date: Date;

  @ApiProperty({ description: 'Counting period to date (ISO 8601)', example: '2026-03-31T23:59:59.000Z' })
  counting_period_to_date: Date;

  @ApiPropertyOptional({ description: 'Status', example: 'draft', enum: ['draft', 'open', 'closed'] })
  status?: string;
}

export class PhysicalCountPeriodUpdateRequestDto {
  @ApiPropertyOptional({ description: 'Counting period from date (ISO 8601)', example: '2026-03-01T00:00:00.000Z' })
  counting_period_from_date?: Date;

  @ApiPropertyOptional({ description: 'Counting period to date (ISO 8601)', example: '2026-03-31T23:59:59.000Z' })
  counting_period_to_date?: Date;

  @ApiPropertyOptional({ description: 'Status', example: 'open', enum: ['draft', 'open', 'closed'] })
  status?: string;
}
