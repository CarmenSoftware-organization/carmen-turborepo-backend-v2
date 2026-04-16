import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BaseHttpController } from '@/common';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { Config_SqlQueryService } from './config_sql_query.service';

interface SqlQueryCreateBody {
  name: string;
  description?: string;
  sql_text: string;
  query_type?: string;
  category?: string;
}

interface SqlQueryUpdateBody {
  name?: string;
  description?: string;
  sql_text?: string;
  query_type?: string;
  category?: string;
  is_active?: boolean;
}

@ApiTags('SQL Query')
@ApiHeaderRequiredXAppId()
@Controller('api/config/:bu_code/sql-query')
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_SqlQueryController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_SqlQueryController.name,
  );

  constructor(private readonly service: Config_SqlQueryService) {
    super();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all SQL queries',
    description: 'Returns all saved SQL queries / stored procedures for the business unit.',
    operationId: 'sqlQuery_list',
    tags: ['SQL Query'],
    'x-description-th': 'แสดงรายการ SQL query ทั้งหมดของหน่วยธุรกิจ',
  } as any)
  async list(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.service.list(bu_code, user_id);
    this.respond(res, result);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get SQL query by ID',
    description: 'Returns a single SQL query by its ID.',
    operationId: 'sqlQuery_get',
    tags: ['SQL Query'],
    'x-description-th': 'ดู SQL query ตาม ID',
  } as any)
  async get(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.service.get(bu_code, user_id, id);
    this.respond(res, result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new SQL query',
    description: 'Saves a new SQL query / stored procedure / view definition.',
    operationId: 'sqlQuery_create',
    tags: ['SQL Query'],
    'x-description-th': 'สร้าง SQL query ใหม่',
  } as any)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'PR Summary Report' },
        description: { type: 'string', example: 'Monthly PR summary grouped by department' },
        sql_text: { type: 'string', example: 'SELECT pr_no, pr_date, description FROM tb_purchase_request WHERE deleted_at IS NULL' },
        query_type: { type: 'string', enum: ['query', 'stored_procedure', 'view'], example: 'query' },
        category: { type: 'string', example: 'Procurement' },
      },
      required: ['name', 'sql_text'],
    },
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() body: SqlQueryCreateBody,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.service.create(bu_code, user_id, body as any);
    this.respond(res, result);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a SQL query',
    description: 'Updates an existing SQL query by ID.',
    operationId: 'sqlQuery_update',
    tags: ['SQL Query'],
    'x-description-th': 'แก้ไข SQL query',
  } as any)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        sql_text: { type: 'string' },
        query_type: { type: 'string', enum: ['query', 'stored_procedure', 'view'] },
        category: { type: 'string' },
        is_active: { type: 'boolean' },
      },
    },
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() body: SqlQueryUpdateBody,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.service.update(bu_code, user_id, id, body as any);
    this.respond(res, result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a SQL query',
    description: 'Soft-deletes a SQL query by ID.',
    operationId: 'sqlQuery_delete',
    tags: ['SQL Query'],
    'x-description-th': 'ลบ SQL query (soft delete)',
  } as any)
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.service.delete(bu_code, user_id, id);
    this.respond(res, result);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Duplicate a SQL query',
    description: 'Creates a copy of an existing SQL query with "(Copy)" appended to the name.',
    operationId: 'sqlQuery_duplicate',
    tags: ['SQL Query'],
    'x-description-th': 'คัดลอก SQL query (สร้างสำเนา)',
  } as any)
  async duplicate(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.service.duplicate(bu_code, user_id, id);
    this.respond(res, result);
  }
}
