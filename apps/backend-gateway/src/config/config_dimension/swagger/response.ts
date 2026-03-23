import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DimensionDisplayInResponseDto {
  @ApiProperty({ description: 'Display in item ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Dimension ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  dimension_id: string;

  @ApiProperty({ description: 'Display in context', example: 'product' })
  display_in: string;

  @ApiPropertyOptional({ description: 'Default value as JSON', example: {} })
  default_value?: unknown;

  @ApiPropertyOptional({ description: 'Note', example: 'Display in product form' })
  note?: string;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}

export class DimensionResponseDto {
  @ApiProperty({ description: 'Dimension ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Unique key', example: 'color' })
  key: string;

  @ApiProperty({ description: 'Dimension type', example: 'text' })
  type: string;

  @ApiPropertyOptional({ description: 'Value as JSON', example: {} })
  value?: unknown;

  @ApiPropertyOptional({ description: 'Description', example: 'Color dimension for products' })
  description?: string;

  @ApiPropertyOptional({ description: 'Note', example: 'Used in product configuration' })
  note?: string;

  @ApiPropertyOptional({ description: 'Default value as JSON', example: {} })
  default_value?: unknown;

  @ApiPropertyOptional({ description: 'Whether the dimension is active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional info as JSON object', example: {} })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Display in configurations', type: [DimensionDisplayInResponseDto] })
  tb_dimension_display_in?: DimensionDisplayInResponseDto[];

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class DimensionListResponseDto {
  @ApiProperty({ description: 'List of Dimension records', type: [DimensionResponseDto] })
  data: DimensionResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class DimensionMutationResponseDto {
  @ApiProperty({ description: 'Dimension ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}
