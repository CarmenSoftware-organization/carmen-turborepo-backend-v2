import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendorProductResponseDto {
  @ApiProperty({ description: 'Vendor product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Suppliers Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Chicken Breast' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Whether the vendor product is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;

  @ApiPropertyOptional({ description: 'Document version for optimistic locking', example: 1 })
  doc_version?: number;
}

export class VendorProductListResponseDto {
  @ApiProperty({ description: 'List of vendor product records', type: [VendorProductResponseDto] })
  data: VendorProductResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}
