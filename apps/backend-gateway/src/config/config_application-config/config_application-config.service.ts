import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { ICreateApplicationConfig, IUpdateApplicationConfig } from './dto/application-config.dto';

@Injectable()
export class Config_ApplicationConfigService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ApplicationConfigService.name,
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
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.findOne', service: 'application-config' },
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
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.findAll', service: 'application-config' },
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
    createDto: ICreateApplicationConfig,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', createDto, version },
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.create', service: 'application-config' },
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
    updateDto: IUpdateApplicationConfig,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', updateDto, version },
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.update', service: 'application-config' },
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
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.delete', service: 'application-config' },
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

  async findByKey(
    key: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findByKey', key, version },
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.findByKey', service: 'application-config' },
      { key: key, user_id: user_id, bu_code: bu_code, version: version },
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

  async findUserConfig(
    key: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findUserConfig', key, user_id, version },
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.findUserConfig', service: 'application-config' },
      { key: key, user_id: user_id, bu_code: bu_code, version: version },
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

  async upsertUserConfig(
    key: string,
    data: { value: unknown },
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'upsertUserConfig', key, data, user_id, version },
      Config_ApplicationConfigService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'application-config.upsertUserConfig', service: 'application-config' },
      { key: key, data: data, user_id: user_id, bu_code: bu_code, version: version },
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
