import { HttpStatus, Injectable } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { IPeriodCreate, IPeriodUpdate } from 'src/common/dto/period/period.dto';

@Injectable()
export class PeriodService {
  private readonly logger: BackendLogger = new BackendLogger(
    PeriodService.name,
  );
  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly inventoryService: ClientProxy,
  ) {}

  async findOne(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id, tenant_id, version },
      PeriodService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-period.findOne', service: 'inventory-period' },
      { id, user_id, tenant_id, version },
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
    tenant_id: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate, version },
      PeriodService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-period.findAll', service: 'inventory-period' },
      { user_id, tenant_id, paginate, version },
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

  async create(
    data: IPeriodCreate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id, tenant_id, version },
      PeriodService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-period.create', service: 'inventory-period' },
      { data, user_id, tenant_id, version },
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

  async update(
    id: string,
    data: IPeriodUpdate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', id, data, user_id, tenant_id, version },
      PeriodService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-period.update', service: 'inventory-period' },
      { id, data, user_id, tenant_id, version },
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

  async generateNext(
    count: number,
    start_day: number,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'generateNext', count, start_day, user_id, tenant_id, version },
      PeriodService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-period.generateNext', service: 'inventory-period' },
      { count, start_day, user_id, tenant_id, version },
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

  async delete(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id, tenant_id, version },
      PeriodService.name,
    );

    const res: Observable<MicroserviceResponse> = this.inventoryService.send(
      { cmd: 'inventory-period.delete', service: 'inventory-period' },
      { id, user_id, tenant_id, version },
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
