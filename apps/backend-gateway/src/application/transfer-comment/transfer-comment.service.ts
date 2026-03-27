import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ResponseLib } from 'src/libs/response.lib';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

@Injectable()
export class TransferCommentService {
  private readonly logger: BackendLogger = new BackendLogger(
    TransferCommentService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE') private readonly businessService: ClientProxy,
  ) {}

  async findById(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.find-by-id', service: 'transfer-comment' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }

  async findAllByTransferId(
    transfer_id: string,
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.find-all-by-transfer-id', service: 'transfer-comment' },
      { transfer_id, user_id, bu_code, paginate, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.successWithPaginate(response.data, response.paginate);
  }

  async create(
    data: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.create', service: 'transfer-comment' },
      { data, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.CREATED)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.created(response.data);
  }

  async update(
    id: string,
    data: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.update', service: 'transfer-comment' },
      { id, data, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }

  async delete(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.delete', service: 'transfer-comment' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }

  async addAttachment(
    id: string,
    attachment: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.add-attachment', service: 'transfer-comment' },
      { id, attachment, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }

  async removeAttachment(
    id: string,
    fileToken: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'transfer-comment.remove-attachment', service: 'transfer-comment' },
      { id, fileToken, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }
}
