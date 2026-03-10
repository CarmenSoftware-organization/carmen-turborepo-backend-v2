import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RunningCodeResponseDto {
  @ApiProperty({ description: 'Running code ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Running code type', example: 'purchase_request' })
  type?: string;

  @ApiPropertyOptional({ description: 'Running code configuration (JSON)', example: { A: 'PR', B: '2026', C: '03', D: '0001', format: '{A}{B}{C}{D}' } })
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who created the record', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who last updated the record', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
