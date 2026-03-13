import { HttpStatus, Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class InventoryTransactionService {
  private readonly logger: BackendLogger = new BackendLogger(
    InventoryTransactionService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly inventoryService: ClientProxy,
  ) {}

  /**
   * Send GRN payload to microservice to create FIFO inventory transactions
   * ส่งข้อมูลใบรับสินค้าไปยังไมโครเซอร์วิสเพื่อสร้างรายการเคลื่อนไหวสินค้าคงคลังแบบ FIFO
   * @param data - GRN payload / ข้อมูลใบรับสินค้า
   * @param user_id - Authenticated user ID / รหัสผู้ใช้ที่ยืนยันตัวตนแล้ว
   * @param tenant_id - Business unit code / รหัสหน่วยธุรกิจ
   * @returns Inventory transaction result / ผลลัพธ์รายการเคลื่อนไหวสินค้าคงคลัง
   */
  async testCreateFromGrn(
    data: Record<string, unknown>,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'testCreateFromGrn', user_id, tenant_id },
      InventoryTransactionService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-transaction.create-from-grn', service: 'inventory-transaction' },
      { data, user_id, tenant_id },
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
