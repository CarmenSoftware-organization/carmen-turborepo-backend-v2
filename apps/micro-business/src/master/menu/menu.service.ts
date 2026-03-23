import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { ICreateMenu, IUpdateMenu } from './interface/menu.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_USER_ID } from '@/common/constant';
import getPaginationParams from '@/common/helpers/pagination.params';
import { PrismaClient } from '@repo/prisma-shared-schema-tenant';
import { TryCatch, Result, ErrorCode } from '@/common';

@Injectable()
export class MenuService {
  get bu_code(): string {
    if (this._bu_code) {
      return String(this._bu_code);
    }
    throw new HttpException(
      ERROR_MISSING_BU_CODE,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  get userId(): string {
    if (isUUID(this._userId, 4)) {
      return String(this._userId);
    }
    throw new HttpException(
      ERROR_MISSING_USER_ID,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  set bu_code(value: string) {
    this._bu_code = value;
  }

  set userId(value: string) {
    this._userId = value;
  }

  private _bu_code?: string;
  private _userId?: string;

  async initializePrismaService(bu_code: string, userId: string): Promise<void> {
    this._prismaService = await this.tenantService.prismaTenantInstance(bu_code, userId);
  }

  private _prismaService: PrismaClient | undefined;

  get prismaService(): PrismaClient {
    if (!this._prismaService) {
      throw new HttpException(
        'Prisma service is not initialized',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this._prismaService;
  }

  private readonly logger: BackendLogger = new BackendLogger(MenuService.name);

  constructor(
    private readonly tenantService: TenantService,
  ) {}

  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      MenuService.name,
    );

    const menu = await this.prismaService.tb_menu.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });

    if (!menu) {
      return Result.error('Menu not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(menu);
  }

  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      MenuService.name,
    );
    const defaultSearchFields = ['name', 'url'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      typeof paginate.filter === 'object' && !Array.isArray(paginate.filter) ? paginate.filter : {},
      paginate.sort,
      paginate.advance,
    );

    const baseWhere = {
      ...q.where(),
      deleted_at: null,
    };

    const pagination = getPaginationParams(q.page, q.perpage);
    const customOrderBy = q.orderBy();
    const hasCustomSort = Array.isArray(customOrderBy)
      ? customOrderBy.length > 0
      : Object.keys(customOrderBy).length > 0;

    const menus = await this.prismaService.tb_menu.findMany({
      where: baseWhere,
      orderBy: hasCustomSort ? customOrderBy : [{ name: 'asc' }],
      ...pagination,
    });

    const total = await this.prismaService.tb_menu.count({ where: baseWhere });

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: menus,
    });
  }

  @TryCatch
  async create(data: ICreateMenu): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      MenuService.name,
    );

    // Check duplicate name within same module_id
    const findMenu = await this.prismaService.tb_menu.findFirst({
      where: {
        name: data.name,
        module_id: data.module_id,
        deleted_at: null,
      },
    });

    if (findMenu) {
      return Result.error('Menu with this name already exists in the same module', ErrorCode.ALREADY_EXISTS);
    }

    const createdMenu = await this.prismaService.tb_menu.create({
      data: {
        module_id: data.module_id,
        name: data.name,
        url: data.url,
        description: data.description,
        is_visible: data.is_visible,
        is_active: data.is_active,
        is_lock: data.is_lock,
        created_by_id: this.userId,
      },
    });

    return Result.ok({ id: createdMenu.id });
  }

  @TryCatch
  async update(data: IUpdateMenu): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      MenuService.name,
    );

    const menu = await this.prismaService.tb_menu.findFirst({
      where: {
        id: data.id,
        deleted_at: null,
      },
    });

    if (!menu) {
      return Result.error('Menu not found', ErrorCode.NOT_FOUND);
    }

    // Check duplicate name within same module_id if name or module_id is being updated
    const checkName = data.name || menu.name;
    const checkModuleId = data.module_id || menu.module_id;

    if (data.name || data.module_id) {
      const existingWithName = await this.prismaService.tb_menu.findFirst({
        where: {
          name: checkName,
          module_id: checkModuleId,
          deleted_at: null,
          id: { not: data.id },
        },
      });

      if (existingWithName) {
        return Result.error('Menu with this name already exists in the same module', ErrorCode.ALREADY_EXISTS);
      }
    }

    const updatedMenu = await this.prismaService.tb_menu.update({
      where: { id: data.id },
      data: {
        ...data,
        updated_by_id: this.userId,
      },
    });

    return Result.ok({ id: updatedMenu.id });
  }

  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      MenuService.name,
    );

    const menu = await this.prismaService.tb_menu.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });

    if (!menu) {
      return Result.error('Menu not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.tb_menu.update({
      where: { id: id },
      data: {
        is_active: false,
        deleted_by_id: this.userId,
        deleted_at: new Date().toISOString(),
      },
    });

    return Result.ok({ id });
  }
}
