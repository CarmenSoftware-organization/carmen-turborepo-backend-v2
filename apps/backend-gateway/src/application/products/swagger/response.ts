import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnitResponseDto {
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

  @ApiProperty({ description: 'Inventory unit', type: UnitResponseDto })
  inventory_unit: UnitResponseDto;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class ProductListResponseDto {
  @ApiProperty({ description: 'List of Product records', type: [ProductLocationResponseDto] })
  data: ProductLocationResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}
