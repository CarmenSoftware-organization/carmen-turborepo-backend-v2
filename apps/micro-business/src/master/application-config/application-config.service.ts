import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { ICreateApplicationConfig, IUpdateApplicationConfig, IUserConfigUpsert } from './interface/application-config.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_USER_ID } from '@/common/constant';
import getPaginationParams from '@/common/helpers/pagination.params';
import { PrismaClient, Prisma } from '@repo/prisma-shared-schema-tenant';
import { TryCatch, Result, ErrorCode } from '@/common';

@Injectable()
export class ApplicationConfigService {
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

  private readonly logger: BackendLogger = new BackendLogger(ApplicationConfigService.name);

  constructor(
    private readonly tenantService: TenantService,
  ) {}

  // ==================== tb_application_config CRUD ====================

  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const config = await this.prismaService.tb_application_config.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });

    if (!config) {
      return Result.error('Application config not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(config);
  }

  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      ApplicationConfigService.name,
    );
    const defaultSearchFields = ['key'];

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

    const configs = await this.prismaService.tb_application_config.findMany({
      where: baseWhere,
      orderBy: hasCustomSort ? customOrderBy : [{ key: 'asc' }],
      ...pagination,
    });

    const total = await this.prismaService.tb_application_config.count({ where: baseWhere });

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: configs,
    });
  }

  @TryCatch
  async create(data: ICreateApplicationConfig): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const findConfig = await this.prismaService.tb_application_config.findFirst({
      where: {
        key: data.key,
        deleted_at: null,
      },
    });

    if (findConfig) {
      return Result.error('Application config with this key already exists', ErrorCode.ALREADY_EXISTS);
    }

    const createdConfig = await this.prismaService.tb_application_config.create({
      data: {
        key: data.key,
        value: data.value as Prisma.InputJsonValue,
        created_by_id: this.userId,
      },
    });

    return Result.ok({ id: createdConfig.id });
  }

  @TryCatch
  async update(data: IUpdateApplicationConfig): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const config = await this.prismaService.tb_application_config.findFirst({
      where: {
        id: data.id,
        deleted_at: null,
      },
    });

    if (!config) {
      return Result.error('Application config not found', ErrorCode.NOT_FOUND);
    }

    const updatedConfig = await this.prismaService.tb_application_config.update({
      where: { id: data.id },
      data: {
        value: data.value as Prisma.InputJsonValue,
        updated_by_id: this.userId,
      },
    });

    return Result.ok({ id: updatedConfig.id });
  }

  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const config = await this.prismaService.tb_application_config.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });

    if (!config) {
      return Result.error('Application config not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.tb_application_config.update({
      where: { id: id },
      data: {
        deleted_by_id: this.userId,
        deleted_at: new Date().toISOString(),
      },
    });

    return Result.ok({ id });
  }

  // ==================== Find by key ====================

  @TryCatch
  async findByKey(key: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findByKey', key, user_id: this.userId, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const config = await this.prismaService.tb_application_config.findFirst({
      where: {
        key: key,
        deleted_at: null,
      },
    });

    if (!config) {
      return Result.error('Application config not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(config);
  }

  // ==================== tb_application_user_config ====================

  @TryCatch
  async findUserConfig(userId: string, key: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findUserConfig', userId, key, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const userConfig = await this.prismaService.tb_application_user_config.findFirst({
      where: {
        user_id: userId,
        key: key,
        deleted_at: null,
      },
    });

    if (!userConfig) {
      return Result.error('User config not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(userConfig);
  }

  @TryCatch
  async upsertUserConfig(data: IUserConfigUpsert): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'upsertUserConfig', data, tenant_id: this.bu_code },
      ApplicationConfigService.name,
    );

    const existingConfig = await this.prismaService.tb_application_user_config.findFirst({
      where: {
        user_id: data.user_id,
        key: data.key,
        deleted_at: null,
      },
    });

    if (existingConfig) {
      const updatedConfig = await this.prismaService.tb_application_user_config.update({
        where: { id: existingConfig.id },
        data: {
          value: data.value as Prisma.InputJsonValue,
          updated_by_id: this.userId,
        },
      });
      return Result.ok({ id: updatedConfig.id });
    }

    const createdConfig = await this.prismaService.tb_application_user_config.create({
      data: {
        user_id: data.user_id,
        key: data.key,
        value: data.value as Prisma.InputJsonValue,
        created_by_id: this.userId,
      },
    });

    return Result.ok({ id: createdConfig.id });
  }
}
