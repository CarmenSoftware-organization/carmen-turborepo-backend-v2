import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import {
  PrismaClient_TENANT,
  enum_physical_count_status,
  enum_physical_count_period_status,
  enum_doc_status,
  Prisma,
} from '@repo/prisma-shared-schema-tenant';
import { TenantService } from '@/tenant/tenant.service';
import QueryParams from '@/libs/paginate.query';
import {
  IPhysicalCountCreate,
  IPhysicalCountSave,
  IPhysicalCountSubmit,
  IPhysicalCountDetailCommentCreate,
  IPhysicalCountDetailCommentUpdate,
} from './interface/physical-count.interface';
import { ClientProxy } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { Injectable, Inject } from '@nestjs/common';
import { format } from 'date-fns';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import {
  Result,
  ErrorCode,
  TryCatch,
} from '@/common';

@Injectable()
export class PhysicalCountService {
  private readonly logger: BackendLogger = new BackendLogger(
    PhysicalCountService.name,
  );

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
   * Find a physical count by ID
   * ค้นหาการตรวจนับสินค้ารายการเดียวตาม ID
   * @param id - Physical count ID / ID การตรวจนับ
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Physical count detail with items / รายละเอียดการตรวจนับสินค้าพร้อมรายการ
   */
  @TryCatch
  async findOne(
    id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const physicalCount = await prisma.tb_physical_count.findFirst({
      where: { id, deleted_at: null },
    });

    if (!physicalCount) {
      return Result.error('Physical Count not found', ErrorCode.NOT_FOUND);
    }

    const details = await prisma.tb_physical_count_detail.findMany({
      where: { physical_count_id: id, deleted_at: null },
      include: {
        tb_unit_inventory: {
          select: { id: true, name: true },
        },
      },
    });

    const responseData = {
      ...physicalCount,
      details: details,
    };

    return Result.ok(responseData);
  }

  /**
   * Find all physical counts with pagination
   * ค้นหาการตรวจนับสินค้าทั้งหมดพร้อมการแบ่งหน้า
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of physical counts / รายการการตรวจนับสินค้าแบบแบ่งหน้า
   */
  @TryCatch
  async findAll(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
    location_ids: string[] = [],
    period_id?: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate, location_ids, period_id },
      PhysicalCountService.name,
    );

    const defaultSearchFields = ['location_code', 'location_name'];

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

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const locationFilter = location_ids.length > 0
      ? { location_id: { in: location_ids } }
      : {};

    const periodFilter = period_id
      ? { physical_count_period_id: period_id }
      : {};

    const whereClause = {
      ...q.where(),
      ...locationFilter,
      ...periodFilter,
      deleted_at: null,
    };

    const physicalCountList = await prisma.tb_physical_count.findMany({
      where: whereClause,
      orderBy: q.orderBy(),
      skip: (q.page - 1) * q.perpage,
      ...(q.perpage >= 0 ? { take: q.perpage } : {}),
      select: {
        id: true,
        physical_count_period_id: true,
        location_id: true,
        location_code: true,
        location_name: true,
        status: true,
        product_counted: true,
        product_total: true,
        created_at: true,
        updated_at: true,
      },
    });

    const total = await prisma.tb_physical_count.count({
      where: whereClause,
    });

    return Result.ok({
      data: physicalCountList,
      paginate: {
        total,
        page: q.page,
        perpage: q.perpage,
        pages: total === 0 ? 1 : Math.ceil(total / q.perpage),
      },
    });
  }

  /**
   * Create a new physical count for a location
   * สร้างการตรวจนับสินค้าใหม่สำหรับสถานที่
   * @param data - Physical count creation data / ข้อมูลสร้างการตรวจนับสินค้า
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created physical count ID / ID การตรวจนับสินค้าที่สร้างแล้ว
   */
  @TryCatch
  async create(
    data: IPhysicalCountCreate,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const period = await prisma.tb_physical_count_period.findFirst({
      where: { id: data.period_id, deleted_at: null },
    });

    if (!period) {
      return Result.error('Physical Count Period not found', ErrorCode.NOT_FOUND);
    }

    if (period.status !== enum_physical_count_period_status.counting) {
      return Result.error(
        'Physical Count Period is not in counting status',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    const location = await prisma.tb_location.findFirst({
      where: { id: data.location_id, deleted_at: null },
    });

    if (!location) {
      return Result.error('Location not found', ErrorCode.NOT_FOUND);
    }

    const existingCount = await prisma.tb_physical_count.findFirst({
      where: {
        physical_count_period_id: data.period_id,
        location_id: data.location_id,
        deleted_at: null,
      },
    });

    if (existingCount) {
      return this.findOne(existingCount.id, user_id, tenant_id);
    }

    // Get products that have stock at this location (to know WHICH products to count)
    // on_hand_qty will be computed later during the review step
    const stockGrouped = await prisma.tb_inventory_transaction_detail.groupBy({
      by: ['product_id'],
      where: { location_id: data.location_id },
      _sum: { qty: true },
    });

    // Filter products with non-zero stock
    const productIdsWithStock = stockGrouped
      .filter((g) => g._sum.qty && !g._sum.qty.equals(0))
      .map((g) => g.product_id);

    // Get product details
    const products = productIdsWithStock.length > 0
      ? await prisma.tb_product.findMany({
        where: { id: { in: productIdsWithStock }, deleted_at: null },
        select: { id: true, name: true, local_name: true, code: true, sku: true, inventory_unit_id: true },
      })
      : [];

    const stockByProduct = products.map((p) => ({
      product_id: p.id,
      product_name: p.name,
      product_local_name: p.local_name,
      product_code: p.code,
      product_sku: p.sku,
      inventory_unit_id: p.inventory_unit_id,
    }));

    // Create physical count and details in transaction
    const result = await prisma.$transaction(async (tx) => {
      const physicalCount = await tx.tb_physical_count.create({
        data: {
          physical_count_period_id: data.period_id,
          location_id: data.location_id,
          location_code: location.code,
          location_name: location.name,
          description: data.description || null,
          status: enum_physical_count_status.in_progress,
          start_counting_at: new Date().toISOString(),
          start_counting_by_id: user_id,
          product_total: stockByProduct.length,
          product_counted: 0,
          created_by_id: user_id,
        },
      });

      // Create details for each product (on_hand_qty = 0, will be computed at review)
      if (stockByProduct.length > 0) {
        const detailsData = stockByProduct.map((item) => ({
          physical_count_id: physicalCount.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_local_name: item.product_local_name,
          product_code: item.product_code,
          product_sku: item.product_sku,
          inventory_unit_id: item.inventory_unit_id,
          on_hand_qty: new Prisma.Decimal(0),
          counted_qty: new Prisma.Decimal(0),
          diff_qty: new Prisma.Decimal(0),
          created_by_id: user_id,
        }));

        await tx.tb_physical_count_detail.createMany({
          data: detailsData,
        });
      }

      return physicalCount;
    });

    return this.findOne(result.id, user_id, tenant_id);
  }

  /**
   * Save physical count detail quantities
   * บันทึกจำนวนรายการรายละเอียดการตรวจนับสินค้า
   * @param data - Physical count save data with detail items / ข้อมูลบันทึกการตรวจนับพร้อมรายการรายละเอียด
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Saved physical count / การตรวจนับสินค้าที่บันทึกแล้ว
   */
  @TryCatch
  async save(
    data: IPhysicalCountSave,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'save', data, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const physicalCount = await prisma.tb_physical_count.findFirst({
      where: { id: data.id, deleted_at: null },
    });

    if (!physicalCount) {
      return Result.error('Physical Count not found', ErrorCode.NOT_FOUND);
    }

    if (physicalCount.status === enum_physical_count_status.completed) {
      return Result.error(
        'Physical Count is already completed',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const detail of data.details) {
        const existingDetail = await tx.tb_physical_count_detail.findFirst({
          where: { id: detail.id, physical_count_id: data.id, deleted_at: null },
        });

        if (!existingDetail) {
          continue;
        }

        const countedQty = new Prisma.Decimal(detail.counted_qty);
        const diffQty = countedQty.minus(existingDetail.on_hand_qty);

        await tx.tb_physical_count_detail.update({
          where: { id: detail.id },
          data: {
            counted_qty: countedQty,
            diff_qty: diffQty,
            updated_by_id: user_id,
            updated_at: new Date().toISOString(),
          },
        });
      }

      const allDetails = await tx.tb_physical_count_detail.findMany({
        where: { physical_count_id: data.id, deleted_at: null },
      });

      const totalCounted = allDetails.filter(
        (d) => d.counted_qty && !d.counted_qty.equals(0),
      ).length;

      await tx.tb_physical_count.update({
        where: { id: data.id },
        data: {
          product_counted: totalCounted,
          updated_by_id: user_id,
          updated_at: new Date().toISOString(),
        },
      });
    });

    return this.findOne(data.id, user_id, tenant_id);
  }

  /**
   * Review physical count items with actual quantities
   * ตรวจสอบรายการตรวจนับสินค้าพร้อมจำนวนจริง
   * @param id - Physical count ID / ID การตรวจนับ
   * @param data - Review items with actual quantities / รายการตรวจสอบพร้อมจำนวนจริง
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Updated physical count / การตรวจนับสินค้าที่อัปเดตแล้ว
   */
  @TryCatch
  async reviewItems(
    id: string,
    data: { items: Array<{ id: string; actual_qty: number }> },
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'reviewItems', id, data, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const physicalCount = await prisma.tb_physical_count.findFirst({
      where: { id, deleted_at: null },
    });

    if (!physicalCount) {
      return Result.error('Physical Count not found', ErrorCode.NOT_FOUND);
    }

    if (physicalCount.status === enum_physical_count_status.completed) {
      return Result.error(
        'Physical Count is already completed',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    const details = await prisma.tb_physical_count_detail.findMany({
      where: { physical_count_id: id, deleted_at: null },
    });

    // Build a map of actual_qty from items
    const actualQtyMap = new Map(
      (data.items || []).map((item) => [item.id, new Prisma.Decimal(item.actual_qty)]),
    );

    // Compute on_hand_qty from inventory_transaction_detail
    const onHandGrouped = await prisma.tb_inventory_transaction_detail.groupBy({
      by: ['product_id'],
      where: { location_id: physicalCount.location_id },
      _sum: { qty: true },
    });

    const onHandMap = new Map(
      onHandGrouped.map((item) => [item.product_id, item._sum.qty || new Prisma.Decimal(0)]),
    );

    // Update each detail with actual_qty (counted_qty), computed on_hand_qty, and diff_qty
    await prisma.$transaction(async (tx) => {
      for (const detail of details) {
        const onHandQty = onHandMap.get(detail.product_id) || new Prisma.Decimal(0);
        const countedQty = actualQtyMap.get(detail.id) || detail.counted_qty;
        const diffQty = countedQty.minus(onHandQty);

        await tx.tb_physical_count_detail.update({
          where: { id: detail.id },
          data: {
            counted_qty: countedQty,
            on_hand_qty: onHandQty,
            diff_qty: diffQty,
            updated_by_id: user_id,
            updated_at: new Date().toISOString(),
          },
        });
      }

      // Update product_counted
      const totalCounted = details.filter(
        (d) => actualQtyMap.has(d.id) || (d.counted_qty && !d.counted_qty.equals(0)),
      ).length;

      await tx.tb_physical_count.update({
        where: { id },
        data: {
          product_counted: totalCounted,
          updated_by_id: user_id,
          updated_at: new Date().toISOString(),
        },
      });
    });

    return this.findOne(id, user_id, tenant_id);
  }

  /**
   * Submit a physical count for approval
   * ส่งการตรวจนับสินค้าเพื่อขออนุมัติ
   * @param data - Physical count submit data / ข้อมูลส่งการตรวจนับ
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Submitted physical count / การตรวจนับสินค้าที่ส่งแล้ว
   */
  @TryCatch
  async submit(
    data: IPhysicalCountSubmit,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'submit', data, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const physicalCount = await prisma.tb_physical_count.findFirst({
      where: { id: data.id, deleted_at: null },
    });

    if (!physicalCount) {
      return Result.error('Physical Count not found', ErrorCode.NOT_FOUND);
    }

    if (physicalCount.status === enum_physical_count_status.completed) {
      return Result.error(
        'Physical Count is already completed',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    const period = await prisma.tb_physical_count_period.findFirst({
      where: { id: physicalCount.physical_count_period_id, deleted_at: null },
      include: {
        tb_period: {
          select: { start_at: true, end_at: true },
        },
      },
    });

    const details = await prisma.tb_physical_count_detail.findMany({
      where: { physical_count_id: data.id, deleted_at: null },
    });

    const uncountedDetails = details.filter(
      (d) => d.counted_qty === null || d.counted_qty.equals(0),
    );

    if (uncountedDetails.length > 0) {
      return Result.error(
        `${uncountedDetails.length} products have not been counted yet`,
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    const detailsWithVariance = details.filter(
      (d) => d.diff_qty && !d.diff_qty.equals(0),
    );

    const periodNote = period?.tb_period
      ? `Physical Count Adjustment - Period: ${format(period.tb_period.start_at, 'yyyy-MM-dd')} to ${format(period.tb_period.end_at, 'yyyy-MM-dd')}`
      : 'Physical Count Adjustment';

    await prisma.$transaction(async (tx) => {
      const positiveVariance = detailsWithVariance.filter(
        (d) => d.diff_qty.greaterThan(0),
      );
      const negativeVariance = detailsWithVariance.filter(
        (d) => d.diff_qty.lessThan(0),
      );

      if (positiveVariance.length > 0) {
        const siNo = await this.generateSINo(new Date().toISOString(), tenant_id, user_id);

        const stockIn = await tx.tb_stock_in.create({
          data: {
            si_no: siNo,
            description: periodNote,
            doc_status: enum_doc_status.completed,
            doc_version: 0,
            created_by_id: user_id,
          },
        });

        let sequenceNo = 1;
        const stockInDetails = positiveVariance.map((d) => ({
          stock_in_id: stockIn.id,
          sequence_no: sequenceNo++,
          product_id: d.product_id,
          product_name: d.product_name,
          location_id: physicalCount.location_id,
          location_code: physicalCount.location_code,
          location_name: physicalCount.location_name,
          qty: d.diff_qty,
          cost_per_unit: new Prisma.Decimal(0),
          total_cost: new Prisma.Decimal(0),
          note: `Physical Count Adjustment - Variance: +${d.diff_qty}`,
          created_by_id: user_id,
        }));

        await tx.tb_stock_in_detail.createMany({
          data: stockInDetails,
        });
      }

      if (negativeVariance.length > 0) {
        const soNo = await this.generateSONo(new Date().toISOString(), tenant_id, user_id);

        const stockOut = await tx.tb_stock_out.create({
          data: {
            so_no: soNo,
            description: periodNote,
            doc_status: enum_doc_status.completed,
            doc_version: 0,
            created_by_id: user_id,
          },
        });

        let sequenceNo = 1;
        const stockOutDetails = negativeVariance.map((d) => ({
          stock_out_id: stockOut.id,
          sequence_no: sequenceNo++,
          product_id: d.product_id,
          product_name: d.product_name,
          location_id: physicalCount.location_id,
          location_code: physicalCount.location_code,
          location_name: physicalCount.location_name,
          qty: d.diff_qty.abs(),
          cost_per_unit: new Prisma.Decimal(0),
          total_cost: new Prisma.Decimal(0),
          note: `Physical Count Adjustment - Variance: ${d.diff_qty}`,
          created_by_id: user_id,
        }));

        await tx.tb_stock_out_detail.createMany({
          data: stockOutDetails,
        });
      }

      await tx.tb_physical_count.update({
        where: { id: data.id },
        data: {
          status: enum_physical_count_status.completed,
          completed_at: new Date().toISOString(),
          completed_by_id: user_id,
          updated_by_id: user_id,
          updated_at: new Date().toISOString(),
        },
      });
    });

    return this.findOne(data.id, user_id, tenant_id);
  }

  /**
   * Soft delete a physical count
   * ลบการตรวจนับสินค้าแบบซอฟต์ดีลีท
   * @param id - Physical count ID / ID การตรวจนับ
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Deleted physical count ID / ID การตรวจนับที่ลบแล้ว
   */
  @TryCatch
  async delete(
    id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const physicalCount = await prisma.tb_physical_count.findFirst({
      where: { id, deleted_at: null },
    });

    if (!physicalCount) {
      return Result.error('Physical Count not found', ErrorCode.NOT_FOUND);
    }

    if (physicalCount.status === enum_physical_count_status.completed) {
      return Result.error(
        'Cannot delete completed Physical Count',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tb_physical_count_detail.updateMany({
        where: { physical_count_id: id },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: user_id,
        },
      });

      await tx.tb_physical_count.update({
        where: { id },
        data: {
          deleted_at: new Date().toISOString(),
          deleted_by_id: user_id,
        },
      });
    });

    return Result.ok({ id });
  }

  // ==================== Detail Comment CRUD ====================

  /**
   * Find comments for a physical count detail
   * ค้นหาความคิดเห็นสำหรับรายการรายละเอียดการตรวจนับ
   * @param physical_count_detail_id - Physical count detail ID / ID รายการรายละเอียดการตรวจนับ
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns List of comments / รายการความคิดเห็น
   */
  @TryCatch
  async findDetailComments(
    physical_count_detail_id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findDetailComments', physical_count_detail_id, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const comments = await prisma.tb_physical_count_detail_comment.findMany({
      where: { physical_count_detail_id, deleted_at: null },
      orderBy: { created_at: 'asc' },
    });

    return Result.ok(comments);
  }

  @TryCatch
  /**
   * Create a comment on a physical count detail
   * สร้างความคิดเห็นในรายการรายละเอียดการตรวจนับ
   * @param data - Comment creation data / ข้อมูลสร้างความคิดเห็น
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created comment / ความคิดเห็นที่สร้างแล้ว
   */
  async createDetailComment(
    data: IPhysicalCountDetailCommentCreate,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'createDetailComment', data, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const detail = await prisma.tb_physical_count_detail.findFirst({
      where: { id: data.physical_count_detail_id, deleted_at: null },
    });

    if (!detail) {
      return Result.error('Physical Count Detail not found', ErrorCode.NOT_FOUND);
    }

    const comment = await prisma.tb_physical_count_detail_comment.create({
      data: {
        physical_count_detail_id: data.physical_count_detail_id,
        type: 'user',
        user_id: user_id,
        message: data.message || null,
        attachments: data.attachments || [],
        created_by_id: user_id,
      },
    });

    return Result.ok(comment);
  }

  /**
   * Update a physical count detail comment
   * แก้ไขความคิดเห็นในรายการรายละเอียดการตรวจนับ
   * @param data - Comment update data / ข้อมูลแก้ไขความคิดเห็น
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Updated comment / ความคิดเห็นที่แก้ไขแล้ว
   */
  @TryCatch
  async updateDetailComment(
    data: IPhysicalCountDetailCommentUpdate,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'updateDetailComment', data, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const existingComment = await prisma.tb_physical_count_detail_comment.findFirst({
      where: { id: data.id, deleted_at: null },
    });

    if (!existingComment) {
      return Result.error('Comment not found', ErrorCode.NOT_FOUND);
    }

    const { id, ...updateData } = data;

    const comment = await prisma.tb_physical_count_detail_comment.update({
      where: { id: data.id },
      data: {
        ...updateData,
        updated_by_id: user_id,
        updated_at: new Date().toISOString(),
      },
    });

    return Result.ok(comment);
  }

  /**
   * Soft delete a physical count detail comment
   * ลบความคิดเห็นในรายการรายละเอียดการตรวจนับแบบซอฟต์ดีลีท
   * @param id - Comment ID / ID ความคิดเห็น
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Deleted comment ID / ID ความคิดเห็นที่ลบแล้ว
   */
  @TryCatch
  async deleteDetailComment(
    id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'deleteDetailComment', id, user_id, tenant_id },
      PhysicalCountService.name,
    );

    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const existingComment = await prisma.tb_physical_count_detail_comment.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existingComment) {
      return Result.error('Comment not found', ErrorCode.NOT_FOUND);
    }

    await prisma.tb_physical_count_detail_comment.update({
      where: { id },
      data: {
        deleted_at: new Date().toISOString(),
        deleted_by_id: user_id,
      },
    });

    return Result.ok({ id });
  }

  // ==================== Private Helper Methods ====================

  private async generateSINo(
    siDate: string,
    bu_code: string,
    user_id: string,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const res: Observable<any> = this.masterService.send(
      { cmd: 'running-code.get-pattern-by-type', service: 'running-codes' },
      { type: 'SI', user_id, bu_code },
    );
    const response = await firstValueFrom(res);

    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(`Failed to get running code pattern for SI (physical-count): ${JSON.stringify(response)}`);
    }

    const patterns = response.data;

    let datePattern: Record<string, unknown> | undefined;
    let runningPattern: Record<string, unknown> | undefined;
    patterns.forEach((pattern: Record<string, unknown>) => {
      if (pattern.type === 'date') {
        datePattern = pattern;
      } else if (pattern.type === 'running') {
        runningPattern = pattern;
      }
    });

    if (!datePattern || !runningPattern) {
      throw new Error(`Missing running code pattern config for SI (physical-count): datePattern=${!!datePattern}, runningPattern=${!!runningPattern}`);
    }

    const getDate = new Date(siDate);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const generateCodeRes: Observable<any> = this.masterService.send(
      { cmd: 'running-code.generate-code', service: 'running-codes' },
      {
        type: 'SI',
        issueDate: getDate,
        last_no: 0,
        user_id,
        bu_code: bu_code,
      },
    );
    const generateCodeResponse = await firstValueFrom(generateCodeRes);

    if (!generateCodeResponse?.data?.code) {
      throw new Error(`Failed to generate SI number (physical-count): ${JSON.stringify(generateCodeResponse)}`);
    }

    return generateCodeResponse.data.code;
  }

  private async generateSONo(
    soDate: string,
    bu_code: string,
    user_id: string,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const res: Observable<any> = this.masterService.send(
      { cmd: 'running-code.get-pattern-by-type', service: 'running-codes' },
      { type: 'SO', user_id, bu_code },
    );
    const response = await firstValueFrom(res);

    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(`Failed to get running code pattern for SO (physical-count): ${JSON.stringify(response)}`);
    }

    const patterns = response.data;

    let datePattern: Record<string, unknown> | undefined;
    let runningPattern: Record<string, unknown> | undefined;
    patterns.forEach((pattern: Record<string, unknown>) => {
      if (pattern.type === 'date') {
        datePattern = pattern;
      } else if (pattern.type === 'running') {
        runningPattern = pattern;
      }
    });

    if (!datePattern || !runningPattern) {
      throw new Error(`Missing running code pattern config for SO (physical-count): datePattern=${!!datePattern}, runningPattern=${!!runningPattern}`);
    }

    const getDate = new Date(soDate);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const generateCodeRes: Observable<any> = this.masterService.send(
      { cmd: 'running-code.generate-code', service: 'running-codes' },
      {
        type: 'SO',
        issueDate: getDate,
        last_no: 0,
        user_id,
        bu_code: bu_code,
      },
    );
    const generateCodeResponse = await firstValueFrom(generateCodeRes);

    if (!generateCodeResponse?.data?.code) {
      throw new Error(`Failed to generate SO number (physical-count): ${JSON.stringify(generateCodeResponse)}`);
    }

    return generateCodeResponse.data.code;
  }
}
