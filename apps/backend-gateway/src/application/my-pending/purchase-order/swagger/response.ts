import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MyPendingPurchaseOrderCountResponseDto {
  @ApiProperty({ description: 'Count of pending purchase orders', example: 1 })
  pending: number;
}

export class MyPendingPurchaseOrderResponseDto {
  @ApiProperty({ description: 'Purchase order ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Purchase order number', example: 'PO-2026-001' })
  po_no?: string;

  @ApiPropertyOptional({ description: 'Purchase order date', example: '2026-03-10T00:00:00.000Z' })
  po_date?: Date;

  @ApiPropertyOptional({ description: 'Document status', example: 'pending' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Kitchen supplies order' })
  description?: string;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Suppliers Co.' })
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Business unit code', example: 'BU-001' })
  bu_code?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;
}
