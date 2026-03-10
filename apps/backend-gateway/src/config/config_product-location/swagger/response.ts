import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductLocationResponseDto {
  @ApiProperty({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  name?: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Whether the location-product assignment is active', example: true })
  is_active?: boolean;
}
