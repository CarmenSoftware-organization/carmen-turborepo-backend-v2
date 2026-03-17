import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditNoteReasonCreateRequestDto {
  @ApiProperty({ description: 'Credit note reason name', example: 'Damaged goods' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the reason', example: 'Items received were damaged during transit' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the reason is active', example: true, default: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Note', example: 'Common for fragile items' })
  note?: string;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: {} })
  dimension?: unknown;
}
