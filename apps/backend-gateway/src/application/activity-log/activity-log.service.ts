import { HttpStatus, Injectable } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

export interface IActivityLogFilter {
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}

@Injectable()
export class ActivityLogService {
  private readonly logger: BackendLogger = new BackendLogger(
    ActivityLogService.name,
  );

  constructor(
    @Inject('LOG_SERVICE')
    private readonly logService: ClientProxy,
  ) {}

  async findAll(
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
    filters?: IActivityLogFilter,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'findAll',
        user_id,
        bu_code,
        paginate,
        filters,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.findAll', service: 'activity-log' },
      {
        user_id,
        bu_code,
        paginate,
        filters,
      },
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

  async findByEntity(
    entity_type: string,
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'findByEntity',
        entity_type,
        user_id,
        bu_code,
        paginate,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.findByEntity', service: 'activity-log' },
      {
        entity_type,
        user_id,
        bu_code,
        paginate,
      },
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

  async findOne(
    id: string,
    user_id: string,
    bu_code: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        user_id,
        bu_code,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.findOne', service: 'activity-log' },
      { id, user_id, bu_code },
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
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        user_id,
        bu_code,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.delete', service: 'activity-log' },
      { id, user_id, bu_code },
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

  async deleteMany(
    ids: string[],
    user_id: string,
    bu_code: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'deleteMany',
        ids,
        user_id,
        bu_code,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.deleteMany', service: 'activity-log' },
      { ids, user_id, bu_code },
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

  async hardDelete(
    id: string,
    user_id: string,
    bu_code: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'hardDelete',
        id,
        user_id,
        bu_code,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.hardDelete', service: 'activity-log' },
      { id, user_id, bu_code },
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

  async hardDeleteMany(
    ids: string[],
    user_id: string,
    bu_code: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'hardDeleteMany',
        ids,
        user_id,
        bu_code,
      },
      ActivityLogService.name,
    );

    const res: Observable<MicroserviceResponse> = this.logService.send(
      { cmd: 'activity-log.hardDeleteMany', service: 'activity-log' },
      { ids, user_id, bu_code },
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
