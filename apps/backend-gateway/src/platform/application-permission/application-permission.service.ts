import {
  Inject,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { CreateApplicationPermissionDto, UpdateApplicationPermissionDto } from './dto/application-permission.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

@Injectable()
export class ApplicationPermissionService {
  private readonly logger: BackendLogger = new BackendLogger(
    ApplicationPermissionService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE') private readonly authService: ClientProxy,
  ) {}

  /**
   * Get all application permissions
   * @param version
   * @returns
   */
  async findAll(version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findAll',
        version,
      },
      ApplicationPermissionService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'permission.findAll', service: 'permission' },
      { version },
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
   * Get application permission by ID
   * @param id
   * @param version
   * @returns
   */
  async findOne(id: string, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      ApplicationPermissionService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'permission.findOne', service: 'permission' },
      { id, version },
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
   * Create new application permission
   * @param createApplicationPermissionDto
   * @param version
   * @returns
   */
  async create(
    createApplicationPermissionDto: CreateApplicationPermissionDto,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'create',
        createApplicationPermissionDto,
        version,
      },
      ApplicationPermissionService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'permission.create', service: 'permission' },
      { data: createApplicationPermissionDto, version },
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
   * Update application permission
   * @param id
   * @param updateApplicationPermissionDto
   * @param version
   * @returns
   */
  async update(
    id: string,
    updateApplicationPermissionDto: UpdateApplicationPermissionDto,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateApplicationPermissionDto,
        version,
      },
      ApplicationPermissionService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'permission.update', service: 'permission' },
      { id, data: updateApplicationPermissionDto, version },
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
   * Delete application permission
   * @param id
   * @param version
   * @returns
   */
  async delete(id: string, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      ApplicationPermissionService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'permission.remove', service: 'permission' },
      { id, version },
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
