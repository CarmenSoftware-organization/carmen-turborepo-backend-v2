import { HttpStatus, Injectable } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import {
  ITransferCreate,
  ITransferUpdate,
  ITransferDetailCreate,
  ITransferDetailUpdate,
  Result,
  MicroserviceResponse,
} from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

import { getGatewayRequestContext } from '@/common/context/gateway-request-context';
@Injectable()
export class TransferService {
  private readonly logger: BackendLogger = new BackendLogger(TransferService.name);

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly inventoryService: ClientProxy,
  ) {}

  /**
   * Find a transfer record by ID via microservice.
   * ค้นหารายการโอนย้ายสินค้าเดียวตาม ID ผ่านไมโครเซอร์วิส
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Transfer record or error / รายการโอนย้ายสินค้าหรือข้อผิดพลาด
   */
  async findOne(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer.findOne', service: 'transfer' },
      { id, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Find all transfer records with pagination via microservice.
   * ค้นหารายการโอนย้ายสินค้าทั้งหมดพร้อมการแบ่งหน้าผ่านไมโครเซอร์วิส
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated transfer records or error / รายการโอนย้ายสินค้าพร้อมการแบ่งหน้าหรือข้อผิดพลาด
   */
  async findAll(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer.findAll', service: 'transfer' },
      { user_id, tenant_id, paginate, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok({ data: response.data, paginate: response.paginate });
  }

  /**
   * Create a new transfer record via microservice.
   * สร้างรายการโอนย้ายสินค้าใหม่ผ่านไมโครเซอร์วิส
   * @param data - Transfer creation data / ข้อมูลสำหรับสร้างรายการโอนย้าย
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Created transfer record or error / รายการโอนย้ายสินค้าที่สร้างแล้วหรือข้อผิดพลาด
   */
  async create(
    data: ITransferCreate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer.create', service: 'transfer' },
      { data, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Update an existing transfer record via microservice.
   * อัปเดตรายการโอนย้ายสินค้าที่มีอยู่ผ่านไมโครเซอร์วิส
   * @param data - Transfer update data / ข้อมูลสำหรับอัปเดตรายการโอนย้าย
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Updated transfer record or error / รายการโอนย้ายสินค้าที่อัปเดตแล้วหรือข้อผิดพลาด
   */
  async update(
    data: ITransferUpdate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer.update', service: 'transfer' },
      { data, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Delete a transfer record via microservice.
   * ลบรายการโอนย้ายสินค้าผ่านไมโครเซอร์วิส
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result or error / ผลลัพธ์การลบหรือข้อผิดพลาด
   */
  async delete(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer.delete', service: 'transfer' },
      { id, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  // ==================== Transfer Detail CRUD ====================

  /**
   * Find a transfer detail by ID via microservice.
   * ค้นหารายการย่อยโอนย้ายสินค้าเดียวตาม ID ผ่านไมโครเซอร์วิส
   * @param detailId - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Transfer detail or error / รายการย่อยโอนย้ายสินค้าหรือข้อผิดพลาด
   */
  async findDetailById(
    detailId: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findDetailById', detailId, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.find-by-id', service: 'transfer' },
      { detail_id: detailId, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Find all details for a transfer record via microservice.
   * ค้นหารายการย่อยทั้งหมดของรายการโอนย้ายสินค้าผ่านไมโครเซอร์วิส
   * @param transferId - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns List of transfer details or error / รายการย่อยโอนย้ายสินค้าหรือข้อผิดพลาด
   */
  async findDetailsByTransferId(
    transferId: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findDetailsByTransferId', transferId, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.find-all', service: 'transfer' },
      { transfer_id: transferId, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Create a new transfer detail via microservice.
   * สร้างรายการย่อยโอนย้ายสินค้าใหม่ผ่านไมโครเซอร์วิส
   * @param transferId - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param data - Detail creation data / ข้อมูลสำหรับสร้างรายการย่อย
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Created transfer detail or error / รายการย่อยโอนย้ายสินค้าที่สร้างแล้วหรือข้อผิดพลาด
   */
  async createDetail(
    transferId: string,
    data: ITransferDetailCreate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'createDetail', transferId, data, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.create', service: 'transfer' },
      { transfer_id: transferId, data, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Update an existing transfer detail via microservice.
   * อัปเดตรายการย่อยโอนย้ายสินค้าที่มีอยู่ผ่านไมโครเซอร์วิส
   * @param detailId - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param data - Detail update data / ข้อมูลสำหรับอัปเดตรายการย่อย
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Updated transfer detail or error / รายการย่อยโอนย้ายสินค้าที่อัปเดตแล้วหรือข้อผิดพลาด
   */
  async updateDetail(
    detailId: string,
    data: ITransferDetailUpdate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'updateDetail', detailId, data, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.update', service: 'transfer' },
      { detail_id: detailId, data, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  /**
   * Delete a transfer detail via microservice.
   * ลบรายการย่อยโอนย้ายสินค้าผ่านไมโครเซอร์วิส
   * @param detailId - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result or error / ผลลัพธ์การลบหรือข้อผิดพลาด
   */
  async deleteDetail(
    detailId: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'deleteDetail', detailId, user_id, tenant_id, version },
      TransferService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.delete', service: 'transfer' },
      { detail_id: detailId, user_id, tenant_id, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }
}
