import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriceListResponseDto {
  @ApiProperty({ description: 'Price list ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Price list number', example: 'PL-2026-0001' })
  pricelist_no?: string;

  @ApiProperty({ description: 'Price list name', example: 'Q1 2026 Food Supplies' })
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Quarterly price list for food supplies' })
  description?: string | null;

  @ApiPropertyOptional({ description: 'Status', example: 'active' })
  status?: string;

  @ApiPropertyOptional({ description: 'Vendor ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'Global Foods Co.' })
  vendor_name?: string | null;

  @ApiPropertyOptional({ description: 'Currency ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  currency_id?: string;

  @ApiPropertyOptional({ description: 'Currency code', example: 'THB' })
  currency_code?: string | null;

  @ApiProperty({ description: 'Effective from date', example: '2026-01-01T00:00:00.000Z' })
  effective_from_date: Date;

  @ApiProperty({ description: 'Effective to date', example: '2026-03-31T23:59:59.000Z' })
  effective_to_date: Date;

  @ApiPropertyOptional({ description: 'Whether the price list is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-01-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-01T08:00:00.000Z' })
  updated_at?: Date;
}

export class PriceListDetailResponseDto {
  @ApiProperty({ description: 'Price list detail ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Price list ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  pricelist_id: string;

  @ApiPropertyOptional({ description: 'Sequence number', example: 1 })
  sequence_no?: number;

  @ApiPropertyOptional({ description: 'Product ID', example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  product_id?: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Unit ID', example: 'd4e5f6a7-b8c9-0123-def0-1234567890ab' })
  unit_id?: string;

  @ApiPropertyOptional({ description: 'Tax profile ID', example: 'e5f6a7b8-c901-2345-ef01-234567890abc' })
  tax_profile_id?: string;

  @ApiPropertyOptional({ description: 'Tax rate percentage', example: 7.0 })
  tax_rate?: number;

  @ApiPropertyOptional({ description: 'Minimum order quantity', example: 10 })
  moq_qty?: number;

  @ApiPropertyOptional({ description: 'Price without tax', example: 250.0 })
  price_without_tax?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 17.5 })
  tax_amt?: number;

  @ApiPropertyOptional({ description: 'Price including tax', example: 267.5 })
  price?: number;

  @ApiPropertyOptional({ description: 'Document version', example: 0 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-01-01T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-01T08:00:00.000Z' })
  updated_at?: Date;
}

export class PriceCompareResponseDto {
  @ApiProperty({ description: 'Vendor ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  vendor_id: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'Global Foods Co.' })
  vendor_name?: string;

  @ApiProperty({ description: 'Product ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  product_id: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Olive Oil 1L' })
  product_name?: string;

  @ApiPropertyOptional({ description: 'Price', example: 267.5 })
  price?: number;

  @ApiPropertyOptional({ description: 'Price with VAT', example: 286.225 })
  price_with_vat?: number;

  @ApiPropertyOptional({ description: 'Price without VAT', example: 267.5 })
  price_without_vat?: number;

  @ApiPropertyOptional({ description: 'From date', example: '2026-01-01T00:00:00.000Z' })
  from_date?: Date;

  @ApiPropertyOptional({ description: 'To date', example: '2026-03-31T23:59:59.000Z' })
  to_date?: Date;
}

export class CheckPriceListResponseDto {
  @ApiPropertyOptional({ description: 'Decoded token data', example: {} })
  data?: unknown;

  @ApiProperty({ description: 'Whether the token is valid', example: true })
  valid: boolean;
}
