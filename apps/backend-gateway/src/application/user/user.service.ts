import { Inject, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { AuthService } from 'src/auth/auth.service';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { sendToService } from 'src/common/helpers/microservice.helper';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger: BackendLogger = new BackendLogger(UserService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async onModuleInit() {
    const maxRetries = 5;
    const delayMs = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.authService.connect();
        this.logger.log('AUTH_SERVICE TCP client connected (UserService)');
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : error;
        if (attempt < maxRetries) {
          this.logger.warn(`AUTH_SERVICE connection attempt ${attempt}/${maxRetries} failed: ${message}. Retrying in ${delayMs / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          this.logger.error(`AUTH_SERVICE connection failed after ${maxRetries} attempts: ${message}. Will reconnect on first request.`);
        }
      }
    }
  }

  async getUserProfile(id: string, version: string): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'getUserProfile',
        id,
        version,
      },
      UserService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'get-user-profile', service: 'auth' },
      { id: id, version: version },
    );

    this.logger.log({
      file: AuthService.name,
      function: this.getUserProfile.name,
      res: response,
    });

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  async getAllUserInTenant(
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'getAllUserInTenant',
        user_id,
        bu_code,
        version,
      },
      UserService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'get-all-user-in-tenant', service: 'auth' },
      { user_id: user_id, bu_code: bu_code, version: version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok({
      data: response.data,
      paginate: response.data.paginate,
    });
  }

  async updateUserById(
    userId: string,
    updateData: {
      firstname?: string;
      middlename?: string;
      lastname?: string;
      telephone?: string;
    },
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'updateUserById',
        userId,
        updateData,
        version,
      },
      UserService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'update-user-profile', service: 'auth' },
      { user_id: userId, data: updateData, version: version },
    );

    const response = await firstValueFrom(res);

    this.logger.log({
      file: UserService.name,
      function: this.updateUserById.name,
      res: response,
    });

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  async getPermission(user_id: string, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getPermission',
        user_id,
        version,
      },
      UserService.name,
    );

    const res: Observable<MicroserviceResponse> = this.authService.send(
      { cmd: 'get-permission', service: 'auth' },
      { user_id: user_id, version: version },
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
