import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditTermListItemResponseDto {
  @ApiProperty({ description: 'Credit term ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Credit term name', example: 'Net 30' })
  name: string;

  @ApiPropertyOptional({ description: 'Credit term value in days', example: 30 })
  value?: number;

  @ApiPropertyOptional({ description: 'Credit term description', example: 'Payment due within 30 days' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the credit term is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class CreditTermDetailResponseDto extends CreditTermListItemResponseDto {
  @ApiPropertyOptional({ description: 'Additional notes', example: 'Standard payment terms for local vendors' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
