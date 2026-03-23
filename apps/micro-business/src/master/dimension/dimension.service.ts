import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { ICreateDimension, IUpdateDimension } from './interface/dimension.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_USER_ID } from '@/common/constant';
import getPaginationParams from '@/common/helpers/pagination.params';
import { PrismaClient, Prisma } from '@repo/prisma-shared-schema-tenant';
import { TryCatch, Result, ErrorCode } from '@/common';

@Injectable()
export class DimensionService {
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

  private readonly logger: BackendLogger = new BackendLogger(DimensionService.name);

  constructor(
    private readonly tenantService: TenantService,
  ) {}

  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      DimensionService.name,
    );

    const dimension = await this.prismaService.tb_dimension.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
      include: {
        tb_dimension_display_in: {
          where: { deleted_at: null },
        },
      },
    });

    if (!dimension) {
      return Result.error('Dimension not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(dimension);
  }

  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      DimensionService.name,
    );
    const defaultSearchFields = ['key', 'description'];

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

    const dimensions = await this.prismaService.tb_dimension.findMany({
      where: baseWhere,
      orderBy: hasCustomSort ? customOrderBy : [{ key: 'asc' }],
      ...pagination,
    });

    const total = await this.prismaService.tb_dimension.count({ where: baseWhere });

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: dimensions,
    });
  }

  @TryCatch
  async create(data: ICreateDimension): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      DimensionService.name,
    );

    const findDimension = await this.prismaService.tb_dimension.findFirst({
      where: {
        key: data.key,
        deleted_at: null,
      },
    });

    if (findDimension) {
      return Result.error('Dimension with this key already exists', ErrorCode.ALREADY_EXISTS);
    }

    const { display_in, ...dimensionData } = data;

    const createdDimension = await this.prismaService.tb_dimension.create({
      data: {
        key: dimensionData.key,
        type: dimensionData.type as any,
        description: dimensionData.description,
        note: dimensionData.note,
        is_active: dimensionData.is_active,
        value: dimensionData.value as Prisma.InputJsonValue,
        default_value: dimensionData.default_value as Prisma.InputJsonValue,
        info: dimensionData.info as Prisma.InputJsonValue,
        created_by_id: this.userId,
        tb_dimension_display_in: display_in && display_in.length > 0
          ? {
              create: display_in.map((item) => ({
                display_in: item.display_in as any,
                default_value: item.default_value as Prisma.InputJsonValue,
                note: item.note,
                created_by_id: this.userId,
              })),
            }
          : undefined,
      },
    });

    return Result.ok({ id: createdDimension.id });
  }

  @TryCatch
  async update(data: IUpdateDimension): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      DimensionService.name,
    );

    const dimension = await this.prismaService.tb_dimension.findFirst({
      where: {
        id: data.id,
        deleted_at: null,
      },
    });

    if (!dimension) {
      return Result.error('Dimension not found', ErrorCode.NOT_FOUND);
    }

    if (data.key && data.key !== dimension.key) {
      const existingWithKey = await this.prismaService.tb_dimension.findFirst({
        where: {
          key: data.key,
          deleted_at: null,
          id: { not: data.id },
        },
      });

      if (existingWithKey) {
        return Result.error('Dimension with this key already exists', ErrorCode.ALREADY_EXISTS);
      }
    }

    const { display_in, ...dimensionData } = data;

    await this.prismaService.$transaction(async (tx) => {
      await tx.tb_dimension.update({
        where: { id: data.id },
        data: {
          key: dimensionData.key,
          type: dimensionData.type as any,
          description: dimensionData.description,
          note: dimensionData.note,
          is_active: dimensionData.is_active,
          value: dimensionData.value as Prisma.InputJsonValue,
          default_value: dimensionData.default_value as Prisma.InputJsonValue,
          info: dimensionData.info as Prisma.InputJsonValue,
          updated_by_id: this.userId,
          updated_at: new Date().toISOString(),
        },
      });

      if (display_in) {
        // Add new display_in items
        if (display_in.add && display_in.add.length > 0) {
          for (const item of display_in.add) {
            await tx.tb_dimension_display_in.create({
              data: {
                dimension_id: data.id,
                display_in: item.display_in as never,
                default_value: item.default_value as Prisma.InputJsonValue,
                note: item.note,
                created_by_id: this.userId,
              },
            });
          }
        }

        // Update existing display_in items
        if (display_in.update && display_in.update.length > 0) {
          for (const item of display_in.update) {
            await tx.tb_dimension_display_in.update({
              where: { id: item.id },
              data: {
                display_in: item.display_in as never,
                default_value: item.default_value as Prisma.InputJsonValue,
                note: item.note,
                updated_by_id: this.userId,
              },
            });
          }
        }

        // Soft delete display_in items
        if (display_in.delete && display_in.delete.length > 0) {
          for (const id of display_in.delete) {
            await tx.tb_dimension_display_in.update({
              where: { id },
              data: {
                deleted_at: new Date().toISOString(),
                deleted_by_id: this.userId,
              },
            });
          }
        }
      }
    });

    return Result.ok({ id: data.id });
  }

  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      DimensionService.name,
    );

    const dimension = await this.prismaService.tb_dimension.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });

    if (!dimension) {
      return Result.error('Dimension not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.$transaction(async (tx) => {
      // Soft delete display_in items
      await tx.tb_dimension_display_in.updateMany({
        where: {
          dimension_id: id,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: this.userId,
        },
      });

      // Soft delete dimension
      await tx.tb_dimension.update({
        where: { id: id },
        data: {
          is_active: false,
          deleted_by_id: this.userId,
          deleted_at: new Date().toISOString(),
        },
      });
    });

    return Result.ok({ id });
  }
}
