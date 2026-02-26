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
    @Inject('INVENTORY_SERVICE')
    private readonly inventoryService: ClientProxy,
  ) {}

  /**
   * ⚠️ TEST ONLY — DELETE when GRN approve integration is verified.
   *
   * Calls createFromGoodReceivedNote via TCP so you can test the FIFO
   * cost-layer logic with a direct HTTP request.
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
      { cmd: 'inventory-transaction.test-create-from-grn', service: 'inventory-transaction' },
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
