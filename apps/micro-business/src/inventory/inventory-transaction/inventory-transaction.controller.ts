import { Body, Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryTransactionService } from './inventory-transaction.service';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class InventoryTransactionController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    InventoryTransactionController.name,
  );
  constructor(
    private readonly inventoryTransactionService: InventoryTransactionService,
  ) {
    super();
  }

  /**
   * Create audit context from payload
   * สร้างบริบทการตรวจสอบจาก payload
   * @param payload - Microservice payload / ข้อมูล payload จากไมโครเซอร์วิส
   * @returns Audit context object / ออบเจกต์บริบทการตรวจสอบ
   */
  private createAuditContext(payload: MicroservicePayload): AuditContext {
    return {
      tenant_id: payload.tenant_id || payload.bu_code,
      user_id: payload.user_id,
      request_id: payload.request_id,
      ip_address: payload.ip_address,
      user_agent: payload.user_agent,
    };
  }

  /**
   * Find all inventory transactions by IDs
   * ค้นหาธุรกรรมสินค้าคงคลังทั้งหมดตาม ID
   * @param body - Contains ids, user_id, tenant_id / ประกอบด้วย ids, user_id, tenant_id
   * @returns List of inventory transactions / รายการธุรกรรมสินค้าคงคลัง
   */
  @MessagePattern({
    cmd: 'inventory-transaction.find-all-by-ids',
    service: 'inventory-transaction',
  })
  async findAllByIds(@Body() body: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAllByIds', body }, InventoryTransactionController.name);
    const auditContext = this.createAuditContext(body);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.findAllByIds(
        body.ids,
        body.user_id,
        body.tenant_id,
      )
    );
    return this.handleResult(result);
  }

  /**
   * Create inventory transactions from a good received note
   * สร้างธุรกรรมสินค้าคงคลังจากใบรับสินค้า
   * @param payload - Contains data with grn_id, grn_no, grn_date, detail_items / ประกอบด้วย data ที่มี grn_id, grn_no, grn_date, detail_items
   * @returns Created inventory transactions / ธุรกรรมสินค้าคงคลังที่สร้างแล้ว
   */
  @MessagePattern({
    cmd: 'inventory-transaction.create-from-grn',
    service: 'inventory-transaction',
  })
  async createFromGrn(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'createFromGrn', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createFromGrn(
        {
          bu_code: tenant_id,
          grn_id: data.grn_id,
          grn_no: data.grn_no || null,
          grn_date: data.grn_date ? new Date(data.grn_date) : new Date(),
          detail_items: data.detail_items || [],
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }
}
