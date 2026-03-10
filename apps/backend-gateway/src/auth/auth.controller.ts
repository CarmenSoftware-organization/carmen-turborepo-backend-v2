import {
  Controller,
  ConsoleLogger,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  InviteUserDto,
  LoginDto,
  RegisterConfirmDto,
  RegisterDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  ResetPasswordWithTokenDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHideProperty,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { KeycloakGuard } from './guards/keycloak.guard';
import { Glob } from 'bun';
import { ExceptionFilter } from 'src/exception/exception.fillter';
import { IgnoreGuards } from './decorators/ignore-guard.decorator';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/auth')
// @UseFilters(ExceptionFilter)
@ApiTags('Authentication')
@ApiHeaderRequiredXAppId()
export class AuthController {
  private readonly logger: BackendLogger = new BackendLogger(
    AuthController.name,
  );

  constructor(private readonly authService: AuthService) {}

  /**
   * Authenticates a user against Keycloak using email and password credentials.
   * Returns JWT access and refresh tokens for subsequent API requests across all ERP modules.
   */
  @Post('login')
  @UseGuards(new AppIdGuard('auth.login'))
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: LoginDto,
    description: 'Login',
    examples: {
      Login: {
        value: {
          email: 'test@test.com',
          password: '12345678',
        },
      },
      'Login with wrong email': {
        value: {
          email: 'test@test.com',
          password: 'password',
        },
      },
    },
  })
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticates a user against Keycloak using email and password credentials, returning JWT access and refresh tokens for subsequent API requests across all ERP modules.',
    operationId: 'login',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [{}],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Login successful',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'login',
        loginDto,
        version,
      },
      AuthController.name,
    );

    return this.authService.login({ ...loginDto }, version);
  }

  /**
   * Terminates the user's authenticated session by invalidating their Keycloak tokens.
   * The user must log in again to access ERP resources.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @UseGuards(KeycloakGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
    description: 'Terminates the user\'s authenticated session by invalidating their Keycloak tokens, ensuring they can no longer access ERP resources until they log in again.',
    operationId: 'logout',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Logout successful',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async logout(
    @Query('version') version: string = 'latest',
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);

    const logoutDto = { user_id: user_id, ...body };

    this.logger.debug(
      {
        function: 'logout',
        logoutDto,
        version,
      },
      AuthController.name,
    );

    return this.authService.logout(logoutDto, version);
  }

  /**
   * Creates a new user account in both Keycloak and the Carmen platform.
   * Used to onboard new hotel staff such as purchasers, department heads, or property managers.
   */
  @Post('register')
  // @UseGuards(KeycloakGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiVersionMinRequest()
  @ApiBody({
    type: RegisterDto,
    description: 'Register a new user',
    examples: {
      Register: {
        value: {
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'password123',
          user_info: {
            first_name: 'John',
            middle_name: '',
            last_name: 'Doe',
            telephone: '0812345678',
          },
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Register',
    description: 'Creates a new user account in both Keycloak and the Carmen platform. Used to onboard new hotel staff such as purchasers, department heads, or property managers into the ERP system.',
    operationId: 'register',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      201: {
        description: 'Register successful',
      },
      401: {
        description: 'Unauthorized',
      },
      409: {
        description: 'User already exists',
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'register',
        registerDto,
        version,
      },
      AuthController.name,
    );

    return this.authService.register({ ...registerDto }, version);
  }

  /**
   * Sends an invitation to a new user to join the Carmen ERP platform.
   * The invited user receives a registration link to complete their account setup.
   */
  @Post('invite-user')
  @UseGuards(KeycloakGuard)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Invite User',
    description: 'Sends an invitation to a new user to join the Carmen ERP platform. The invited user receives a registration link to complete their account setup and gain access to assigned hotel properties.',
    operationId: 'inviteUser',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Invite user successful',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @Query('version') version: string = 'latest',
    @Req() req: Request,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'inviteUser',
        inviteUserDto,
        version,
      },
      AuthController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.authService.inviteUser({ ...inviteUserDto }, user_id, version);
  }

  /**
   * Completes the registration process for an invited user.
   * Verifies the invitation token and activates the user's account in the platform.
   */
  @Post('register-confirm')
  @IgnoreGuards(KeycloakGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Register Confirm',
    description: 'Completes the registration process for an invited user by verifying their invitation token and activating their account in the Carmen ERP platform.',
    operationId: 'registerConfirm',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [{}],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Register confirm successful',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async registerConfirm(
    @Body() registerConfirmDto: RegisterConfirmDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'registerConfirm',
        registerConfirmDto,
        version,
      },
      AuthController.name,
    );

    return this.authService.registerConfirm({ ...registerConfirmDto }, version);
  }

  // @Post('verify-token')
  // async verifyToken(
  //   @Body() verifyTokenDto: any,
  //   @Query('version') version: string,
  // ) {
  //   this.logger.log({
  //     file: AuthController.name,
  //     function: this.verifyToken.name,
  //     verifyTokenDto: verifyTokenDto,
  //     version: version,
  //   });
  //   return this.authService.verifyToken(verifyTokenDto, version);
  // }

  /**
   * Exchanges an expired or expiring access token for a new one using the refresh token.
   * Maintains the user's authenticated session without requiring re-login.
   */
  @Post('refresh-token')
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Refresh Token',
    description: 'Exchanges an expired or expiring access token for a new one using the refresh token, maintaining the user\'s authenticated session without requiring them to log in again.',
    operationId: 'refreshToken',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [{}],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Refresh token successful',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async refreshToken(
    @Body() refreshTokenDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'refreshToken',
        refreshTokenDto,
        version,
      },
      AuthController.name,
    );

    return this.authService.refreshToken(refreshTokenDto, version);
  }

  /**
   * Initiates the password recovery flow for a user who has forgotten their credentials.
   * Sends a password reset email with a secure token link to the registered address.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Forgot Password - Send reset email',
    examples: {
      'Forgot Password': {
        value: {
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Forgot Password',
    description:
      'Initiates the password recovery flow for a user who has forgotten their credentials. Sends a password reset email with a secure token link to the registered email address.',
    operationId: 'forgotPassword',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [{}],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Password reset email sent successfully',
      },
      404: {
        description: 'User not found',
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'forgotPassword',
        forgotPasswordDto,
        version,
      },
      AuthController.name,
    );

    return this.authService.forgotPassword({ ...forgotPasswordDto }, version);
  }

  /**
   * Completes the password recovery process by setting a new password using the emailed token.
   * The token is single-use and time-limited for security.
   */
  @Post('reset-password-with-token')
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({
    type: ResetPasswordWithTokenDto,
    description: 'Reset password using token from email',
    examples: {
      'Reset Password': {
        value: {
          token: 'abc123',
          new_password: 'newPassword123',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Reset Password with Token',
    description: 'Completes the password recovery process by setting a new password using the secure token received via the forgot-password email. The token is single-use and time-limited for security.',
    operationId: 'resetPasswordWithToken',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [{}],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Password reset successful',
      },
      400: {
        description: 'Invalid or expired token',
      },
      404: {
        description: 'Token not found',
      },
    },
  })
  async resetPasswordWithToken(
    @Body() resetPasswordWithTokenDto: ResetPasswordWithTokenDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'resetPasswordWithToken',
        token: resetPasswordWithTokenDto.token,
        version,
      },
      AuthController.name,
    );

    return this.authService.resetPasswordWithToken(
      { ...resetPasswordWithTokenDto },
      version,
    );
  }

  // @Get('mobile')
  // @ApiBearerAuth()
  // @ApiVersionMinRequest()
  // async mobile(@Req() req: any, @Query('version') version: string = 'latest') {
  //   const { authorization } = req.headers as any;
  //   const [, accessToken] = authorization.split(' ');
  //   const appId = req.headers['x-app-id'];
  //   return this.authService.permission_mobile(accessToken, appId, version);
  // }

  // @Get('web')
  // @ApiBearerAuth()
  // @ApiVersionMinRequest()
  // async web(@Req() req: any, @Query('version') version: string = 'latest') {
  //   const { authorization } = req.headers as any;
  //   const [, accessToken] = authorization.split(' ');
  //   return this.authService.permission_web(accessToken, version);
  // }

  /**
   * Allows a platform administrator to forcibly reset another user's password.
   * Used for support scenarios when hotel staff are locked out of their accounts.
   */
  @Post('reset-password')
  @UseGuards(KeycloakGuard)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiHideProperty()
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Reset Password',
    examples: {
      'Reset Password': {
        value: {
          email: 'user@example.com',
          new_password: 'newPassword123',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Allows a platform administrator to forcibly reset another user\'s password without requiring the user\'s current password. Used for support scenarios when hotel staff are locked out of their accounts.',
    operationId: 'resetPassword',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [{}],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Password reset successful',
      },
      400: {
        description: 'Bad request',
      },
      404: {
        description: 'User not found',
      },
    },
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'resetPassword',
        email: resetPasswordDto.email,
        version,
      },
      AuthController.name,
    );

    return this.authService.resetPassword({ ...resetPasswordDto }, version);
  }

  /**
   * Allows an authenticated user to change their own password.
   * Requires the current password for verification before setting the new one.
   */
  @Post('change-password')
  @UseGuards(KeycloakGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiVersionMinRequest()
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Change Password',
    examples: {
      'Change Password': {
        value: {
          current_password: 'currentPassword123',
          new_password: 'newPassword123',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Change Password',
    description:
      'Allows an authenticated user to change their own password by providing their current password for verification. This is the standard self-service password update flow for ERP users.',
    operationId: 'changePassword',
    tags: ['Authentication', 'Auth'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Password changed successfully',
      },
      400: {
        description: 'Bad request or incorrect current password',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ) {
    this.logger.debug(
      {
        function: 'changePassword',
        version,
      },
      AuthController.name,
    );

    const { user_id, accessToken } = ExtractRequestHeader(req);

    const dto = {
      ...changePasswordDto,
      user_id,
      accessToken,
    };

    return this.authService.changePassword(dto, version);
  }

  // @Post('change-email')
  // async changeEmail(
  //   @Body() changeEmailDto: any,
  //   @Query('version') version: string,
  // ) {
  //   this.logger.log({
  //     file: AuthController.name,
  //     function: this.changeEmail.name,
  //     changeEmailDto: changeEmailDto,
  //     version: version,
  //   });
  //   return this.authService.changeEmail(changeEmailDto, version);
  // }

  /**
   * Retrieves all platform users for notification testing purposes.
   */
  @Get('test-notification')
  @ApiVersionMinRequest()
  async getAllUsers(@Query('version') version: string = 'latest') {
    // get all user in tb_user
    return this.authService.getAllUsers(version);
  }
}
