import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ICreateJournalVoucher,
  IUpdateJournalVoucher,
  Result,
  MicroserviceResponse,
} from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

@Injectable()
export class JournalVoucherService {
  private readonly logger: BackendLogger = new BackendLogger(
    JournalVoucherService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  /**
   * Find a journal voucher by ID via microservice
   * @param id - Journal voucher ID
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Journal voucher data or error
   */
  async findOne(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      JournalVoucherService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'journal-voucher.findOne', service: 'journal-voucher' },
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

  /**
   * Find all journal vouchers with pagination via microservice
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param query - Pagination parameters
   * @param version - API version
   * @returns Paginated journal voucher data or error
   */
  async findAll(
    user_id: string,
    bu_code: string,
    query: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      JournalVoucherService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'journal-voucher.findAll', service: 'journal-voucher' },
      {
        user_id: user_id,
        paginate: query,
        bu_code: bu_code,
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

    return Result.ok({ data: response.data, paginate: response.paginate });
  }

  /**
   * Create a new journal voucher via microservice
   * @param createDto - Creation data with details
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Created journal voucher or error
   */
  async create(
    createDto: ICreateJournalVoucher,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      JournalVoucherService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'journal-voucher.create', service: 'journal-voucher' },
      {
        data: createDto,
        user_id: user_id,
        bu_code: bu_code,
        version: version,
      },
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

  /**
   * Update an existing journal voucher via microservice
   * @param updateDto - Update data with detail operations
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Updated journal voucher or error
   */
  async update(
    updateDto: IUpdateJournalVoucher,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'update',
        updateDto,
        version,
      },
      JournalVoucherService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'journal-voucher.update', service: 'journal-voucher' },
      {
        data: updateDto,
        user_id: user_id,
        bu_code: bu_code,
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

  /**
   * Delete a journal voucher by ID via microservice
   * @param id - Journal voucher ID
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Deletion result or error
   */
  async delete(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      JournalVoucherService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'journal-voucher.delete', service: 'journal-voucher' },
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
