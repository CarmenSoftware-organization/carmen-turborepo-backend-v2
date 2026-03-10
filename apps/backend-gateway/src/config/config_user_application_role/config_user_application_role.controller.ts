import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { KeycloakGuard } from 'src/auth';
import { ConfigUserApplicationRoleService } from './config_user_application_role.service';
import { ZodSerializerInterceptor, BaseHttpController } from '@/common';
import { AssignUserApplicationRoleDto, RemoveUserApplicationRoleDto, UpdateUserApplicationRoleDto } from './dto/user_application_role.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignUserApplicationRoleRequest, UpdateUserApplicationRoleRequest, RemoveUserApplicationRoleRequest } from './swagger/request';
import { ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/user-application-roles')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ConfigUserApplicationRoleController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ConfigUserApplicationRoleController.name,
  );

  constructor(
    private readonly configUserApplicationRoleService: ConfigUserApplicationRoleService,
  ) {
    super();
  }

  /**
   * Retrieves all application roles assigned to a specific user, determining their
   * system access permissions (e.g., Admin, Manager, Purchaser, Requestor).
   */
  @Get(':user_id')
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get application roles by user ID', description: 'Retrieves all application roles assigned to a specific user, determining their system access permissions (e.g., Admin, Manager, Purchaser, Requestor).', operationId: 'configUserApplicationRole_findByUser', tags: ['Configuration', 'User Application Role'] })
  async findByUser(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('user_id') targetUserId: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findByUser',
        user_id: ExtractRequestHeader(req).user_id,
        targetUserId,
        bu_code,
        version,
      },
      ConfigUserApplicationRoleController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUserApplicationRoleService.findByUser(targetUserId, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Assigns one or more application roles to a user, granting them the associated
   * permissions and access rights within the procurement and inventory system.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Assign application roles to a user', description: 'Assigns one or more application roles to a user, granting them the associated permissions and access rights within the procurement and inventory system.', operationId: 'configUserApplicationRole_assign', tags: ['Configuration', 'User Application Role'] })
  @ApiBody({ type: AssignUserApplicationRoleRequest })
  async assign(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() assignDto: AssignUserApplicationRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'assign',
        user_id: ExtractRequestHeader(req).user_id,
        assignDto,
        bu_code,
        version,
      },
      ConfigUserApplicationRoleController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUserApplicationRoleService.assign(assignDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies the application role assignments for a user, such as changing their role
   * level or adjusting permissions within the system.
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update user application role assignments', description: 'Modifies the application role assignments for a user, such as changing their role level or adjusting permissions within the system.', operationId: 'configUserApplicationRole_update', tags: ['Configuration', 'User Application Role'] })
  @ApiBody({ type: UpdateUserApplicationRoleRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: UpdateUserApplicationRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        user_id: ExtractRequestHeader(req).user_id,
        updateDto,
        bu_code,
        version,
      },
      ConfigUserApplicationRoleController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUserApplicationRoleService.update(updateDto, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Revokes one or more application roles from a user, removing the associated
   * permissions. The user loses access to features granted by those roles.
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove application roles from a user', description: 'Revokes one or more application roles from a user, removing the associated permissions and system access rights. The user loses access to features granted by those roles.', operationId: 'configUserApplicationRole_remove', tags: ['Configuration', 'User Application Role'] })
  @ApiBody({ type: RemoveUserApplicationRoleRequest })
  async remove(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() removeDto: RemoveUserApplicationRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'remove',
        user_id: ExtractRequestHeader(req).user_id,
        removeDto,
        bu_code,
        version,
      },
      ConfigUserApplicationRoleController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUserApplicationRoleService.remove(removeDto, user_id, bu_code, version);
    this.respond(res, result);
  }
}
