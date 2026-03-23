import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DimensionDisplayInCreateRequest {
  @ApiProperty({ description: 'Display in context', example: 'product' })
  display_in: string;

  @ApiPropertyOptional({ description: 'Default value as JSON', example: {} })
  default_value?: unknown;

  @ApiPropertyOptional({ description: 'Note', example: 'Display in product form' })
  note?: string;
}

export class DimensionDisplayInUpdateRequest {
  @ApiProperty({ description: 'Display in item ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiPropertyOptional({ description: 'Display in context', example: 'product' })
  display_in?: string;

  @ApiPropertyOptional({ description: 'Default value as JSON', example: {} })
  default_value?: unknown;

  @ApiPropertyOptional({ description: 'Note', example: 'Updated note' })
  note?: string;
}

export class DimensionDisplayInUpdateGroup {
  @ApiPropertyOptional({ description: 'Items to add', type: [DimensionDisplayInCreateRequest] })
  add?: DimensionDisplayInCreateRequest[];

  @ApiPropertyOptional({ description: 'Items to update', type: [DimensionDisplayInUpdateRequest] })
  update?: DimensionDisplayInUpdateRequest[];

  @ApiPropertyOptional({ description: 'IDs to delete', type: [String], example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'] })
  delete?: string[];
}

export class DimensionCreateRequest {
  @ApiProperty({ description: 'Unique key for the dimension', example: 'color' })
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

  @ApiPropertyOptional({ description: 'Whether the dimension is active', example: true, default: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Additional info as JSON object', example: {} })
  info?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Display in configurations', type: [DimensionDisplayInCreateRequest] })
  display_in?: DimensionDisplayInCreateRequest[];
}

export class DimensionUpdateRequest {
  @ApiPropertyOptional({ description: 'Unique key for the dimension', example: 'color' })
  key?: string;

  @ApiPropertyOptional({ description: 'Dimension type', example: 'text' })
  type?: string;

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

  @ApiPropertyOptional({ description: 'Display in configurations (add/update/delete)', type: DimensionDisplayInUpdateGroup })
  display_in?: DimensionDisplayInUpdateGroup;
}
