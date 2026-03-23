import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationConfigResponseDto {
  @ApiProperty({ description: 'Config ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Config key', example: 'app.theme' })
  key: string;

  @ApiPropertyOptional({ description: 'Config value (JSON)', example: { theme: 'dark' } })
  value?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Created by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  created_by_id?: string;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;

  @ApiPropertyOptional({ description: 'Updated by user ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  updated_by_id?: string;
}

export class ApplicationConfigListResponseDto {
  @ApiProperty({ description: 'List of Application Config records', type: [ApplicationConfigResponseDto] })
  data: ApplicationConfigResponseDto[];

  @ApiPropertyOptional({ description: 'Total count of records', example: 50 })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page number', example: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Records per page', example: 10 })
  perpage?: number;
}

export class ApplicationConfigMutationResponseDto {
  @ApiProperty({ description: 'Config ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;
}

export class UserConfigResponseDto {
  @ApiProperty({ description: 'User config ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  user_id: string;

  @ApiProperty({ description: 'Config key', example: 'user.preferences' })
  key: string;

  @ApiPropertyOptional({ description: 'Config value (JSON)', example: { sidebar_collapsed: true } })
  value?: unknown;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-03-10T00:00:00.000Z' })
  created_at?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-03-10T00:00:00.000Z' })
  updated_at?: Date;
}
