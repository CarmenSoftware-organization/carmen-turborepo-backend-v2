import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtraCostTypeResponseDto {
  @ApiProperty({ description: 'Extra cost type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Name of the extra cost type', example: 'Shipping Fee' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the extra cost type', example: 'Additional shipping charges' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the extra cost type is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Applied to international orders' })
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
