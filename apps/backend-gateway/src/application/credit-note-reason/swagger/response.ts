import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditNoteReasonListItemResponseDto {
  @ApiProperty({ description: 'Credit note reason ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Reason name', example: 'Damaged Goods' })
  name?: string;

  @ApiPropertyOptional({ description: 'Reason description', example: 'Items arrived damaged during shipping' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the reason is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;
}

export class CreditNoteReasonDetailResponseDto extends CreditNoteReasonListItemResponseDto {
  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
