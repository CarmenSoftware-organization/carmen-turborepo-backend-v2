import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result } from '@/common';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { getGatewayRequestContext } from '@/common/context/gateway-request-context';

interface MicroResponse {
  status: number;
  data?: unknown;
  error?: string;
  details?: string;
}

@Injectable()
export class Config_SqlQueryService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_SqlQueryService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly businessService: ClientProxy,
  ) {}

  private async call(
    cmd: string,
    payload: Record<string, unknown>,
    okStatus: number = HttpStatus.OK,
  ): Promise<Result<unknown>> {
    const obs: Observable<MicroResponse> = this.businessService.send(
      { cmd, service: 'business' },
      { ...payload, ...getGatewayRequestContext() },
    );
    const response = await firstValueFrom(obs);

    if (response.status !== okStatus) {
      const message = response.details
        ? `${response.error || 'Request failed'}: ${response.details}`
        : response.error || 'Request failed';
      this.logger.warn(
        { function: 'call', cmd, status: response.status, error: response.error, details: response.details },
        Config_SqlQueryService.name,
      );
      return Result.error(message, httpStatusToErrorCode(response.status));
    }
    return Result.ok(response.data);
  }

  async list(bu_code: string, user_id: string) {
    return this.call('sqlQuery.list', { bu_code, user_id });
  }

  async get(bu_code: string, user_id: string, id: string) {
    return this.call('sqlQuery.get', { bu_code, user_id, id });
  }

  async create(bu_code: string, user_id: string, body: Record<string, unknown>) {
    return this.call('sqlQuery.create', { bu_code, user_id, ...body }, HttpStatus.CREATED);
  }

  async update(bu_code: string, user_id: string, id: string, body: Record<string, unknown>) {
    return this.call('sqlQuery.update', { bu_code, user_id, id, ...body });
  }

  async delete(bu_code: string, user_id: string, id: string) {
    return this.call('sqlQuery.delete', { bu_code, user_id, id });
  }

  async duplicate(bu_code: string, user_id: string, id: string) {
    return this.call('sqlQuery.duplicate', { bu_code, user_id, id }, HttpStatus.CREATED);
  }
}
