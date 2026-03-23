import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import {
  ICreateExtraCost,
  IUpdateExtraCost,
} from './interface/extra-cost.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_TENANT_ID, ERROR_MISSING_USER_ID } from '@/common/constant';
import getPaginationParams from '@/common/helpers/pagination.params';
import { PrismaClient } from '@repo/prisma-shared-schema-tenant';
import {
  TryCatch,
  Result,
  ErrorCode,
} from '@/common';
import {
  ExtraCostDetailResponseSchema,
  ExtraCostListItemResponseSchema,
} from './dto/extra-cost.serializer';

@Injectable()
export class ExtraCostService {
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

  private readonly logger: BackendLogger = new BackendLogger(
    ExtraCostService.name,
  );

  /**
   * Initialize the Prisma service for the tenant
   * @param bu_code - Business unit code
   * @param userId - User ID
   */
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

  constructor(
    private readonly tenantService: TenantService,
  ) { }

  /**
   * Find a single extra cost by ID with details
   * @param id - Extra cost ID
   * @returns Extra cost detail with detail items
   */
  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      ExtraCostService.name,
    );

    const extraCost = await this.prismaService.tb_extra_cost.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        tb_extra_cost_detail: {
          where: {
            deleted_at: null,
          },
          orderBy: {
            sequence_no: 'asc',
          },
        },
      },
    });
    if (!extraCost) {
      return Result.error('Extra cost not found', ErrorCode.NOT_FOUND);
    }

    const serializedExtraCost = ExtraCostDetailResponseSchema.parse(extraCost);
    return Result.ok(serializedExtraCost);
  }

  /**
   * Find all extra costs with pagination
   * @param paginate - Pagination parameters
   * @returns Paginated list of extra costs
   */
  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      ExtraCostService.name,
    );
    const defaultSearchFields = ['name'];

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

    const pagination = getPaginationParams(q.page, q.perpage);
    const customOrderBy = q.orderBy();
    const hasCustomSort = Array.isArray(customOrderBy)
      ? customOrderBy.length > 0
      : Object.keys(customOrderBy).length > 0;

    const extraCosts = await this.prismaService.tb_extra_cost.findMany({
      where: q.where(),
      orderBy: hasCustomSort ? customOrderBy : [{ created_at: 'desc' }],
      ...pagination,
    });

    const total = await this.prismaService.tb_extra_cost.count({ where: q.where() });

    const serializedExtraCosts = extraCosts.map((item) => ExtraCostListItemResponseSchema.parse(item));
    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: serializedExtraCosts,
    });
  }

  /**
   * Create a new extra cost with details
   * @param data - Extra cost creation data with nested details
   * @returns Created extra cost ID
   */
  @TryCatch
  async create(data: ICreateExtraCost): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      ExtraCostService.name,
    );

    const { details, ...headerData } = data;

    const result = await this.prismaService.$transaction(async (tx) => {
      const extraCost = await tx.tb_extra_cost.create({
        data: {
          name: headerData.name,
          good_received_note_id: headerData.good_received_note_id,
          allocate_extra_cost_type: headerData.allocate_extra_cost_type as any,
          description: headerData.description,
          note: headerData.note,
          info: headerData.info as any,
          created_by_id: this.userId,
        },
      });

      if (details && details.length > 0) {
        await tx.tb_extra_cost_detail.createMany({
          data: details.map((detail, index) => ({
            extra_cost_id: extraCost.id,
            extra_cost_type_id: detail.extra_cost_type_id,
            name: detail.name,
            description: detail.description,
            note: detail.note,
            amount: detail.amount,
            tax_profile_id: detail.tax_profile_id,
            tax_profile_name: detail.tax_profile_name,
            tax_rate: detail.tax_rate,
            tax_amount: detail.tax_amount,
            is_tax_adjustment: detail.is_tax_adjustment,
            info: detail.info as any,
            dimension: detail.dimension as any,
            sequence_no: index + 1,
            created_by_id: this.userId,
          })),
        });
      }

      return extraCost;
    });

    return Result.ok({ id: result.id });
  }

  /**
   * Update an existing extra cost with details (add/update/delete)
   * @param data - Extra cost update data with nested detail operations
   * @returns Updated extra cost ID
   */
  @TryCatch
  async update(data: IUpdateExtraCost): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      ExtraCostService.name,
    );

    const extraCost = await this.prismaService.tb_extra_cost.findFirst({
      where: {
        id: data.id,
        deleted_at: null,
      },
    });

    if (!extraCost) {
      return Result.error('Extra cost not found', ErrorCode.NOT_FOUND);
    }

    const { details, id, ...headerData } = data;

    const result = await this.prismaService.$transaction(async (tx) => {
      const updatedExtraCost = await tx.tb_extra_cost.update({
        where: {
          id: data.id,
        },
        data: {
          name: headerData.name,
          good_received_note_id: headerData.good_received_note_id,
          allocate_extra_cost_type: headerData.allocate_extra_cost_type as any,
          description: headerData.description,
          note: headerData.note,
          info: headerData.info as any,
          updated_by_id: this.userId,
          updated_at: new Date().toISOString(),
        },
      });

      if (details) {
        // Add new details
        if (details.add && details.add.length > 0) {
          // Get current max sequence_no
          const maxSeq = await tx.tb_extra_cost_detail.findFirst({
            where: { extra_cost_id: data.id, deleted_at: null },
            orderBy: { sequence_no: 'desc' },
            select: { sequence_no: true },
          });
          const startSeq = (maxSeq?.sequence_no ?? 0) + 1;

          await tx.tb_extra_cost_detail.createMany({
            data: details.add.map((detail, index) => ({
              extra_cost_id: data.id,
              extra_cost_type_id: detail.extra_cost_type_id,
              name: detail.name,
              description: detail.description,
              note: detail.note,
              amount: detail.amount,
              tax_profile_id: detail.tax_profile_id,
              tax_profile_name: detail.tax_profile_name,
              tax_rate: detail.tax_rate,
              tax_amount: detail.tax_amount,
              is_tax_adjustment: detail.is_tax_adjustment,
              info: detail.info as any,
              dimension: detail.dimension as any,
              sequence_no: startSeq + index,
              created_by_id: this.userId,
            })),
          });
        }

        // Update existing details
        if (details.update && details.update.length > 0) {
          for (const detail of details.update) {
            if (detail.id) {
              await tx.tb_extra_cost_detail.update({
                where: { id: detail.id },
                data: {
                  extra_cost_type_id: detail.extra_cost_type_id,
                  name: detail.name,
                  description: detail.description,
                  note: detail.note,
                  amount: detail.amount,
                  tax_profile_id: detail.tax_profile_id,
                  tax_profile_name: detail.tax_profile_name,
                  tax_rate: detail.tax_rate,
                  tax_amount: detail.tax_amount,
                  is_tax_adjustment: detail.is_tax_adjustment,
                  info: detail.info as any,
                  dimension: detail.dimension as any,
                  updated_by_id: this.userId,
                  updated_at: new Date().toISOString(),
                },
              });
            }
          }
        }

        // Soft delete details
        if (details.delete && details.delete.length > 0) {
          await tx.tb_extra_cost_detail.updateMany({
            where: {
              id: { in: details.delete },
              extra_cost_id: data.id,
            },
            data: {
              deleted_at: new Date().toISOString(),
              deleted_by_id: this.userId,
            },
          });
        }
      }

      return updatedExtraCost;
    });

    return Result.ok({ id: result.id });
  }

  /**
   * Soft delete an extra cost and all its details
   * @param id - Extra cost ID
   * @returns Deleted extra cost ID
   */
  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      ExtraCostService.name,
    );

    const extraCost = await this.prismaService.tb_extra_cost.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!extraCost) {
      return Result.error('Extra cost not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.$transaction(async (tx) => {
      // Soft delete all details
      await tx.tb_extra_cost_detail.updateMany({
        where: {
          extra_cost_id: id,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: this.userId,
        },
      });

      // Soft delete the header
      await tx.tb_extra_cost.update({
        where: { id },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: this.userId,
        },
      });
    });

    return Result.ok({ id });
  }
}
