import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserBusinessUnitResponseDto {
  @ApiProperty({ description: 'Business unit ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Business unit code', example: 'BU-001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Business unit name', example: 'Grand Hotel Bangkok' })
  name?: string;

  @ApiPropertyOptional({ description: 'Whether this is the default tenant', example: true })
  is_default?: boolean;
}
