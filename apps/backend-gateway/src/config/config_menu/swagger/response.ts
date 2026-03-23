import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuResponseDto {
  @ApiProperty({ description: 'Menu ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Module ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  module_id: string;

  @ApiProperty({ description: 'Menu name', example: 'Dashboard' })
  name: string;

  @ApiPropertyOptional({ description: 'Menu URL', example: '/dashboard' })
  url?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Main dashboard page' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the menu is visible', example: true })
  is_visible?: boolean;

  @ApiPropertyOptional({ description: 'Whether the menu is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Whether the menu is locked', example: false })
  is_lock?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class MenuListResponseDto {
  @ApiProperty({ description: 'List of Menu records', type: [MenuResponseDto] })
  data: MenuResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class MenuMutationResponseDto {
  @ApiProperty({ description: 'Menu ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
