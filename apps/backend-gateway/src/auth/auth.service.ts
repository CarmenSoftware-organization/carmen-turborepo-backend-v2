import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  NotImplementedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IInviteUser, ILogin, IRegisterConfirm, IResetPassword, IForgotPassword, IResetPasswordWithToken } from './dto/auth.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ResponseLib } from 'src/libs/response.lib';
import { sendToService } from 'src/common/helpers/microservice.helper';

@Injectable()
export class AuthService {
  private readonly logger: BackendLogger = new BackendLogger(AuthService.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) { }

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

    const response = await sendToService(
      this.authService,
      { cmd: 'login', service: 'auth' },
      { data: loginDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
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

    const response = await sendToService(
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

    const response = await sendToService(
      this.authService,
      { cmd: 'register', service: 'auth' },
      { data: registerDto, version: version },
    );

    if (response.response.status !== HttpStatus.CREATED) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
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

    const response = await sendToService(
      this.authService,
      { cmd: 'invite-user', service: 'auth' },
      { data: inviteUserDto, user_id, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
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

    const response = await sendToService(
      this.authService,
      { cmd: 'register-confirm', service: 'auth' },
      { data: registerConfirmDto, version: version },
    );

    if (response.response.status !== HttpStatus.CREATED) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
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

    const response = await sendToService(
      this.authService,
      { cmd: 'refresh-token', service: 'auth' },
      { data: refreshTokenDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
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

    const response = await sendToService(
      this.authService,
      { cmd: 'forgot-password', service: 'auth' },
      { data: forgotPasswordDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response;
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

    const response = await sendToService(
      this.authService,
      { cmd: 'reset-password-with-token', service: 'auth' },
      { data: resetPasswordWithTokenDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response;
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

    const response = await sendToService(
      this.authService,
      { cmd: 'reset-password', service: 'auth' },
      { data: resetPasswordDto, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response;
  }

  async changePassword(changePasswordDto: Record<string, unknown>, version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'changePassword',
        changePasswordDto,
        version,
      },
      AuthService.name,
    );

    const response = await sendToService(
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

    const response = await sendToService(
      this.authService,
      { cmd: 'get-by-tenant', service: 'auth' },
      { data: tenant_id, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
  }

  async getAllUsers(version: string): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getAllUsers',
        version,
      },
      AuthService.name,
    );

    const response = await sendToService(
      this.authService,
      { cmd: 'get-all-users', service: 'auth' },
      { data: {}, version: version },
    );

    if (response.response.status !== HttpStatus.OK) {
      throw new HttpException(response.response, response.response.status);
    }

    return response.data;
  }
}
