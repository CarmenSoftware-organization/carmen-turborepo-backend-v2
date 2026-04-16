import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SqlQueryService } from './sql-query.service';

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

@Controller()
export class SqlQueryController {
  private readonly logger = new Logger(SqlQueryController.name);

  constructor(private readonly sqlQueryService: SqlQueryService) {}

  @MessagePattern({ cmd: 'sqlQuery.list', service: 'business' })
  async list(data: { bu_code: string; user_id: string }) {
    try {
      const items = await this.sqlQueryService.list(data.bu_code, data.user_id);
      return { status: 200, data: { items, count: items.length } };
    } catch (error) {
      return { status: 500, error: 'Failed to list sql queries', details: errMsg(error) };
    }
  }

  @MessagePattern({ cmd: 'sqlQuery.get', service: 'business' })
  async get(data: { bu_code: string; user_id: string; id: string }) {
    try {
      const item = await this.sqlQueryService.get(data.bu_code, data.user_id, data.id);
      if (!item) return { status: 404, error: 'SQL query not found' };
      return { status: 200, data: item };
    } catch (error) {
      return { status: 500, error: 'Failed to get sql query', details: errMsg(error) };
    }
  }

  @MessagePattern({ cmd: 'sqlQuery.create', service: 'business' })
  async create(data: {
    bu_code: string;
    user_id: string;
    name: string;
    description?: string;
    sql_text: string;
    query_type?: string;
    category?: string;
  }) {
    try {
      const item = await this.sqlQueryService.create(data.bu_code, data.user_id, data);
      return { status: 201, data: item };
    } catch (error) {
      return { status: 400, error: 'Failed to create sql query', details: errMsg(error) };
    }
  }

  @MessagePattern({ cmd: 'sqlQuery.update', service: 'business' })
  async update(data: {
    bu_code: string;
    user_id: string;
    id: string;
    name?: string;
    description?: string;
    sql_text?: string;
    query_type?: string;
    category?: string;
    is_active?: boolean;
  }) {
    try {
      const item = await this.sqlQueryService.update(data.bu_code, data.user_id, data.id, data);
      if (!item) return { status: 404, error: 'SQL query not found' };
      return { status: 200, data: item };
    } catch (error) {
      return { status: 400, error: 'Failed to update sql query', details: errMsg(error) };
    }
  }

  @MessagePattern({ cmd: 'sqlQuery.delete', service: 'business' })
  async delete(data: { bu_code: string; user_id: string; id: string }) {
    try {
      const result = await this.sqlQueryService.delete(data.bu_code, data.user_id, data.id);
      return { status: 200, data: result };
    } catch (error) {
      return { status: 400, error: 'Failed to delete sql query', details: errMsg(error) };
    }
  }

  @MessagePattern({ cmd: 'sqlQuery.duplicate', service: 'business' })
  async duplicate(data: { bu_code: string; user_id: string; id: string }) {
    try {
      const item = await this.sqlQueryService.duplicate(data.bu_code, data.user_id, data.id);
      if (!item) return { status: 404, error: 'SQL query not found' };
      return { status: 201, data: item };
    } catch (error) {
      return { status: 400, error: 'Failed to duplicate sql query', details: errMsg(error) };
    }
  }
}
