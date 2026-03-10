import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Username', example: 'john.doe' })
  username?: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstname?: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'William' })
  middlename?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastname?: string;

  @ApiPropertyOptional({ description: 'Telephone number', example: '+66-81-234-5678' })
  telephone?: string;

  @ApiPropertyOptional({ description: 'Whether the user is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class UserPermissionResponseDto {
  @ApiPropertyOptional({ description: 'User permissions data', example: {} })
  permissions?: unknown;
}

export class UserListItemResponseDto {
  @ApiProperty({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Username', example: 'john.doe' })
  username?: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstname?: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'William' })
  middlename?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastname?: string;

  @ApiPropertyOptional({ description: 'Whether the user is active', example: true })
  is_active?: boolean;
}
