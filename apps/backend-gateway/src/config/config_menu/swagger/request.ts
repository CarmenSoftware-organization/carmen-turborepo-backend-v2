import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuCreateRequest {
  @ApiProperty({ description: 'Module ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  module_id: string;

  @ApiProperty({ description: 'Menu name', example: 'Dashboard' })
  name: string;

  @ApiPropertyOptional({ description: 'Menu URL', example: '/dashboard' })
  url?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Main dashboard page' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the menu is visible', example: true, default: true })
  is_visible?: boolean;

  @ApiPropertyOptional({ description: 'Whether the menu is active', example: true, default: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Whether the menu is locked', example: false, default: false })
  is_lock?: boolean;
}

export class MenuUpdateRequest {
  @ApiPropertyOptional({ description: 'Module ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  module_id?: string;

  @ApiPropertyOptional({ description: 'Menu name', example: 'Dashboard' })
  name?: string;

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
}
