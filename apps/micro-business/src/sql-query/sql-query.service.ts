import { Injectable, Logger } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';

const SELECT_FIELDS = {
  id: true,
  name: true,
  description: true,
  sql_text: true,
  query_type: true,
  category: true,
  is_active: true,
  created_at: true,
  created_by_id: true,
  updated_at: true,
  updated_by_id: true,
} as const;

@Injectable()
export class SqlQueryService {
  private readonly logger = new Logger(SqlQueryService.name);

  constructor(private readonly tenantService: TenantService) {}

  async list(bu_code: string, user_id: string) {
    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    return prisma.tb_sql_query.findMany({
      where: { deleted_at: null },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: SELECT_FIELDS,
    });
  }

  async get(bu_code: string, user_id: string, id: string) {
    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    return prisma.tb_sql_query.findFirst({
      where: { id, deleted_at: null },
      select: SELECT_FIELDS,
    });
  }

  async create(
    bu_code: string,
    user_id: string,
    input: {
      name: string;
      description?: string;
      sql_text: string;
      query_type?: string;
      category?: string;
    },
  ) {
    if (!input.name?.trim()) throw new Error('name is required');
    if (!input.sql_text?.trim()) throw new Error('sql_text is required');
    if (!user_id) throw new Error('user_id is required');

    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const nowIso = new Date().toISOString();

    return prisma.tb_sql_query.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        sql_text: input.sql_text,
        query_type: input.query_type || 'query',
        category: input.category?.trim() || null,
        created_at: nowIso,
        created_by_id: user_id,
      },
      select: SELECT_FIELDS,
    });
  }

  async update(
    bu_code: string,
    user_id: string,
    id: string,
    input: {
      name?: string;
      description?: string;
      sql_text?: string;
      query_type?: string;
      category?: string;
      is_active?: boolean;
    },
  ) {
    if (!user_id) throw new Error('user_id is required');

    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const existing = await prisma.tb_sql_query.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });
    if (!existing) return null;

    const nowIso = new Date().toISOString();

    return prisma.tb_sql_query.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && { description: input.description?.trim() || null }),
        ...(input.sql_text !== undefined && { sql_text: input.sql_text }),
        ...(input.query_type !== undefined && { query_type: input.query_type }),
        ...(input.category !== undefined && { category: input.category?.trim() || null }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
        updated_at: nowIso,
        updated_by_id: user_id,
      },
      select: SELECT_FIELDS,
    });
  }

  async delete(bu_code: string, user_id: string, id: string) {
    if (!user_id) throw new Error('user_id is required');

    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const result = await prisma.tb_sql_query.updateMany({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date().toISOString(), deleted_by_id: user_id },
    });

    return { deleted: result.count > 0, count: result.count };
  }

  async duplicate(bu_code: string, user_id: string, id: string) {
    const prisma = await this.tenantService.prismaTenantInstance(bu_code, user_id);
    const source = await prisma.tb_sql_query.findFirst({
      where: { id, deleted_at: null },
      select: { name: true, description: true, sql_text: true, query_type: true, category: true },
    });
    if (!source) return null;

    const nowIso = new Date().toISOString();

    return prisma.tb_sql_query.create({
      data: {
        name: `${source.name} (Copy)`,
        description: source.description,
        sql_text: source.sql_text,
        query_type: source.query_type,
        category: source.category,
        created_at: nowIso,
        created_by_id: user_id,
      },
      select: SELECT_FIELDS,
    });
  }
}
