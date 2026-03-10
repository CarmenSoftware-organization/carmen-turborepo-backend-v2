import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BusinessUnitCreateRequestDto {
  @ApiProperty({ description: 'Cluster ID the business unit belongs to', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  cluster_id: string;

  @ApiProperty({ description: 'Business unit code (min 3 characters)', example: 'BU001' })
  code: string;

  @ApiProperty({ description: 'Business unit name (min 3 characters)', example: 'Grand Palace Hotel' })
  name: string;

  @ApiPropertyOptional({ description: 'Alias name (min 3 characters)', example: 'GPH' })
  alias_name?: string;

  @ApiPropertyOptional({ description: 'Default currency ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  default_currency_id?: string;

  @ApiProperty({ description: 'Whether this is the headquarters unit', example: false })
  is_hq: boolean;

  @ApiProperty({ description: 'Whether the business unit is active', example: true })
  is_active: boolean;
}

export class BusinessUnitUpdateRequestDto {
  @ApiPropertyOptional({ description: 'Cluster ID the business unit belongs to', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  cluster_id?: string;

  @ApiPropertyOptional({ description: 'Business unit code (min 3 characters)', example: 'BU001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Business unit name (min 3 characters)', example: 'Grand Palace Hotel' })
  name?: string;

  @ApiPropertyOptional({ description: 'Alias name (min 3 characters)', example: 'GPH' })
  alias_name?: string;

  @ApiPropertyOptional({ description: 'Default currency ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  default_currency_id?: string;

  @ApiPropertyOptional({ description: 'Whether this is the headquarters unit', example: false })
  is_hq?: boolean;

  @ApiPropertyOptional({ description: 'Whether the business unit is active', example: true })
  is_active?: boolean;
}
