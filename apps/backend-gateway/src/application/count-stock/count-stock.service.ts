import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

@Injectable()
export class CountStockService {
  private readonly logger: BackendLogger = new BackendLogger(
    CountStockService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly businessService: ClientProxy,
  ) {}

  async findOne(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, version },
      CountStockService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'count-stock.findOne', service: 'count-stock' },
      { id: id, user_id: user_id, bu_code: bu_code, version: version },
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
    bu_code: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, bu_code, paginate, version },
      CountStockService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'count-stock.findAll', service: 'count-stock' },
      { user_id: user_id, bu_code: bu_code, paginate: paginate, version: version },
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
    data: unknown,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, version },
      CountStockService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'count-stock.create', service: 'count-stock' },
      { data: data, user_id: user_id, bu_code: bu_code, version: version },
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
    data: unknown,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, version },
      CountStockService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'count-stock.update', service: 'count-stock' },
      { data: data, user_id: user_id, bu_code: bu_code, version: version },
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

  async delete(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, version },
      CountStockService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'count-stock.delete', service: 'count-stock' },
      { id: id, user_id: user_id, bu_code: bu_code, version: version },
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
