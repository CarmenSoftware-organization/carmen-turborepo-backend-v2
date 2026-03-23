import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { ICreateCountStock, IUpdateCountStock } from './interface/count-stock.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_USER_ID } from '@/common/constant';
import getPaginationParams from '@/common/helpers/pagination.params';
import { PrismaClient, Prisma } from '@repo/prisma-shared-schema-tenant';
import { TryCatch, Result, ErrorCode } from '@/common';

@Injectable()
export class CountStockService {
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

  private readonly logger: BackendLogger = new BackendLogger(CountStockService.name);

  constructor(
    private readonly tenantService: TenantService,
  ) {}

  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      CountStockService.name,
    );

    const countStock = await this.prismaService.tb_count_stock.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
      include: {
        tb_location: {
          select: { id: true, name: true, code: true },
        },
        tb_count_stock_detail: {
          where: { deleted_at: null },
          orderBy: { sequence_no: 'asc' },
          include: {
            tb_product: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!countStock) {
      return Result.error('Count stock not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(countStock);
  }

  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      CountStockService.name,
    );
    const defaultSearchFields = ['count_stock_no', 'location_name'];

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

    const countStocks = await this.prismaService.tb_count_stock.findMany({
      where: baseWhere,
      orderBy: hasCustomSort ? customOrderBy : [{ created_at: 'desc' }],
      ...pagination,
    });

    const total = await this.prismaService.tb_count_stock.count({ where: baseWhere });

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: countStocks,
    });
  }

  @TryCatch
  async create(data: ICreateCountStock): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      CountStockService.name,
    );

    const { details, ...headerData } = data;

    const createdCountStock = await this.prismaService.tb_count_stock.create({
      data: {
        ...headerData,
        start_date: headerData.start_date ? new Date(headerData.start_date) : undefined,
        end_date: headerData.end_date ? new Date(headerData.end_date) : undefined,
        info: headerData.info as Prisma.InputJsonValue,
        dimension: headerData.dimension as unknown as Prisma.InputJsonValue,
        created_by_id: this.userId,
        tb_count_stock_detail: details && details.length > 0
          ? {
              create: details.map((item) => ({
                sequence_no: item.sequence_no,
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name,
                product_local_name: item.product_local_name,
                product_sku: item.product_sku,
                qty: item.qty,
                description: item.description,
                note: item.note,
                info: item.info as Prisma.InputJsonValue,
                dimension: item.dimension as unknown as Prisma.InputJsonValue,
                created_by_id: this.userId,
              })),
            }
          : undefined,
      },
    });

    return Result.ok({ id: createdCountStock.id });
  }

  @TryCatch
  async update(data: IUpdateCountStock): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      CountStockService.name,
    );

    const countStock = await this.prismaService.tb_count_stock.findFirst({
      where: {
        id: data.id,
        deleted_at: null,
      },
    });

    if (!countStock) {
      return Result.error('Count stock not found', ErrorCode.NOT_FOUND);
    }

    const { details, ...headerData } = data;

    await this.prismaService.$transaction(async (tx) => {
      await tx.tb_count_stock.update({
        where: { id: data.id },
        data: {
          ...headerData,
          start_date: headerData.start_date ? new Date(headerData.start_date) : undefined,
          end_date: headerData.end_date ? new Date(headerData.end_date) : undefined,
          info: headerData.info as Prisma.InputJsonValue,
          dimension: headerData.dimension as unknown as Prisma.InputJsonValue,
          updated_by_id: this.userId,
        },
      });

      if (details) {
        // Add new detail items
        if (details.add && details.add.length > 0) {
          for (const item of details.add) {
            await tx.tb_count_stock_detail.create({
              data: {
                count_stock_id: data.id,
                sequence_no: item.sequence_no,
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name,
                product_local_name: item.product_local_name,
                product_sku: item.product_sku,
                qty: item.qty,
                description: item.description,
                note: item.note,
                info: item.info as Prisma.InputJsonValue,
                dimension: item.dimension as unknown as Prisma.InputJsonValue,
                created_by_id: this.userId,
              },
            });
          }
        }

        // Update existing detail items
        if (details.update && details.update.length > 0) {
          for (const item of details.update) {
            await tx.tb_count_stock_detail.update({
              where: { id: item.id },
              data: {
                sequence_no: item.sequence_no,
                product_id: item.product_id,
                product_code: item.product_code,
                product_name: item.product_name,
                product_local_name: item.product_local_name,
                product_sku: item.product_sku,
                qty: item.qty,
                description: item.description,
                note: item.note,
                info: item.info as Prisma.InputJsonValue,
                dimension: item.dimension as unknown as Prisma.InputJsonValue,
                updated_by_id: this.userId,
              },
            });
          }
        }

        // Soft delete detail items
        if (details.delete && details.delete.length > 0) {
          for (const id of details.delete) {
            await tx.tb_count_stock_detail.update({
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
      CountStockService.name,
    );

    const countStock = await this.prismaService.tb_count_stock.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });

    if (!countStock) {
      return Result.error('Count stock not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.$transaction(async (tx) => {
      // Soft delete detail items
      await tx.tb_count_stock_detail.updateMany({
        where: {
          count_stock_id: id,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: this.userId,
        },
      });

      // Soft delete header
      await tx.tb_count_stock.update({
        where: { id: id },
        data: {
          deleted_by_id: this.userId,
          deleted_at: new Date().toISOString(),
        },
      });
    });

    return Result.ok({ id });
  }
}
