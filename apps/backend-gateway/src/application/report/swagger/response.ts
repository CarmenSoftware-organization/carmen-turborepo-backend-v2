import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportTypeResponseDto {
  @ApiProperty({ description: 'Report type identifier', example: 'inventory_summary' })
  report_type: string;

  @ApiProperty({ description: 'Report name', example: 'Inventory Summary' })
  name: string;

  @ApiProperty({ description: 'Report description', example: 'Summary of current inventory levels by location' })
  description: string;

  @ApiProperty({ description: 'Report category (numeric)', example: 1 })
  category: number;

  @ApiProperty({ description: 'Supported output formats (1=PDF, 2=Excel, 3=CSV, 4=JSON)', example: [1, 2, 3, 4], type: [Number] })
  supported_formats: number[];
}

export class ReportTemplateResponseDto {
  @ApiProperty({ description: 'Template ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ description: 'Template name', example: 'Standard Inventory Report' })
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  description?: string;

  @ApiProperty({ description: 'Report group', example: 'inventory' })
  report_group: string;

  @ApiProperty({ description: 'Dialog configuration (JSON string)' })
  dialog: string;

  @ApiProperty({ description: 'Template content (JSON string)' })
  content: string;

  @ApiProperty({ description: 'Whether this is a standard template', example: true })
  is_standard: boolean;

  @ApiProperty({ description: 'Allowed business unit codes', type: [String] })
  allow_business_unit: string[];

  @ApiProperty({ description: 'Denied business unit codes', type: [String] })
  deny_business_unit: string[];

  @ApiProperty({ description: 'Whether this template is active', example: true })
  is_active: boolean;
}

export class ViewerResponseDto {
  @ApiProperty({ description: 'External report viewer URL', example: 'https://report.blueledgers.cloud/viewer/abc123' })
  url: string;
}

export class LookupItemDto {
  @ApiProperty({ description: 'Item code', example: 'V001' })
  code: string;

  @ApiProperty({ description: 'Item name', example: 'Vendor ABC' })
  name: string;
}
