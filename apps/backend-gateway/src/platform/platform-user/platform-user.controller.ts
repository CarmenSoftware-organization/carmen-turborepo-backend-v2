import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PlatformUserService } from './platform-user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePlatformUserRequestDto,
  UpdatePlatformUserRequestDto,
} from './swagger/request';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BaseHttpController } from '@/common';

@Controller('api-system')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class PlatformUserController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PlatformUserController.name,
  );

  constructor(
    private readonly platformUserService: PlatformUserService,
  ) {
    super();
  }

  /**
   * Synchronizes user accounts from the Keycloak identity provider into the Carmen platform.
   * Ensures all hotel staff provisioned in Keycloak are available for role and property assignment.
   */
  @Post('fetch-user')
  @UseGuards(new AppIdGuard('platform-user.fetch'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Fetch users from Keycloak realm',
    description: 'Synchronizes user accounts from the Keycloak identity provider into the Carmen platform database. This ensures that all hotel staff and administrators provisioned in Keycloak are available for assignment to clusters, business units, and roles within the ERP system.',
    operationId: 'platformUser_fetchFromKeycloak',
    tags: ['Platform Admin', 'Platform User'],
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
        description: 'API version',
      },
    ],
    responses: {
      200: {
        description: 'Users fetched and synced successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'Internal server error',
      },
    },
  })
  async fetchUsers(
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'fetchUsers',
        version,
      },
      PlatformUserController.name,
    );

    const result = await this.platformUserService.fetchUsers(version);
    this.respond(res, result);
  }

  /**
   * Lists all system-wide user accounts across all tenants with pagination.
   * Used by platform administrators to manage hotel staff and ERP users across the organization.
   */
  @Get('user')
  @UseGuards(new AppIdGuard('platform-user.list'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get list of platform users',
    description: 'Lists all system-wide user accounts across all tenants with pagination support. Used by platform administrators to manage hotel staff, procurement officers, and other ERP users across the entire organization.',
    operationId: 'platformUser_findAll',
    tags: ['Platform Admin', 'Platform User'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Users retrieved successfully' },
      401: { description: 'Unauthorized' },
    },
  })
  async getUserList(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getUserList',
        query,
        version,
      },
      PlatformUserController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.platformUserService.getUserList(
      user_id,
      tenant_id,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves detailed information about a specific platform user.
   * Includes their profile, role assignments, and associated business units.
   */
  @Get('user/:id')
  @UseGuards(new AppIdGuard('platform-user.get'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiOperation({
    summary: 'Get platform user by ID',
    description: 'Retrieves detailed information about a specific platform user, including their profile, role assignments, and associated business units. Used to review or audit individual user access across the ERP system.',
    operationId: 'platformUser_findOne',
    tags: ['Platform Admin', 'Platform User'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User retrieved successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'User not found' },
    },
  })
  async getUser(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getUser',
        id,
        version,
      },
      PlatformUserController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platformUserService.getUser(
      user_id,
      tenant_id,
      id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Provisions a new system-wide user account in the Carmen ERP platform.
   * The user can then be assigned to clusters and business units for property access.
   */
  @Post('user')
  @UseGuards(new AppIdGuard('platform-user.create'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({ type: CreatePlatformUserRequestDto, description: 'Create platform user data' })
  @ApiOperation({
    summary: 'Create a new platform user',
    description: 'Provisions a new system-wide user account in the Carmen ERP platform. The user can subsequently be assigned to clusters and business units to grant them access to specific hotel properties and procurement workflows.',
    operationId: 'platformUser_create',
    tags: ['Platform Admin', 'Platform User'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User created successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  })
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'createUser',
        data,
        version,
      },
      PlatformUserController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platformUserService.createUser(
      user_id,
      tenant_id,
      data,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Updates the profile or account details of an existing platform user.
   * Used by administrators to maintain accurate user records across the hotel management system.
   */
  @Put('user/:id')
  @UseGuards(new AppIdGuard('platform-user.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiBody({ type: UpdatePlatformUserRequestDto, description: 'Update platform user data' })
  @ApiOperation({
    summary: 'Update a platform user',
    description: 'Updates the profile or account details of an existing platform user, such as name, contact information, or status. Used by administrators to maintain accurate user records across the hotel management system.',
    operationId: 'platformUser_update',
    tags: ['Platform Admin', 'Platform User'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User updated successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
      404: { description: 'User not found' },
    },
  })
  async updateUser(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'updateUser',
        id,
        data,
        version,
      },
      PlatformUserController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platformUserService.updateUser(
      user_id,
      tenant_id,
      id,
      data,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Deactivates or removes a user account from the Carmen platform.
   * Revokes the user's access to all business units, clusters, and procurement workflows.
   */
  @Delete('user/:id')
  @UseGuards(new AppIdGuard('platform-user.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiOperation({
    summary: 'Delete a platform user',
    description: 'Deactivates or removes a user account from the Carmen platform. This revokes the user\'s access to all business units and clusters, effectively removing them from all hotel properties and procurement workflows.',
    operationId: 'platformUser_delete',
    tags: ['Platform Admin', 'Platform User'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User deleted successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'User not found' },
    },
  })
  async deleteUser(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'deleteUser',
        id,
        version,
      },
      PlatformUserController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platformUserService.deleteUser(
      user_id,
      tenant_id,
      id,
      version,
    );
    this.respond(res, result);
  }
}
