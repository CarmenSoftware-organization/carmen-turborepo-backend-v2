import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserClusterCreateRequestDto {
  @ApiProperty({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id: string;

  @ApiProperty({ description: 'Cluster ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  cluster_id: string;

  @ApiProperty({ description: 'Is mapping active', example: true })
  is_active: boolean;

  @ApiProperty({ description: 'User role in cluster', example: 'user', enum: ['admin', 'user'] })
  role: string;
}

export class UserClusterUpdateRequestDto {
  @ApiPropertyOptional({ description: 'User ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  user_id?: string;

  @ApiPropertyOptional({ description: 'Cluster ID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  cluster_id?: string;

  @ApiPropertyOptional({ description: 'Is mapping active', example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'User role in cluster', example: 'user', enum: ['admin', 'user'] })
  role?: string;
}
