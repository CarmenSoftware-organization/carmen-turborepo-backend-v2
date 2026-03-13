import {
  Inject,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { CreateApplicationRoleDto, UpdateApplicationRoleDto } from './dto/application-role.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

@Injectable()
export class ApplicationRoleService {
  private readonly logger: BackendLogger = new BackendLogger(
    ApplicationRoleService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE') private readonly authService: ClientProxy,
  ) { }

  /**
   * Get all application roles
   * @param version
   * @returns
   */
  async findAll(version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findAll',
        version,
      },
      ApplicationRoleService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'role.findAll', service: 'role' },
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
   * Get application role by ID
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
      ApplicationRoleService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'role.findOne', service: 'role' },
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
   * Create new application role
   * @param createApplicationRoleDto
   * @param version
   * @returns
   */
  async create(
    createApplicationRoleDto: CreateApplicationRoleDto,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'create',
        createApplicationRoleDto,
        version,
      },
      ApplicationRoleService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'role.create', service: 'role' },
      { data: createApplicationRoleDto, version },
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
   * Update application role
   * @param id
   * @param updateApplicationRoleDto
   * @param version
   * @returns
   */
  async update(
    id: string,
    updateApplicationRoleDto: UpdateApplicationRoleDto,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateApplicationRoleDto,
        version,
      },
      ApplicationRoleService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'role.update', service: 'role' },
      { id, data: updateApplicationRoleDto, version },
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
   * Delete application role
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
      ApplicationRoleService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'role.remove', service: 'role' },
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
