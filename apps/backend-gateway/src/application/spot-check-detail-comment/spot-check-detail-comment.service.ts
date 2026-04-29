import {
  BadGatewayException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ResponseLib } from 'src/libs/response.lib';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

import { getGatewayRequestContext } from '@/common/context/gateway-request-context';
export interface UploadedAttachment {
  fileName: string;
  fileToken: string;
  fileUrl: string;
  contentType: string;
  size: number;
}

@Injectable()
export class SpotCheckDetailCommentService {
  private readonly logger: BackendLogger = new BackendLogger(
    SpotCheckDetailCommentService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE') private readonly businessService: ClientProxy,
    @Inject('FILE_SERVICE') private readonly fileService: ClientProxy,
  ) {}

  async findById(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'spot-check-detail-comment.find-by-id', service: 'spot-check-detail-comment' },
      { id, user_id, bu_code, version, ...getGatewayRequestContext() },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }

  async findAllBySpotCheckDetailId(
    spot_check_detail_id: string,
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
    version: string,
  ): Promise<unknown> {
    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'spot-check-detail-comment.find-all-by-spot-check-detail-id', service: 'spot-check-detail-comment' },
      { spot_check_detail_id, user_id, bu_code, paginate, version, ...getGatewayRequestContext() },
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
      { cmd: 'spot-check-detail-comment.create', service: 'spot-check-detail-comment' },
      { data, user_id, bu_code, version, ...getGatewayRequestContext() },
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
      { cmd: 'spot-check-detail-comment.update', service: 'spot-check-detail-comment' },
      { id, data, user_id, bu_code, version, ...getGatewayRequestContext() },
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
      { cmd: 'spot-check-detail-comment.delete', service: 'spot-check-detail-comment' },
      { id, user_id, bu_code, version, ...getGatewayRequestContext() },
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
      { cmd: 'spot-check-detail-comment.add-attachment', service: 'spot-check-detail-comment' },
      { id, attachment, user_id, bu_code, version, ...getGatewayRequestContext() },
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
      { cmd: 'spot-check-detail-comment.remove-attachment', service: 'spot-check-detail-comment' },
      { id, fileToken, user_id, bu_code, version, ...getGatewayRequestContext() },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK)
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    return ResponseLib.success(response.data);
  }
  async createWithFiles(
    files: Express.Multer.File[],
    dto: {
      spot_check_detail_id: string;
      message?: string | null;
      type?: 'user' | 'system';
    },
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    const uploaded: UploadedAttachment[] = [];

    if (files.length > 0) {
      const settled = await Promise.allSettled(
        files.map((f) => this.uploadFile(f, user_id, bu_code)),
      );

      const failures = settled.filter((s) => s.status === 'rejected');
      const successes = settled.filter(
        (s): s is PromiseFulfilledResult<UploadedAttachment> =>
          s.status === 'fulfilled',
      );

      uploaded.push(...successes.map((s) => s.value));

      if (failures.length > 0) {
        this.logger.warn(
          {
            function: 'createWithFiles',
            phase: 'upload-rollback',
            bu_code,
            spot_check_detail_id: dto.spot_check_detail_id,
            uploaded_count: uploaded.length,
            failed_count: failures.length,
          },
          SpotCheckDetailCommentService.name,
        );
        await Promise.all(
          uploaded.map((a) => this.deleteFile(a.fileToken, user_id, bu_code)),
        );
        const firstReason = (failures[0] as PromiseRejectedResult).reason;
        const msg =
          firstReason instanceof Error ? firstReason.message : String(firstReason);
        throw new BadGatewayException(`File upload failed: ${msg}`);
      }
    }

    const data = {
      spot_check_detail_id: dto.spot_check_detail_id,
      message: dto.message ?? null,
      type: dto.type ?? 'user',
      attachments: uploaded,
    };

    const res: Observable<MicroserviceResponse> = this.businessService.send(
      { cmd: 'spot-check-detail-comment.create', service: 'spot-check-detail-comment' },
      { data, user_id, bu_code, version, ...getGatewayRequestContext() },
    );
    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.CREATED) {
      if (uploaded.length > 0) {
        this.logger.warn(
          {
            function: 'createWithFiles',
            phase: 'create-rollback',
            bu_code,
            spot_check_detail_id: dto.spot_check_detail_id,
            uploaded_count: uploaded.length,
            create_status: response.response.status,
          },
          SpotCheckDetailCommentService.name,
        );
        await Promise.all(
          uploaded.map((a) => this.deleteFile(a.fileToken, user_id, bu_code)),
        );
      }
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }
    return ResponseLib.created(response.data);
  }

  async uploadFile(
    file: Express.Multer.File,
    user_id: string,
    bu_code: string,
  ): Promise<UploadedAttachment> {
    const payload = {
      fileName: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer.toString('base64'),
      bu_code,
      user_id,
      ...getGatewayRequestContext(),
    };
    const res: Observable<MicroserviceResponse> = this.fileService.send(
      { cmd: 'file.upload', service: 'files' },
      payload,
    );
    const response = (await firstValueFrom(res)) as any;
    if (!response.success) {
      const msg = response.response?.message ?? 'File upload failed';
      throw new BadGatewayException(msg);
    }
    const data = response.data as
      | {
          fileToken?: string;
          objectName?: string;
          originalName?: string;
          contentType?: string;
          size?: number;
        }
      | undefined;
    return {
      fileName: data?.originalName ?? file.originalname,
      fileToken: String(data?.fileToken ?? ''),
      fileUrl: '',
      contentType: data?.contentType ?? file.mimetype,
      size: typeof data?.size === 'number' ? data.size : file.size,
    };
  }

  async deleteFile(
    fileToken: string,
    user_id: string,
    bu_code: string,
  ): Promise<boolean> {
    try {
      const res: Observable<MicroserviceResponse> = this.fileService.send(
        { cmd: 'file.delete', service: 'files' },
        { fileToken, user_id, bu_code, ...getGatewayRequestContext() },
      );
      const response = (await firstValueFrom(res)) as any;
      if (!response.success) {
        this.logger.warn(
          {
            function: 'deleteFile',
            fileToken,
            reason: response.response?.message,
          },
          SpotCheckDetailCommentService.name,
        );
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(
        { function: 'deleteFile', fileToken, error: (err as Error).message },
        SpotCheckDetailCommentService.name,
      );
      return false;
    }
  }
}
