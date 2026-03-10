import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TestCreateFromGrnDetailItemDto {
  @ApiProperty({ description: 'GRN detail item ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  detail_item_id: string;

  @ApiProperty({ description: 'Product ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  product_id: string;

  @ApiProperty({ description: 'Location ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  location_id: string;

  @ApiPropertyOptional({ description: 'Location code', example: 'WH-01' })
  location_code?: string;

  @ApiProperty({ description: 'Received base quantity', example: 30 })
  received_base_qty: number;

  @ApiProperty({ description: 'Base net amount', example: 100 })
  base_net_amount: number;
}

export class TestCreateFromGrnRequestDto {
  @ApiProperty({ description: 'GRN ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  grn_id: string;

  @ApiProperty({ description: 'GRN number', example: 'GRN-2026-001' })
  grn_no: string;

  @ApiProperty({ description: 'GRN date', example: '2026-02-25T00:00:00.000Z' })
  grn_date: string;

  @ApiProperty({ description: 'Detail items for the transaction', type: [TestCreateFromGrnDetailItemDto] })
  detail_items: TestCreateFromGrnDetailItemDto[];
}
