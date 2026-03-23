import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationConfigCreateRequest {
  @ApiProperty({ description: 'Config key', example: 'app.theme' })
  key: string;

  @ApiProperty({ description: 'Config value (any JSON)', example: { theme: 'dark', language: 'en' } })
  value: unknown;
}

export class ApplicationConfigUpdateRequest {
  @ApiProperty({ description: 'Config value (any JSON)', example: { theme: 'light', language: 'th' } })
  value: unknown;
}

export class UserConfigUpsertRequest {
  @ApiProperty({ description: 'User config value (any JSON)', example: { sidebar_collapsed: true } })
  value: unknown;
}
