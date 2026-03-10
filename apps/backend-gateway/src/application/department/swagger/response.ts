import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentListItemResponseDto {
  @ApiProperty({ description: 'Department ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Department code', example: 'FNB' })
  code?: string;

  @ApiProperty({ description: 'Department name', example: 'Food & Beverage' })
  name: string;

  @ApiPropertyOptional({ description: 'Department description', example: 'Handles all food and beverage operations' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the department is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional info (JSON)', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data (JSON)', example: [] })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

class DepartmentUserEmbeddedDto {
  @ApiProperty({ description: 'User-department relation ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id?: string;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstname?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastname?: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'M.' })
  middlename?: string;

  @ApiPropertyOptional({ description: 'Telephone number', example: '+66-2-123-4567' })
  telephone?: string;
}

export class DepartmentDetailResponseDto extends DepartmentListItemResponseDto {
  @ApiPropertyOptional({ description: 'Users assigned to this department', type: [DepartmentUserEmbeddedDto] })
  department_users?: DepartmentUserEmbeddedDto[];

  @ApiPropertyOptional({ description: 'Head-of-department users', type: [DepartmentUserEmbeddedDto] })
  hod_users?: DepartmentUserEmbeddedDto[];
}
