import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhysicalCountPeriodResponseDto {
  @ApiProperty({ description: 'Physical count period ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Counting period from date', example: '2026-03-01T00:00:00.000Z' })
  counting_period_from_date: Date;

  @ApiProperty({ description: 'Counting period to date', example: '2026-03-31T23:59:59.000Z' })
  counting_period_to_date: Date;

  @ApiProperty({ description: 'Status', example: 'draft' })
  status: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T08:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
