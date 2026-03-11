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

  private async sendCommand(
    cmd: string,
    payload: Record<string, unknown>,
  ): Promise<Result<unknown>> {
    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd, service: 'inventory-transaction' },
      payload,
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

  async testIssue(data: Record<string, unknown>, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'testIssue', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.test-issue', { data, user_id, tenant_id });
  }

  async testAdjustmentOut(data: Record<string, unknown>, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'testAdjustmentOut', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.test-adjustment-out', { data, user_id, tenant_id });
  }

  async testAdjustmentIn(data: Record<string, unknown>, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'testAdjustmentIn', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.test-adjustment-in', { data, user_id, tenant_id });
  }

  async testTransfer(data: Record<string, unknown>, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'testTransfer', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.test-transfer', { data, user_id, tenant_id });
  }

  async testCreditNoteQty(data: Record<string, unknown>, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'testCreditNoteQty', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.test-credit-note-qty', { data, user_id, tenant_id });
  }

  async getCostLayers(product_id: string | undefined, location_id: string | undefined, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getCostLayers', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.get-cost-layers', { product_id, location_id, user_id, tenant_id });
  }

  async getStockBalance(product_id: string | undefined, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getStockBalance', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.get-stock-balance', { product_id, user_id, tenant_id });
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  async getLocations(user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getLocations', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.get-locations', { user_id, tenant_id });
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  async getProducts(user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getProducts', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.get-products', { user_id, tenant_id });
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  async getProductsByLocation(location_id: string, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getProductsByLocation', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.get-products-by-location', { location_id, user_id, tenant_id });
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  async getCalculationMethod(user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getCalculationMethod', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.get-calculation-method', { user_id, tenant_id });
  }

  // ⚠️ TEST ONLY — DELETE
  async clearProductTransactions(data: Record<string, unknown>, user_id: string, tenant_id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'clearProductTransactions', user_id, tenant_id }, InventoryTransactionService.name);
    return this.sendCommand('inventory-transaction.clear-product-transactions', { data, user_id, tenant_id });
  }
}
