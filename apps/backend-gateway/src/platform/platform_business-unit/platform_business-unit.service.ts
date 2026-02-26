import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  IBusinessUnitCreate,
  IBusinessUnitUpdate,
} from './dto/business-unit.dto';
import { firstValueFrom, Observable } from 'rxjs';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class Platform_BusinessUnitService {
  private readonly logger: BackendLogger = new BackendLogger(
    Platform_BusinessUnitService.name,
  );

  constructor(
    @Inject('CLUSTER_SERVICE')
    private readonly businessUnitService: ClientProxy,
  ) { }

  async createBusinessUnit(
    data: IBusinessUnitCreate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'createBusinessUnit',
        data,
        user_id,
        tenant_id,
        version,
      },
      Platform_BusinessUnitService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessUnitService.send(
      { cmd: 'business-unit.create', service: 'business-unit' },
      { data: data, user_id: user_id, tenant_id: tenant_id, version: version },
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

  async updateBusinessUnit(
    data: IBusinessUnitUpdate,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'updateBusinessUnit',
        data,
        user_id,
        tenant_id,
        version,
      },
      Platform_BusinessUnitService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessUnitService.send(
      { cmd: 'business-unit.update', service: 'business-unit' },
      { data: data, user_id: user_id, tenant_id: tenant_id, version: version },
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

  async deleteBusinessUnit(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'deleteBusinessUnit',
        id,
        user_id,
        tenant_id,
        version,
      },
      Platform_BusinessUnitService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessUnitService.send(
      { cmd: 'business-unit.delete', service: 'business-unit' },
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

  async getBusinessUnitList(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'getBusinessUnitList',
        user_id,
        tenant_id,
        paginate,
        version,
      },
      Platform_BusinessUnitService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessUnitService.send(
      { cmd: 'business-unit.list', service: 'business-unit' },
      {
        data: null,
        user_id: user_id,
        tenant_id: tenant_id,
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

  async getBusinessUnitById(
    id: string,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'getBusinessUnitById',
        id,
        user_id,
        tenant_id,
        version,
      },
      Platform_BusinessUnitService.name,
    );
    const res: Observable<MicroserviceResponse> = this.businessUnitService.send(
      { cmd: 'business-unit.get-by-id', service: 'business-unit' },
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

}
