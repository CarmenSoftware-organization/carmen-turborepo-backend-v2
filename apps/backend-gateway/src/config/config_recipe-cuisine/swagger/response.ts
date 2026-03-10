import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeCuisineResponseDto {
  @ApiProperty({ description: 'Recipe cuisine ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Cuisine name', example: 'Thai' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the cuisine', example: 'Traditional Thai cuisine' })
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Known for spicy and aromatic dishes' })
  note?: string;

  @ApiPropertyOptional({ description: 'Whether the cuisine is active', example: true })
  is_active?: boolean;

  @ApiProperty({ description: 'Cuisine region', example: 'ASIAN' })
  region: string;

  @ApiPropertyOptional({ description: 'Popular dishes (JSON)', example: ['Pad Thai', 'Tom Yum'] })
  popular_dishes?: unknown;

  @ApiPropertyOptional({ description: 'Key ingredients (JSON)', example: ['lemongrass', 'galangal', 'kaffir lime'] })
  key_ingredients?: unknown;

  @ApiPropertyOptional({ description: 'Additional info as JSON', example: {} })
  info?: unknown;

  @ApiPropertyOptional({ description: 'Dimension data as JSON', example: {} })
  dimension?: unknown;

  @ApiPropertyOptional({ description: 'Document version', example: 1 })
  doc_version?: number;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who created the record', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'ID of the user who last updated the record', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}
