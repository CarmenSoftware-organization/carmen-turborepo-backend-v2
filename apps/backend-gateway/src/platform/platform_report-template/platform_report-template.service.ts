import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

import { getGatewayRequestContext } from '@/common/context/gateway-request-context';
@Injectable()
export class Platform_ReportTemplateService {
  private readonly logger: BackendLogger = new BackendLogger(
    Platform_ReportTemplateService.name,
  );

  constructor(
    @Inject('CLUSTER_SERVICE')
    private readonly clusterService: ClientProxy,
  ) {}

  async findAll(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate, version },
      Platform_ReportTemplateService.name,
    );

    const res: Observable<MicroserviceResponse> = this.clusterService.send(
      { cmd: 'report-template.findAll', service: 'report-template' },
      { user_id, tenant_id, paginate, version, ...getGatewayRequestContext() },
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
    tenant_id: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      { function: 'findOne', id, user_id, tenant_id, version },
      Platform_ReportTemplateService.name,
    );

    const res: Observable<MicroserviceResponse> = this.clusterService.send(
      { cmd: 'report-template.findOne', service: 'report-template' },
      { id, user_id, tenant_id, version, ...getGatewayRequestContext() },
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

  async create(
    data: Record<string, unknown>,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      { function: 'create', data, user_id, tenant_id, version },
      Platform_ReportTemplateService.name,
    );

    const res: Observable<MicroserviceResponse> = this.clusterService.send(
      { cmd: 'report-template.create', service: 'report-template' },
      { data, user_id, tenant_id, version, ...getGatewayRequestContext() },
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
    data: Record<string, unknown>,
    user_id: string,
    tenant_id: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      { function: 'update', id, data, user_id, tenant_id, version },
      Platform_ReportTemplateService.name,
    );

    const res: Observable<MicroserviceResponse> = this.clusterService.send(
      { cmd: 'report-template.update', service: 'report-template' },
      { id, data, user_id, tenant_id, version, ...getGatewayRequestContext() },
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
    tenant_id: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      { function: 'delete', id, user_id, tenant_id, version },
      Platform_ReportTemplateService.name,
    );

    const res: Observable<MicroserviceResponse> = this.clusterService.send(
      { cmd: 'report-template.delete', service: 'report-template' },
      { id, user_id, tenant_id, version, ...getGatewayRequestContext() },
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
