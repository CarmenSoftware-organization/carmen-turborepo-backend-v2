import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CronjobResponseDto {
  @ApiProperty({ description: 'Cron job ID', example: 'cron_123' })
  id: string;

  @ApiProperty({ description: 'Cron job name', example: 'Daily Backup Job' })
  name: string;

  @ApiPropertyOptional({ description: 'Cron job description', example: 'Performs daily database backup at midnight' })
  description?: string;

  @ApiProperty({ description: 'Cron expression defining the schedule', example: '0 0 * * *' })
  cronExpression: string;

  @ApiProperty({ description: 'Type of job to execute', example: 'notification_check' })
  jobType: string;

  @ApiPropertyOptional({ description: 'JSON string containing job-specific data', example: '{"title":"System Check","message":"Health check","type":"info"}' })
  jobData?: string;

  @ApiPropertyOptional({ description: 'Whether the cron job is active', example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Timezone for cron execution', example: 'Asia/Bangkok' })
  timezone?: string;

  @ApiPropertyOptional({ description: 'Last execution timestamp', example: '2026-01-15T00:00:00.000Z' })
  lastExecution?: Date;

  @ApiPropertyOptional({ description: 'Next scheduled execution timestamp', example: '2026-01-16T00:00:00.000Z' })
  nextExecution?: Date;

  @ApiPropertyOptional({ description: 'Created timestamp', example: '2026-01-15T10:30:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ description: 'Updated timestamp', example: '2026-01-15T10:30:00.000Z' })
  updatedAt?: Date;
}
