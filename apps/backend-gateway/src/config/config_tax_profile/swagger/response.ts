import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaxProfileResponseDto {
  @ApiProperty({ description: 'Tax profile ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Tax profile name', example: 'VAT 7%' })
  name: string;

  @ApiPropertyOptional({ description: 'Tax profile description', example: 'Standard value added tax' })
  description?: string;

  @ApiPropertyOptional({ description: 'Tax rate percentage', example: 7.0 })
  rate?: number;

  @ApiPropertyOptional({ description: 'Whether the tax profile is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Default tax for domestic purchases' })
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
