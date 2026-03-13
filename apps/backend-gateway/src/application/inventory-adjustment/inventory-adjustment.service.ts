import { HttpStatus, Injectable } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

export type AdjustmentType = 'stock-in' | 'stock-out';

export interface InventoryAdjustmentItem {
  id: string;
  type: AdjustmentType;
  document_no: string;
  date: string;
  location_id?: string;
  location_name?: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

@Injectable()
export class InventoryAdjustmentService {
  private readonly logger: BackendLogger = new BackendLogger(InventoryAdjustmentService.name);

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly inventoryService: ClientProxy,
  ) {}

  /**
   * Find all inventory adjustments (stock-in and/or stock-out) with pagination.
   * ค้นหารายการปรับปรุงสินค้าคงคลังทั้งหมด (รับเข้าและ/หรือจ่ายออก) พร้อมการแบ่งหน้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @param type - Optional adjustment type filter / ตัวกรองประเภทการปรับปรุง (ไม่บังคับ)
   * @returns Combined and sorted adjustment records / รายการปรับปรุงที่รวมและจัดเรียงแล้ว
   */
  async findAll(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
    version: string,
    type?: AdjustmentType,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate, version, type },
      InventoryAdjustmentService.name,
    );

    const results: InventoryAdjustmentItem[] = [];
    let totalStockIn = 0;
    let totalStockOut = 0;

    // Fetch stock-in data if type is not specified or type is 'stock-in'
    if (!type || type === 'stock-in') {
      const stockInRes: Observable<MicroserviceResponse> = this.inventoryService.send(
        { cmd: 'stock-in.findAll', service: 'stock-in' },
        { user_id, tenant_id, paginate, version },
      );

      const stockInResponse = await firstValueFrom(stockInRes);

      if (stockInResponse.response.status === HttpStatus.OK) {
        const stockInData = (stockInResponse.data || []) as Record<string, unknown>[];
        const stockInItems = stockInData.map((item: Record<string, unknown>) => ({
          ...item,
          type: 'stock-in' as AdjustmentType,
          document_no: item.si_no || item.document_no,
        })) as InventoryAdjustmentItem[];
        results.push(...stockInItems);
        totalStockIn = stockInResponse.paginate?.total || stockInItems.length;
      }
    }

    // Fetch stock-out data if type is not specified or type is 'stock-out'
    if (!type || type === 'stock-out') {
      const stockOutRes: Observable<MicroserviceResponse> = this.inventoryService.send(
        { cmd: 'stock-out.findAll', service: 'stock-out' },
        { user_id, tenant_id, paginate, version },
      );

      const stockOutResponse = await firstValueFrom(stockOutRes);

      if (stockOutResponse.response.status === HttpStatus.OK) {
        const stockOutData = (stockOutResponse.data || []) as Record<string, unknown>[];
        const stockOutItems = stockOutData.map((item: Record<string, unknown>) => ({
          ...item,
          type: 'stock-out' as AdjustmentType,
          document_no: item.so_no || item.document_no,
        })) as InventoryAdjustmentItem[];
        results.push(...stockOutItems);
        totalStockOut = stockOutResponse.paginate?.total || stockOutItems.length;
      }
    }

    // Sort by created_at descending (most recent first)
    results.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return Result.ok({
      data: results,
      paginate: {
        total: totalStockIn + totalStockOut,
        page: paginate.page,
        perpage: paginate.perpage,
        totalStockIn,
        totalStockOut,
      },
    });
  }

  /**
   * Find a single inventory adjustment by ID and type via microservice.
   * ค้นหารายการปรับปรุงสินค้าคงคลังเดียวตาม ID และประเภทผ่านไมโครเซอร์วิส
   * @param id - Adjustment record ID / รหัสรายการปรับปรุง
   * @param type - Adjustment type (stock-in/stock-out) / ประเภทการปรับปรุง (รับเข้า/จ่ายออก)
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Adjustment record with type annotation or error / รายการปรับปรุงพร้อมประเภทหรือข้อผิดพลาด
   */
  async findOne(
    id: string,
    type: AdjustmentType,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, type, user_id, tenant_id, version },
      InventoryAdjustmentService.name,
    );

    const cmd = type === 'stock-in' ? 'stock-in.findOne' : 'stock-out.findOne';
    const service = type === 'stock-in' ? 'stock-in' : 'stock-out';

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd, service },
      { id, user_id, tenant_id, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    const data = response.data as Record<string, unknown>;
    return Result.ok({
      ...data,
      type,
      document_no: type === 'stock-in'
        ? data.si_no || data.document_no
        : data.so_no || data.document_no,
    });
  }
}
