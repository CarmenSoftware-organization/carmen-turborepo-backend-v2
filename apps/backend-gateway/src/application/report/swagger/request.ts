import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportFiltersDto {
  @ApiPropertyOptional({ description: 'Start date filter (ISO 8601)', example: '2026-01-01' })
  date_from?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO 8601)', example: '2026-03-31' })
  date_to?: string;

  @ApiPropertyOptional({ description: 'Filter by location IDs', example: ['uuid1', 'uuid2'], type: [String] })
  location_ids?: string[];

  @ApiPropertyOptional({ description: 'Filter by department IDs', example: ['uuid1'], type: [String] })
  department_ids?: string[];

  @ApiPropertyOptional({ description: 'Filter by vendor IDs', type: [String] })
  vendor_ids?: string[];

  @ApiPropertyOptional({ description: 'Filter by product IDs', type: [String] })
  product_ids?: string[];

  @ApiPropertyOptional({ description: 'Filter by category IDs', type: [String] })
  category_ids?: string[];

  @ApiPropertyOptional({ description: 'Filter by status values', example: ['approved', 'pending'], type: [String] })
  status?: string[];
}

export class ReportOptionsDto {
  @ApiPropertyOptional({ description: 'Report title', example: 'Inventory Summary Report' })
  title?: string;

  @ApiPropertyOptional({ description: 'Locale for formatting', example: 'th-TH' })
  locale?: string;

  @ApiPropertyOptional({ description: 'Timezone', example: 'Asia/Bangkok' })
  timezone?: string;

  @ApiPropertyOptional({ description: 'Page size for PDF', enum: ['A4', 'A3', 'Letter'], example: 'A4' })
  page_size?: string;

  @ApiPropertyOptional({ description: 'Page orientation for PDF', enum: ['portrait', 'landscape'], example: 'portrait' })
  orientation?: string;

  @ApiPropertyOptional({ description: 'Include summary section', example: true })
  include_summary?: boolean;

  @ApiPropertyOptional({ description: 'Group results by field', example: 'category' })
  group_by?: string;

  @ApiPropertyOptional({ description: 'Sort results by field', example: 'product_name' })
  sort_by?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], example: 'asc' })
  sort_order?: string;
}

export class GenerateReportRequestDto {
  @ApiProperty({ description: 'Report type identifier', example: 'inventory_summary' })
  report_type: string;

  @ApiPropertyOptional({ description: 'Output format', enum: ['json', 'pdf', 'excel', 'csv'], example: 'json', default: 'json' })
  format?: string;

  @ApiPropertyOptional({ description: 'Report filters', type: ReportFiltersDto })
  filters?: ReportFiltersDto;

  @ApiPropertyOptional({ description: 'Report options', type: ReportOptionsDto })
  options?: ReportOptionsDto;

  @ApiPropertyOptional({ description: 'Report template ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  template_id?: string;
}

export class ViewerRequestDto {
  @ApiProperty({ description: 'Report template ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  template_id: string;

  @ApiPropertyOptional({ description: 'Report filters', type: ReportFiltersDto })
  filters?: ReportFiltersDto;
}

export class ReportDataRequestDto {
  @ApiProperty({ description: 'Report template ID (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  template_id: string;

  @ApiPropertyOptional({ description: 'Report filters', type: ReportFiltersDto })
  filters?: ReportFiltersDto;
}

export class ScheduleConfigDto {
  @ApiProperty({ description: 'Frequency', enum: ['daily', 'weekly', 'monthly'], example: 'weekly' })
  frequency: string;

  @ApiProperty({ description: 'Time of day (HH:mm)', example: '08:00' })
  time: string;

  @ApiPropertyOptional({ description: 'Days of week (0=Sun..6=Sat)', type: [Number], example: [1, 3, 5] })
  days_of_week?: number[];

  @ApiPropertyOptional({ description: 'Days of month (1-31)', type: [Number], example: [1, 15] })
  days_of_month?: number[];
}

export class CreateScheduleRequestDto {
  @ApiProperty({ description: 'Schedule name', example: 'Daily Inventory Report' })
  name: string;

  @ApiProperty({ description: 'Report type identifier', example: 'inventory_summary' })
  report_type: string;

  @ApiPropertyOptional({ description: 'Report template ID (UUID)' })
  report_template_id?: string;

  @ApiPropertyOptional({ description: 'Output format', enum: ['json', 'pdf', 'excel', 'csv'], example: 'pdf', default: 'pdf' })
  format?: string;

  @ApiPropertyOptional({ description: 'Cron expression (5-field)', example: '0 8 * * *' })
  cron_expression?: string;

  @ApiPropertyOptional({ description: 'User-friendly schedule config (alternative to cron_expression)', type: ScheduleConfigDto })
  schedule_config?: ScheduleConfigDto;

  @ApiPropertyOptional({ description: 'Report filters', type: ReportFiltersDto })
  filters?: ReportFiltersDto;

  @ApiPropertyOptional({ description: 'Report options', type: ReportOptionsDto })
  options?: ReportOptionsDto;

  @ApiPropertyOptional({ description: 'Recipient user IDs', type: [String], example: ['uuid1', 'uuid2'] })
  recipients?: string[];
}
