import { HttpStatus, HttpException, Inject, Injectable } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { TenantService } from '@/tenant/tenant.service';
import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT } from '@repo/prisma-shared-schema-tenant';
import {
  enum_purchase_order_doc_status,
  enum_purchase_request_doc_status,
  Prisma,
  PrismaClient,
} from '@repo/prisma-shared-schema-tenant';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import {
  ICreatePurchaseOrder,
  IUpdatePurchaseOrder,
  IPurchaseOrderDetail,
} from './interface/purchase-order.interface';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { CommonLogic } from '@/common/common.logic';
import { getPattern } from '@/common/common.helper';
import { format } from 'date-fns';
import QueryParams from '@/libs/paginate.query';
import getPaginationParams from '@/common/helpers/pagination.params';
import {
  NotificationService,
  NotificationType,
  PurchaseOrderDetailResponseSchema,
  PurchaseOrderListItemResponseSchema,
  TryCatch,
  Result,
  ErrorCode,
} from '@/common';
import {
  ApprovePurchaseOrderDetailDto,
  RejectPurchaseOrderDetailDto,
  ReviewPurchaseOrderDetailDto,
} from './dto/approve-purchase-order.dto';
import * as ExcelJS from 'exceljs';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';


const ERROR_MISSING_BU_CODE = 'Missing bu_code';
const ERROR_MISSING_USER_ID = 'Missing user_id';

@Injectable()
export class PurchaseOrderService {
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
    PurchaseOrderService.name,
  );

  /**
   * Initialize the Prisma service for tenant-specific database access
   * เริ่มต้นบริการ Prisma สำหรับการเข้าถึงฐานข้อมูลเฉพาะผู้เช่า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param userId - User ID / ID ผู้ใช้
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
    @Inject('PRISMA_SYSTEM')
    private readonly prismaSystem: typeof PrismaClient_SYSTEM,
    @Inject('PRISMA_TENANT')
    private readonly prismaTenant: typeof PrismaClient_TENANT,
    private readonly tenantService: TenantService,
    private readonly commonLogic: CommonLogic,
    private readonly notificationService: NotificationService,
  ) { }

  /**
   * Find a purchase order by ID with all related data (vendor, currency, credit term, details)
   * ค้นหาใบสั่งซื้อตาม ID พร้อมข้อมูลที่เกี่ยวข้องทั้งหมด (ผู้ขาย สกุลเงิน เงื่อนไขเครดิต รายละเอียด)
   * @param id - Purchase order ID / ID ของใบสั่งซื้อ
   * @returns Purchase order data with relations / ข้อมูลใบสั่งซื้อพร้อมความสัมพันธ์
   */
  @TryCatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- result.value accessed by logic layer
  async findById(id: string): Promise<Result<any>> {
    this.logger.debug(
      { function: 'findById', id, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        po_no: true,
        po_status: true,
        description: true,
        order_date: true,
        delivery_date: true,
        workflow_id: true,
        workflow_name: true,
        workflow_current_stage: true,
        workflow_previous_stage: true,
        workflow_next_stage: true,
        user_action: true,
        last_action: true,
        last_action_at_date: true,
        last_action_by_id: true,
        last_action_by_name: true,
        vendor_id: true,
        vendor_name: true,
        currency_id: true,
        currency_code: true,
        exchange_rate: true,
        approval_date: true,
        email: true,
        buyer_id: true,
        buyer_name: true,
        credit_term_id: true,
        credit_term_name: true,
        credit_term_value: true,
        remarks: true,
        total_qty: true,
        total_price: true,
        total_tax: true,
        total_amount: true,
        note: true,
        info: true,
        doc_version: true,
        created_at: true,
        tb_vendor: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        tb_currency_tb_purchase_order_currency_idTotb_currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        tb_credit_term: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        tb_purchase_order_detail: {
          select: {
            id: true,
            sequence_no: true,
            description: true,
            order_qty: true,
            order_unit_id: true,
            order_unit_name: true,
            order_unit_conversion_factor: true,
            base_qty: true,
            base_unit_id: true,
            base_unit_name: true,
            is_foc: true,
            tax_profile_id: true,
            tax_profile_name: true,
            tax_rate: true,
            tax_amount: true,
            base_tax_amount: true,
            is_tax_adjustment: true,
            discount_rate: true,
            discount_amount: true,
            base_discount_amount: true,
            is_discount_adjustment: true,
            price: true,
            sub_total_price: true,
            net_amount: true,
            total_price: true,
            base_price: true,
            base_sub_total_price: true,
            base_net_amount: true,
            base_total_price: true,
            received_qty: true,
            cancelled_qty: true,
            note: true,
            info: true,
            doc_version: true,
            tb_purchase_order_detail_tb_purchase_request_detail: {
              select: {
                id: true,
                pr_detail_id: true,
                pr_detail_order_unit_id: true,
                pr_detail_order_unit_name: true,
                pr_detail_qty: true,
                pr_detail_base_qty: true,
                pr_detail_base_unit_id: true,
                pr_detail_base_unit_name: true,
                received_qty: true,
                foc_qty: true,
              },
            },
          },
        },
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    // Transform the response
    const transformedData = {
      ...purchaseOrder,
      vendor: purchaseOrder.tb_vendor,
      currency: purchaseOrder.tb_currency_tb_purchase_order_currency_idTotb_currency,
      //credit_term: purchaseOrder.tb_credit_term?.value,
      credit_term_value: purchaseOrder.tb_credit_term?.value,
      credit_term_id: purchaseOrder.tb_credit_term?.id,
      credit_term_name: purchaseOrder.tb_credit_term?.name,
      total_qty: Number(purchaseOrder.total_qty),
      total_price: Number(purchaseOrder.total_price),
      total_tax: Number(purchaseOrder.total_tax),
      total_amount: Number(purchaseOrder.total_amount),
      exchange_rate: Number(purchaseOrder.exchange_rate),
      purchase_order_detail: purchaseOrder.tb_purchase_order_detail.map((detail) => ({
        ...detail,
        order_qty: Number(detail.order_qty),
        order_unit_conversion_factor: Number(detail.order_unit_conversion_factor),
        base_qty: Number(detail.base_qty),
        tax_rate: Number(detail.tax_rate),
        tax_amount: Number(detail.tax_amount),
        base_tax_amount: Number(detail.base_tax_amount),
        discount_rate: Number(detail.discount_rate),
        discount_amount: Number(detail.discount_amount),
        base_discount_amount: Number(detail.base_discount_amount),
        price: Number(detail.price),
        sub_total_price: Number(detail.sub_total_price),
        net_amount: Number(detail.net_amount),
        total_price: Number(detail.total_price),
        base_price: Number(detail.base_price),
        base_sub_total_price: Number(detail.base_sub_total_price),
        base_net_amount: Number(detail.base_net_amount),
        base_total_price: Number(detail.base_total_price),
        received_qty: Number(detail.received_qty),
        cancelled_qty: Number(detail.cancelled_qty),
        pr_details: detail.tb_purchase_order_detail_tb_purchase_request_detail.map((prLink) => ({
          id: prLink.id,
          pr_detail_id: prLink.pr_detail_id,
          order_unit_id: prLink.pr_detail_order_unit_id,
          order_unit_name: prLink.pr_detail_order_unit_name,
          order_qty: Number(prLink.pr_detail_qty),
          order_base_qty: Number(prLink.pr_detail_base_qty),
          base_unit_id: prLink.pr_detail_base_unit_id,
          base_unit_name: prLink.pr_detail_base_unit_name,
          received_qty: Number(prLink.received_qty),
          foc_qty: Number(prLink.foc_qty),
        })),
      })),
    };

    // Remove the original nested relations
    delete (transformedData as Record<string, unknown>).tb_vendor;
    delete (transformedData as Record<string, unknown>).tb_currency_tb_purchase_order_currency_idTotb_currency;
    delete (transformedData as Record<string, unknown>).tb_credit_term;
    delete (transformedData as Record<string, unknown>).tb_purchase_order_detail;

    const serializedPurchaseOrder = PurchaseOrderDetailResponseSchema.parse(transformedData);

    return Result.ok(serializedPurchaseOrder);
  }

  /**
   * Find all purchase orders with pagination, search, and filtering
   * ค้นหาใบสั่งซื้อทั้งหมดพร้อมการแบ่งหน้า การค้นหา และการกรอง
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of purchase orders / รายการใบสั่งซื้อที่แบ่งหน้าแล้ว
   */
  @TryCatch
  async findAll(paginate: IPaginate): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      PurchaseOrderService.name,
    );

    const defaultSearchFields = ['po_no', 'description', 'vendor_name'];

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

    const selectClause = {
      id: true,
      po_no: true,
      po_status: true,
      description: true,
      order_date: true,
      delivery_date: true,
      vendor_id: true,
      vendor_name: true,
      currency_id: true,
      currency_code: true,
      exchange_rate: true,
      buyer_id: true,
      buyer_name: true,
      total_qty: true,
      total_price: true,
      total_tax: true,
      total_amount: true,
      workflow_current_stage: true,
      workflow_next_stage: true,
      last_action: true,
      created_at: true,
      doc_version: true,
      tb_vendor: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      tb_currency_tb_purchase_order_currency_idTotb_currency: {
        select: {
          id: true,
          name: true,
          code: true,
          symbol: true,
        },
      },
    };

    const purchaseOrders = await this.prismaService.tb_purchase_order.findMany({
      select: selectClause,
      where: q.where(),
      orderBy: q.orderBy(),
      ...pagination
    });

    const total = await this.prismaService.tb_purchase_order.count({
      where: q.where(),
    });

    const transformedData = purchaseOrders.map((po) => ({
      id: po.id,
      po_no: po.po_no,
      po_status: po.po_status,
      description: po.description,
      order_date: po.order_date,
      delivery_date: po.delivery_date,
      vendor_name: po.tb_vendor?.name ?? po.vendor_name ?? null,
      vendor: po.tb_vendor,
      currency: po.tb_currency_tb_purchase_order_currency_idTotb_currency,
      exchange_rate: Number(po.exchange_rate),
      buyer_id: po.buyer_id,
      buyer_name: po.buyer_name,
      total_qty: Number(po.total_qty),
      total_price: Number(po.total_price),
      total_tax: Number(po.total_tax),
      total_amount: Number(po.total_amount),
      workflow_current_stage: po.workflow_current_stage,
      workflow_next_stage: po.workflow_next_stage,
      last_action: po.last_action,
      created_at: po.created_at,
      doc_version: po.doc_version,
    }));

    const serializedPurchaseOrders = transformedData.map((item) => PurchaseOrderListItemResponseSchema.parse(item));

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: serializedPurchaseOrders,
    });
  }

  /**
   * Create a new purchase order with details and generate a running PO number
   * สร้างใบสั่งซื้อใหม่พร้อมรายละเอียดและสร้างเลขที่ใบสั่งซื้ออัตโนมัติ
   * @param data - Purchase order creation data / ข้อมูลสำหรับสร้างใบสั่งซื้อ
   * @returns Created purchase order ID and PO number / ID และเลขที่ใบสั่งซื้อที่สร้างแล้ว
   */
  @TryCatch
  async create(data: ICreatePurchaseOrder): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Validate vendor
    const vendor = await this.prismaService.tb_vendor.findUnique({
      where: { id: data.vendor_id },
    });

    if (!vendor) {
      return Result.error('Vendor not found', ErrorCode.INVALID_ARGUMENT);
    }

    // Validate currency
    const currency = await this.prismaService.tb_currency.findUnique({
      where: { id: data.currency_id },
    });

    if (!currency) {
      return Result.error('Currency not found', ErrorCode.INVALID_ARGUMENT);
    }

    // Validate credit term if provided
    let creditTerm = null;
    if (data.credit_term_id) {
      creditTerm = await this.prismaService.tb_credit_term.findUnique({
        where: { id: data.credit_term_id },
      });
    }

    // Generate PO number - ensure order_date is a valid Date
    const orderDate = data.order_date ? new Date(String(data.order_date)) : new Date();
    const poNo = await this.generatePONo(orderDate.toISOString());

    // Calculate totals from details
    let total_qty = 0;
    let total_price = 0;
    let total_tax = 0;
    let total_amount = 0;

    for (const detail of data.details) {
      total_qty += detail.order_qty || 0;
      total_price += detail.sub_total_price || 0;
      total_tax += detail.tax_amount || 0;
      total_amount += detail.total_price || 0;
    }

    // Create Purchase Order with transaction
    const purchaseOrder = await this.prismaService.$transaction(async (prismatx) => {
      // Create PO header
      const po = await prismatx.tb_purchase_order.create({
        data: {
          po_no: poNo,
          po_status: enum_purchase_order_doc_status.draft,
          description: data.description,
          order_date: orderDate.toISOString(),
          delivery_date: new Date(String(data.delivery_date)).toISOString(),
          vendor_id: data.vendor_id,
          vendor_name: data.vendor_name || vendor.name,
          currency_id: data.currency_id,
          currency_code: data.currency_code || currency.code,
          exchange_rate: data.exchange_rate || 1,
          email: data.email,
          buyer_id: data.buyer_id,
          buyer_name: data.buyer_name,
          credit_term_id: data.credit_term_id,
          credit_term_name: data.credit_term_name || creditTerm?.name,
          credit_term_value: data.credit_term_value || creditTerm?.value,
          remarks: data.remarks,
          note: data.note,
          total_qty,
          total_price,
          total_tax,
          total_amount,
          is_active: true,
          doc_version: 1,
          created_by_id: this.userId,
        },
      });

      // Create PO details and PR detail linkages
      for (const detail of data.details) {
        // Validate unit
        const unit = await prismatx.tb_unit.findUnique({
          where: { id: detail.order_unit_id },
        });

        // Calculate base_qty if not provided
        const base_qty =
          detail.base_qty ||
          detail.order_qty * (detail.order_unit_conversion_factor || 1);

        // Create PO detail
        const poDetail = await prismatx.tb_purchase_order_detail.create({
          data: {
            purchase_order_id: po.id,
            sequence_no: detail.sequence,
            description: detail.description,
            order_qty: detail.order_qty,
            order_unit_id: detail.order_unit_id || undefined,
            order_unit_name: detail.order_unit_name || unit?.name,
            order_unit_conversion_factor: detail.order_unit_conversion_factor || 1,
            base_qty: base_qty,
            base_unit_id: detail.base_unit_id || undefined,
            base_unit_name: detail.base_unit_name,
            is_foc: detail.is_foc || false,
            // Pricing
            price: detail.price || 0,
            sub_total_price: detail.sub_total_price || 0,
            net_amount: detail.net_amount || 0,
            total_price: detail.total_price || 0,
            // Tax
            tax_profile_id: detail.tax_profile_id || undefined,
            tax_profile_name: detail.tax_profile_name,
            tax_rate: detail.tax_rate || 0,
            tax_amount: detail.tax_amount || 0,
            is_tax_adjustment: detail.is_tax_adjustment || false,
            // Discount
            discount_rate: detail.discount_rate || 0,
            discount_amount: detail.discount_amount || 0,
            is_discount_adjustment: detail.is_discount_adjustment || false,
            note: detail.note,
            // Store product info in info JSON field
            info: {
              product_id: detail.product_id,
              product_name: detail.product_name,
              product_local_name: detail.product_local_name,
            },
            is_active: true,
            doc_version: 1,
            created_by_id: this.userId,
          },
        });

        // Create PR detail linkages (junction table records)
        if (detail.pr_detail && detail.pr_detail.length > 0) {
          for (const prDetail of detail.pr_detail) {
            // Skip if required fields are missing
            if (!prDetail.pr_detail_id || !prDetail.order_unit_id) {
              continue;
            }
            await prismatx.tb_purchase_order_detail_tb_purchase_request_detail.create({
              data: {
                po_detail_id: poDetail.id,
                pr_detail_id: prDetail.pr_detail_id,
                pr_detail_order_unit_id: prDetail.order_unit_id,
                pr_detail_order_unit_name: prDetail.order_unit_name || '',
                pr_detail_qty: prDetail.order_qty,
                pr_detail_base_qty: prDetail.order_base_qty,
                pr_detail_base_unit_id: prDetail.order_base_unit_id || undefined,
                pr_detail_base_unit_name: prDetail.order_base_unit_name,
                created_by_id: this.userId,
              },
            });
          }
        }
      }

      return po;
    });

    // Send notification for PO creation
    this.sendPOCreatedNotification(purchaseOrder, data);

    return Result.ok({ id: purchaseOrder.id, po_no: purchaseOrder.po_no });
  }

  /**
   * Update an existing purchase order header and its detail lines (add, update, delete)
   * อัปเดตส่วนหัวใบสั่งซื้อที่มีอยู่และรายการรายละเอียด (เพิ่ม อัปเดต ลบ)
   * @param data - Updated purchase order data with detail operations / ข้อมูลใบสั่งซื้อที่อัปเดตพร้อมการดำเนินการรายละเอียด
   * @returns Updated purchase order ID / ID ของใบสั่งซื้อที่อัปเดตแล้ว
   */
  @TryCatch
  async update(data: IUpdatePurchaseOrder): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    const purchaseOrderId = typeof data.id === 'object' ? (data.id as unknown as Record<string, string>).id : data.id;

    const currentPO = await this.prismaService.tb_purchase_order.findUnique({
      where: { id: purchaseOrderId },
    });

    if (!currentPO) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    // Check doc_version for optimistic locking
    if (data.doc_version !== undefined && data.doc_version !== currentPO.doc_version) {
      return Result.error('Purchase order has been modified by another user', ErrorCode.ALREADY_EXISTS);
    }

    // Validate vendor if provided
    if (data.vendor_id) {
      const vendor = await this.prismaService.tb_vendor.findUnique({
        where: { id: data.vendor_id },
      });

      if (!vendor) {
        return Result.error('Vendor not found', ErrorCode.INVALID_ARGUMENT);
      }
      data.vendor_name = data.vendor_name || vendor.name;
    }

    // Validate currency if provided
    if (data.currency_id) {
      const currency = await this.prismaService.tb_currency.findUnique({
        where: { id: data.currency_id },
      });

      if (!currency) {
        return Result.error('Currency not found', ErrorCode.INVALID_ARGUMENT);
      }
      data.currency_code = data.currency_code || currency.code;
    }

    // Update the main purchase order record
    const updatedPO = await this.prismaService.tb_purchase_order.update({
      where: { id: purchaseOrderId },
      data: {
        description: data.description,
        order_date: data.order_date ? new Date(data.order_date as string).toISOString() : undefined,
        delivery_date: data.delivery_date
          ? new Date(data.delivery_date as string).toISOString()
          : undefined,
        vendor_id: data.vendor_id,
        vendor_name: data.vendor_name,
        currency_id: data.currency_id,
        currency_code: data.currency_code,
        exchange_rate: data.exchange_rate,
        email: data.email,
        buyer_id: data.buyer_id,
        buyer_name: data.buyer_name,
        credit_term_id: data.credit_term_id,
        credit_term_name: data.credit_term_name,
        credit_term_value: data.credit_term_value,
        remarks: data.remarks,
        note: data.note,
        info: data.info as object,
        doc_version: { increment: 1 },
        updated_by_id: this.userId,
      },
    });

    // Handle purchase_order_details add/remove/update
    if (data.purchase_order_details) {
      // Add new details
      if (data.purchase_order_details.add) {
        for (const detail of data.purchase_order_details.add) {
          await this.prismaService.tb_purchase_order_detail.create({
            data: {
              purchase_order_id: updatedPO.id,
              sequence_no: detail.sequence_no,
              description: detail.description,
              order_qty: detail.order_qty,
              order_unit_id: detail.order_unit_id || undefined,
              order_unit_name: detail.order_unit_name,
              order_unit_conversion_factor: detail.order_unit_conversion_factor,
              base_qty: detail.base_qty,
              base_unit_id: detail.base_unit_id || undefined,
              base_unit_name: detail.base_unit_name,
              is_foc: detail.is_foc,
              tax_profile_id: detail.tax_profile_id || undefined,
              tax_profile_name: detail.tax_profile_name,
              tax_rate: detail.tax_rate,
              tax_amount: detail.tax_amount,
              is_tax_adjustment: detail.is_tax_adjustment,
              discount_rate: detail.discount_rate,
              discount_amount: detail.discount_amount,
              is_discount_adjustment: detail.is_discount_adjustment,
              price: detail.price,
              sub_total_price: detail.sub_total_price,
              net_amount: detail.net_amount,
              total_price: detail.total_price,
              note: detail.note,
              info: detail.info as object,
              is_active: true,
              doc_version: 1,
              created_by_id: this.userId,
            },
          });
        }
      }

      // Remove details
      if (data.purchase_order_details.remove) {
        for (const detailId of data.purchase_order_details.remove) {
          const id = typeof detailId === 'object' ? detailId.id : detailId;
          // First delete junction records
          await this.prismaService.tb_purchase_order_detail_tb_purchase_request_detail.deleteMany(
            {
              where: { po_detail_id: id },
            },
          );
          // Then delete the detail
          await this.prismaService.tb_purchase_order_detail.delete({
            where: { id: id },
          });
        }
      }

      // Update existing details
      if (data.purchase_order_details.update) {
        for (const detail of data.purchase_order_details.update) {
          const detailId = typeof detail.id === 'object' ? (detail.id as unknown as Record<string, string>).id : detail.id;
          await this.prismaService.tb_purchase_order_detail.update({
            where: { id: detailId },
            data: {
              sequence_no: detail.sequence_no,
              description: detail.description,
              order_qty: detail.order_qty,
              order_unit_id: detail.order_unit_id || undefined,
              order_unit_name: detail.order_unit_name,
              order_unit_conversion_factor: detail.order_unit_conversion_factor,
              base_qty: detail.base_qty,
              base_unit_id: detail.base_unit_id || undefined,
              base_unit_name: detail.base_unit_name,
              is_foc: detail.is_foc,
              tax_profile_id: detail.tax_profile_id || undefined,
              tax_profile_name: detail.tax_profile_name,
              tax_rate: detail.tax_rate,
              tax_amount: detail.tax_amount,
              is_tax_adjustment: detail.is_tax_adjustment,
              discount_rate: detail.discount_rate,
              discount_amount: detail.discount_amount,
              is_discount_adjustment: detail.is_discount_adjustment,
              price: detail.price,
              sub_total_price: detail.sub_total_price,
              net_amount: detail.net_amount,
              total_price: detail.total_price,
              note: detail.note,
              info: detail.info as object,
              doc_version: { increment: 1 },
              updated_by_id: this.userId,
            },
          });
        }
      }
    }

    // Recalculate totals
    const details = await this.prismaService.tb_purchase_order_detail.findMany({
      where: { purchase_order_id: updatedPO.id },
    });

    let total_qty = 0;
    let total_price = 0;
    let total_tax = 0;
    let total_amount = 0;

    for (const detail of details) {
      total_qty += Number(detail.order_qty) || 0;
      total_price += Number(detail.sub_total_price) || 0;
      total_tax += Number(detail.tax_amount) || 0;
      total_amount += Number(detail.total_price) || 0;
    }

    await this.prismaService.tb_purchase_order.update({
      where: { id: updatedPO.id },
      data: {
        total_qty,
        total_price,
        total_tax,
        total_amount,
      },
    });

    return Result.ok({ id: updatedPO.id });
  }

  /**
   * Delete a purchase order and all its detail lines
   * ลบใบสั่งซื้อและรายการรายละเอียดทั้งหมด
   * @param id - Purchase order ID to delete / ID ของใบสั่งซื้อที่ต้องการลบ
   * @returns Deleted purchase order ID / ID ของใบสั่งซื้อที่ลบแล้ว
   */
  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    const purchaseOrder = await this.prismaService.tb_purchase_order.findUnique({
      where: { id: id },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    // Soft delete - update status and set deleted_at
    const deletedPO = await this.prismaService.tb_purchase_order.update({
      where: { id: id },
      data: {
        is_active: false,
        deleted_at: new Date(),
        deleted_by_id: this.userId,
      },
    });

    return Result.ok({ id: deletedPO.id });
  }

  /**
   * Save a purchase order by updating header and managing detail lines (add, update, delete)
   * บันทึกใบสั่งซื้อโดยอัปเดตส่วนหัวและจัดการรายการรายละเอียด (เพิ่ม อัปเดต ลบ)
   * @param id - Purchase order ID / ID ของใบสั่งซื้อ
   * @param header - Header data to update / ข้อมูลส่วนหัวที่ต้องการอัปเดต
   * @param details - Detail operations (add, update, delete) / การดำเนินการรายละเอียด (เพิ่ม อัปเดต ลบ)
   * @returns Saved purchase order ID / ID ของใบสั่งซื้อที่บันทึกแล้ว
   */
  @TryCatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async save(id: string, header: Record<string, any>, details: Record<string, any>): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'save',
        id,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      PurchaseOrderService.name,
    );

    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
        po_status: enum_purchase_order_doc_status.in_progress,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found or not in progress', ErrorCode.NOT_FOUND);
    }

    await this.prismaService.$transaction(async (txp) => {
      // 1. Update PO header if any header fields provided
      if (Object.keys(header).length > 0) {
        await txp.tb_purchase_order.update({
          where: { id },
          data: {
            ...header,
            delivery_date: header.delivery_date
              ? new Date(header.delivery_date as string).toISOString()
              : undefined,
            order_date: header.order_date
              ? new Date(header.order_date as string).toISOString()
              : undefined,
            updated_by_id: this.userId,
          },
        });
      }

      // 2. Remove details
      if (details?.remove?.length > 0) {
        for (const item of details.remove) {
          // Delete junction records first
          await txp.tb_purchase_order_detail_tb_purchase_request_detail.deleteMany({
            where: { po_detail_id: item.id },
          });
          // Then delete the detail
          await txp.tb_purchase_order_detail.delete({
            where: { id: item.id },
          });
        }
      }

      // 3. Add new details
      if (details?.add?.length > 0) {
        for (const detail of details.add) {
          const base_qty =
            detail.base_qty ||
            detail.order_qty * (detail.order_unit_conversion_factor || 1);

          const poDetail = await txp.tb_purchase_order_detail.create({
            data: {
              purchase_order_id: id,
              sequence_no: detail.sequence,
              description: detail.description,
              order_qty: detail.order_qty,
              order_unit_id: detail.order_unit_id || undefined,
              order_unit_name: detail.order_unit_name,
              order_unit_conversion_factor: detail.order_unit_conversion_factor || 1,
              base_qty: base_qty,
              base_unit_id: detail.base_unit_id || undefined,
              base_unit_name: detail.base_unit_name,
              is_foc: detail.is_foc || false,
              price: detail.price || 0,
              sub_total_price: detail.sub_total_price || 0,
              net_amount: detail.net_amount || 0,
              total_price: detail.total_price || 0,
              tax_profile_id: detail.tax_profile_id || undefined,
              tax_profile_name: detail.tax_profile_name,
              tax_rate: detail.tax_rate || 0,
              tax_amount: detail.tax_amount || 0,
              is_tax_adjustment: detail.is_tax_adjustment || false,
              discount_rate: detail.discount_rate || 0,
              discount_amount: detail.discount_amount || 0,
              is_discount_adjustment: detail.is_discount_adjustment || false,
              note: detail.note,
              info: {
                product_id: detail.product_id,
                product_name: detail.product_name,
                product_local_name: detail.product_local_name,
              },
              is_active: true,
              doc_version: 1,
              created_by_id: this.userId,
            },
          });

          // Create PR detail linkages
          if (detail.pr_detail?.length > 0) {
            for (const prDetail of detail.pr_detail) {
              if (!prDetail.pr_detail_id || !prDetail.order_unit_id) continue;
              await txp.tb_purchase_order_detail_tb_purchase_request_detail.create({
                data: {
                  po_detail_id: poDetail.id,
                  pr_detail_id: prDetail.pr_detail_id,
                  pr_detail_order_unit_id: prDetail.order_unit_id,
                  pr_detail_order_unit_name: prDetail.order_unit_name || '',
                  pr_detail_qty: prDetail.order_qty,
                  pr_detail_base_qty: prDetail.order_base_qty,
                  pr_detail_base_unit_id: prDetail.order_base_unit_id || undefined,
                  pr_detail_base_unit_name: prDetail.order_base_unit_name,
                  created_by_id: this.userId,
                },
              });
            }
          }
        }
      }

      // 4. Update existing details
      if (details?.update?.length > 0) {
        for (const detail of details.update) {
          await txp.tb_purchase_order_detail.update({
            where: { id: detail.id },
            data: {
              sequence_no: detail.sequence,
              description: detail.description,
              order_qty: detail.order_qty,
              order_unit_id: detail.order_unit_id || undefined,
              order_unit_name: detail.order_unit_name,
              order_unit_conversion_factor: detail.order_unit_conversion_factor,
              base_qty: detail.base_qty,
              base_unit_id: detail.base_unit_id || undefined,
              base_unit_name: detail.base_unit_name,
              is_foc: detail.is_foc,
              tax_profile_id: detail.tax_profile_id || undefined,
              tax_profile_name: detail.tax_profile_name,
              tax_rate: detail.tax_rate,
              tax_amount: detail.tax_amount,
              is_tax_adjustment: detail.is_tax_adjustment,
              discount_rate: detail.discount_rate,
              discount_amount: detail.discount_amount,
              is_discount_adjustment: detail.is_discount_adjustment,
              price: detail.price,
              sub_total_price: detail.sub_total_price,
              net_amount: detail.net_amount,
              total_price: detail.total_price,
              note: detail.note,
              info: {
                product_id: detail.product_id,
                product_name: detail.product_name,
                product_local_name: detail.product_local_name,
              },
              doc_version: { increment: 1 },
              updated_by_id: this.userId,
            },
          });
        }
      }

      // 5. Recalculate totals
      const allDetails = await txp.tb_purchase_order_detail.findMany({
        where: { purchase_order_id: id },
      });

      let total_qty = 0;
      let total_price = 0;
      let total_tax = 0;
      let total_amount = 0;

      for (const d of allDetails) {
        total_qty += Number(d.order_qty) || 0;
        total_price += Number(d.sub_total_price) || 0;
        total_tax += Number(d.tax_amount) || 0;
        total_amount += Number(d.total_price) || 0;
      }

      await txp.tb_purchase_order.update({
        where: { id },
        data: {
          total_qty,
          total_price,
          total_tax,
          total_amount,
          doc_version: { increment: 1 },
          updated_by_id: this.userId,
        },
      });

      return id;
    });

    return Result.ok({ id: purchaseOrder.id });
  }

  /**
   * Approve a purchase order and advance the workflow stage
   * อนุมัติใบสั่งซื้อและเลื่อนขั้นตอนการทำงานไปข้างหน้า
   * @param id - Purchase order ID / ID ของใบสั่งซื้อ
   * @param workflow - Workflow state data / ข้อมูลสถานะขั้นตอนการทำงาน
   * @param payload - Approval detail data for each line / ข้อมูลรายละเอียดการอนุมัติของแต่ละรายการ
   * @returns Approved purchase order ID / ID ของใบสั่งซื้อที่อนุมัติแล้ว
   */
  @TryCatch
  async approve(id: string, workflow: Record<string, unknown>, payload: ApprovePurchaseOrderDetailDto[]): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      PurchaseOrderService.name,
    );

    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
        po_status: enum_purchase_order_doc_status.in_progress,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found or not in progress', ErrorCode.NOT_FOUND);
    }

    const PODetailDocs = await this.prismaService.tb_purchase_order_detail.findMany({
      where: {
        purchase_order_id: id,
      },
      select: {
        id: true,
        history: true,
      },
    });

    await this.prismaService.$transaction(async (txp) => {
      for (const detail of payload) {
        const findPODoc = PODetailDocs.find((d) => d.id === detail.id);
        if (!findPODoc) {
          continue;
        }

        const history: Record<string, unknown>[] = (findPODoc?.history as unknown as Record<string, unknown>[]) || [];

        history.push({
          seq: history.length + 1,
          action: 'approved',
          status: detail.stage_status,
          user: {
            id: this.userId,
          },
          at: new Date().toISOString(),
        });

        await txp.tb_purchase_order_detail.update({
          where: {
            id: detail.id,
          },
          data: {
            doc_version: { increment: 1 },
            history: history as unknown as Prisma.InputJsonValue,
            updated_by_id: this.userId,
          },
        });
      }

      await txp.tb_purchase_order.update({
        where: {
          id,
        },
        data: {
          ...workflow,
          doc_version: { increment: 1 },
          updated_by_id: this.userId,
        },
      });

      return id;
    });

    return Result.ok({ id: purchaseOrder.id });
  }

  /**
   * Reject a purchase order and update the workflow stage
   * ปฏิเสธใบสั่งซื้อและอัปเดตขั้นตอนการทำงาน
   * @param id - Purchase order ID / ID ของใบสั่งซื้อ
   * @param workflow - Workflow state data / ข้อมูลสถานะขั้นตอนการทำงาน
   * @param payload - Rejection detail data for each line / ข้อมูลรายละเอียดการปฏิเสธของแต่ละรายการ
   * @returns Rejected purchase order ID / ID ของใบสั่งซื้อที่ปฏิเสธแล้ว
   */
  @TryCatch
  async reject(id: string, workflow: Record<string, unknown>, payload: RejectPurchaseOrderDetailDto[]): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'reject',
        id,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      PurchaseOrderService.name,
    );

    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
        po_status: enum_purchase_order_doc_status.in_progress,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found or not in progress', ErrorCode.NOT_FOUND);
    }

    const PODetailDocs = await this.prismaService.tb_purchase_order_detail.findMany({
      where: {
        purchase_order_id: id,
      },
      select: {
        id: true,
        history: true,
      },
    });

    await this.prismaService.$transaction(async (txp) => {
      for (const detail of payload) {
        const findPODoc = PODetailDocs.find((d) => d.id === detail.id);
        if (!findPODoc) {
          continue;
        }

        const history: Record<string, unknown>[] = (findPODoc?.history as unknown as Record<string, unknown>[]) || [];

        history.push({
          seq: history.length + 1,
          action: 'rejected',
          status: detail.stage_status,
          message: detail.stage_message || '',
          user: {
            id: this.userId,
          },
          at: new Date().toISOString(),
        });

        await txp.tb_purchase_order_detail.update({
          where: {
            id: detail.id,
          },
          data: {
            doc_version: { increment: 1 },
            history: history as unknown as Prisma.InputJsonValue,
            updated_by_id: this.userId,
          },
        });
      }

      await txp.tb_purchase_order.update({
        where: {
          id,
        },
        data: {
          ...workflow,
          po_status: enum_purchase_order_doc_status.closed,
          updated_by_id: this.userId,
        },
      });

      return id;
    });

    return Result.ok({ id: purchaseOrder.id });
  }

  /**
   * Review a purchase order and forward it to the next workflow stage
   * ตรวจสอบใบสั่งซื้อและส่งต่อไปยังขั้นตอนการทำงานถัดไป
   * @param id - Purchase order ID / ID ของใบสั่งซื้อ
   * @param workflow - Workflow state data / ข้อมูลสถานะขั้นตอนการทำงาน
   * @param payload - Review detail data for each line / ข้อมูลรายละเอียดการตรวจสอบของแต่ละรายการ
   * @returns Reviewed purchase order ID / ID ของใบสั่งซื้อที่ตรวจสอบแล้ว
   */
  @TryCatch
  async review(id: string, workflow: Record<string, unknown>, payload: ReviewPurchaseOrderDetailDto[]): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'review',
        id,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      PurchaseOrderService.name,
    );

    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
        po_status: enum_purchase_order_doc_status.in_progress,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found or not in progress', ErrorCode.NOT_FOUND);
    }

    const PODetailDocs = await this.prismaService.tb_purchase_order_detail.findMany({
      where: {
        purchase_order_id: id,
      },
      select: {
        id: true,
        history: true,
      },
    });

    await this.prismaService.$transaction(async (txp) => {
      for (const detail of payload) {
        const findPODoc = PODetailDocs.find((d) => d.id === detail.id);
        if (!findPODoc) {
          continue;
        }

        const history: Record<string, unknown>[] = (findPODoc?.history as unknown as Record<string, unknown>[]) || [];

        history.push({
          seq: history.length + 1,
          action: 'reviewed',
          status: detail.stage_status,
          message: detail.stage_message || '',
          user: {
            id: this.userId,
          },
          at: new Date().toISOString(),
        });

        await txp.tb_purchase_order_detail.update({
          where: {
            id: detail.id,
          },
          data: {
            doc_version: { increment: 1 },
            history: history as unknown as Prisma.InputJsonValue,
            updated_by_id: this.userId,
          },
        });
      }

      await txp.tb_purchase_order.update({
        where: {
          id,
        },
        data: {
          ...workflow,
          updated_by_id: this.userId,
        },
      });

      return id;
    });

    return Result.ok({ id: purchaseOrder.id });
  }

  /**
   * Cancel a purchase order and update its status
   * ยกเลิกใบสั่งซื้อและอัปเดตสถานะ
   * @param id - Purchase order ID to cancel / ID ของใบสั่งซื้อที่ต้องการยกเลิก
   * @returns Cancelled purchase order ID / ID ของใบสั่งซื้อที่ยกเลิกแล้ว
   */
  @TryCatch
  async cancel(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'cancel', id, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Find the purchase order with its details
    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
        is_active: true,
        deleted_at: null,
      },
      include: {
        tb_purchase_order_detail: true,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    // Validate status - only allow cancellation from draft, in_progress, or sent
    const allowedStatuses: enum_purchase_order_doc_status[] = [
      enum_purchase_order_doc_status.draft,
      enum_purchase_order_doc_status.in_progress,
      enum_purchase_order_doc_status.sent,
    ];

    if (!allowedStatuses.includes(purchaseOrder.po_status)) {
      return Result.error(
        `Cannot cancel purchase order with status '${purchaseOrder.po_status}'. Only draft, in_progress, or sent orders can be cancelled.`,
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    // Use transaction to update PO and line items
    await this.prismaService.$transaction(async (prismatx) => {
      // Update PO header
      await prismatx.tb_purchase_order.update({
        where: { id: id },
        data: {
          po_status: enum_purchase_order_doc_status.closed,
          last_action_at_date: new Date(),
          last_action_by_id: this.userId,
          updated_by_id: this.userId,
        },
      });

      // Update each line item - set cancelled_qty to remaining qty (order_qty - received_qty)
      for (const detail of purchaseOrder.tb_purchase_order_detail) {
        const orderQty = Number(detail.order_qty) || 0;
        const receivedQty = Number(detail.received_qty) || 0;
        const cancelledQty = orderQty - receivedQty;

        await prismatx.tb_purchase_order_detail.update({
          where: { id: detail.id },
          data: {
            cancelled_qty: cancelledQty,
            updated_by_id: this.userId,
          },
        });
      }
    });

    return Result.ok({ id: id });
  }

  /**
   * Generate a running purchase order number based on date pattern configuration
   * สร้างเลขที่ใบสั่งซื้อแบบเรียงลำดับตามการตั้งค่ารูปแบบวันที่
   * @param orderDate - Order date for pattern generation / วันที่สั่งซื้อสำหรับสร้างรูปแบบ
   * @returns Generated PO number / เลขที่ใบสั่งซื้อที่สร้างแล้ว
   */
  private async generatePONo(orderDate: string): Promise<string> {
    this.logger.debug(
      { function: 'generatePONo', orderDate, tenant_id: this.bu_code, user_id: this.userId },
      PurchaseOrderService.name,
    );

    const pattern = await this.commonLogic.getRunningPattern(
      'PO',
      this.userId,
      this.bu_code,
    );

    const poPatterns = getPattern(pattern);
    let datePattern;
    let runningPattern;

    poPatterns.forEach((p) => {
      if (p.type === 'date') {
        datePattern = p;
      } else if (p.type === 'running') {
        runningPattern = p;
      }
    });

    if (!datePattern || !runningPattern) {
      throw new Error(`Missing running code pattern config for PO: datePattern=${!!datePattern}, runningPattern=${!!runningPattern}`);
    }

    const getDate = new Date(orderDate);
    const datePatternValue = format(getDate, datePattern.pattern);

    const latestPO = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        po_no: {
          contains: `PO${datePatternValue}`,
        },
      },
      orderBy: {
        po_no: 'desc',
      },
    });

    const latestPONumber = latestPO
      ? Number(latestPO.po_no.slice(-Number(runningPattern.pattern)))
      : 0;

    const poNo = await this.commonLogic.generateRunningCode(
      'PO',
      getDate,
      latestPONumber,
      this.userId,
      this.bu_code,
    );

    return poNo;
  }

  /**
   * Group PR details by vendor_id -> delivery_date -> currency_id
   * This is used to prepare data for creating POs from PRs
   */
  /**
   * Group purchase requests by vendor for purchase order creation preview
   * จัดกลุ่มใบขอซื้อตามผู้ขายสำหรับแสดงตัวอย่างก่อนสร้างใบสั่งซื้อ
   * @param pr_ids - Array of purchase request IDs to group / อาร์เรย์ของ ID ใบขอซื้อที่ต้องการจัดกลุ่ม
   * @returns Grouped purchase request data by vendor / ข้อมูลใบขอซื้อที่จัดกลุ่มตามผู้ขาย
   */
  @TryCatch
  async groupPrForPo(pr_ids: string[]): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'groupPrForPo',
        pr_ids,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      PurchaseOrderService.name,
    );

    if (!pr_ids || pr_ids.length === 0) {
      return Result.error('PR IDs are required', ErrorCode.INVALID_ARGUMENT);
    }

    // Fetch PR details with related data based on PR IDs
    const prDetails = await this.prismaService.tb_purchase_request_detail.findMany({
      where: {
        purchase_request_id: { in: pr_ids },
      },
      select: {
        id: true,
        purchase_request_id: true,
        delivery_date: true,
        product_id: true,
        product_name: true,
        vendor_id: true,
        vendor_name: true,
        currency_id: true,
        currency_code: true,
        exchange_rate: true,
        approved_qty: true,
        pricelist_price: true,
        total_price: true,
        base_total_price: true,
        tb_purchase_request: {
          select: {
            id: true,
            pr_no: true,
          },
        },
        tb_vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_currency: {
          select: {
            id: true,
            code: true,
          },
        },
        tb_product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (prDetails.length === 0) {
      return Result.error('No PR details found', ErrorCode.NOT_FOUND);
    }

    // Group by vendor_id -> delivery_date -> currency_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupedData = new Map<string, Record<string, any>>();

    for (const prDetail of prDetails) {
      // Skip if missing required grouping fields
      if (!prDetail.vendor_id || !prDetail.currency_id) {
        continue;
      }

      // Format delivery_date to date string (YYYY-MM-DD)
      const deliveryDateStr = prDetail.delivery_date
        ? format(new Date(prDetail.delivery_date), 'yyyy-MM-dd')
        : '';

      // Create group key: vendor_id|delivery_date|currency_id
      const groupKey = `${prDetail.vendor_id}|${deliveryDateStr}|${prDetail.currency_id}`;

      if (!groupedData.has(groupKey)) {
        groupedData.set(groupKey, {
          vendor_id: prDetail.vendor_id,
          delivery_date: deliveryDateStr,
          vendor_name: prDetail.vendor_name || prDetail.tb_vendor?.name || '',
          currency_id: prDetail.currency_id,
          currency_code: prDetail.currency_code || prDetail.tb_currency?.code || '',
          exchange_rate: Number(prDetail.exchange_rate) || 1,
          total_price: 0,
          base_price: 0,
          products: [],
          pr_set: new Set<string>(),
        });
      }

      const group = groupedData.get(groupKey);

      // Add product to the group
      group.products.push({
        product_id: prDetail.product_id || '',
        product_name: prDetail.product_name || prDetail.tb_product?.name || '',
        qty: Number(prDetail.approved_qty) || 0,
        price_per_unit: Number(prDetail.pricelist_price) || 0,
        total: Number(prDetail.total_price) || 0,
        base_total_price: Number(prDetail.base_total_price) || 0,
      });

      // Update totals
      group.total_price += Number(prDetail.total_price) || 0;
      group.base_price += Number(prDetail.base_total_price) || 0;

      // Track PR numbers
      const prNo = prDetail.tb_purchase_request?.pr_no;
      if (prNo) {
        group.pr_set.add(prNo);
      }
    }

    // Convert Map to array and add draft PO numbers
    const result: Record<string, unknown>[] = [];
    let draftCounter = 1;

    // Sort groups by vendor_name, then delivery_date
    const sortedGroups = Array.from(groupedData.values()).sort((a, b) => {
      const vendorCompare = (a.vendor_name || '').localeCompare(b.vendor_name || '');
      if (vendorCompare !== 0) return vendorCompare;
      return (a.delivery_date || '').localeCompare(b.delivery_date || '');
    });

    for (const group of sortedGroups) {
      // Convert pr_set to sorted array and remove from result
      const prArray = Array.from(group.pr_set).sort();
      delete group.pr_set;
      delete group.vendor_id;
      delete group.currency_id;

      result.push({
        po_no: `#${String(draftCounter).padStart(2, '0')}`,
        delivery_date: group.delivery_date,
        vendor_name: group.vendor_name,
        currency_code: group.currency_code,
        exchange_rate: group.exchange_rate,
        total_price: group.total_price,
        base_price: group.base_price,
        products: group.products,
        pr: prArray,
      });

      draftCounter++;
    }

    return Result.ok(result);
  }

  /**
   * Confirm PR and create PO(s)
   * Groups PR details by vendor_id -> delivery_date -> currency_id and creates POs
   */
  /**
   * Confirm and convert purchase requests into purchase orders, grouped by vendor
   * ยืนยันและแปลงใบขอซื้อเป็นใบสั่งซื้อ จัดกลุ่มตามผู้ขาย
   * @param pr_ids - Array of purchase request IDs to confirm / อาร์เรย์ของ ID ใบขอซื้อที่ต้องการยืนยัน
   * @returns Created purchase order IDs / ID ของใบสั่งซื้อที่สร้างแล้ว
   */
  @TryCatch
  async confirmPrToPo(pr_ids: string[]): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'confirmPrToPo',
        pr_ids,
        user_id: this.userId,
        tenant_id: this.bu_code,
      },
      PurchaseOrderService.name,
    );

    if (!pr_ids || pr_ids.length === 0) {
      return Result.error('PR IDs are required', ErrorCode.INVALID_ARGUMENT);
    }

    // Fetch PR details with related data based on PR IDs
    const prDetails = await this.prismaService.tb_purchase_request_detail.findMany({
      where: {
        purchase_request_id: { in: pr_ids },
      },
      select: {
        id: true,
        purchase_request_id: true,
        sequence_no: true,
        delivery_date: true,
        location_id: true,
        location_code: true,
        location_name: true,
        delivery_point_id: true,
        delivery_point_name: true,
        product_id: true,
        product_name: true,
        product_local_name: true,
        inventory_unit_id: true,
        inventory_unit_name: true,
        description: true,
        vendor_id: true,
        vendor_name: true,
        pricelist_detail_id: true,
        pricelist_no: true,
        pricelist_unit: true,
        pricelist_price: true,
        currency_id: true,
        currency_code: true,
        exchange_rate: true,
        approved_qty: true,
        approved_unit_id: true,
        approved_unit_name: true,
        approved_unit_conversion_factor: true,
        approved_base_qty: true,
        tax_profile_id: true,
        tax_profile_name: true,
        tax_rate: true,
        tax_amount: true,
        base_tax_amount: true,
        is_tax_adjustment: true,
        discount_rate: true,
        discount_amount: true,
        base_discount_amount: true,
        is_discount_adjustment: true,
        sub_total_price: true,
        net_amount: true,
        total_price: true,
        base_price: true,
        base_sub_total_price: true,
        base_net_amount: true,
        base_total_price: true,
        foc_qty: true,
        tb_purchase_request: {
          select: {
            id: true,
            pr_no: true,
          },
        },
        tb_vendor: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        tb_currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
      },
    });

    if (prDetails.length === 0) {
      return Result.error('No PR details found', ErrorCode.NOT_FOUND);
    }

    // Group by vendor_id -> delivery_date -> currency_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupedData = new Map<string, Record<string, any>>();

    for (const prDetail of prDetails) {
      if (!prDetail.vendor_id || !prDetail.currency_id) {
        continue;
      }

      const deliveryDateStr = prDetail.delivery_date
        ? format(new Date(prDetail.delivery_date), 'yyyy-MM-dd')
        : 'no-date';

      const groupKey = `${prDetail.vendor_id}|${deliveryDateStr}|${prDetail.currency_id}`;

      if (!groupedData.has(groupKey)) {
        // Ensure delivery_date is a valid Date object
        let deliveryDate: Date | null = null;
        if (prDetail.delivery_date) {
          deliveryDate = prDetail.delivery_date instanceof Date
            ? prDetail.delivery_date
            : new Date(prDetail.delivery_date);
        }

        groupedData.set(groupKey, {
          vendor_id: prDetail.vendor_id,
          vendor_name: prDetail.vendor_name || prDetail.tb_vendor?.name,
          delivery_date: deliveryDate,
          currency_id: prDetail.currency_id,
          currency_code: prDetail.currency_code || prDetail.tb_currency?.code,
          exchange_rate: Number(prDetail.exchange_rate) || 1,
          items: [],
          total_qty: 0,
          total_price: 0,
          total_tax: 0,
          total_amount: 0,
        });
      }

      const group = groupedData.get(groupKey);

      // Find existing item with same product_id
      const existingItem = group.items.find(
        (item) => item.product_id === prDetail.product_id,
      );

      if (existingItem) {
        existingItem.pr_details.push({
          pr_detail_id: prDetail.id,
          pr_id: prDetail.purchase_request_id,
          pr_no: prDetail.tb_purchase_request?.pr_no,
          order_qty: Number(prDetail.approved_qty) || 0,
          order_unit_id: prDetail.approved_unit_id,
          order_unit_name: prDetail.approved_unit_name,
          order_unit_conversion_factor: Number(prDetail.approved_unit_conversion_factor) || 1,
          order_base_qty: Number(prDetail.approved_base_qty) || 0,
          location_id: prDetail.location_id,
          location_name: prDetail.location_name,
        });

        existingItem.order_qty += Number(prDetail.approved_qty) || 0;
        existingItem.base_qty += Number(prDetail.approved_base_qty) || 0;
        existingItem.sub_total_price += Number(prDetail.sub_total_price) || 0;
        existingItem.tax_amount += Number(prDetail.tax_amount) || 0;
        existingItem.total_price += Number(prDetail.total_price) || 0;
      } else {
        group.items.push({
          sequence: group.items.length + 1,
          product_id: prDetail.product_id,
          product_name: prDetail.product_name,
          product_local_name: prDetail.product_local_name,
          order_unit_id: prDetail.approved_unit_id,
          order_unit_name: prDetail.approved_unit_name,
          order_unit_conversion_factor: Number(prDetail.approved_unit_conversion_factor) || 1,
          order_qty: Number(prDetail.approved_qty) || 0,
          base_unit_id: prDetail.inventory_unit_id,
          base_unit_name: prDetail.inventory_unit_name,
          base_qty: Number(prDetail.approved_base_qty) || 0,
          price: Number(prDetail.pricelist_price) || 0,
          sub_total_price: Number(prDetail.sub_total_price) || 0,
          net_amount: Number(prDetail.net_amount) || 0,
          total_price: Number(prDetail.total_price) || 0,
          tax_profile_id: prDetail.tax_profile_id,
          tax_profile_name: prDetail.tax_profile_name,
          tax_rate: Number(prDetail.tax_rate) || 0,
          tax_amount: Number(prDetail.tax_amount) || 0,
          is_tax_adjustment: prDetail.is_tax_adjustment || false,
          discount_rate: Number(prDetail.discount_rate) || 0,
          discount_amount: Number(prDetail.discount_amount) || 0,
          is_discount_adjustment: prDetail.is_discount_adjustment || false,
          is_foc: (Number(prDetail.foc_qty) || 0) > 0,
          pricelist_detail_id: prDetail.pricelist_detail_id,
          pricelist_no: prDetail.pricelist_no,
          pr_details: [
            {
              pr_detail_id: prDetail.id,
              pr_id: prDetail.purchase_request_id,
              pr_no: prDetail.tb_purchase_request?.pr_no,
              order_qty: Number(prDetail.approved_qty) || 0,
              order_unit_id: prDetail.approved_unit_id,
              order_unit_name: prDetail.approved_unit_name,
              order_unit_conversion_factor: Number(prDetail.approved_unit_conversion_factor) || 1,
              order_base_qty: Number(prDetail.approved_base_qty) || 0,
              location_id: prDetail.location_id,
              location_name: prDetail.location_name,
            },
          ],
        });
      }

      group.total_qty += Number(prDetail.approved_qty) || 0;
      group.total_price += Number(prDetail.sub_total_price) || 0;
      group.total_tax += Number(prDetail.tax_amount) || 0;
      group.total_amount += Number(prDetail.total_price) || 0;
    }

    const groups = Array.from(groupedData.values());

    if (groups.length === 0) {
      return Result.error('No valid PR details found for PO creation (missing vendor or currency)', ErrorCode.INVALID_ARGUMENT);
    }

    // Create POs from grouped data
    const createdPOs: Record<string, unknown>[] = [];

    await this.prismaService.$transaction(async (prismatx) => {
      for (const group of groups) {
        // Generate PO number
        const orderDate = new Date();
        const poNo = await this.generatePONo(orderDate.toISOString());

        // Create PO header
        const po = await prismatx.tb_purchase_order.create({
          data: {
            po_no: poNo,
            po_status: enum_purchase_order_doc_status.draft,
            description: `PO from PR confirmation`,
            order_date: orderDate.toISOString(),
            delivery_date: group.delivery_date instanceof Date ? group.delivery_date.toISOString() : orderDate.toISOString(),
            vendor_id: group.vendor_id,
            vendor_name: group.vendor_name,
            currency_id: group.currency_id,
            currency_code: group.currency_code,
            exchange_rate: group.exchange_rate,
            total_qty: group.total_qty,
            total_price: group.total_price,
            total_tax: group.total_tax,
            total_amount: group.total_amount,
            is_active: true,
            doc_version: 1,
            created_by_id: this.userId,
          },
        });

        // Create PO details
        for (const item of group.items) {
          const poDetail = await prismatx.tb_purchase_order_detail.create({
            data: {
              purchase_order_id: po.id,
              sequence_no: item.sequence,
              description: item.product_name,
              order_qty: item.order_qty,
              order_unit_id: item.order_unit_id || undefined,
              order_unit_name: item.order_unit_name,
              order_unit_conversion_factor: item.order_unit_conversion_factor,
              base_qty: item.base_qty,
              base_unit_id: item.base_unit_id || undefined,
              base_unit_name: item.base_unit_name,
              is_foc: item.is_foc || false,
              price: item.price,
              sub_total_price: item.sub_total_price,
              net_amount: item.net_amount,
              total_price: item.total_price,
              tax_profile_id: item.tax_profile_id || undefined,
              tax_profile_name: item.tax_profile_name,
              tax_rate: item.tax_rate,
              tax_amount: item.tax_amount,
              is_tax_adjustment: item.is_tax_adjustment,
              discount_rate: item.discount_rate,
              discount_amount: item.discount_amount,
              is_discount_adjustment: item.is_discount_adjustment,
              info: {
                product_id: item.product_id,
                product_name: item.product_name,
                product_local_name: item.product_local_name,
                pricelist_detail_id: item.pricelist_detail_id,
                pricelist_no: item.pricelist_no,
              },
              is_active: true,
              doc_version: 1,
              created_by_id: this.userId,
            },
          });

          // Create PR detail linkages
          for (const prDetail of item.pr_details) {
            // Skip if required fields are missing
            if (!prDetail.pr_detail_id || !prDetail.order_unit_id) {
              continue;
            }
            await prismatx.tb_purchase_order_detail_tb_purchase_request_detail.create({
              data: {
                po_detail_id: poDetail.id,
                pr_detail_id: prDetail.pr_detail_id,
                pr_detail_order_unit_id: prDetail.order_unit_id,
                pr_detail_order_unit_name: prDetail.order_unit_name || '',
                pr_detail_qty: prDetail.order_qty,
                pr_detail_base_qty: prDetail.order_base_qty,
                pr_detail_base_unit_id: prDetail.order_base_unit_id || undefined,
                pr_detail_base_unit_name: prDetail.order_base_unit_name,
                created_by_id: this.userId,
              },
            });
          }
        }

        createdPOs.push({
          id: po.id,
          po_no: po.po_no,
          vendor_id: po.vendor_id,
          vendor_name: po.vendor_name,
          delivery_date: po.delivery_date,
          currency_id: po.currency_id,
          currency_code: po.currency_code,
          total_qty: Number(po.total_qty),
          total_price: Number(po.total_price),
          total_tax: Number(po.total_tax),
          total_amount: Number(po.total_amount),
          items_count: group.items.length,
        });
      }

      // Update PR status to completed after creating all POs
      await prismatx.tb_purchase_request.updateMany({
        where: {
          id: { in: pr_ids },
        },
        data: {
          pr_status: enum_purchase_request_doc_status.completed,
          updated_by_id: this.userId,
          updated_at: new Date(),
        },
      });
    });

    // Send notifications for PO creation from PR confirmation
    this.sendPOFromPRNotification(createdPOs, prDetails);

    return Result.ok({
      purchase_orders: createdPOs,
      summary: {
        total_pos_created: createdPOs.length,
        total_prs_processed: pr_ids.length,
        total_pr_details_processed: prDetails.length,
      },
    });
  }

  /**
   * Send notification when PO is created
   */
  /**
   * Send a notification when a new purchase order is created
   * ส่งการแจ้งเตือนเมื่อสร้างใบสั่งซื้อใหม่
   */
  private async sendPOCreatedNotification(
    purchaseOrder: Record<string, unknown>,
    data: ICreatePurchaseOrder,
  ): Promise<void> {
    try {
      const poNo = purchaseOrder.po_no;
      const buyerId = data.buyer_id;

      // Notify buyer if specified
      if (buyerId) {
        await this.notificationService.sendPONotification(
          buyerId,
          `Purchase Order Created: ${poNo}`,
          `A new Purchase Order ${poNo} has been created for vendor ${data.vendor_name || 'N/A'}.`,
          {
            po_id: purchaseOrder.id,
            po_no: poNo,
            vendor_id: data.vendor_id,
            vendor_name: data.vendor_name,
            action: 'created',
          },
          this.userId,
        );
      }

      this.logger.log(`Notification sent for PO ${poNo} creation`);
    } catch (error) {
      this.logger.error('Failed to send PO created notification:', error);
    }
  }

  /**
   * Send notification when POs are created from PR confirmation
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Send a notification when purchase orders are created from purchase requests
   * ส่งการแจ้งเตือนเมื่อสร้างใบสั่งซื้อจากใบขอซื้อ
   */
  private async sendPOFromPRNotification(
    createdPOs: any[],
    prDetails: any[],
  ): Promise<void> {
    try {
      // Collect unique PR requestor IDs
      const prRequestorMap = new Map<string, Set<string>>();

      for (const prDetail of prDetails) {
        const prId = prDetail.purchase_request_id;
        const prNo = prDetail.tb_purchase_request?.pr_no;

        if (prId && prNo) {
          if (!prRequestorMap.has(prId)) {
            prRequestorMap.set(prId, new Set());
          }
        }
      }

      // Get PR requestors from database
      const prIds = Array.from(prRequestorMap.keys());
      if (prIds.length > 0) {
        const prs = await this.prismaService.tb_purchase_request.findMany({
          where: { id: { in: prIds } },
          select: {
            id: true,
            pr_no: true,
            requestor_id: true,
            requestor_name: true,
          },
        });

        // Notify each PR requestor
        const notifiedUsers = new Set<string>();
        for (const pr of prs) {
          if (pr.requestor_id && !notifiedUsers.has(pr.requestor_id)) {
            notifiedUsers.add(pr.requestor_id);

            const poNumbers = createdPOs.map((po) => po.po_no).join(', ');

            await this.notificationService.sendPONotification(
              pr.requestor_id,
              `Purchase Orders Created from PR: ${pr.pr_no}`,
              `${createdPOs.length} Purchase Order(s) have been created from your Purchase Request ${pr.pr_no}: ${poNumbers}`,
              {
                pr_id: pr.id,
                pr_no: pr.pr_no,
                po_ids: createdPOs.map((po) => po.id),
                po_numbers: createdPOs.map((po) => po.po_no),
                action: 'pr_to_po_confirmed',
              },
              this.userId,
            );
          }
        }

        this.logger.log(
          `Notification sent to ${notifiedUsers.size} requestor(s) for ${createdPOs.length} PO(s) creation`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to send PO from PR notification:', error);
    }
  }

  /**
   * Export Purchase Order to Excel format
   */
  /**
   * Export a purchase order to Excel spreadsheet format
   * ส่งออกใบสั่งซื้อเป็นไฟล์สเปรดชีต Excel
   * @param id - Purchase order ID to export / ID ของใบสั่งซื้อที่ต้องการส่งออก
   * @returns Excel file buffer and filename / บัฟเฟอร์ไฟล์ Excel และชื่อไฟล์
   */
  @TryCatch
  async exportToExcel(id: string): Promise<Result<{ buffer: Buffer; filename: string }>> {
    this.logger.debug(
      { function: 'exportToExcel', id, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Fetch the purchase order with all details
    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        po_no: true,
        po_status: true,
        description: true,
        order_date: true,
        delivery_date: true,
        vendor_id: true,
        vendor_name: true,
        currency_id: true,
        currency_code: true,
        exchange_rate: true,
        approval_date: true,
        email: true,
        buyer_id: true,
        buyer_name: true,
        credit_term_id: true,
        credit_term_name: true,
        credit_term_value: true,
        remarks: true,
        total_qty: true,
        total_price: true,
        total_tax: true,
        total_amount: true,
        note: true,
        created_at: true,
        tb_vendor: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        tb_currency_tb_purchase_order_currency_idTotb_currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        tb_credit_term: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        tb_purchase_order_detail: {
          select: {
            id: true,
            sequence_no: true,
            description: true,
            order_qty: true,
            order_unit_id: true,
            order_unit_name: true,
            base_qty: true,
            base_unit_id: true,
            base_unit_name: true,
            is_foc: true,
            tax_profile_id: true,
            tax_profile_name: true,
            tax_rate: true,
            tax_amount: true,
            discount_rate: true,
            discount_amount: true,
            price: true,
            sub_total_price: true,
            net_amount: true,
            total_price: true,
            received_qty: true,
            cancelled_qty: true,
            note: true,
            info: true,
          },
          orderBy: {
            sequence_no: 'asc',
          },
        },
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Carmen System';
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet('Purchase Order');

    // Define header styles
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const titleStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    };

    const labelStyle: Partial<ExcelJS.Style> = {
      font: { bold: true },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      },
    };

    // Set column widths
    worksheet.columns = [
      { width: 5 },   // A - No.
      { width: 35 },  // B - Description/Product
      { width: 12 },  // C - Qty
      { width: 12 },  // D - Unit
      { width: 15 },  // E - Unit Price
      { width: 15 },  // F - Sub Total
      { width: 12 },  // G - Tax %
      { width: 15 },  // H - Tax Amount
      { width: 15 },  // I - Total
    ];

    // Add title
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'PURCHASE ORDER';
    titleCell.style = titleStyle;
    worksheet.getRow(1).height = 30;

    // Add PO header information
    let currentRow = 3;

    // PO Number and Status
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'PO Number:';
    worksheet.getCell(`A${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = purchaseOrder.po_no || '';

    worksheet.getCell(`F${currentRow}`).value = 'Status:';
    worksheet.getCell(`F${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
    worksheet.getCell(`G${currentRow}`).value = purchaseOrder.po_status || '';

    currentRow++;

    // Vendor and Order Date
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Vendor:';
    worksheet.getCell(`A${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = purchaseOrder.vendor_name || purchaseOrder.tb_vendor?.name || '';

    worksheet.getCell(`F${currentRow}`).value = 'Order Date:';
    worksheet.getCell(`F${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
    worksheet.getCell(`G${currentRow}`).value = purchaseOrder.order_date
      ? format(new Date(purchaseOrder.order_date), 'dd/MM/yyyy')
      : '';

    currentRow++;

    // Currency and Delivery Date
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Currency:';
    worksheet.getCell(`A${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
    const currency = purchaseOrder.tb_currency_tb_purchase_order_currency_idTotb_currency;
    worksheet.getCell(`C${currentRow}`).value = currency
      ? `${currency.name} (${currency.code})`
      : purchaseOrder.currency_code || '';

    worksheet.getCell(`F${currentRow}`).value = 'Delivery Date:';
    worksheet.getCell(`F${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
    worksheet.getCell(`G${currentRow}`).value = purchaseOrder.delivery_date
      ? format(new Date(purchaseOrder.delivery_date), 'dd/MM/yyyy')
      : '';

    currentRow++;

    // Buyer and Credit Term
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'Buyer:';
    worksheet.getCell(`A${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`C${currentRow}:E${currentRow}`);
    worksheet.getCell(`C${currentRow}`).value = purchaseOrder.buyer_name || '';

    worksheet.getCell(`F${currentRow}`).value = 'Credit Term:';
    worksheet.getCell(`F${currentRow}`).style = labelStyle;
    worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
    worksheet.getCell(`G${currentRow}`).value = purchaseOrder.credit_term_name || '';

    currentRow++;

    // Description
    if (purchaseOrder.description) {
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'Description:';
      worksheet.getCell(`A${currentRow}`).style = labelStyle;
      worksheet.mergeCells(`C${currentRow}:I${currentRow}`);
      worksheet.getCell(`C${currentRow}`).value = purchaseOrder.description;
      currentRow++;
    }

    // Add empty row before details
    currentRow++;

    // Add detail table header
    const headerRow = currentRow;
    const headers = ['No.', 'Description', 'Qty', 'Unit', 'Unit Price', 'Sub Total', 'Tax %', 'Tax Amount', 'Total'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(headerRow, index + 1);
      cell.value = header;
      cell.style = headerStyle;
    });
    worksheet.getRow(headerRow).height = 25;

    currentRow++;

    // Add detail rows
    const currencySymbol = currency?.symbol || '';
    purchaseOrder.tb_purchase_order_detail.forEach((detail, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const info = detail.info as any;
      const productName = info?.product_name || detail.description || '';

      worksheet.getCell(currentRow, 1).value = index + 1;
      worksheet.getCell(currentRow, 1).alignment = { horizontal: 'center' };

      worksheet.getCell(currentRow, 2).value = productName;

      worksheet.getCell(currentRow, 3).value = Number(detail.order_qty) || 0;
      worksheet.getCell(currentRow, 3).numFmt = '#,##0.00';
      worksheet.getCell(currentRow, 3).alignment = { horizontal: 'right' };

      worksheet.getCell(currentRow, 4).value = detail.order_unit_name || '';
      worksheet.getCell(currentRow, 4).alignment = { horizontal: 'center' };

      worksheet.getCell(currentRow, 5).value = Number(detail.price) || 0;
      worksheet.getCell(currentRow, 5).numFmt = '#,##0.00';
      worksheet.getCell(currentRow, 5).alignment = { horizontal: 'right' };

      worksheet.getCell(currentRow, 6).value = Number(detail.sub_total_price) || 0;
      worksheet.getCell(currentRow, 6).numFmt = '#,##0.00';
      worksheet.getCell(currentRow, 6).alignment = { horizontal: 'right' };

      worksheet.getCell(currentRow, 7).value = Number(detail.tax_rate) || 0;
      worksheet.getCell(currentRow, 7).numFmt = '0.00%';
      worksheet.getCell(currentRow, 7).alignment = { horizontal: 'right' };

      worksheet.getCell(currentRow, 8).value = Number(detail.tax_amount) || 0;
      worksheet.getCell(currentRow, 8).numFmt = '#,##0.00';
      worksheet.getCell(currentRow, 8).alignment = { horizontal: 'right' };

      worksheet.getCell(currentRow, 9).value = Number(detail.total_price) || 0;
      worksheet.getCell(currentRow, 9).numFmt = '#,##0.00';
      worksheet.getCell(currentRow, 9).alignment = { horizontal: 'right' };

      // Add borders to detail rows
      for (let col = 1; col <= 9; col++) {
        worksheet.getCell(currentRow, col).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }

      currentRow++;
    });

    // Add totals section
    currentRow++;

    // Sub Total
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.getCell(`H${currentRow}`).value = 'Sub Total:';
    worksheet.getCell(`H${currentRow}`).style = labelStyle;
    worksheet.getCell(`H${currentRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`I${currentRow}`).value = Number(purchaseOrder.total_price) || 0;
    worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
    worksheet.getCell(`I${currentRow}`).alignment = { horizontal: 'right' };

    currentRow++;

    // Total Tax
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.getCell(`H${currentRow}`).value = 'Total Tax:';
    worksheet.getCell(`H${currentRow}`).style = labelStyle;
    worksheet.getCell(`H${currentRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`I${currentRow}`).value = Number(purchaseOrder.total_tax) || 0;
    worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
    worksheet.getCell(`I${currentRow}`).alignment = { horizontal: 'right' };

    currentRow++;

    // Grand Total
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    worksheet.getCell(`H${currentRow}`).value = 'Grand Total:';
    worksheet.getCell(`H${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`H${currentRow}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getCell(`H${currentRow}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell(`H${currentRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`I${currentRow}`).value = Number(purchaseOrder.total_amount) || 0;
    worksheet.getCell(`I${currentRow}`).numFmt = '#,##0.00';
    worksheet.getCell(`I${currentRow}`).font = { bold: true };
    worksheet.getCell(`I${currentRow}`).alignment = { horizontal: 'right' };

    // Add remarks if present
    if (purchaseOrder.remarks) {
      currentRow += 2;
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      worksheet.getCell(`A${currentRow}`).value = 'Remarks:';
      worksheet.getCell(`A${currentRow}`).style = labelStyle;
      worksheet.mergeCells(`C${currentRow}:I${currentRow}`);
      worksheet.getCell(`C${currentRow}`).value = purchaseOrder.remarks;
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename
    const poNo = purchaseOrder.po_no?.replace(/[^a-zA-Z0-9]/g, '_') || 'PO';
    const dateStr = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `${poNo}_${dateStr}.xlsx`;

    return Result.ok({
      buffer: Buffer.from(buffer),
      filename,
    });
  }

  /**
   * Print Purchase Order to PDF format
   */
  /**
   * Print a purchase order to PDF format
   * พิมพ์ใบสั่งซื้อเป็นไฟล์ PDF
   * @param id - Purchase order ID to print / ID ของใบสั่งซื้อที่ต้องการพิมพ์
   * @returns PDF file buffer and filename / บัฟเฟอร์ไฟล์ PDF และชื่อไฟล์
   */
  @TryCatch
  async printToPdf(id: string): Promise<Result<{ buffer: Buffer; filename: string }>> {
    this.logger.debug(
      { function: 'printToPdf', id, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Fetch the purchase order with all details
    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
      },
      select: {
        id: true,
        po_no: true,
        po_status: true,
        description: true,
        order_date: true,
        delivery_date: true,
        vendor_id: true,
        vendor_name: true,
        currency_id: true,
        currency_code: true,
        exchange_rate: true,
        approval_date: true,
        email: true,
        buyer_id: true,
        buyer_name: true,
        credit_term_id: true,
        credit_term_name: true,
        credit_term_value: true,
        remarks: true,
        total_qty: true,
        total_price: true,
        total_tax: true,
        total_amount: true,
        note: true,
        created_at: true,
        tb_vendor: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        tb_currency_tb_purchase_order_currency_idTotb_currency: {
          select: {
            id: true,
            name: true,
            code: true,
            symbol: true,
          },
        },
        tb_credit_term: {
          select: {
            id: true,
            name: true,
            value: true,
          },
        },
        tb_purchase_order_detail: {
          select: {
            id: true,
            sequence_no: true,
            description: true,
            order_qty: true,
            order_unit_id: true,
            order_unit_name: true,
            base_qty: true,
            base_unit_id: true,
            base_unit_name: true,
            is_foc: true,
            tax_profile_id: true,
            tax_profile_name: true,
            tax_rate: true,
            tax_amount: true,
            discount_rate: true,
            discount_amount: true,
            price: true,
            sub_total_price: true,
            net_amount: true,
            total_price: true,
            received_qty: true,
            cancelled_qty: true,
            note: true,
            info: true,
          },
          orderBy: {
            sequence_no: 'asc',
          },
        },
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    const currency = purchaseOrder.tb_currency_tb_purchase_order_currency_idTotb_currency;
    const currencySymbol = currency?.symbol || '';
    const currencyCode = currency?.code || purchaseOrder.currency_code || '';

    // Format number with thousand separator
    const formatNumber = (num: number): string => {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Build detail table rows
    const tableBody: TableCell[][] = [
      // Header row
      [
        { text: 'No.', style: 'tableHeader', alignment: 'center' },
        { text: 'Description', style: 'tableHeader' },
        { text: 'Qty', style: 'tableHeader', alignment: 'right' },
        { text: 'Unit', style: 'tableHeader', alignment: 'center' },
        { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
        { text: 'Tax %', style: 'tableHeader', alignment: 'right' },
        { text: 'Total', style: 'tableHeader', alignment: 'right' },
      ],
    ];

    // Add detail rows
    purchaseOrder.tb_purchase_order_detail.forEach((detail, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const info = detail.info as any;
      const productName = info?.product_name || detail.description || '';

      tableBody.push([
        { text: (index + 1).toString(), alignment: 'center' },
        { text: productName },
        { text: formatNumber(Number(detail.order_qty) || 0), alignment: 'right' },
        { text: detail.order_unit_name || '', alignment: 'center' },
        { text: formatNumber(Number(detail.price) || 0), alignment: 'right' },
        { text: `${Number(detail.tax_rate) || 0}%`, alignment: 'right' },
        { text: formatNumber(Number(detail.total_price) || 0), alignment: 'right' },
      ]);
    });

    // Build document definition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // Title
        {
          text: 'PURCHASE ORDER',
          style: 'title',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // Header info - two columns
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: [{ text: 'PO Number: ', bold: true }, purchaseOrder.po_no || ''] },
                { text: [{ text: 'Vendor: ', bold: true }, purchaseOrder.vendor_name || purchaseOrder.tb_vendor?.name || ''] },
                { text: [{ text: 'Currency: ', bold: true }, currencyCode] },
                { text: [{ text: 'Buyer: ', bold: true }, purchaseOrder.buyer_name || ''] },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: [{ text: 'Status: ', bold: true }, purchaseOrder.po_status || ''] },
                { text: [{ text: 'Order Date: ', bold: true }, purchaseOrder.order_date ? format(new Date(purchaseOrder.order_date), 'dd/MM/yyyy') : ''] },
                { text: [{ text: 'Delivery Date: ', bold: true }, purchaseOrder.delivery_date ? format(new Date(purchaseOrder.delivery_date), 'dd/MM/yyyy') : ''] },
                { text: [{ text: 'Credit Term: ', bold: true }, purchaseOrder.credit_term_name || ''] },
              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },

        // Description
        ...(purchaseOrder.description
          ? [
            {
              text: [{ text: 'Description: ', bold: true }, purchaseOrder.description],
              margin: [0, 0, 0, 15] as [number, number, number, number],
            } as Content,
          ]
          : []),

        // Detail table
        {
          table: {
            headerRows: 1,
            widths: [30, '*', 50, 40, 70, 40, 70],
            body: tableBody,
          },
          layout: {
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table?.body?.length) ? 1 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#aaaaaa',
            vLineColor: () => '#aaaaaa',
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#4472C4' : null),
          },
          margin: [0, 0, 0, 15],
        } as any,

        // Totals
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 200,
              table: {
                widths: ['*', 80],
                body: [
                  [
                    { text: 'Sub Total:', alignment: 'right', bold: true },
                    { text: `${currencySymbol} ${formatNumber(Number(purchaseOrder.total_price) || 0)}`, alignment: 'right' },
                  ],
                  [
                    { text: 'Total Tax:', alignment: 'right', bold: true },
                    { text: `${currencySymbol} ${formatNumber(Number(purchaseOrder.total_tax) || 0)}`, alignment: 'right' },
                  ],
                  [
                    { text: 'Grand Total:', alignment: 'right', bold: true, fillColor: '#4472C4', color: 'white' },
                    { text: `${currencySymbol} ${formatNumber(Number(purchaseOrder.total_amount) || 0)}`, alignment: 'right', bold: true, fillColor: '#4472C4', color: 'white' },
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0.5,
                hLineColor: () => '#aaaaaa',
                vLineColor: () => '#aaaaaa',
              },
            },
          ],
        } as any,

        // Remarks
        ...(purchaseOrder.remarks
          ? [
            {
              text: [{ text: 'Remarks: ', bold: true }, purchaseOrder.remarks],
              margin: [0, 20, 0, 0] as [number, number, number, number],
            } as Content,
          ]
          : []),
      ],

      styles: {
        title: {
          fontSize: 18,
          bold: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
        },
      },

      defaultStyle: {
        fontSize: 10,
      },
    };

    // Generate PDF buffer
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      try {
        // Use pdfmake's createPdf with virtual file system
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const PdfMake = require('pdfmake/build/pdfmake');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const vfsFonts = require('pdfmake/build/vfs_fonts');
        PdfMake.vfs = vfsFonts.pdfMake ? vfsFonts.pdfMake.vfs : vfsFonts.vfs;

        const pdfDocGenerator = PdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        });
      } catch (error) {
        reject(error);
      }
    });

    // Generate filename
    const poNo = purchaseOrder.po_no?.replace(/[^a-zA-Z0-9]/g, '_') || 'PO';
    const dateStr = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `${poNo}_${dateStr}.pdf`;

    return Result.ok({
      buffer: pdfBuffer,
      filename,
    });
  }

  // ==================== Purchase Order Detail CRUD ====================

  /**
   * Get a single Purchase Order Detail by ID
   */
  /**
   * Find a purchase order detail line by its ID
   * ค้นหารายละเอียดใบสั่งซื้อรายการเดียวตาม ID
   * @param detailId - Detail line ID / ID ของรายการรายละเอียด
   * @returns Purchase order detail data / ข้อมูลรายละเอียดใบสั่งซื้อ
   */
  @TryCatch
  async findDetailById(detailId: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findDetailById', detailId, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    const detail = await this.prismaService.tb_purchase_order_detail.findFirst({
      where: {
        id: detailId,
        deleted_at: null,
      },
      include: {
        tb_purchase_order: {
          select: {
            id: true,
            po_no: true,
            po_status: true,
            vendor_name: true,
            currency_code: true,
          },
        },
        tb_unit_tb_purchase_order_detail_order_unit_idTotb_unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_unit_tb_purchase_order_detail_base_unit_idTotb_unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_tax_profile: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_purchase_order_detail_tb_purchase_request_detail: {
          select: {
            id: true,
            pr_detail_id: true,
            pr_detail_qty: true,
            pr_detail_order_unit_id: true,
            pr_detail_order_unit_name: true,
          },
        },
      },
    });

    if (!detail) {
      return Result.error('Purchase order detail not found', ErrorCode.NOT_FOUND);
    }

    // Convert decimal fields to numbers
    const result = {
      ...detail,
      order_qty: Number(detail.order_qty),
      order_unit_conversion_factor: Number(detail.order_unit_conversion_factor),
      base_qty: Number(detail.base_qty),
      price: Number(detail.price),
      sub_total_price: Number(detail.sub_total_price),
      net_amount: Number(detail.net_amount),
      total_price: Number(detail.total_price),
      base_price: Number(detail.base_price),
      base_sub_total_price: Number(detail.base_sub_total_price),
      base_net_amount: Number(detail.base_net_amount),
      base_total_price: Number(detail.base_total_price),
      tax_rate: Number(detail.tax_rate),
      tax_amount: Number(detail.tax_amount),
      base_tax_amount: Number(detail.base_tax_amount),
      discount_rate: Number(detail.discount_rate),
      discount_amount: Number(detail.discount_amount),
      base_discount_amount: Number(detail.base_discount_amount),
      received_qty: Number(detail.received_qty),
      cancelled_qty: Number(detail.cancelled_qty),
    };

    return Result.ok(result);
  }

  /**
   * Get all Purchase Order Details by Purchase Order ID
   */
  /**
   * Find all detail lines for a specific purchase order
   * ค้นหารายละเอียดทั้งหมดของใบสั่งซื้อที่ระบุ
   * @param purchaseOrderId - Purchase order ID / ID ของใบสั่งซื้อ
   * @returns List of purchase order details / รายการรายละเอียดใบสั่งซื้อ
   */
  @TryCatch
  async findDetailsByPurchaseOrderId(purchaseOrderId: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findDetailsByPurchaseOrderId', purchaseOrderId, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Verify PO exists
    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: purchaseOrderId,
        deleted_at: null,
      },
      select: {
        id: true,
        po_no: true,
        po_status: true,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    const details = await this.prismaService.tb_purchase_order_detail.findMany({
      where: {
        purchase_order_id: purchaseOrderId,
        deleted_at: null,
      },
      orderBy: {
        sequence_no: 'asc',
      },
      include: {
        tb_unit_tb_purchase_order_detail_order_unit_idTotb_unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_unit_tb_purchase_order_detail_base_unit_idTotb_unit: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_tax_profile: {
          select: {
            id: true,
            name: true,
          },
        },
        tb_purchase_order_detail_tb_purchase_request_detail: {
          select: {
            id: true,
            pr_detail_id: true,
            pr_detail_qty: true,
            pr_detail_order_unit_id: true,
            pr_detail_order_unit_name: true,
          },
        },
      },
    });

    // Convert decimal fields to numbers
    const results = details.map((detail) => ({
      ...detail,
      order_qty: Number(detail.order_qty),
      order_unit_conversion_factor: Number(detail.order_unit_conversion_factor),
      base_qty: Number(detail.base_qty),
      price: Number(detail.price),
      sub_total_price: Number(detail.sub_total_price),
      net_amount: Number(detail.net_amount),
      total_price: Number(detail.total_price),
      base_price: Number(detail.base_price),
      base_sub_total_price: Number(detail.base_sub_total_price),
      base_net_amount: Number(detail.base_net_amount),
      base_total_price: Number(detail.base_total_price),
      tax_rate: Number(detail.tax_rate),
      tax_amount: Number(detail.tax_amount),
      base_tax_amount: Number(detail.base_tax_amount),
      discount_rate: Number(detail.discount_rate),
      discount_amount: Number(detail.discount_amount),
      base_discount_amount: Number(detail.base_discount_amount),
      received_qty: Number(detail.received_qty),
      cancelled_qty: Number(detail.cancelled_qty),
    }));

    return Result.ok({
      purchase_order: purchaseOrder,
      details: results,
    });
  }

  /**
   * Create a new Purchase Order Detail
   */
  /**
   * Create a new purchase order detail line item and recalculate totals
   * สร้างรายการรายละเอียดใบสั่งซื้อใหม่และคำนวณยอดรวมใหม่
   * @param purchaseOrderId - Parent purchase order ID / ID ของใบสั่งซื้อหลัก
   * @param detailData - Detail line data / ข้อมูลรายการรายละเอียด
   * @returns Created detail ID / ID ของรายละเอียดที่สร้างแล้ว
   */
  @TryCatch
  async createDetail(purchaseOrderId: string, detailData: IPurchaseOrderDetail): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'createDetail', purchaseOrderId, detailData, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Verify PO exists and is editable
    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: purchaseOrderId,
        deleted_at: null,
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    if (purchaseOrder.po_status !== enum_purchase_order_doc_status.draft) {
      return Result.error('Cannot add detail to non-draft purchase order', ErrorCode.INVALID_ARGUMENT);
    }

    // Get next sequence number
    const lastDetail = await this.prismaService.tb_purchase_order_detail.findFirst({
      where: {
        purchase_order_id: purchaseOrderId,
        deleted_at: null,
      },
      orderBy: {
        sequence_no: 'desc',
      },
      select: {
        sequence_no: true,
      },
    });

    const nextSequenceNo = (lastDetail?.sequence_no || 0) + 1;

    const tx = await this.prismaService.$transaction(async (prisma) => {
      // Create detail
      const newDetail = await prisma.tb_purchase_order_detail.create({
        data: {
          purchase_order_id: purchaseOrderId,
          sequence_no: nextSequenceNo,
          description: detailData.description,
          order_qty: detailData.order_qty || 0,
          order_unit_id: detailData.order_unit_id,
          order_unit_name: detailData.order_unit_name,
          order_unit_conversion_factor: detailData.order_unit_conversion_factor || 1,
          base_qty: detailData.base_qty || 0,
          base_unit_id: detailData.base_unit_id,
          base_unit_name: detailData.base_unit_name,
          is_foc: detailData.is_foc || false,
          tax_profile_id: detailData.tax_profile_id,
          tax_profile_name: detailData.tax_profile_name,
          tax_rate: detailData.tax_rate || 0,
          tax_amount: detailData.tax_amount || 0,
          base_tax_amount: detailData.base_tax_amount || 0,
          is_tax_adjustment: detailData.is_tax_adjustment || false,
          discount_rate: detailData.discount_rate || 0,
          discount_amount: detailData.discount_amount || 0,
          base_discount_amount: detailData.base_discount_amount || 0,
          is_discount_adjustment: detailData.is_discount_adjustment || false,
          price: detailData.price || 0,
          sub_total_price: detailData.sub_total_price || 0,
          net_amount: detailData.net_amount || 0,
          total_price: detailData.total_price || 0,
          base_sub_total_price: detailData.base_sub_total_price || 0,
          base_net_amount: detailData.base_net_amount || 0,
          base_total_price: detailData.base_total_price || 0,
          note: detailData.note,
          info: detailData.info || {
            product_id: detailData.product_id,
            product_name: detailData.product_name,
            product_local_name: detailData.product_local_name,
          },
          created_by_id: this.userId,
        },
      });

      // Update PO totals
      await this.updatePurchaseOrderTotals(prisma, purchaseOrderId);

      return newDetail;
    });

    return Result.ok({ id: tx.id });
  }

  /**
   * Update a Purchase Order Detail
   */
  /**
   * Update an existing purchase order detail line item and recalculate totals
   * อัปเดตรายการรายละเอียดใบสั่งซื้อที่มีอยู่และคำนวณยอดรวมใหม่
   * @param detailId - Detail line ID to update / ID ของรายการรายละเอียดที่ต้องการอัปเดต
   * @param detailData - Updated detail line data / ข้อมูลรายการรายละเอียดที่อัปเดต
   * @returns Updated detail ID / ID ของรายละเอียดที่อัปเดตแล้ว
   */
  @TryCatch
  async updateDetail(detailId: string, detailData: Partial<IPurchaseOrderDetail>): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'updateDetail', detailId, detailData, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Find detail with PO
    const existingDetail = await this.prismaService.tb_purchase_order_detail.findFirst({
      where: {
        id: detailId,
        deleted_at: null,
      },
      include: {
        tb_purchase_order: true,
      },
    });

    if (!existingDetail) {
      return Result.error('Purchase order detail not found', ErrorCode.NOT_FOUND);
    }

    if (existingDetail.tb_purchase_order?.po_status !== enum_purchase_order_doc_status.draft) {
      return Result.error('Cannot update detail of non-draft purchase order', ErrorCode.INVALID_ARGUMENT);
    }

    const tx = await this.prismaService.$transaction(async (prisma) => {
      // Build update info object
      const currentInfo = (existingDetail.info as unknown as Record<string, unknown>) || {};
      const updatedInfo = {
        ...currentInfo,
        ...(detailData.product_id && { product_id: detailData.product_id }),
        ...(detailData.product_name && { product_name: detailData.product_name }),
        ...(detailData.product_local_name && { product_local_name: detailData.product_local_name }),
      };

      // Update detail
      const updatedDetail = await prisma.tb_purchase_order_detail.update({
        where: { id: detailId },
        data: {
          description: detailData.description ?? existingDetail.description,
          sequence_no: detailData.sequence_no ?? existingDetail.sequence_no,
          order_qty: detailData.order_qty ?? existingDetail.order_qty,
          order_unit_id: detailData.order_unit_id ?? existingDetail.order_unit_id,
          order_unit_name: detailData.order_unit_name ?? existingDetail.order_unit_name,
          order_unit_conversion_factor: detailData.order_unit_conversion_factor ?? existingDetail.order_unit_conversion_factor,
          base_qty: detailData.base_qty ?? existingDetail.base_qty,
          base_unit_id: detailData.base_unit_id ?? existingDetail.base_unit_id,
          base_unit_name: detailData.base_unit_name ?? existingDetail.base_unit_name,
          is_foc: detailData.is_foc ?? existingDetail.is_foc,
          tax_profile_id: detailData.tax_profile_id ?? existingDetail.tax_profile_id,
          tax_profile_name: detailData.tax_profile_name ?? existingDetail.tax_profile_name,
          tax_rate: detailData.tax_rate ?? existingDetail.tax_rate,
          tax_amount: detailData.tax_amount ?? existingDetail.tax_amount,
          base_tax_amount: detailData.base_tax_amount ?? existingDetail.base_tax_amount,
          is_tax_adjustment: detailData.is_tax_adjustment ?? existingDetail.is_tax_adjustment,
          discount_rate: detailData.discount_rate ?? existingDetail.discount_rate,
          discount_amount: detailData.discount_amount ?? existingDetail.discount_amount,
          base_discount_amount: detailData.base_discount_amount ?? existingDetail.base_discount_amount,
          is_discount_adjustment: detailData.is_discount_adjustment ?? existingDetail.is_discount_adjustment,
          price: detailData.price ?? existingDetail.price,
          sub_total_price: detailData.sub_total_price ?? existingDetail.sub_total_price,
          net_amount: detailData.net_amount ?? existingDetail.net_amount,
          total_price: detailData.total_price ?? existingDetail.total_price,
          base_sub_total_price: detailData.base_sub_total_price ?? existingDetail.base_sub_total_price,
          base_net_amount: detailData.base_net_amount ?? existingDetail.base_net_amount,
          base_total_price: detailData.base_total_price ?? existingDetail.base_total_price,
          note: detailData.note ?? existingDetail.note,
          info: updatedInfo,
          doc_version: { increment: 1 },
          updated_by_id: this.userId,
        },
      });

      // Update PO totals
      await this.updatePurchaseOrderTotals(prisma, existingDetail.purchase_order_id);

      return updatedDetail;
    });

    return Result.ok({ id: tx.id });
  }

  /**
   * Delete a Purchase Order Detail
   */
  /**
   * Delete a purchase order detail line item and recalculate totals
   * ลบรายการรายละเอียดใบสั่งซื้อและคำนวณยอดรวมใหม่
   * @param detailId - Detail line ID to delete / ID ของรายการรายละเอียดที่ต้องการลบ
   * @returns Deleted detail ID / ID ของรายละเอียดที่ลบแล้ว
   */
  @TryCatch
  async deleteDetail(detailId: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'deleteDetail', detailId, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Find detail with PO
    const existingDetail = await this.prismaService.tb_purchase_order_detail.findFirst({
      where: {
        id: detailId,
        deleted_at: null,
      },
      include: {
        tb_purchase_order: true,
      },
    });

    if (!existingDetail) {
      return Result.error('Purchase order detail not found', ErrorCode.NOT_FOUND);
    }

    if (existingDetail.tb_purchase_order?.po_status !== enum_purchase_order_doc_status.draft) {
      return Result.error('Cannot delete detail of non-draft purchase order', ErrorCode.INVALID_ARGUMENT);
    }

    const tx = await this.prismaService.$transaction(async (prisma) => {
      // Soft delete - set deleted_at
      await prisma.tb_purchase_order_detail.update({
        where: { id: detailId },
        data: {
          deleted_at: new Date(),
          deleted_by_id: this.userId,
        },
      });

      // Update PO totals
      await this.updatePurchaseOrderTotals(prisma, existingDetail.purchase_order_id);

      return { id: detailId };
    });

    return Result.ok(tx);
  }

  /**
   * Helper method to update Purchase Order totals after detail changes
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Recalculate and update purchase order totals (qty, price, tax, amount) from detail lines
   * คำนวณและอัปเดตยอดรวมใบสั่งซื้อ (จำนวน ราคา ภาษี ยอดรวม) จากรายการรายละเอียด
   * @param prisma - Prisma transaction client / Prisma transaction client
   * @param purchaseOrderId - Purchase order ID / ID ของใบสั่งซื้อ
   */
  private async updatePurchaseOrderTotals(prisma: any, purchaseOrderId: string): Promise<void> {
    // Calculate totals from all active details
    const totals = await prisma.tb_purchase_order_detail.aggregate({
      where: {
        purchase_order_id: purchaseOrderId,
        deleted_at: null,
      },
      _sum: {
        order_qty: true,
        sub_total_price: true,
        tax_amount: true,
        total_price: true,
      },
    });

    // Update PO with new totals
    await prisma.tb_purchase_order.update({
      where: { id: purchaseOrderId },
      data: {
        total_qty: totals._sum.order_qty || 0,
        total_price: totals._sum.sub_total_price || 0,
        total_tax: totals._sum.tax_amount || 0,
        total_amount: totals._sum.total_price || 0,
        doc_version: { increment: 1 },
        updated_by_id: this.userId,
      },
    });
  }

  /**
   * Close a Purchase Order - marks it as closed, sends notification and email
   * This is different from cancel - close is for POs that have been partially or fully received
   */
  /**
   * Close a purchase order and update its status to closed
   * ปิดใบสั่งซื้อและอัปเดตสถานะเป็นปิด
   * @param id - Purchase order ID to close / ID ของใบสั่งซื้อที่ต้องการปิด
   * @returns Closed purchase order ID / ID ของใบสั่งซื้อที่ปิดแล้ว
   */
  @TryCatch
  async closePO(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'closePO', id, user_id: this.userId, tenant_id: this.bu_code },
      PurchaseOrderService.name,
    );

    // Find the purchase order with its details and vendor contact
    const purchaseOrder = await this.prismaService.tb_purchase_order.findFirst({
      where: {
        id: id,
        is_active: true,
        deleted_at: null,
      },
      include: {
        tb_purchase_order_detail: true,
        tb_vendor: {
          include: {
            tb_vendor_contact: {
              where: {
                is_primary: true,
                deleted_at: null,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!purchaseOrder) {
      return Result.error('Purchase order not found', ErrorCode.NOT_FOUND);
    }

    // Validate status - only allow closing from sent, partial, or in_progress
    const allowedStatuses: enum_purchase_order_doc_status[] = [
      enum_purchase_order_doc_status.sent,
      enum_purchase_order_doc_status.partial,
      enum_purchase_order_doc_status.in_progress,
    ];

    if (!allowedStatuses.includes(purchaseOrder.po_status)) {
      return Result.error(
        `Cannot close purchase order with status '${purchaseOrder.po_status}'. Only sent, partial, or in_progress orders can be closed.`,
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    // Use transaction to update PO and line items
    await this.prismaService.$transaction(async (prismatx) => {
      // Update PO header
      await prismatx.tb_purchase_order.update({
        where: { id: id },
        data: {
          po_status: enum_purchase_order_doc_status.closed,
          last_action_at_date: new Date(),
          last_action_by_id: this.userId,
          updated_by_id: this.userId,
        },
      });

      // Update each line item - set cancelled_qty to remaining qty (order_qty - received_qty)
      for (const detail of purchaseOrder.tb_purchase_order_detail) {
        const orderQty = Number(detail.order_qty) || 0;
        const receivedQty = Number(detail.received_qty) || 0;
        const cancelledQty = orderQty - receivedQty;

        if (cancelledQty > 0) {
          await prismatx.tb_purchase_order_detail.update({
            where: { id: detail.id },
            data: {
              cancelled_qty: cancelledQty,
              updated_by_id: this.userId,
            },
          });
        }
      }
    });

    // Send notification to buyer
    await this.sendClosePONotification(purchaseOrder);

    return Result.ok({ id: id, message: 'Purchase order closed successfully' });
  }

  /**
   * Send notification when PO is closed
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Send a notification when a purchase order is closed
   * ส่งการแจ้งเตือนเมื่อปิดใบสั่งซื้อ
   */
  private async sendClosePONotification(purchaseOrder: any): Promise<void> {
    try {
      const poNo = purchaseOrder?.po_no || 'N/A';
      const buyerId = purchaseOrder?.buyer_id;
      const vendorName = purchaseOrder?.vendor_name || purchaseOrder?.tb_vendor?.name || 'Unknown Vendor';
      const vendorEmail = purchaseOrder?.email ||
        purchaseOrder?.tb_vendor?.tb_vendor_contact?.[0]?.email || null;

      // Send notification to buyer
      if (buyerId) {
        const title = `Purchase Order Closed: ${poNo}`;
        const message = `Purchase Order ${poNo} for ${vendorName} has been closed.`;

        await this.notificationService.sendPONotification(
          buyerId,
          title,
          message,
          {
            po_id: purchaseOrder?.id,
            po_no: poNo,
            action: 'closed',
            vendor_id: purchaseOrder?.vendor_id,
            vendor_name: vendorName,
            vendor_email: vendorEmail,
            total_amount: Number(purchaseOrder?.total_amount) || 0,
            send_email: true,
          },
          this.userId,
        );
      }

      this.logger.log(`Close PO notification sent for PO ${poNo}`);
    } catch (error) {
      this.logger.error('Failed to send close PO notification:', error);
    }
  }

  /**
   * Find all purchase orders pending approval for the current user across business units
   * ค้นหาใบสั่งซื้อทั้งหมดที่รอการอนุมัติของผู้ใช้ปัจจุบันจากทุกหน่วยธุรกิจ
   * @param user_id - User ID / ID ผู้ใช้
   * @param bu_code - Business unit code(s) / รหัสหน่วยธุรกิจ
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of pending purchase orders / รายการใบสั่งซื้อที่รออนุมัติที่แบ่งหน้าแล้ว
   */
  @TryCatch
  async findAllMyPending(
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
  ): Promise<Result<any>> {
    this.logger.debug(
      { function: 'findAllMyPending', user_id, bu_code, paginate },
      PurchaseOrderService.name,
    );
    const defaultSearchFields = ['po_no', 'description'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      typeof paginate.filter === 'object' && !Array.isArray(paginate.filter)
        ? paginate.filter
        : {},
      paginate.sort,
      paginate.advance,
    );
    const results = [];

    let bu_codes: any = '';

    if (bu_code == '' || bu_code == undefined || bu_code == null) {
      const bus = await this.prismaSystem.tb_user_tb_business_unit.findMany({
        where: { user_id, is_active: true },
        include: { tb_business_unit: true },
      });
      bu_codes = bus.map((b) => b.tb_business_unit.code);
    } else {
      bu_codes = bu_code;
    }

    for (const code of bu_codes) {
      const tenant = await this.tenantService.getdb_connection(user_id, code);

      if (!tenant) {
        return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
      }

      const prisma = await this.prismaTenant(
        tenant.tenant_id,
        tenant.db_connection,
      );

      const bu_detail = await this.prismaSystem.tb_business_unit.findFirst({
        where: { code: code },
      });

      if (!bu_detail) {
        return Result.error(
          `Business unit ${code} not found`,
          ErrorCode.NOT_FOUND,
        );
      }

      const standardQuery = q.findMany();

      const purchaseOrders = await prisma.tb_purchase_order
        .findMany({
          ...standardQuery,
          where: {
            ...standardQuery.where,
            OR: [
              {
                user_action: {
                  path: ['execute'],
                  array_contains: [{ user_id: user_id }],
                },
              },
              {
                po_status: enum_purchase_order_doc_status.draft,
                buyer_id: user_id,
              },
            ],
          },
          include: {
            tb_purchase_order_detail: true,
          },
        })
        .then((res) => {
          return res.map((po) => {
            const purchase_order_detail = po['tb_purchase_order_detail'];
            delete po['tb_purchase_order_detail'];

            return {
              id: po.id,
              po_no: po.po_no,
              order_date: po.order_date,
              delivery_date: po.delivery_date,
              description: po.description,
              po_status: po.po_status,
              vendor_name: po.vendor_name,
              buyer_name: po.buyer_name,
              workflow_name: po.workflow_name,
              created_at: po.created_at,
              purchase_order_detail: purchase_order_detail.map((d) => ({
                base_qty: Number(d.base_qty),
                receive_qty: Number(d.received_qty),
                price: Number(d.price),
                total_price: Number(d.total_price),
              })),
              total_amount: Number(po.total_amount),
              workflow_current_stage: po.workflow_current_stage,
              workflow_next_stage: po.workflow_next_stage,
              workflow_previous_stage: po.workflow_previous_stage,
              last_action: po.last_action,
            };
          });
        });

      const total = await prisma.tb_purchase_order.count({
        where: {
          ...standardQuery.where,
          OR: [
            {
              user_action: {
                path: ['execute'],
                array_contains: [{ user_id: user_id }],
              },
            },
            {
              po_status: enum_purchase_order_doc_status.draft,
              buyer_id: user_id,
            },
          ],
        },
      });

      const serializedPurchaseOrders = purchaseOrders.map((item) =>
        PurchaseOrderListItemResponseSchema.parse(item),
      );

      results.push({
        bu_code: code,
        bu_name: bu_detail.name,
        bu_alias_name: bu_detail.alias_name,
        paginate: {
          total: total,
          page: Number(paginate.page),
          perpage: Number(paginate.perpage),
          pages: total == 0 ? 1 : Math.ceil(total / Number(paginate.perpage)),
        },
        data: serializedPurchaseOrders,
      });
    }

    return Result.ok(results);
  }

  /**
   * Get the count of purchase orders pending approval for the current user
   * นับจำนวนใบสั่งซื้อที่รอการอนุมัติของผู้ใช้ปัจจุบัน
   * @param user_id - User ID / ID ผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @returns Count of pending purchase orders / จำนวนใบสั่งซื้อที่รออนุมัติ
   */
  async findAllMyPendingCount(user_id: string, bu_code: string): Promise<any> {
    this.logger.debug(
      { function: 'findAllMyPendingCount', user_id, bu_code },
      PurchaseOrderService.name,
    );

    const paginate: IPaginate = {
      page: 1,
      perpage: 1,
      search: '',
      searchfields: ['po_no', 'description'],
      filter: {},
      sort: [],
      advance: {},
    };
    const defaultSearchFields = ['po_no', 'description'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      typeof paginate.filter === 'object' && !Array.isArray(paginate.filter)
        ? paginate.filter
        : {},
      paginate.sort,
      paginate.advance,
    );
    const results = [];

    let bu_codes: any = '';

    if (bu_code == '' || bu_code == undefined || bu_code == null) {
      const bus = await this.prismaSystem.tb_user_tb_business_unit.findMany({
        where: { user_id, is_active: true },
        include: { tb_business_unit: true },
      });
      bu_codes = bus.map((b) => b.tb_business_unit.code);
    } else {
      bu_codes = bu_code;
    }

    for (const code of bu_codes) {
      const tenant = await this.tenantService.getdb_connection(user_id, code);

      if (!tenant) {
        return {
          response: {
            status: HttpStatus.NO_CONTENT,
            message: 'Tenant not found',
          },
        };
      }

      const prisma = await this.prismaTenant(
        tenant.tenant_id,
        tenant.db_connection,
      );

      const bu_detail = await this.prismaSystem.tb_business_unit.findFirst({
        where: { code: code },
      });

      if (!bu_detail) {
        return {
          response: {
            status: HttpStatus.NO_CONTENT,
            message: `Business unit ${code} not found`,
          },
        };
      }

      const standardQuery = q.findMany();

      const total = await prisma.tb_purchase_order.count({
        where: {
          ...standardQuery.where,
          OR: [
            {
              user_action: {
                path: ['execute'],
                array_contains: [{ user_id: user_id }],
              },
            },
            {
              po_status: enum_purchase_order_doc_status.draft,
              buyer_id: user_id,
            },
          ],
        },
      });

      results.push({
        total: total,
      });
    }

    const total = results.reduce((acc, curr) => acc + curr.total, 0);
    this.logger.debug({
      function: 'findAllMyPendingCount',
      user_id,
      total,
    });

    return Result.ok({ pending: total });
  }
}

// Force reload at Wed Jan 28 09:54:59 AM +07 2026
