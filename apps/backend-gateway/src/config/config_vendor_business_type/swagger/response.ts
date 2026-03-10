import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendorBusinessTypeResponseDto {
  @ApiProperty({ description: 'Vendor business type ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Business type name', example: 'Food Supplier' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the business type', example: 'Vendors that supply food products' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the business type is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Includes fresh and frozen food suppliers' })
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
