import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UnitEmbeddedDto {
  @ApiProperty({ description: 'Unit ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id: string;

  @ApiPropertyOptional({ description: 'Unit name', example: 'Bottle' })
  name?: string;
}

export class ProductLocationResponseDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Product name', example: 'Olive Oil 1L' })
  name: string;

  @ApiProperty({ description: 'Product code', example: 'PRD-001' })
  code: string;

  @ApiProperty({ description: 'Inventory unit', type: UnitEmbeddedDto })
  inventory_unit: UnitEmbeddedDto;
}
