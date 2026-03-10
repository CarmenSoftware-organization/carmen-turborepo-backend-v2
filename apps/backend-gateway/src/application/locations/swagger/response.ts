import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DeliveryPointEmbeddedDto {
  @ApiPropertyOptional({ description: 'Delivery point ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id?: string;

  @ApiPropertyOptional({ description: 'Delivery point name', example: 'Loading Dock A' })
  name?: string;

  @ApiPropertyOptional({ description: 'Whether the delivery point is active', example: true })
  is_active?: boolean;
}

class UserLocationEmbeddedDto {
  @ApiProperty({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstname?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastname?: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'M.' })
  middlename?: string;

  @ApiPropertyOptional({ description: 'Telephone number', example: '+66-2-123-4567' })
  telephone?: string;
}

class ProductLocationEmbeddedDto {
  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Product name', example: 'Rice 5kg' })
  name?: string;

  @ApiPropertyOptional({ description: 'Product code', example: 'PRD-001' })
  code?: string;

  @ApiPropertyOptional({ description: 'Minimum quantity', example: 10 })
  min_qty?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity', example: 500 })
  max_qty?: number;

  @ApiPropertyOptional({ description: 'Reorder quantity', example: 50 })
  re_order_qty?: number;

  @ApiPropertyOptional({ description: 'Par quantity', example: 100 })
  par_qty?: number;
}

export class LocationListItemResponseDto {
  @ApiProperty({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Location code', example: 'WH-01' })
  code: string;

  @ApiProperty({ description: 'Location name', example: 'Main Warehouse' })
  name: string;

  @ApiProperty({ description: 'Location type', enum: ['inventory', 'direct', 'consignment'], example: 'inventory' })
  location_type: string;

  @ApiPropertyOptional({ description: 'Physical count type', enum: ['no', 'daily', 'weekly', 'monthly'], example: 'no' })
  physical_count_type?: string;

  @ApiPropertyOptional({ description: 'Location description', example: 'Primary storage warehouse' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the location is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Delivery point', type: DeliveryPointEmbeddedDto })
  delivery_point?: DeliveryPointEmbeddedDto;
}

export class LocationDetailResponseDto extends LocationListItemResponseDto {
  @ApiPropertyOptional({ description: 'Users assigned to this location', type: [UserLocationEmbeddedDto] })
  user_location?: UserLocationEmbeddedDto[];

  @ApiPropertyOptional({ description: 'Products assigned to this location', type: [ProductLocationEmbeddedDto] })
  product_location?: ProductLocationEmbeddedDto[];
}

export class ProductInventoryInfoResponseDto {
  @ApiProperty({ description: 'On-hand quantity', example: 150.0 })
  on_hand_qty: number;

  @ApiProperty({ description: 'On-order quantity', example: 50.0 })
  on_order_qty: number;

  @ApiProperty({ description: 'Reorder quantity threshold', example: 20.0 })
  re_order_qty: number;

  @ApiProperty({ description: 'Restock quantity', example: 100.0 })
  re_stock_qty: number;
}
