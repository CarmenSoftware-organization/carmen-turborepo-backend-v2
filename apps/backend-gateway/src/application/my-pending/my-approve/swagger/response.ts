import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MyApprovePendingCountResponseDto {
  @ApiProperty({ description: 'Total count of all pending approvals', example: 15 })
  total: number;

  @ApiProperty({ description: 'Count of pending store requisitions', example: 5 })
  sr: number;

  @ApiProperty({ description: 'Count of pending purchase requests', example: 10 })
  pr: number;

  @ApiProperty({ description: 'Count of pending purchase orders', example: 0 })
  po: number;
}

export class MyApproveListResponseDto {
  @ApiPropertyOptional({ description: 'Pending store requisitions', example: [] })
  store_requisitions?: unknown[];

  @ApiPropertyOptional({ description: 'Pending purchase requests', example: [] })
  purchase_requests?: unknown[];

  @ApiPropertyOptional({ description: 'Pending purchase orders', example: [] })
  purchase_orders?: unknown[];
}
