import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TransferService } from './transfer.service';
import { ITransferCreate, ITransferUpdate } from './interface/transfer.interface';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class TransferController extends BaseMicroserviceController {
  private readonly logger = new BackendLogger(TransferController.name);

  constructor(private readonly transferService: TransferService) {
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
   * Find a transfer by ID
   * ค้นหาใบโอนสินค้ารายการเดียวตาม ID
   * @param payload - Contains id, user_id, tenant_id / ประกอบด้วย id, user_id, tenant_id
   * @returns Transfer detail / รายละเอียดใบโอนสินค้า
   */
  @MessagePattern({ cmd: 'transfer.findOne', service: 'transfer' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, TransferController.name);
    const id = payload.id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.findOne(id, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Find all transfers with pagination
   * ค้นหาใบโอนสินค้าทั้งหมดพร้อมการแบ่งหน้า
   * @param payload - Contains user_id, tenant_id, paginate / ประกอบด้วย user_id, tenant_id, paginate
   * @returns Paginated list of transfers / รายการใบโอนสินค้าแบบแบ่งหน้า
   */
  @MessagePattern({ cmd: 'transfer.findAll', service: 'transfer' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, TransferController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const paginate = payload.paginate;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.findAll(user_id, tenant_id, paginate)
    );
    return this.handlePaginatedResult(result);
  }

  /**
   * Create a new transfer
   * สร้างใบโอนสินค้าใหม่
   * @param payload - Contains data, user_id, tenant_id / ประกอบด้วย data, user_id, tenant_id
   * @returns Created transfer / ใบโอนสินค้าที่สร้างแล้ว
   */
  @MessagePattern({ cmd: 'transfer.create', service: 'transfer' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, TransferController.name);
    const data: ITransferCreate = payload.data;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.create(data, user_id, tenant_id)
    );
    return this.handleResult(result, HttpStatus.CREATED);
  }

  /**
   * Update a transfer
   * แก้ไขใบโอนสินค้า
   * @param payload - Contains data, user_id, tenant_id / ประกอบด้วย data, user_id, tenant_id
   * @returns Updated transfer / ใบโอนสินค้าที่แก้ไขแล้ว
   */
  @MessagePattern({ cmd: 'transfer.update', service: 'transfer' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, TransferController.name);
    const data: ITransferUpdate = payload.data;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.update(data, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Delete a transfer
   * ลบใบโอนสินค้า
   * @param payload - Contains id, user_id, tenant_id / ประกอบด้วย id, user_id, tenant_id
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @MessagePattern({ cmd: 'transfer.delete', service: 'transfer' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, TransferController.name);
    const id = payload.id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.delete(id, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  // ==================== Transfer Detail CRUD ====================

  /**
   * Find a transfer detail by ID
   * ค้นหารายละเอียดใบโอนสินค้าตาม ID
   * @param payload - Contains detail_id, user_id, tenant_id / ประกอบด้วย detail_id, user_id, tenant_id
   * @returns Transfer detail item / รายละเอียดใบโอนสินค้า
   */
  @MessagePattern({ cmd: 'transfer-detail.find-by-id', service: 'transfer' })
  async getDetailById(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getDetailById', payload }, TransferController.name);
    const detailId = payload.detail_id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.findDetailById(detailId, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Find all details of a transfer
   * ค้นหารายละเอียดทั้งหมดของใบโอนสินค้า
   * @param payload - Contains transfer_id, user_id, tenant_id / ประกอบด้วย transfer_id, user_id, tenant_id
   * @returns List of transfer details / รายการรายละเอียดใบโอนสินค้า
   */
  @MessagePattern({ cmd: 'transfer-detail.find-all', service: 'transfer' })
  async getDetailsByTransferId(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'getDetailsByTransferId', payload }, TransferController.name);
    const transferId = payload.transfer_id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.findDetailsByTransferId(transferId, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Create a detail item for a transfer
   * สร้างรายละเอียดสินค้าในใบโอน
   * @param payload - Contains transfer_id, data, user_id, tenant_id / ประกอบด้วย transfer_id, data, user_id, tenant_id
   * @returns Created detail item / รายละเอียดสินค้าที่สร้างแล้ว
   */
  @MessagePattern({ cmd: 'transfer-detail.create', service: 'transfer' })
  async createDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'createDetail', payload }, TransferController.name);
    const transferId = payload.transfer_id;
    const data = payload.data;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.createDetail(transferId, data, user_id, tenant_id)
    );
    return this.handleResult(result, HttpStatus.CREATED);
  }

  /**
   * Update a detail item of a transfer
   * แก้ไขรายละเอียดสินค้าในใบโอน
   * @param payload - Contains detail_id, data, user_id, tenant_id / ประกอบด้วย detail_id, data, user_id, tenant_id
   * @returns Updated detail item / รายละเอียดสินค้าที่แก้ไขแล้ว
   */
  @MessagePattern({ cmd: 'transfer-detail.update', service: 'transfer' })
  async updateDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'updateDetail', payload }, TransferController.name);
    const detailId = payload.detail_id;
    const data = payload.data;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.updateDetail(detailId, data, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Delete a detail item of a transfer
   * ลบรายละเอียดสินค้าในใบโอน
   * @param payload - Contains detail_id, user_id, tenant_id / ประกอบด้วย detail_id, user_id, tenant_id
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @MessagePattern({ cmd: 'transfer-detail.delete', service: 'transfer' })
  async deleteDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'deleteDetail', payload }, TransferController.name);
    const detailId = payload.detail_id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.deleteDetail(detailId, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  // ==================== Standalone Transfer Detail API ====================

  /**
   * Find all transfer details with pagination (standalone API)
   * ค้นหารายละเอียดใบโอนทั้งหมดพร้อมการแบ่งหน้า (API แบบแยก)
   * @param payload - Contains user_id, tenant_id, paginate / ประกอบด้วย user_id, tenant_id, paginate
   * @returns Paginated list of transfer details / รายการรายละเอียดใบโอนแบบแบ่งหน้า
   */
  @MessagePattern({ cmd: 'transfer-detail.findAll', service: 'transfer-detail' })
  async findAllDetails(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAllDetails', payload }, TransferController.name);
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const paginate = payload.paginate;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.findAllDetails(user_id, tenant_id, paginate)
    );
    return this.handlePaginatedResult(result);
  }

  /**
   * Find a single transfer detail (standalone API)
   * ค้นหารายละเอียดใบโอนรายการเดียว (API แบบแยก)
   * @param payload - Contains id, user_id, tenant_id / ประกอบด้วย id, user_id, tenant_id
   * @returns Transfer detail / รายละเอียดใบโอน
   */
  @MessagePattern({ cmd: 'transfer-detail.findOne', service: 'transfer-detail' })
  async findOneDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOneDetail', payload }, TransferController.name);
    const detailId = payload.id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.findDetailById(detailId, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Create a standalone transfer detail
   * สร้างรายละเอียดใบโอนแบบแยก
   * @param payload - Contains data, user_id, tenant_id / ประกอบด้วย data, user_id, tenant_id
   * @returns Created standalone detail / รายละเอียดใบโอนแบบแยกที่สร้างแล้ว
   */
  @MessagePattern({ cmd: 'transfer-detail.createStandalone', service: 'transfer-detail' })
  async createStandaloneDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'createStandaloneDetail', payload }, TransferController.name);
    const data = payload.data;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.createStandaloneDetail(data, user_id, tenant_id)
    );
    return this.handleResult(result, HttpStatus.CREATED);
  }

  /**
   * Update a standalone transfer detail
   * แก้ไขรายละเอียดใบโอนแบบแยก
   * @param payload - Contains id, data, user_id, tenant_id / ประกอบด้วย id, data, user_id, tenant_id
   * @returns Updated standalone detail / รายละเอียดใบโอนแบบแยกที่แก้ไขแล้ว
   */
  @MessagePattern({ cmd: 'transfer-detail.updateStandalone', service: 'transfer-detail' })
  async updateStandaloneDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'updateStandaloneDetail', payload }, TransferController.name);
    const detailId = payload.id;
    const data = payload.data;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.updateDetail(detailId, { id: detailId, ...data }, user_id, tenant_id)
    );
    return this.handleResult(result);
  }

  /**
   * Delete a standalone transfer detail
   * ลบรายละเอียดใบโอนแบบแยก
   * @param payload - Contains id, user_id, tenant_id / ประกอบด้วย id, user_id, tenant_id
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @MessagePattern({ cmd: 'transfer-detail.deleteStandalone', service: 'transfer-detail' })
  async deleteStandaloneDetail(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'deleteStandaloneDetail', payload }, TransferController.name);
    const detailId = payload.id;
    const user_id = payload.user_id;
    const tenant_id = payload.tenant_id || payload.bu_code;
    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.transferService.deleteDetail(detailId, user_id, tenant_id)
    );
    return this.handleResult(result);
  }
}
