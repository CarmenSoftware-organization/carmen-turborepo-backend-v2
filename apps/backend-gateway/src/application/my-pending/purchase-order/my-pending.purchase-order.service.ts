import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class MyPendingPurchaseOrderService {
  private readonly logger: BackendLogger = new BackendLogger(
    MyPendingPurchaseOrderService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly procurementService: ClientProxy,
  ) {}

  async findById(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<any>> {
    this.logger.debug(
      {
        function: 'findById',
        id,
        version,
      },
      MyPendingPurchaseOrderService.name,
    );

    const res: Observable<any> = this.procurementService.send(
      { cmd: 'purchase-order.find-by-id', service: 'purchase-order' },
      { id: id, user_id: user_id, tenant_id: tenant_id, version: version },
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

  async findAll(
    user_id: string,
    bu_code: string[],
    paginate: IPaginate,
    version: string,
  ): Promise<Result<any>> {
    this.logger.debug(
      {
        function: 'findAll',
        user_id,
        bu_code,
        paginate,
        version,
      },
      MyPendingPurchaseOrderService.name,
    );

    const res: Observable<any> = this.procurementService.send(
      { cmd: 'my-pending.purchase-order.find-all', service: 'my-pending' },
      {
        user_id: user_id,
        bu_code: bu_code,
        paginate: paginate,
        version: version,
      },
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

  async findAllMyPendingPurchaseOrdersCount(
    user_id: string,
    version: string,
  ): Promise<any> {
    this.logger.debug(
      {
        function: 'findAllMyPendingPurchaseOrdersCount',
        version,
        user_id,
      },
      MyPendingPurchaseOrderService.name,
    );

    const res: Observable<any> = this.procurementService.send(
      {
        cmd: 'my-pending.purchase-order.find-all.count',
        service: 'my-pending',
      },
      {
        user_id,
        version: version,
      },
    );

    const response = await firstValueFrom(res);

    this.logger.debug(
      {
        function: 'findAllMyPendingPurchaseOrdersCount',
        version,
        user_id,
        response,
      },
      MyPendingPurchaseOrderService.name,
    );

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }
}
