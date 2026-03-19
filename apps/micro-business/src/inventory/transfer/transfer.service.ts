import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT, enum_doc_status } from '@repo/prisma-shared-schema-tenant';
import { TenantService } from '@/tenant/tenant.service';
import QueryParams from '@/libs/paginate.query';
import { ITransferCreate, ITransferUpdate, ITransferDetailCreate, ITransferDetailUpdate } from './interface/transfer.interface';
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
import {
  TransferDetailResponseSchema,
  TransferListItemResponseSchema,
} from './dto/transfer.serializer';

@Injectable()
export class TransferService {
  private readonly logger: BackendLogger = new BackendLogger(TransferService.name);

  constructor(
    @Inject('PRISMA_SYSTEM')
    private readonly prismaSystem: typeof PrismaClient_SYSTEM,
    @Inject('PRISMA_TENANT')
    private readonly prismaTenant: typeof PrismaClient_TENANT,
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
    private readonly tenantService: TenantService,
  ) {}

  /**
   * Generate transfer document number using running code service
   * สร้างเลขที่เอกสารโอนย้ายโดยใช้บริการรหัสลำดับ
   * @param trDate - Transfer date / วันที่โอนย้าย
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param user_id - User ID / ID ผู้ใช้
   * @returns Generated document number / เลขที่เอกสารที่สร้างขึ้น
   */
  private async generateTRNo(trDate: string, tenant_id: string, user_id: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const res: Observable<any> = this.masterService.send(
      { cmd: 'running-code.get-pattern-by-type', service: 'running-codes' },
      { type: 'TR', user_id, bu_code: tenant_id },
    );
    const response = await firstValueFrom(res);

    if (!response?.data || !Array.isArray(response.data)) {
      throw new Error(`Failed to get running code pattern for transfer_header: ${JSON.stringify(response)}`);
    }

    const patterns = response.data;

    let datePattern: { pattern: string; type: string } | undefined;
    let runningPattern: { pattern: string; type: string } | undefined;
    patterns.forEach((pattern: { pattern: string; type: string }) => {
      if (pattern.type === 'date') {
        datePattern = pattern;
      } else if (pattern.type === 'running') {
        runningPattern = pattern;
      }
    });

    if (!datePattern || !runningPattern) {
      throw new Error(`Missing running code pattern config for transfer_header: datePattern=${!!datePattern}, runningPattern=${!!runningPattern}`);
    }

    const getDate = new Date(trDate);
    const datePatternValue = format(getDate, datePattern.pattern);
    const latestTR = await this.findLatestTRByPattern(datePatternValue, tenant_id, user_id);
    const latestTRNumber = latestTR
      ? Number(latestTR.tr_no.slice(-Number(runningPattern.pattern)))
      : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
    const generateCodeRes: Observable<any> = this.masterService.send(
      { cmd: 'running-code.generate-code', service: 'running-codes' },
      {
        type: 'TR',
        issueDate: getDate,
        last_no: latestTRNumber,
        user_id,
        bu_code: tenant_id,
      },
    );
    const generateCodeResponse = await firstValueFrom(generateCodeRes);

    if (!generateCodeResponse?.data?.code) {
      throw new Error(`Failed to generate TR number: ${JSON.stringify(generateCodeResponse)}`);
    }

    return generateCodeResponse.data.code;
  }

  /**
   * Find latest transfer by date pattern for running number calculation
   * ค้นหาใบโอนย้ายล่าสุดตามรูปแบบวันที่เพื่อคำนวณเลขลำดับ
   * @param datePattern - Date pattern to match / รูปแบบวันที่ที่จะจับคู่
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param user_id - User ID / ID ผู้ใช้
   * @returns Latest transfer or null / ใบโอนย้ายล่าสุดหรือ null
   */
  private async findLatestTRByPattern(datePattern: string, tenant_id: string, user_id: string) {
    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return null;

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    return prisma.tb_transfer.findFirst({
      where: {
        tr_no: { contains: datePattern },
        deleted_at: null,
      },
      orderBy: { tr_no: 'desc' },
    });
  }

  /**
   * Find a transfer by ID
   * ค้นหาการโอนย้ายรายการเดียวตาม ID
   * @param id - Transfer ID / ID การโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Transfer detail with items / รายละเอียดการโอนย้ายพร้อมรายการ
   */
  @TryCatch
  async findOne(id: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findOne', id, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const transfer = await prisma.tb_transfer.findFirst({
      where: { id, deleted_at: null },
    });

    if (!transfer) {
      return Result.error('Transfer not found', ErrorCode.NOT_FOUND);
    }

    const transferDetail = await prisma.tb_transfer_detail.findMany({
      where: { transfer_id: id, deleted_at: null },
      orderBy: { sequence_no: 'asc' },
    });

    const responseData = {
      ...transfer,
      tb_transfer_detail: transferDetail,
    };

    const serializedData = TransferDetailResponseSchema.parse(responseData);
    return Result.ok(serializedData);
  }

  /**
   * Find all transfers with pagination
   * ค้นหาการโอนย้ายทั้งหมดพร้อมการแบ่งหน้า
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of transfers / รายการการโอนย้ายแบบแบ่งหน้า
   */
  @TryCatch
  async findAll(user_id: string, tenant_id: string, paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findAll', user_id, tenant_id, paginate }, TransferService.name);

    const defaultSearchFields = ['tr_no', 'description'];

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

    const transferList = await prisma.tb_transfer.findMany({
      ...q.findMany(),
      where: {
        ...q.where(),
        deleted_at: null,
      },
      select: {
        id: true,
        tr_no: true,
        tr_date: true,
        description: true,
        doc_status: true,
        from_location_id: true,
        from_location_code: true,
        from_location_name: true,
        to_location_id: true,
        to_location_code: true,
        to_location_name: true,
        // workflow_name: true,
        // workflow_current_stage: true,
        // last_action: true,
        // last_action_at_date: true,
        // last_action_by_name: true,
        note: true,
        created_at: true,
        created_by_id: true,
        updated_at: true,
      },
    });

    const total = await prisma.tb_transfer.count({
      where: {
        ...q.where(),
        deleted_at: null,
      },
    });

    const serializedTransferList = transferList.map((item) =>
      TransferListItemResponseSchema.parse(item)
    );

    return Result.ok({
      data: serializedTransferList,
      paginate: {
        total,
        page: q.page,
        perpage: q.perpage,
        pages: total === 0 ? 1 : Math.ceil(total / q.perpage),
      },
    });
  }

  /**
   * Create a new transfer with optional detail lines
   * สร้างการโอนย้ายใหม่พร้อมรายการรายละเอียด (ไม่บังคับ)
   * @param data - Transfer creation data / ข้อมูลสร้างการโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created transfer ID and number / ID และเลขที่การโอนย้ายที่สร้างแล้ว
   */
  @TryCatch
  async create(data: ITransferCreate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'create', data, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    // Validate from_location if provided
    if (data.from_location_id) {
      const fromLocation = await prisma.tb_location.findFirst({
        where: { id: data.from_location_id },
      });
      if (!fromLocation) {
        return Result.error('From location not found', ErrorCode.NOT_FOUND);
      }
      data.from_location_code = fromLocation.code;
      data.from_location_name = fromLocation.name;
    }

    // Validate to_location if provided
    if (data.to_location_id) {
      const toLocation = await prisma.tb_location.findFirst({
        where: { id: data.to_location_id },
      });
      if (!toLocation) {
        return Result.error('To location not found', ErrorCode.NOT_FOUND);
      }
      data.to_location_code = toLocation.code;
      data.to_location_name = toLocation.name;
    }

    // Validate details if provided
    if (data.details && data.details.length > 0) {
      const productNotFound: string[] = [];

      await Promise.all(
        data.details.map(async (item) => {
          if (item.product_id) {
            const product = await prisma.tb_product.findFirst({
              where: { id: item.product_id },
            });
            if (!product) {
              productNotFound.push(item.product_id);
            } else {
              item.product_name = product.name;
              item.product_code = product.code;
              item.product_sku = product.code;
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
      const createTransfer = await prisma.tb_transfer.create({
        data: {
          tr_no: await this.generateTRNo(new Date().toISOString(), tenant_id, user_id),
          tr_date: data.tr_date ? new Date(data.tr_date).toISOString() : new Date().toISOString(),
          description: data.description || null,
          doc_status: enum_doc_status.draft,
          from_location_id: data.from_location_id || null,
          from_location_code: data.from_location_code || null,
          from_location_name: data.from_location_name || null,
          to_location_id: data.to_location_id || null,
          to_location_code: data.to_location_code || null,
          to_location_name: data.to_location_name || null,
          // workflow_id: data.workflow_id || null,
          // workflow_name: data.workflow_name || null,
          note: data.note || null,
          info: data.info || {},
          dimension: data.dimension || [],
          created_by_id: user_id,
          doc_version: 0,
        },
      });

      if (data.details && data.details.length > 0) {
        let sequenceNo = 1;
        const transferDetailObj = data.details.map((item) => ({
          transfer_id: createTransfer.id,
          created_by_id: user_id,
          sequence_no: sequenceNo++,
          product_id: item.product_id,
          product_name: item.product_name || null,
          product_local_name: item.product_local_name || null,
          description: item.description || null,
          qty: item.qty || 0,
          cost_per_unit: item.cost_per_unit || 0,
          total_cost: item.total_cost || 0,
          note: item.note || null,
          info: item.info || {},
          dimension: item.dimension || [],
        }));

        await prisma.tb_transfer_detail.createMany({
          data: transferDetailObj,
        });
      }

      return { id: createTransfer.id, tr_no: createTransfer.tr_no };
    });

    return Result.ok(tx);
  }

  /**
   * Update a transfer
   * แก้ไขการโอนย้าย
   * @param data - Transfer update data / ข้อมูลแก้ไขการโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Updated transfer / การโอนย้ายที่แก้ไขแล้ว
   */
  @TryCatch
  async update(data: ITransferUpdate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'update', data, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const existing = await prisma.tb_transfer.findFirst({
      where: { id: data.id, deleted_at: null },
    });

    if (!existing) {
      return Result.error('Transfer not found', ErrorCode.NOT_FOUND);
    }

    const updatePayload: Record<string, unknown> = {
      updated_by_id: user_id,
      updated_at: new Date(),
    };

    if (data.tr_date !== undefined) updatePayload.tr_date = data.tr_date || null;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.doc_status) updatePayload.doc_status = data.doc_status as enum_doc_status;
    if (data.from_location_id !== undefined) updatePayload.from_location_id = data.from_location_id;
    if (data.from_location_code !== undefined) updatePayload.from_location_code = data.from_location_code;
    if (data.from_location_name !== undefined) updatePayload.from_location_name = data.from_location_name;
    if (data.to_location_id !== undefined) updatePayload.to_location_id = data.to_location_id;
    if (data.to_location_code !== undefined) updatePayload.to_location_code = data.to_location_code;
    if (data.to_location_name !== undefined) updatePayload.to_location_name = data.to_location_name;
    // if (data.workflow_id !== undefined) updatePayload.workflow_id = data.workflow_id;
    // if (data.workflow_name !== undefined) updatePayload.workflow_name = data.workflow_name;
    // if (data.workflow_history !== undefined) updatePayload.workflow_history = data.workflow_history;
    // if (data.workflow_current_stage !== undefined) updatePayload.workflow_current_stage = data.workflow_current_stage;
    // if (data.workflow_previous_stage !== undefined) updatePayload.workflow_previous_stage = data.workflow_previous_stage;
    // if (data.workflow_next_stage !== undefined) updatePayload.workflow_next_stage = data.workflow_next_stage;
    // if (data.user_action !== undefined) updatePayload.user_action = data.user_action;
    // if (data.last_action !== undefined) updatePayload.last_action = data.last_action;
    // if (data.last_action_at_date !== undefined) updatePayload.last_action_at_date = data.last_action_at_date ? new Date(data.last_action_at_date) : null;
    // if (data.last_action_by_id !== undefined) updatePayload.last_action_by_id = data.last_action_by_id;
    // if (data.last_action_by_name !== undefined) updatePayload.last_action_by_name = data.last_action_by_name;
    if (data.note !== undefined) updatePayload.note = data.note;
    if (data.info !== undefined) updatePayload.info = data.info;
    if (data.dimension !== undefined) updatePayload.dimension = data.dimension;

    const transfer = await prisma.tb_transfer.update({
      where: { id: data.id },
      data: updatePayload,
    });

    return Result.ok(transfer);
  }

  /**
   * Soft delete a transfer and its details
   * ลบการโอนย้ายและรายการรายละเอียดแบบซอฟต์ดีลีท
   * @param id - Transfer ID / ID การโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Deleted transfer / การโอนย้ายที่ลบแล้ว
   */
  @TryCatch
  async delete(id: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'delete', id, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const existing = await prisma.tb_transfer.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      return Result.error('Transfer not found', ErrorCode.NOT_FOUND);
    }

    const now = new Date();

    // Soft delete details
    await prisma.tb_transfer_detail.updateMany({
      where: { transfer_id: id, deleted_at: null },
      data: { deleted_at: now, deleted_by_id: user_id },
    });

    // Soft delete transfer
    const transfer = await prisma.tb_transfer.update({
      where: { id },
      data: { deleted_at: now, deleted_by_id: user_id },
    });

    return Result.ok(transfer);
  }

  // ==================== Transfer Detail CRUD ====================

  /**
   * Find a transfer detail by ID
   * ค้นหารายการรายละเอียดการโอนย้ายตาม ID
   * @param detailId - Transfer detail ID / ID รายการรายละเอียดการโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Transfer detail / รายการรายละเอียดการโอนย้าย
   */
  @TryCatch
  async findDetailById(detailId: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findDetailById', detailId, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const detail = await prisma.tb_transfer_detail.findFirst({
      where: { id: detailId, deleted_at: null },
      include: { tb_transfer: true },
    });

    if (!detail) {
      return Result.error('Transfer detail not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(detail);
  }

  /**
   * Find all details by transfer ID
   * ค้นหารายการรายละเอียดทั้งหมดตาม ID การโอนย้าย
   * @param transferId - Transfer ID / ID การโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns List of transfer details / รายการรายละเอียดการโอนย้าย
   */
  @TryCatch
  async findDetailsByTransferId(transferId: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findDetailsByTransferId', transferId, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const details = await prisma.tb_transfer_detail.findMany({
      where: { transfer_id: transferId, deleted_at: null },
      orderBy: { sequence_no: 'asc' },
    });

    return Result.ok(details);
  }

  /**
   * Create a transfer detail line
   * สร้างรายการรายละเอียดการโอนย้าย
   * @param transferId - Transfer ID / ID การโอนย้าย
   * @param data - Detail creation data / ข้อมูลสร้างรายการรายละเอียด
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created detail / รายการรายละเอียดที่สร้างแล้ว
   */
  @TryCatch
  async createDetail(transferId: string, data: ITransferDetailCreate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createDetail', transferId, data, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const transfer = await prisma.tb_transfer.findFirst({
      where: { id: transferId, deleted_at: null },
    });

    if (!transfer) {
      return Result.error('Transfer not found', ErrorCode.NOT_FOUND);
    }

    if (transfer.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot add detail to non-draft transfer', ErrorCode.VALIDATION_FAILURE);
    }

    // Validate product
    if (data.product_id) {
      const product = await prisma.tb_product.findFirst({
        where: { id: data.product_id },
      });
      if (!product) {
        return Result.error('Product not found', ErrorCode.NOT_FOUND);
      }
      data.product_name = product.name;
      data.product_code = product.code;
      data.product_sku = product.code;
      data.product_local_name = product.local_name;
    }

    const lastDetail = await prisma.tb_transfer_detail.findFirst({
      where: { transfer_id: transferId, deleted_at: null },
      orderBy: { sequence_no: 'desc' },
    });

    const nextSequence = (lastDetail?.sequence_no || 0) + 1;

    const detail = await prisma.tb_transfer_detail.create({
      data: {
        transfer_id: transferId,
        sequence_no: nextSequence,
        product_id: data.product_id,
        product_name: data.product_name || null,
        product_local_name: data.product_local_name || null,
        description: data.description || null,
        qty: data.qty || 0,
        cost_per_unit: data.cost_per_unit || 0,
        total_cost: data.total_cost || 0,
        note: data.note || null,
        info: data.info || {},
        dimension: data.dimension || [],
        created_by_id: user_id,
      },
    });

    return Result.ok(detail);
  }

  /**
   * Update a transfer detail line
   * แก้ไขรายการรายละเอียดการโอนย้าย
   * @param detailId - Transfer detail ID / ID รายการรายละเอียดการโอนย้าย
   * @param data - Detail update data / ข้อมูลแก้ไขรายการรายละเอียด
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Updated detail / รายการรายละเอียดที่แก้ไขแล้ว
   */
  @TryCatch
  async updateDetail(detailId: string, data: ITransferDetailUpdate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'updateDetail', detailId, data, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const existingDetail = await prisma.tb_transfer_detail.findFirst({
      where: { id: detailId, deleted_at: null },
      include: { tb_transfer: true },
    });

    if (!existingDetail) {
      return Result.error('Transfer detail not found', ErrorCode.NOT_FOUND);
    }

    if (existingDetail.tb_transfer.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot update detail of non-draft transfer', ErrorCode.VALIDATION_FAILURE);
    }

    const updatePayload: Record<string, unknown> = {
      updated_by_id: user_id,
      updated_at: new Date(),
    };

    if (data.product_id !== undefined) updatePayload.product_id = data.product_id;
    if (data.product_name !== undefined) updatePayload.product_name = data.product_name;
    if (data.product_local_name !== undefined) updatePayload.product_local_name = data.product_local_name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.qty !== undefined) updatePayload.qty = data.qty;
    if (data.cost_per_unit !== undefined) updatePayload.cost_per_unit = data.cost_per_unit;
    if (data.total_cost !== undefined) updatePayload.total_cost = data.total_cost;
    if (data.note !== undefined) updatePayload.note = data.note;
    if (data.info !== undefined) updatePayload.info = data.info;
    if (data.dimension !== undefined) updatePayload.dimension = data.dimension;

    const detail = await prisma.tb_transfer_detail.update({
      where: { id: detailId },
      data: updatePayload,
    });

    return Result.ok(detail);
  }

  /**
   * Soft delete a transfer detail line
   * ลบรายการรายละเอียดการโอนย้ายแบบซอฟต์ดีลีท
   * @param detailId - Transfer detail ID / ID รายการรายละเอียดการโอนย้าย
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Deleted detail / รายการรายละเอียดที่ลบแล้ว
   */
  @TryCatch
  async deleteDetail(detailId: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'deleteDetail', detailId, user_id, tenant_id }, TransferService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const existingDetail = await prisma.tb_transfer_detail.findFirst({
      where: { id: detailId, deleted_at: null },
      include: { tb_transfer: true },
    });

    if (!existingDetail) {
      return Result.error('Transfer detail not found', ErrorCode.NOT_FOUND);
    }

    if (existingDetail.tb_transfer.doc_status !== enum_doc_status.draft) {
      return Result.error('Cannot delete detail of non-draft transfer', ErrorCode.VALIDATION_FAILURE);
    }

    const detail = await prisma.tb_transfer_detail.update({
      where: { id: detailId },
      data: { deleted_at: new Date(), deleted_by_id: user_id },
    });

    return Result.ok(detail);
  }

  // ==================== Standalone Transfer Detail API ====================

  /**
   * Find all transfer details with pagination (standalone API)
   * ค้นหารายการรายละเอียดการโอนย้ายทั้งหมดพร้อมการแบ่งหน้า (API แบบอิสระ)
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of transfer details / รายการรายละเอียดการโอนย้ายแบบแบ่งหน้า
   */
  @TryCatch
  async findAllDetails(user_id: string, tenant_id: string, paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findAllDetails', user_id, tenant_id, paginate }, TransferService.name);

    const defaultSearchFields = ['product_name', 'description'];

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

    const details = await prisma.tb_transfer_detail.findMany({
      ...q.findMany(),
      where: {
        ...q.where(),
        deleted_at: null,
      },
      include: { tb_transfer: true },
    });

    const total = await prisma.tb_transfer_detail.count({
      where: {
        ...q.where(),
        deleted_at: null,
      },
    });

    return Result.ok({
      data: details,
      paginate: {
        total,
        page: q.page,
        perpage: q.perpage,
        pages: total === 0 ? 1 : Math.ceil(total / q.perpage),
      },
    });
  }

  /**
   * Create a standalone transfer detail (requires transfer_id in data)
   * สร้างรายการรายละเอียดการโอนย้ายแบบอิสระ (ต้องระบุ transfer_id ในข้อมูล)
   * @param data - Detail creation data with transfer_id / ข้อมูลสร้างรายการรายละเอียดพร้อม transfer_id
   * @param user_id - User ID / ID ผู้ใช้
   * @param tenant_id - Tenant ID / ID ผู้เช่า
   * @returns Created detail / รายการรายละเอียดที่สร้างแล้ว
   */
  @TryCatch
  async createStandaloneDetail(data: ITransferDetailCreate, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createStandaloneDetail', data, user_id, tenant_id }, TransferService.name);

    if (!data.transfer_id) {
      return Result.error('transfer_id is required', ErrorCode.VALIDATION_FAILURE);
    }

    return this.createDetail(data.transfer_id, data, user_id, tenant_id);
  }
}
