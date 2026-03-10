import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationProductResponseDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  name?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Whether the product-location assignment is active', example: true })
  is_active?: boolean;
}
