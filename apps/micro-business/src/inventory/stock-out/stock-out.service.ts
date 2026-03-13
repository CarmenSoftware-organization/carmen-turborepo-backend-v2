import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT, enum_doc_status } from '@repo/prisma-shared-schema-tenant';
import { TenantService } from '@/tenant/tenant.service';
import QueryParams from '@/libs/paginate.query';
import { IStockOutCreate, IStockOutUpdate, IStockOutDetailCreate, IStockOutDetailUpdate } from './interface/stock-out.interface';
import { ClientProxy } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { Injectable, Inject } from '@nestjs/common';
import { format } from 'date-fns';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import {
  StockOutDetailResponseSchema,
  StockOutListItemResponseSchema,
  Result,
  ErrorCode,
  TryCatch,
} from '@/common';

@Injectable()
export class StockOutService {
  private readonly logger: BackendLogger = new BackendLogger(StockOutService.name);

  constructor(
    @Inject('PRISMA_SYSTEM')
    private readonly prismaSystem: typeof PrismaClient_SYSTEM,
    @Inject('PRISMA_TENANT')
    private readonly prismaTenant: typeof PrismaClient_TENANT,
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
    private readonly tenantService: TenantService,
  ) { }

  /**
   * Find a stock out by ID
   * ค้นหาใบเบิกสินค้าออกรายการเดียวตาม ID
   * @param id - Stock out ID / ID ใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Stock out detail with items / รายละเอียดใบเบิกสินค้าออกพร้อมรายการ
   */
  @TryCatch
  async findOne(id: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findOne', id, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: { id, deleted_at: null },
    });

    if (!stockOut) {
      return Result.error('Stock Out not found', ErrorCode.NOT_FOUND);
    }

    const stockOutDetail = await prisma.tb_stock_out_detail.findMany({
      where: { stock_out_id: id, deleted_at: null },
      orderBy: { sequence_no: 'asc' },
    });

    const responseData = {
      ...stockOut,
      stock_out_detail: stockOutDetail,
    };

    const serializedData = StockOutDetailResponseSchema.parse(responseData);
    return Result.ok(serializedData);
  }

  /**
   * Find all stock outs with pagination
   * ค้นหาใบเบิกสินค้าออกทั้งหมดพร้อมการแบ่งหน้า
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of stock outs / รายการใบเบิกสินค้าออกแบบแบ่งหน้า
   */
  @TryCatch
  async findAll(user_id: string, tenant_id: string, paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findAll', user_id, tenant_id, paginate }, StockOutService.name);

    const defaultSearchFields = ['so_no', 'description'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      paginate.filter,
      paginate.sort,
      paginate.advance,
    );

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOutList = await prisma.tb_stock_out.findMany({
      ...q.findMany(),
      where: {
        ...q.where(),
        deleted_at: null,
      },
      select: {
        id: true,
        so_no: true,
        description: true,
        doc_status: true,
        // workflow_name: true,
        // workflow_current_stage: true,
        created_at: true,
        updated_at: true,
      },
    });

    const total = await prisma.tb_stock_out.count({
      where: {
        ...q.where(),
        deleted_at: null,
      },
    });

    const serializedStockOutList = stockOutList.map((item) =>
      StockOutListItemResponseSchema.parse(item)
    );

    return Result.ok({
      data: serializedStockOutList,
      paginate: {
        total,
        page: q.page,
        perpage: q.perpage,
        pages: total === 0 ? 1 : Math.ceil(total / q.perpage),
      },
    });
  }

  /**
   * Create a new stock out with optional detail lines
   * สร้างใบเบิกสินค้าออกใหม่พร้อมรายการรายละเอียด (ไม่บังคับ)
   * @param data - Stock out creation data / ข้อมูลสร้างใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created stock out ID and number / ID และเลขที่ใบเบิกสินค้าออกที่สร้างแล้ว
   */
  @TryCatch
  async create(data: IStockOutCreate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'create', data, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    // Validate workflow if provided
    // if (data.workflow_id) {
    //   const workflow = await prisma.tb_workflow.findFirst({
    //     where: { id: data.workflow_id },
    //   });
    //   if (!workflow) {
    //     return Result.error('Workflow not found', ErrorCode.NOT_FOUND);
    //   }
    // }

    // Validate stock_out_detail items
    if (data.stock_out_detail?.add) {
      const productNotFound: string[] = [];

      await Promise.all(
        data.stock_out_detail.add.map(async (item) => {
          if (item.product_id) {
            const product = await prisma.tb_product.findFirst({
              where: { id: item.product_id },
            });
            if (!product) {
              productNotFound.push(item.product_id);
            } else {
              item.product_name = product.name;
              item.product_local_name = product.local_name;
            }
          }
        }),
      );

      if (productNotFound.length > 0) {
        return Result.error(`Product not found: ${productNotFound.join(', ')}`, ErrorCode.NOT_FOUND);
      }
    }

    const tx = await prisma.$transaction(async (prisma) => {
      const stockOutObject = { ...data };
      delete stockOutObject.stock_out_detail;

      const createStockOut = await prisma.tb_stock_out.create({
        data: {
          ...stockOutObject,
          created_by_id: user_id,
          so_no: await this.generateSONo(new Date().toISOString(), tenant_id, user_id),
          doc_version: 0,
          doc_status: enum_doc_status.draft,
        },
      });

      if (data.stock_out_detail?.add && data.stock_out_detail.add.length > 0) {
        let sequenceNo = 1;
        const stockOutDetailObj = data.stock_out_detail.add.map((item) => ({
          stock_out_id: createStockOut.id,
          created_by_id: user_id,
          sequence_no: sequenceNo++,
          product_id: item.product_id || '',
          product_name: item.product_name || null,
          product_local_name: item.product_local_name || null,
          description: item.description || null,
          qty: item.qty || 0,
          note: item.note || null,
          info: item.info || null,
          dimension: item.dimension || null,
        }));

        await prisma.tb_stock_out_detail.createMany({
          data: stockOutDetailObj,
        });
      }

      return { id: createStockOut.id, so_no: createStockOut.so_no };
    });

    return Result.ok(tx);
  }

  /**
   * Update a stock out
   * แก้ไขใบเบิกสินค้าออก
   * @param data - Stock out update data / ข้อมูลแก้ไขใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Updated stock out / ใบเบิกสินค้าออกที่แก้ไขแล้ว
   */
  @TryCatch
  async update(data: IStockOutUpdate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'update', data, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: { id: data.id, deleted_at: null },
    });

    if (!stockOut) {
      return Result.error('Stock Out not found', ErrorCode.NOT_FOUND);
    }

    // Validate workflow if provided
    // if (data.workflow_id) {
    //   const workflow = await prisma.tb_workflow.findFirst({
    //     where: { id: data.workflow_id },
    //   });
    //   if (!workflow) {
    //     return Result.error('Workflow not found', ErrorCode.NOT_FOUND);
    //   }
    // }

    // Validate detail items
    if (data.stock_out_detail) {
      if (data.stock_out_detail.add) {
        const productNotFound: string[] = [];

        await Promise.all(
          data.stock_out_detail.add.map(async (item) => {
            if (item.product_id) {
              const product = await prisma.tb_product.findFirst({
                where: { id: item.product_id },
              });
              if (!product) {
                productNotFound.push(item.product_id);
              } else {
                item.product_name = product.name;
                item.product_local_name = product.local_name;
              }
            }
          }),
        );

        if (productNotFound.length > 0) {
          return Result.error(`Product not found: ${productNotFound.join(', ')}`, ErrorCode.NOT_FOUND);
        }
      }

      if (data.stock_out_detail.update) {
        const detailNotFound: string[] = [];

        await Promise.all(
          data.stock_out_detail.update.map(async (item) => {
            const detail = await prisma.tb_stock_out_detail.findFirst({
              where: { id: item.id, deleted_at: null },
            });
            if (!detail) {
              detailNotFound.push(item.id);
            }
          }),
        );

        if (detailNotFound.length > 0) {
          return Result.error(`Stock Out Detail not found: ${detailNotFound.join(', ')}`, ErrorCode.NOT_FOUND);
        }
      }

      if (data.stock_out_detail.remove) {
        const detailNotFound: string[] = [];

        await Promise.all(
          data.stock_out_detail.remove.map(async (item) => {
            const detail = await prisma.tb_stock_out_detail.findFirst({
              where: { id: item.id, deleted_at: null },
            });
            if (!detail) {
              detailNotFound.push(item.id);
            }
          }),
        );

        if (detailNotFound.length > 0) {
          return Result.error(`Stock Out Detail not found: ${detailNotFound.join(', ')}`, ErrorCode.NOT_FOUND);
        }
      }
    }

    const tx = await prisma.$transaction(async (prisma) => {
      const { stock_out_detail: _, id: __, ...stockOutUpdateData } = data;

      if (Object.keys(stockOutUpdateData).length > 0) {
        const updatePayload: Record<string, unknown> = {
          ...stockOutUpdateData,
          updated_by_id: user_id,
          updated_at: new Date(),
        };
        if (stockOutUpdateData.doc_status) {
          updatePayload.doc_status = stockOutUpdateData.doc_status as enum_doc_status;
        }
        await prisma.tb_stock_out.update({
          where: { id: data.id },
          data: updatePayload,
        });
      }

      if (data.stock_out_detail) {
        if (data.stock_out_detail.add && data.stock_out_detail.add.length > 0) {
          const maxSequence = await prisma.tb_stock_out_detail.aggregate({
            where: { stock_out_id: data.id, deleted_at: null },
            _max: { sequence_no: true },
          });
          let sequenceNo = (maxSequence._max.sequence_no || 0) + 1;

          const detailCreateObj = data.stock_out_detail.add.map((item) => ({
            stock_out_id: data.id,
            created_by_id: user_id,
            sequence_no: sequenceNo++,
            product_id: item.product_id || '',
            product_name: item.product_name || null,
            product_local_name: item.product_local_name || null,
            description: item.description || null,
            qty: item.qty || 0,
            note: item.note || null,
            info: item.info || null,
            dimension: item.dimension || null,
          }));

          await prisma.tb_stock_out_detail.createMany({
            data: detailCreateObj,
          });
        }

        if (data.stock_out_detail.update && data.stock_out_detail.update.length > 0) {
          await Promise.all(
            data.stock_out_detail.update.map(async (item) => {
              const { id, ...updateData } = item;
              await prisma.tb_stock_out_detail.update({
                where: { id },
                data: {
                  ...updateData,
                  updated_by_id: user_id,
                  updated_at: new Date(),
                },
              });
            }),
          );
        }

        if (data.stock_out_detail.remove && data.stock_out_detail.remove.length > 0) {
          const detailIds = data.stock_out_detail.remove.map((item) => item.id);
          await prisma.tb_stock_out_detail.updateMany({
            where: { id: { in: detailIds } },
            data: {
              deleted_at: new Date(),
              deleted_by_id: user_id,
            },
          });
        }
      }

      return { id: data.id };
    });

    return Result.ok(tx);
  }

  /**
   * Soft delete a stock out and its details
   * ลบใบเบิกสินค้าออกและรายการรายละเอียดแบบซอฟต์ดีลีท
   * @param id - Stock out ID / ID ใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Deleted stock out / ใบเบิกสินค้าออกที่ลบแล้ว
   */
  @TryCatch
  async delete(id: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'delete', id, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: { id, deleted_at: null },
    });

    if (!stockOut) {
      return Result.error('Stock Out not found', ErrorCode.NOT_FOUND);
    }

    await prisma.$transaction(async (prisma) => {
      await prisma.tb_stock_out_detail.updateMany({
        where: { stock_out_id: id },
        data: {
          deleted_at: new Date(),
          deleted_by_id: user_id,
        },
      });

      await prisma.tb_stock_out_comment.updateMany({
        where: { stock_out_id: id },
        data: {
          deleted_at: new Date(),
          deleted_by_id: user_id,
        },
      });

      await prisma.tb_stock_out.update({
        where: { id },
        data: {
          deleted_at: new Date(),
          deleted_by_id: user_id,
        },
      });
    });

    return Result.ok({ id });
  }

  /**
   * Find the latest stock out by document number pattern
   * ค้นหาใบเบิกสินค้าออกล่าสุดตามรูปแบบเลขที่เอกสาร
   * @param pattern - Document number pattern / รูปแบบเลขที่เอกสาร
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param user_id - User ID / ID ผู้ใช้
   * @returns Latest stock out matching the pattern / ใบเบิกสินค้าออกล่าสุดที่ตรงกับรูปแบบ
   */
  async findLatestSOByPattern(pattern: string, tenant_id: string, user_id: string): Promise<any> {
    this.logger.debug({ function: 'findLatestSOByPattern', pattern, tenant_id, user_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: {
        so_no: { contains: pattern },
      },
      orderBy: { created_at: 'desc' },
    });

    return stockOut;
  }

  /**
   * Generate stock out document number
   * สร้างเลขที่เอกสารใบเบิกสินค้าออก
   * @param soDate - Stock out date / วันที่เบิกสินค้าออก
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param user_id - User ID / ID ผู้ใช้
   * @returns Generated document number / เลขที่เอกสารที่สร้างขึ้น
   */
  private async generateSONo(soDate: string, tenant_id: string, user_id: string): Promise<string> {
    this.logger.debug({ function: 'generateSONo', soDate, tenant_id, user_id }, StockOutService.name);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const res: Observable<any> = this.masterService.send(
      { cmd: 'running-code.get-pattern-by-type', service: 'running-codes' },
      { type: 'SO', user_id, tenant_id },
    );
    const response = await firstValueFrom(res);
    const patterns = response.data;

    let datePattern;
    let runningPattern;
    patterns.forEach((pattern) => {
      if (pattern.type === 'date') {
        datePattern = pattern;
      } else if (pattern.type === 'running') {
        runningPattern = pattern;
      }
    });

    const getDate = new Date(soDate);
    const datePatternValue = format(getDate, datePattern.pattern);
    const latestSO = await this.findLatestSOByPattern(datePatternValue, tenant_id, user_id);
    const latestSONumber = latestSO
      ? Number(latestSO.so_no.slice(-Number(runningPattern.pattern)))
      : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const generateCodeRes: Observable<any> = this.masterService.send(
      { cmd: 'running-code.generate-code', service: 'running-codes' },
      {
        type: 'SO',
        issueDate: getDate,
        last_no: latestSONumber,
        user_id,
        tenant_id,
      },
    );
    const generateCodeResponse = await firstValueFrom(generateCodeRes);
    const soNo = generateCodeResponse.data.code;

    return soNo;
  }

  // ==================== Stock Out Detail CRUD ====================

  /**
   * Find a stock out detail by ID
   * ค้นหารายการรายละเอียดใบเบิกสินค้าออกตาม ID
   * @param detailId - Stock out detail ID / ID รายการรายละเอียดใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Stock out detail / รายการรายละเอียดใบเบิกสินค้าออก
   */
  @TryCatch
  async findDetailById(detailId: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findDetailById', detailId, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const detail = await prisma.tb_stock_out_detail.findFirst({
      where: { id: detailId, deleted_at: null },
      include: {
        tb_stock_out: {
          select: { id: true, so_no: true, doc_status: true },
        },
        tb_product: {
          select: { id: true, name: true, local_name: true },
        },
      },
    });

    if (!detail) {
      return Result.error('Stock Out Detail not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(detail);
  }

  /**
   * Find all details by stock out ID
   * ค้นหารายการรายละเอียดทั้งหมดตาม ID ใบเบิกสินค้าออก
   * @param stockOutId - Stock out ID / ID ใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns List of stock out details / รายการรายละเอียดใบเบิกสินค้าออก
   */
  @TryCatch
  async findDetailsByStockOutId(stockOutId: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findDetailsByStockOutId', stockOutId, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: { id: stockOutId, deleted_at: null },
    });

    if (!stockOut) {
      return Result.error('Stock Out not found', ErrorCode.NOT_FOUND);
    }

    const details = await prisma.tb_stock_out_detail.findMany({
      where: { stock_out_id: stockOutId, deleted_at: null },
      include: {
        tb_product: {
          select: { id: true, name: true, local_name: true },
        },
      },
      orderBy: { sequence_no: 'asc' },
    });

    return Result.ok(details);
  }

  /**
   * Create a stock out detail line
   * สร้างรายการรายละเอียดใบเบิกสินค้าออก
   * @param stockOutId - Stock out ID / ID ใบเบิกสินค้าออก
   * @param data - Detail creation data / ข้อมูลสร้างรายการรายละเอียด
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created detail / รายการรายละเอียดที่สร้างแล้ว
   */
  @TryCatch
  async createDetail(
    stockOutId: string,
    data: IStockOutDetailCreate,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createDetail', stockOutId, data, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: { id: stockOutId, deleted_at: null },
    });

    if (!stockOut) {
      return Result.error('Stock Out not found', ErrorCode.NOT_FOUND);
    }

    if (stockOut.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot add detail to non-draft Stock Out', ErrorCode.INVALID_ARGUMENT);
    }

    if (data.product_id) {
      const product = await prisma.tb_product.findFirst({
        where: { id: data.product_id },
      });
      if (!product) {
        return Result.error('Product not found', ErrorCode.NOT_FOUND);
      }
      data.product_name = product.name;
      data.product_local_name = product.local_name;
    }


    const maxSequence = await prisma.tb_stock_out_detail.aggregate({
      where: { stock_out_id: stockOutId, deleted_at: null },
      _max: { sequence_no: true },
    });
    const nextSequence = (maxSequence._max.sequence_no || 0) + 1;

    const detail = await prisma.tb_stock_out_detail.create({
      data: {
        stock_out_id: stockOutId,
        sequence_no: nextSequence,
        created_by_id: user_id,
        product_id: data.product_id || '',
        product_name: data.product_name || null,
        product_local_name: data.product_local_name || null,
        description: data.description || null,
        qty: data.qty || 0,
        note: data.note || null,
        info: data.info || null,
        dimension: data.dimension || null,
      },
    });

    return Result.ok(detail);
  }

  /**
   * Update a stock out detail line
   * แก้ไขรายการรายละเอียดใบเบิกสินค้าออก
   * @param detailId - Stock out detail ID / ID รายการรายละเอียดใบเบิกสินค้าออก
   * @param data - Detail update data / ข้อมูลแก้ไขรายการรายละเอียด
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Updated detail / รายการรายละเอียดที่แก้ไขแล้ว
   */
  @TryCatch
  async updateDetail(
    detailId: string,
    data: IStockOutDetailUpdate,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'updateDetail', detailId, data, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const existingDetail = await prisma.tb_stock_out_detail.findFirst({
      where: { id: detailId, deleted_at: null },
      include: { tb_stock_out: true },
    });

    if (!existingDetail) {
      return Result.error('Stock Out Detail not found', ErrorCode.NOT_FOUND);
    }

    if (existingDetail.tb_stock_out?.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot update detail of non-draft Stock Out', ErrorCode.INVALID_ARGUMENT);
    }

    const { id, ...updateData } = data;

    const updatedDetail = await prisma.tb_stock_out_detail.update({
      where: { id: detailId },
      data: {
        ...updateData,
        updated_by_id: user_id,
        updated_at: new Date(),
      },
    });

    return Result.ok(updatedDetail);
  }

  /**
   * Soft delete a stock out detail line
   * ลบรายการรายละเอียดใบเบิกสินค้าออกแบบซอฟต์ดีลีท
   * @param detailId - Stock out detail ID / ID รายการรายละเอียดใบเบิกสินค้าออก
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Deleted detail / รายการรายละเอียดที่ลบแล้ว
   */
  @TryCatch
  async deleteDetail(detailId: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'deleteDetail', detailId, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const existingDetail = await prisma.tb_stock_out_detail.findFirst({
      where: { id: detailId, deleted_at: null },
      include: { tb_stock_out: true },
    });

    if (!existingDetail) {
      return Result.error('Stock Out Detail not found', ErrorCode.NOT_FOUND);
    }

    if (existingDetail.tb_stock_out?.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot delete detail of non-draft Stock Out', ErrorCode.INVALID_ARGUMENT);
    }

    await prisma.tb_stock_out_detail.update({
      where: { id: detailId },
      data: {
        deleted_at: new Date(),
        deleted_by_id: user_id,
      },
    });

    return Result.ok({ id: detailId });
  }

  // ==================== Standalone Stock Out Detail API ====================

  /**
   * Find all stock out details with pagination (standalone API)
   * ค้นหารายการรายละเอียดใบเบิกสินค้าออกทั้งหมดพร้อมการแบ่งหน้า (API แบบอิสระ)
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of stock out details / รายการรายละเอียดใบเบิกสินค้าออกแบบแบ่งหน้า
   */
  @TryCatch
  async findAllDetails(user_id: string, tenant_id: string, paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findAllDetails', user_id, tenant_id, paginate }, StockOutService.name);

    const defaultSearchFields = ['product_name', 'product_local_name', 'description'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      paginate.filter,
      paginate.sort,
      paginate.advance,
    );

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const detailList = await prisma.tb_stock_out_detail.findMany({
      ...q.findMany(),
      where: {
        ...q.where(),
        deleted_at: null,
      },
      select: {
        id: true,
        stock_out_id: true,
        sequence_no: true,
        product_id: true,
        product_name: true,
        product_local_name: true,
        description: true,
        qty: true,
        note: true,
        info: true,
        dimension: true,
        created_at: true,
        updated_at: true,
        tb_stock_out: {
          select: {
            id: true,
            so_no: true,
            doc_status: true,
          },
        },
      },
    });

    const total = await prisma.tb_stock_out_detail.count({
      where: {
        ...q.where(),
        deleted_at: null,
      },
    });

    return Result.ok({
      data: detailList,
      paginate: {
        total,
        page: q.page,
        perpage: q.perpage,
        pages: total === 0 ? 1 : Math.ceil(total / q.perpage),
      },
    });
  }

  /**
   * Create a standalone stock out detail (requires stock_out_id in data)
   * สร้างรายการรายละเอียดใบเบิกสินค้าออกแบบอิสระ (ต้องระบุ stock_out_id ในข้อมูล)
   * @param data - Detail creation data with stock_out_id / ข้อมูลสร้างรายการรายละเอียดพร้อม stock_out_id
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created detail / รายการรายละเอียดที่สร้างแล้ว
   */
  @TryCatch
  async createStandaloneDetail(
    data: IStockOutDetailCreate & { stock_out_id: string },
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createStandaloneDetail', data, user_id, tenant_id }, StockOutService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const stockOut = await prisma.tb_stock_out.findFirst({
      where: { id: data.stock_out_id, deleted_at: null },
    });

    if (!stockOut) {
      return Result.error('Stock Out not found', ErrorCode.NOT_FOUND);
    }

    if (stockOut.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot add detail to non-draft Stock Out', ErrorCode.INVALID_ARGUMENT);
    }

    if (data.product_id) {
      const product = await prisma.tb_product.findFirst({
        where: { id: data.product_id },
      });
      if (!product) {
        return Result.error('Product not found', ErrorCode.NOT_FOUND);
      }
      data.product_name = product.name;
      data.product_local_name = product.local_name;
    }


    const maxSequence = await prisma.tb_stock_out_detail.aggregate({
      where: { stock_out_id: data.stock_out_id, deleted_at: null },
      _max: { sequence_no: true },
    });
    const nextSequence = (maxSequence._max.sequence_no || 0) + 1;

    const detail = await prisma.tb_stock_out_detail.create({
      data: {
        stock_out_id: data.stock_out_id,
        sequence_no: nextSequence,
        created_by_id: user_id,
        product_id: data.product_id || '',
        product_name: data.product_name || null,
        product_local_name: data.product_local_name || null,
        description: data.description || null,
        qty: data.qty || 0,
        note: data.note || null,
        info: data.info || null,
        dimension: data.dimension || null,
      },
    });

    return Result.ok(detail);
  }
}
