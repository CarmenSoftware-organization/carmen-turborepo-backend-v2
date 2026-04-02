import { HttpStatus, Injectable } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Result, MicroserviceResponse, TransferDetailCreateDto, TransferDetailUpdateDto } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

import { getGatewayRequestContext } from '@/common/context/gateway-request-context';
@Injectable()
export class TransferDetailService {
  private readonly logger: BackendLogger = new BackendLogger(TransferDetailService.name);

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly inventoryService: ClientProxy,
  ) {}

  /**
   * Find all transfer details with pagination via microservice.
   * ค้นหารายการย่อยโอนย้ายสินค้าทั้งหมดพร้อมการแบ่งหน้าผ่านไมโครเซอร์วิส
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated transfer details or error / รายการย่อยโอนย้ายสินค้าพร้อมการแบ่งหน้าหรือข้อผิดพลาด
   */
  async findAll(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate, version },
      TransferDetailService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.findAll', service: 'transfer-detail' },
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
   * Find a transfer detail by ID via microservice.
   * ค้นหารายการย่อยโอนย้ายสินค้าเดียวตาม ID ผ่านไมโครเซอร์วิส
   * @param id - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Transfer detail or error / รายการย่อยโอนย้ายสินค้าหรือข้อผิดพลาด
   */
  async findOne(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id, tenant_id, version },
      TransferDetailService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.findOne', service: 'transfer-detail' },
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
   * Create a standalone transfer detail via microservice.
   * สร้างรายการย่อยโอนย้ายสินค้าแบบแยกเดี่ยวผ่านไมโครเซอร์วิส
   * @param data - Detail creation data / ข้อมูลสำหรับสร้างรายการย่อย
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Created transfer detail or error / รายการย่อยโอนย้ายสินค้าที่สร้างแล้วหรือข้อผิดพลาด
   */
  async create(
    data: TransferDetailCreateDto,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id, tenant_id, version },
      TransferDetailService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.createStandalone', service: 'transfer-detail' },
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
   * Update a standalone transfer detail via microservice.
   * อัปเดตรายการย่อยโอนย้ายสินค้าแบบแยกเดี่ยวผ่านไมโครเซอร์วิส
   * @param id - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param data - Detail update data / ข้อมูลสำหรับอัปเดตรายการย่อย
   * @param user_id - Current user ID / รหัสผู้ใช้ปัจจุบัน
   * @param tenant_id - Tenant ID (business unit code) / รหัสผู้เช่า (รหัสหน่วยธุรกิจ)
   * @param version - API version / เวอร์ชัน API
   * @returns Updated transfer detail or error / รายการย่อยโอนย้ายสินค้าที่อัปเดตแล้วหรือข้อผิดพลาด
   */
  async update(
    id: string,
    data: TransferDetailUpdateDto,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', id, data, user_id, tenant_id, version },
      TransferDetailService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.updateStandalone', service: 'transfer-detail' },
      { id, data, user_id, tenant_id, version, ...getGatewayRequestContext() },
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
   * Delete a standalone transfer detail via microservice.
   * ลบรายการย่อยโอนย้ายสินค้าแบบแยกเดี่ยวผ่านไมโครเซอร์วิส
   * @param id - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
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
      TransferDetailService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'transfer-detail.deleteStandalone', service: 'transfer-detail' },
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
}
