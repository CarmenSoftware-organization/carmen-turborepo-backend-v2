import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ConfigCronjobService } from './config_cronjob.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BaseHttpController } from '@/common';
import { CreateCronjobDto } from './dto/create-cronjob.dto';
import { UpdateCronjobDto } from './dto/update-cronjob.dto';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';


@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@Controller('api/config/cronjobs')
export class ConfigCronjobController extends BaseHttpController {
  constructor(private readonly configCronjobService: ConfigCronjobService) {
    super();
  }

  /**
   * Returns all scheduled tasks such as automated report generation,
   * inventory recalculations, and periodic data synchronization jobs.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all cron jobs', description: 'Returns all scheduled tasks configured in the system, such as automated report generation, inventory recalculations, and periodic data synchronization jobs.', tags: ['Configuration', 'Cronjob'] })
  @ApiResponse({ status: 200, description: 'Successfully retrieved all cron jobs' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async getAll(@Res() res: Response): Promise<void> {
    // Call the getAll method from the configCronjobService
    const result = await this.configCronjobService.getAll();
    this.respond(res, result);
  }

  /**
   * Retrieves configuration details of a specific scheduled task including
   * cron schedule expression, execution status, and last run information.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get cron job by ID', description: 'Retrieves the configuration details of a specific scheduled task, including its cron schedule expression, execution status, and last run information.', tags: ['Configuration', 'Cronjob'] })
  @ApiParam({ name: 'id', description: 'Cron job ID', example: 'cron_123' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved cron job' })
  @ApiResponse({ status: 404, description: 'Cron job not found' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async getById(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.getById(id);
    this.respond(res, result);
  }

  /**
   * Creates a new scheduled task for automating recurring operations like
   * report generation, data cleanup, or inventory snapshots.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new cron job', description: 'Creates a new scheduled task with a cron schedule expression and task configuration. Used to automate recurring operations like report generation, data cleanup, or inventory snapshots.', tags: ['Configuration', 'Cronjob'] })
  @ApiBody({ type: CreateCronjobDto })
  @ApiResponse({ status: 201, description: 'Cron job created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async create(@Body() body: CreateCronjobDto, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.create({ ...body });
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing scheduled task configuration such as cron schedule,
   * task parameters, or enabled/disabled state.
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update cron job', description: 'Modifies an existing scheduled task configuration, such as changing its cron schedule, task parameters, or enabling/disabling the job.', tags: ['Configuration', 'Cronjob'] })
  @ApiParam({ name: 'id', description: 'Cron job ID', example: 'cron_123' })
  @ApiBody({ type: UpdateCronjobDto })
  @ApiResponse({ status: 200, description: 'Cron job updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Cron job not found' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async update(@Param('id') id: string, @Body() body: UpdateCronjobDto, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.update(id, { ...body });
    this.respond(res, result);
  }

  /**
   * Permanently removes a scheduled task and stops it from executing.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete cron job', description: 'Permanently removes a scheduled task from the system and stops it from executing. Use this to clean up tasks that are no longer needed.', tags: ['Configuration', 'Cronjob'] })
  @ApiParam({ name: 'id', description: 'Cron job ID', example: 'cron_123' })
  @ApiResponse({ status: 200, description: 'Cron job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Cron job not found' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async delete(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.delete(id);
    this.respond(res, result);
  }

  /**
   * Activates a scheduled task so it begins executing at the configured cron intervals.
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start cron job', description: 'Activates a scheduled task so it begins executing according to its cron schedule. The task will run automatically at the configured intervals until stopped.', tags: ['Configuration', 'Cronjob'] })
  @ApiParam({ name: 'id', description: 'Cron job ID', example: 'cron_123' })
  @ApiResponse({ status: 200, description: 'Cron job started successfully' })
  @ApiResponse({ status: 404, description: 'Cron job not found' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async start(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.start(id);
    this.respond(res, result);
  }

  /**
   * Pauses a running scheduled task without deleting it. Can be restarted later.
   */
  @Post(':id/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop cron job', description: 'Pauses a running scheduled task without deleting it. The task remains configured and can be restarted later without losing its settings.', tags: ['Configuration', 'Cronjob'] })
  @ApiParam({ name: 'id', description: 'Cron job ID', example: 'cron_123' })
  @ApiResponse({ status: 200, description: 'Cron job stopped successfully' })
  @ApiResponse({ status: 404, description: 'Cron job not found' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async stop(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.stop(id);
    this.respond(res, result);
  }

  /**
   * Manually triggers a scheduled task to run immediately, bypassing the cron schedule.
   * Useful for testing or urgent on-demand operations.
   */
  @Post(':id/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute cron job immediately', description: 'Manually triggers a scheduled task to run immediately, bypassing the cron schedule. Useful for testing task configurations or running on-demand operations like urgent report generation.', tags: ['Configuration', 'Cronjob'] })
  @ApiParam({ name: 'id', description: 'Cron job ID', example: 'cron_123' })
  @ApiResponse({ status: 200, description: 'Cron job executed successfully' })
  @ApiResponse({ status: 404, description: 'Cron job not found' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async execute(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.execute(id);
    this.respond(res, result);
  }

  /**
   * Returns diagnostic information about scheduled tasks currently active in memory
   * for system monitoring and troubleshooting.
   */
  @Get('debug/memory')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active jobs in memory', description: 'Returns diagnostic information about all scheduled tasks currently loaded and active in the application memory. Used for system monitoring and troubleshooting job execution issues.', tags: ['Configuration', 'Cronjob'] })
  @ApiResponse({ status: 200, description: 'Successfully retrieved active jobs in memory' })
  @ApiResponse({ status: 503, description: 'Failed to connect to cronjob service' })
  async getActiveInMemory(@Res() res: Response): Promise<void> {
    const result = await this.configCronjobService.getActiveInMemory();
    this.respond(res, result);
  }
}
