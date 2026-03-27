import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationProductResponseDto {
  @ApiProperty({ description: 'Product Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'อกไก่' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'SKU-001' })
  product_sku?: string;

  @ApiPropertyOptional({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id?: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Minimum quantity', example: 10 })
  min_qty?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity', example: 100 })
  max_qty?: number;

  @ApiPropertyOptional({ description: 'Re-order quantity', example: 20 })
  re_order_qty?: number;

  @ApiPropertyOptional({ description: 'Par quantity', example: 50 })
  par_qty?: number;

  @ApiPropertyOptional({ description: 'Note', example: 'Keep refrigerated' })
  note?: string;
}

export class LocationProductListResponseDto {
  @ApiProperty({ description: 'List of Location Product records', type: [LocationProductResponseDto] })
  data: LocationProductResponseDto[];
}

export class LocationProductCompareLocationDto {
  @ApiProperty({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'LOC-001' })
  location_code?: string;

  @ApiPropertyOptional({ description: 'Location name', example: 'Main Kitchen' })
  location_name?: string;

  @ApiPropertyOptional({ description: 'Minimum quantity', example: 10 })
  min_qty?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity', example: 100 })
  max_qty?: number;

  @ApiPropertyOptional({ description: 'Re-order quantity', example: 20 })
  re_order_qty?: number;

  @ApiPropertyOptional({ description: 'Par quantity', example: 50 })
  par_qty?: number;
}

export class LocationProductCompareItemDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  product_code?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Product local name', example: 'อกไก่' })
  product_local_name?: string;

  @ApiPropertyOptional({ description: 'Product SKU', example: 'SKU-001' })
  product_sku?: string;

  @ApiProperty({ description: 'Location 1 settings', type: LocationProductCompareLocationDto })
  location_1: LocationProductCompareLocationDto;

  @ApiProperty({ description: 'Location 2 settings', type: LocationProductCompareLocationDto })
  location_2: LocationProductCompareLocationDto;
}

export class LocationProductCompareResponseDto {
  @ApiProperty({ description: 'Products found in both locations', type: [LocationProductCompareItemDto] })
  data: LocationProductCompareItemDto[];
}
