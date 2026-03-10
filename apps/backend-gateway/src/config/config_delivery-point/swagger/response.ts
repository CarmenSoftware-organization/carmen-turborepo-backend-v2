import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DeliveryPointResponseDto {
  @ApiProperty({ description: 'Delivery point ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Name of the delivery point', example: 'Main Warehouse Dock' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the delivery point', example: 'Primary receiving dock for goods' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the delivery point is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Open 8am-5pm weekdays' })
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
