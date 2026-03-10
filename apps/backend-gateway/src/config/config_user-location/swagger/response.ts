import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserLocationResponseDto {
  @ApiProperty({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'User name', example: 'John Doe' })
  name?: string;

  @ApiPropertyOptional({ description: 'User email', example: 'john.doe@example.com' })
  email?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Whether the assignment is active', example: true })
  is_active?: boolean;
}
