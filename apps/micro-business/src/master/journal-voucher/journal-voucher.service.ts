import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import {
  ICreateJournalVoucher,
  IUpdateJournalVoucher,
} from './interface/journal-voucher.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_USER_ID } from '@/common/constant';
import getPaginationParams from '@/common/helpers/pagination.params';
import { PrismaClient } from '@repo/prisma-shared-schema-tenant';
import {
  TryCatch,
  Result,
  ErrorCode,
  JournalVoucherDetailResponseSchema,
  JournalVoucherListItemResponseSchema,
} from '@/common';

@Injectable()
export class JournalVoucherService {
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
    JournalVoucherService.name,
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
  ) {}

  /**
   * Find a single journal voucher by ID with details
   * @param id - Journal voucher header ID
   * @returns Journal voucher with detail lines
   */
  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      JournalVoucherService.name,
    );

    const journalVoucher = await this.prismaService.tb_jv_header.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        tb_jv_detail: {
          where: {
            deleted_at: null,
          },
          orderBy: {
            sequence_no: 'asc',
          },
        },
      },
    });

    if (!journalVoucher) {
      return Result.error('Journal voucher not found', ErrorCode.NOT_FOUND);
    }

    const serializedJournalVoucher = JournalVoucherDetailResponseSchema.parse(journalVoucher);
    return Result.ok(serializedJournalVoucher);
  }

  /**
   * Find all journal vouchers with pagination
   * @param paginate - Pagination parameters
   * @returns Paginated list of journal vouchers
   */
  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      JournalVoucherService.name,
    );
    const defaultSearchFields = ['jv_no', 'description'];

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

    const journalVouchers = await this.prismaService.tb_jv_header.findMany({
      where: {
        ...q.where(),
        deleted_at: null,
      },
      orderBy: hasCustomSort ? customOrderBy : [{ jv_date: 'desc' }],
      ...pagination,
    });

    const total = await this.prismaService.tb_jv_header.count({
      where: {
        ...q.where(),
        deleted_at: null,
      },
    });

    const serializedJournalVouchers = journalVouchers.map((item) =>
      JournalVoucherListItemResponseSchema.parse(item),
    );

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: serializedJournalVouchers,
    });
  }

  /**
   * Create a new journal voucher with details in a transaction
   * @param data - Journal voucher creation data with details array
   * @returns Created journal voucher ID
   */
  @TryCatch
  async create(data: ICreateJournalVoucher): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      JournalVoucherService.name,
    );

    const { details, ...headerData } = data;

    const result = await this.prismaService.$transaction(async (tx) => {
      const header = await tx.tb_jv_header.create({
        data: {
          jv_type: headerData.jv_type,
          jv_no: headerData.jv_no,
          jv_date: headerData.jv_date,
          jv_status: headerData.jv_status as any,
          currency_id: headerData.currency_id,
          currency_name: headerData.currency_name,
          exchange_rate: headerData.exchange_rate,
          base_currency_id: headerData.base_currency_id,
          base_currency_name: headerData.base_currency_name,
          description: headerData.description,
          note: headerData.note,
          info: headerData.info as any,
          dimension: headerData.dimension as any,
          created_by_id: this.userId,
        },
      });

      if (details && details.length > 0) {
        await tx.tb_jv_detail.createMany({
          data: details.map((detail, index) => ({
            jv_header_id: header.id,
            account_code: detail.account_code,
            account_name: detail.account_name,
            currency_id: detail.currency_id,
            currency_name: detail.currency_name,
            exchange_rate: detail.exchange_rate,
            debit: detail.debit,
            credit: detail.credit,
            base_currency_id: detail.base_currency_id,
            base_currency_name: detail.base_currency_name,
            base_debit: detail.base_debit,
            base_credit: detail.base_credit,
            description: detail.description,
            note: detail.note,
            info: detail.info as any,
            dimension: detail.dimension as any,
            sequence_no: index + 1,
            created_by_id: this.userId,
          })),
        });
      }

      return header;
    });

    return Result.ok({ id: result.id });
  }

  /**
   * Update an existing journal voucher with detail operations (add/update/delete)
   * @param data - Journal voucher update data with detail operations
   * @returns Updated journal voucher ID
   */
  @TryCatch
  async update(data: IUpdateJournalVoucher): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      JournalVoucherService.name,
    );

    const existingHeader = await this.prismaService.tb_jv_header.findFirst({
      where: {
        id: data.id,
        deleted_at: null,
      },
    });

    if (!existingHeader) {
      return Result.error('Journal voucher not found', ErrorCode.NOT_FOUND);
    }

    const { details, id, ...headerData } = data;

    const result = await this.prismaService.$transaction(async (tx) => {
      const updatedHeader = await tx.tb_jv_header.update({
        where: { id },
        data: {
          jv_type: headerData.jv_type,
          jv_date: headerData.jv_date,
          jv_status: headerData.jv_status as any,
          currency_id: headerData.currency_id,
          currency_name: headerData.currency_name,
          exchange_rate: headerData.exchange_rate,
          base_currency_id: headerData.base_currency_id,
          base_currency_name: headerData.base_currency_name,
          description: headerData.description,
          note: headerData.note,
          info: headerData.info as any,
          dimension: headerData.dimension as any,
          updated_by_id: this.userId,
          updated_at: new Date().toISOString(),
        },
      });

      if (details) {
        // Add new detail lines
        if (details.add && details.add.length > 0) {
          // Get current max sequence_no
          const maxSeq = await tx.tb_jv_detail.aggregate({
            where: { jv_header_id: id, deleted_at: null },
            _max: { sequence_no: true },
          });
          const startSeq = (maxSeq._max.sequence_no ?? 0) + 1;

          await tx.tb_jv_detail.createMany({
            data: details.add.map((detail, index) => ({
              jv_header_id: id,
              account_code: detail.account_code,
              account_name: detail.account_name,
              currency_id: detail.currency_id,
              currency_name: detail.currency_name,
              exchange_rate: detail.exchange_rate,
              debit: detail.debit,
              credit: detail.credit,
              base_currency_id: detail.base_currency_id,
              base_currency_name: detail.base_currency_name,
              base_debit: detail.base_debit,
              base_credit: detail.base_credit,
              description: detail.description,
              note: detail.note,
              info: detail.info as any,
              dimension: detail.dimension as any,
              sequence_no: startSeq + index,
              created_by_id: this.userId,
            })),
          });
        }

        // Update existing detail lines
        if (details.update && details.update.length > 0) {
          for (const detail of details.update) {
            if (!detail.id) continue;
            await tx.tb_jv_detail.update({
              where: { id: detail.id },
              data: {
                account_code: detail.account_code,
                account_name: detail.account_name,
                currency_id: detail.currency_id,
                currency_name: detail.currency_name,
                exchange_rate: detail.exchange_rate,
                debit: detail.debit,
                credit: detail.credit,
                base_currency_id: detail.base_currency_id,
                base_currency_name: detail.base_currency_name,
                base_debit: detail.base_debit,
                base_credit: detail.base_credit,
                description: detail.description,
                note: detail.note,
                info: detail.info as any,
                dimension: detail.dimension as any,
                updated_by_id: this.userId,
                updated_at: new Date().toISOString(),
              },
            });
          }
        }

        // Soft delete detail lines
        if (details.delete && details.delete.length > 0) {
          await tx.tb_jv_detail.updateMany({
            where: {
              id: { in: details.delete },
              jv_header_id: id,
            },
            data: {
              deleted_at: new Date().toISOString(),
              deleted_by_id: this.userId,
            },
          });
        }
      }

      return updatedHeader;
    });

    return Result.ok({ id: result.id });
  }

  /**
   * Soft delete a journal voucher and all its details
   * @param id - Journal voucher header ID
   * @returns Deleted journal voucher ID
   */
  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      JournalVoucherService.name,
    );

    const journalVoucher = await this.prismaService.tb_jv_header.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!journalVoucher) {
      return Result.error('Journal voucher not found', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.$transaction(async (tx) => {
      // Soft delete all detail lines
      await tx.tb_jv_detail.updateMany({
        where: {
          jv_header_id: id,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: this.userId,
        },
      });

      // Soft delete the header
      await tx.tb_jv_header.update({
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
