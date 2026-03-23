import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ICreateExtraCost,
  IUpdateExtraCost,
  Result,
  MicroserviceResponse,
} from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

@Injectable()
export class ExtraCostService {
  private readonly logger: BackendLogger = new BackendLogger(
    ExtraCostService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  /**
   * Find an extra cost by ID via microservice
   * @param id - Extra cost ID
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Extra cost data or error
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
      ExtraCostService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'extra-cost.findOne', service: 'extra-cost' },
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
   * Find all extra costs with pagination via microservice
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param query - Pagination parameters
   * @param version - API version
   * @returns Paginated extra cost data or error
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
      ExtraCostService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'extra-cost.findAll', service: 'extra-cost' },
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
   * Create a new extra cost via microservice
   * @param createDto - Creation data
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Created extra cost or error
   */
  async create(
    createDto: ICreateExtraCost,
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
      ExtraCostService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'extra-cost.create', service: 'extra-cost' },
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
   * Update an existing extra cost via microservice
   * @param updateDto - Update data
   * @param user_id - Requesting user ID
   * @param bu_code - Business unit code
   * @param version - API version
   * @returns Updated extra cost or error
   */
  async update(
    updateDto: IUpdateExtraCost,
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
      ExtraCostService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'extra-cost.update', service: 'extra-cost' },
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
   * Delete an extra cost by ID via microservice
   * @param id - Extra cost ID
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
      ExtraCostService.name,
    );

    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'extra-cost.delete', service: 'extra-cost' },
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
