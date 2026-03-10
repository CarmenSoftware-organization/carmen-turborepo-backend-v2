import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserBusinessUnitResponseDto {
  @ApiProperty({ description: 'User-Business Unit mapping ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id?: string;

  @ApiPropertyOptional({ description: 'Business unit ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  business_unit_id?: string;

  @ApiProperty({ description: 'User role in business unit', example: 'user', enum: ['admin', 'user'] })
  role: string;

  @ApiPropertyOptional({ description: 'Is default business unit for the user', example: false })
  is_default?: boolean;

  @ApiPropertyOptional({ description: 'Is mapping active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Deleted timestamp', example: null })
  deleted_at?: Date;
}
