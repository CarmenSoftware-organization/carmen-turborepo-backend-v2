import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  NotImplementedException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IInviteUser, ILogin, IRegisterConfirm, IResetPassword, IForgotPassword, IResetPasswordWithToken, IChangePassword } from './dto/auth.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ResponseLib } from 'src/libs/response.lib';
import { sendToService } from 'src/common/helpers/microservice.helper';
import { MicroserviceResponse } from '@/common';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger: BackendLogger = new BackendLogger(AuthService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) { }

  async onModuleInit() {
    const maxRetries = 5;
    const delayMs = 3000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.authService.connect();
        this.logger.log('AUTH_SERVICE TCP client connected');
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

  /**
   * Login function
   * @param loginDto
   * @param version
   * @returns
   */
  async login(loginDto: ILogin, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'login',
        loginDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'login', service: 'auth' },
      { data: loginDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async logout(logoutDto: Record<string, unknown>, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'logout',
        logoutDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'logout', service: 'auth' },
      { data: logoutDto, version: version },
    );

    if (response.response.status !== HttpStatus.NO_CONTENT) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async register(registerDto: Record<string, unknown>, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'register',
        registerDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'register', service: 'auth' },
      { data: registerDto, version: version },
    );

    if (response.response.status !== HttpStatus.CREATED) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.created(response.data);
  }

  async inviteUser(inviteUserDto: IInviteUser, user_id: string, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'inviteUser',
        inviteUserDto,
        user_id,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'invite-user', service: 'auth' },
      { data: inviteUserDto, user_id, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async registerConfirm(
    registerConfirmDto: IRegisterConfirm,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'registerConfirm',
        registerConfirmDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'register-confirm', service: 'auth' },
      { data: registerConfirmDto, version: version },
    );

    if (response.response.status !== HttpStatus.CREATED) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.created(response.data);
  }

  async refreshToken(refreshTokenDto: Record<string, unknown>, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'refreshToken',
        refreshTokenDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'refresh-token', service: 'auth' },
      { data: refreshTokenDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async forgotPassword(forgotPasswordDto: IForgotPassword, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'forgotPassword',
        forgotPasswordDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'forgot-password', service: 'auth' },
      { data: forgotPasswordDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async resetPasswordWithToken(resetPasswordWithTokenDto: IResetPasswordWithToken, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'resetPasswordWithToken',
        token: resetPasswordWithTokenDto.token,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'reset-password-with-token', service: 'auth' },
      { data: resetPasswordWithTokenDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async resetPassword(resetPasswordDto: IResetPassword, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'reset-password',
        email: resetPasswordDto.email,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'reset-password', service: 'auth' },
      { data: resetPasswordDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async changePassword(changePasswordDto: IChangePassword & { user_id: string; accessToken: string }, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'changePassword',
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'change-password', service: 'auth' },
      { data: changePasswordDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async changeEmail(changeEmailDto: Record<string, unknown>, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'changeEmail',
        changeEmailDto,
        version,
      },
      AuthService.name,
    );

    throw new NotImplementedException('Not implemented');
  }

  async getByTenant(tenant_id: string, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getByTenant',
        tenant_id,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'get-by-tenant', service: 'auth' },
      { data: tenant_id, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }

  async getAllUsers(version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getAllUsers',
        version,
      },
      AuthService.name,
    );

    const response = await sendToService<MicroserviceResponse>(
      this.authService,
      { cmd: 'get-all-users', service: 'auth' },
      { data: {}, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return ResponseLib.success(response.data);
  }
}
