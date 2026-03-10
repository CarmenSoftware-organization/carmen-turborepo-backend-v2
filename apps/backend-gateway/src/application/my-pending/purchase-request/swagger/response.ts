import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MyPendingPurchaseRequestCountResponseDto {
  @ApiProperty({ description: 'Count of pending purchase requests', example: 1 })
  pending: number;
}

export class MyPendingPurchaseRequestResponseDto {
  @ApiProperty({ description: 'Purchase request ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Purchase request number', example: 'PR-2026-001' })
  pr_no?: string;

  @ApiPropertyOptional({ description: 'Purchase request date', example: '2026-03-10T00:00:00.000Z' })
  pr_date?: Date;

  @ApiPropertyOptional({ description: 'Document status', example: 'pending' })
  doc_status?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Monthly kitchen supplies request' })
  description?: string;

  @ApiPropertyOptional({ description: 'Business unit code', example: 'BU-001' })
  bu_code?: string;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;
}

export class WorkflowStageResponseDto {
  @ApiPropertyOptional({ description: 'Stage name', example: 'HOD Approval' })
  name?: string;

  @ApiPropertyOptional({ description: 'Stage role', example: 'approve' })
  stage_role?: string;

  @ApiPropertyOptional({ description: 'Stage order', example: 1 })
  order?: number;
}
