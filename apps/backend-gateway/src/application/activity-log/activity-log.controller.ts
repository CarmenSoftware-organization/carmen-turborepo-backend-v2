import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { ActivityLogService, IActivityLogFilter } from './activity-log.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { BaseHttpController } from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BatchDeleteDto } from './swagger/request';

@Controller('api/:bu_code/activity-log')
@ApiTags('Document & Log')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ActivityLogController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ActivityLogController.name,
  );

  constructor(private readonly activityLogService: ActivityLogService) {
    super();
  }

  /**
   * Retrieves all activity logs with filtering by entity type, user, action,
   * and date range. Provides an audit trail of all operations performed
   * on procurement and inventory documents within the business unit.
   */
  @Get()
  @UseGuards(new AppIdGuard('activityLog.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all activity logs',
    description: 'Lists all user activity records for the business unit with filtering by entity type, user, action, and date range. Used for audit trail review, compliance reporting, and investigating who performed what actions on procurement and inventory documents.',
    operationId: 'findAllActivityLogs',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity logs retrieved successfully' },
    },
  })
  @ApiQuery({ name: 'entity_type', required: false, type: String, description: 'Filter by entity type' })
  @ApiQuery({ name: 'entity_id', required: false, type: String, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'actor_id', required: false, type: String, description: 'Filter by actor (user) ID' })
  @ApiQuery({ name: 'action', required: false, type: String, description: 'Filter by action (create, update, delete, etc.)' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Filter from date (ISO 8601)' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Filter to date (ISO 8601)' })
  async findAll(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Query('entity_type') entity_type?: string,
    @Query('entity_id') entity_id?: string,
    @Query('actor_id') actor_id?: string,
    @Query('action') action?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);

    const filters: IActivityLogFilter = {};
    if (entity_type) filters.entity_type = entity_type;
    if (entity_id) filters.entity_id = entity_id;
    if (actor_id) filters.actor_id = actor_id;
    if (action) filters.action = action;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;

    const result = await this.activityLogService.findAll(user_id, bu_code, paginate, filters);
    this.respond(res, result);
  }

  /**
   * Retrieves activity logs filtered by a specific entity type (e.g., purchase_request,
   * purchase_order, stock_in). Used to view the history of a particular document type.
   */
  @Get('entity/:entity_type')
  @UseGuards(new AppIdGuard('activityLog.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get activity logs by entity type',
    description: 'Retrieves all activity records for a specific document type (e.g., purchase_request, purchase_order, good_received_note). Used to review the complete history of actions taken on a particular category of business documents.',
    operationId: 'findActivityLogsByEntity',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity logs retrieved successfully' },
    },
  })
  async findByEntity(
    @Param('entity_type') entity_type: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findByEntity',
        entity_type,
        query,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);

    const result = await this.activityLogService.findByEntity(entity_type, user_id, bu_code, paginate);
    this.respond(res, result);
  }

  /**
   * Retrieves a specific activity log entry by ID, showing the full details
   * of a single action including who performed it, when, and what changed.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('activityLog.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get an activity log by ID',
    description: 'Retrieves the full details of a single audit log entry including the user who performed the action, timestamp, affected entity, and the before/after data changes. Used for detailed investigation of specific user actions.',
    operationId: 'findOneActivityLog',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity log retrieved successfully' },
      404: { description: 'Activity log not found' },
    },
  })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.activityLogService.findOne(id, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * Soft-deletes an activity log entry, marking it as removed but retaining
   * the record for potential recovery or compliance purposes.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('activityLog.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft delete an activity log',
    description: 'Marks an activity log entry as deleted without permanently removing it, preserving the audit trail for compliance. The entry can be restored if needed.',
    operationId: 'deleteActivityLog',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity log deleted successfully' },
      404: { description: 'Activity log not found' },
    },
  })
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.activityLogService.delete(id, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * Soft-deletes multiple activity log entries in a single batch operation.
   */
  @Delete('batch/soft')
  @UseGuards(new AppIdGuard('activityLog.deleteMany'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch soft delete activity logs',
    description: 'Marks multiple activity log entries as deleted in a single operation without permanently removing them. Used for bulk cleanup of audit records while preserving recoverability.',
    operationId: 'deleteManyActivityLogs',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity logs deleted successfully' },
    },
  })
  @ApiBody({ type: BatchDeleteDto, description: 'IDs of activity logs to delete' })
  async deleteMany(
    @Body() body: BatchDeleteDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'deleteMany',
        ids: body.ids,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.activityLogService.deleteMany(body.ids, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * Permanently deletes an activity log entry from the database.
   * Use with caution as this cannot be undone.
   */
  @Delete(':id/hard')
  @UseGuards(new AppIdGuard('activityLog.hardDelete'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Hard delete an activity log',
    description: 'Permanently and irreversibly removes an activity log entry from the database. Use with caution as this cannot be undone and may affect audit compliance.',
    operationId: 'hardDeleteActivityLog',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity log permanently deleted' },
      404: { description: 'Activity log not found' },
    },
  })
  async hardDelete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'hardDelete',
        id,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.activityLogService.hardDelete(id, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * Permanently deletes multiple activity log entries in a single batch operation.
   * Use with caution as this cannot be undone.
   */
  @Delete('batch/hard')
  @UseGuards(new AppIdGuard('activityLog.hardDeleteMany'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch hard delete activity logs',
    description: 'Permanently and irreversibly removes multiple activity log entries from the database in a single operation. Use with caution as this cannot be undone and may affect audit compliance.',
    operationId: 'hardDeleteManyActivityLogs',
    tags: ['Document & Log', 'Activity Log'],
    responses: {
      200: { description: 'Activity logs permanently deleted' },
    },
  })
  @ApiBody({ type: BatchDeleteDto, description: 'IDs of activity logs to permanently delete' })
  async hardDeleteMany(
    @Body() body: BatchDeleteDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'hardDeleteMany',
        ids: body.ids,
      },
      ActivityLogController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.activityLogService.hardDeleteMany(body.ids, user_id, bu_code);
    this.respond(res, result);
  }
}
