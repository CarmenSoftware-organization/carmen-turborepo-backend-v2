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

  @MessagePattern({
    cmd: 'inventory-transaction.test-issue',
    service: 'inventory-transaction',
  })
  async testIssue(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testIssue', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createIssueTransaction(
        {
          bu_code: tenant_id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code || null,
          qty: Number(data.qty),
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-adjustment-out',
    service: 'inventory-transaction',
  })
  async testAdjustmentOut(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testAdjustmentOut', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createAdjustmentOutTransaction(
        {
          bu_code: tenant_id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code || null,
          qty: Number(data.qty),
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-adjustment-in',
    service: 'inventory-transaction',
  })
  async testAdjustmentIn(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testAdjustmentIn', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createAdjustmentInTransaction(
        {
          bu_code: tenant_id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code || null,
          qty: Number(data.qty),
          cost_per_unit: Number(data.cost_per_unit),
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-eop-in',
    service: 'inventory-transaction',
  })
  async testEopIn(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testEopIn', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createEopInTransaction(
        {
          bu_code: tenant_id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code || null,
          qty: Number(data.qty),
          cost_per_unit: Number(data.cost_per_unit),
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-eop-out',
    service: 'inventory-transaction',
  })
  async testEopOut(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testEopOut', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createEopOutTransaction(
        {
          bu_code: tenant_id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code || null,
          qty: Number(data.qty),
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-transfer',
    service: 'inventory-transaction',
  })
  async testTransfer(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testTransfer', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createTransferTransaction(
        {
          bu_code: tenant_id,
          product_id: data.product_id,
          from_location_id: data.from_location_id,
          from_location_code: data.from_location_code || null,
          to_location_id: data.to_location_id,
          to_location_code: data.to_location_code || null,
          qty: Number(data.qty),
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-credit-note-qty',
    service: 'inventory-transaction',
  })
  async testCreditNoteQty(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testCreditNoteQty', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createCreditNoteQtyTransaction(
        {
          bu_code: tenant_id,
          grn_id: data.grn_id,
          detail_items: data.detail_items || [],
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.test-credit-note-amount',
    service: 'inventory-transaction',
  })
  async testCreditNoteAmount(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'testCreditNoteAmount', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.createCreditNoteAmountTransaction(
        {
          bu_code: tenant_id,
          grn_id: data.grn_id,
          detail_items: data.detail_items || [],
          user_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.get-cost-layers',
    service: 'inventory-transaction',
  })
  async getCostLayers(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getCostLayers', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.getCostLayers(
        {
          bu_code: tenant_id,
          product_id: payload.product_id,
          location_id: payload.location_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  @MessagePattern({
    cmd: 'inventory-transaction.get-stock-balance',
    service: 'inventory-transaction',
  })
  async getStockBalance(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getStockBalance', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.getStockBalance(
        {
          bu_code: tenant_id,
          product_id: payload.product_id,
        },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  @MessagePattern({
    cmd: 'inventory-transaction.get-locations',
    service: 'inventory-transaction',
  })
  async getLocations(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getLocations', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.getLocations(user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  @MessagePattern({
    cmd: 'inventory-transaction.get-products',
    service: 'inventory-transaction',
  })
  async getProducts(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getProducts', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.getProducts(user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  @MessagePattern({
    cmd: 'inventory-transaction.get-products-by-location',
    service: 'inventory-transaction',
  })
  async getProductsByLocation(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getProductsByLocation', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.getProductsByLocation(
        payload.location_id,
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  @MessagePattern({
    cmd: 'inventory-transaction.get-calculation-method',
    service: 'inventory-transaction',
  })
  async getCalculationMethod(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getCalculationMethod', payload }, InventoryTransactionController.name);
    const tenant_id = payload.tenant_id || payload.bu_code;
    const result = await this.inventoryTransactionService.getCalculationMethodResult(tenant_id);
    return this.handleResult(result);
  }

  // ⚠️ TEST ONLY — DELETE
  @MessagePattern({
    cmd: 'inventory-transaction.clear-product-transactions',
    service: 'inventory-transaction',
  })
  async clearProductTransactions(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'clearProductTransactions', payload }, InventoryTransactionController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const data = payload.data || {};
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.inventoryTransactionService.clearProductTransactions(
        { product_id: data.product_id, inventory_transaction_id: data.inventory_transaction_id },
        user_id,
        tenant_id,
      )
    );
    return this.handleResult(result);
  }
}
