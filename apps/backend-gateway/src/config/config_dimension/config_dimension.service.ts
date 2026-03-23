import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { ICreateDimension, IUpdateDimension } from './dto/dimension.dto';

@Injectable()
export class Config_DimensionService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DimensionService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  async findOne(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, version },
      Config_DimensionService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'dimension.findOne', service: 'dimension' },
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
      Config_DimensionService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'dimension.findAll', service: 'dimension' },
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
    createDto: ICreateDimension,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', createDto, version },
      Config_DimensionService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'dimension.create', service: 'dimension' },
      { data: createDto, user_id: user_id, bu_code: bu_code, version: version },
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
    updateDto: IUpdateDimension,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', updateDto, version },
      Config_DimensionService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'dimension.update', service: 'dimension' },
      { data: updateDto, user_id: user_id, bu_code: bu_code, version: version },
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
      Config_DimensionService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'dimension.delete', service: 'dimension' },
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
