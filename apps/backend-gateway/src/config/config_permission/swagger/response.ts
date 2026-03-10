import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Permission name', example: 'purchase_request.create' })
  name?: string;

  @ApiPropertyOptional({ description: 'Permission description', example: 'Allow creating purchase requests' })
  description?: string;

  @ApiPropertyOptional({ description: 'Permission module', example: 'purchase_request' })
  module?: string;

  @ApiPropertyOptional({ description: 'Whether the permission is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}
