import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApplicationRolePermissionService } from './application-role-permission.service';
import {
  AssignPermissionsToRoleDto,
  RemovePermissionsFromRoleDto,
  AssignPermissionToRoleDto,
  RemovePermissionFromRoleDto,
} from './dto/application-role-permission.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api-system/role-permission')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ApplicationRolePermissionController {
  private readonly logger: BackendLogger = new BackendLogger(
    ApplicationRolePermissionController.name,
  );

  constructor(
    private readonly applicationRolePermissionService: ApplicationRolePermissionService,
  ) {}

  /**
   * Lists all feature permissions currently assigned to a specific role.
   * Shows exactly what actions users with this role are authorized to perform.
   */
  @Get('role/:roleId/permissions')
  @UseGuards(new AppIdGuard('application-role-permission.getPermissionsByRole'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    type: 'string',
  })
  @ApiOperation({
    summary: 'Get all permissions for a role',
    description: 'Lists all feature permissions currently assigned to a specific role, showing exactly what actions (e.g., create PO, approve PR) users with this role are authorized to perform in the ERP system.',
    operationId: 'platformRolePermission_getPermissionsByRole',
    tags: ['Platform Admin', 'Application Role Permission'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'roleId',
        in: 'path',
        required: true,
        description: 'Role ID',
      },
      {
        name: 'version',
        in: 'query',
        required: false,
        description: 'API version',
      },
    ],
    responses: {
      200: {
        description: 'Permissions retrieved successfully',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Role not found',
      },
    },
  })
  async getPermissionsByRole(
    @Param('roleId') roleId: string,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getPermissionsByRole',
        roleId,
        version,
      },
      ApplicationRolePermissionController.name,
    );

    return this.applicationRolePermissionService.getPermissionsByRole(
      roleId,
      version,
    );
  }

  /**
   * Finds all application roles that include a specific permission.
   * Enables administrators to audit which roles grant a particular capability.
   */
  @Get('permission/:permissionId/roles')
  @UseGuards(new AppIdGuard('application-role-permission.getRolesByPermission'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID',
    type: 'string',
  })
  @ApiOperation({
    summary: 'Get all roles that have a permission',
    description: 'Finds all application roles that include a specific permission, enabling administrators to audit which roles grant a particular capability such as inventory adjustments or purchase approvals.',
    operationId: 'platformRolePermission_getRolesByPermission',
    tags: ['Platform Admin', 'Application Role Permission'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'permissionId',
        in: 'path',
        required: true,
        description: 'Permission ID',
      },
      {
        name: 'version',
        in: 'query',
        required: false,
        description: 'API version',
      },
    ],
    responses: {
      200: {
        description: 'Roles retrieved successfully',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Permission not found',
      },
    },
  })
  async getRolesByPermission(
    @Param('permissionId') permissionId: string,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getRolesByPermission',
        permissionId,
        version,
      },
      ApplicationRolePermissionController.name,
    );

    return this.applicationRolePermissionService.getRolesByPermission(
      permissionId,
      version,
    );
  }

  /**
   * Grants multiple feature permissions to an application role in a single operation.
   * Enables bulk configuration of role capabilities across procurement and inventory modules.
   */
  @Post('assign-permissions')
  @UseGuards(new AppIdGuard('application-role-permission.assignPermissionsToRole'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({
    type: AssignPermissionsToRoleDto,
    description: 'Assign permissions to role data',
  })
  @ApiOperation({
    summary: 'Assign multiple permissions to a role',
    description: 'Grants multiple feature permissions to an application role in a single operation, enabling bulk configuration of role capabilities such as giving a Purchaser role access to create POs, view vendors, and manage stock-in records.',
    operationId: 'platformRolePermission_assignPermissions',
    tags: ['Platform Admin', 'Application Role Permission'],
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
        description: 'Permissions assigned successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async assignPermissionsToRole(
    @Body() assignPermissionsDto: AssignPermissionsToRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'assignPermissionsToRole',
        assignPermissionsDto,
        version,
      },
      ApplicationRolePermissionController.name,
    );

    return this.applicationRolePermissionService.assignPermissionsToRole(
      assignPermissionsDto,
      version,
    );
  }

  /**
   * Grants a single feature permission to an application role.
   * Allows fine-grained incremental updates to role capabilities.
   */
  @Post('assign-permission')
  @UseGuards(new AppIdGuard('application-role-permission.assignPermissionToRole'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({
    type: AssignPermissionToRoleDto,
    description: 'Assign permission to role data',
  })
  @ApiOperation({
    summary: 'Assign a single permission to a role',
    description: 'Grants a single feature permission to an application role, allowing fine-grained incremental updates to role capabilities without replacing the entire permission set.',
    operationId: 'platformRolePermission_assignPermission',
    tags: ['Platform Admin', 'Application Role Permission'],
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
        description: 'Permission assigned successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async assignPermissionToRole(
    @Body() assignPermissionDto: AssignPermissionToRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'assignPermissionToRole',
        assignPermissionDto,
        version,
      },
      ApplicationRolePermissionController.name,
    );

    return this.applicationRolePermissionService.assignPermissionToRole(
      assignPermissionDto,
      version,
    );
  }

  /**
   * Revokes multiple feature permissions from an application role in a single operation.
   * Useful when restructuring role access or restricting capabilities.
   */
  @Delete('remove-permissions')
  @UseGuards(new AppIdGuard('application-role-permission.removePermissionsFromRole'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({
    type: RemovePermissionsFromRoleDto,
    description: 'Remove permissions from role data',
  })
  @ApiOperation({
    summary: 'Remove multiple permissions from a role',
    description: 'Revokes multiple feature permissions from an application role in a single operation, useful when restructuring role access or restricting capabilities across procurement and inventory modules.',
    operationId: 'platformRolePermission_removePermissions',
    tags: ['Platform Admin', 'Application Role Permission'],
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
        description: 'Permissions removed successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async removePermissionsFromRole(
    @Body() removePermissionsDto: RemovePermissionsFromRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'removePermissionsFromRole',
        removePermissionsDto,
        version,
      },
      ApplicationRolePermissionController.name,
    );

    return this.applicationRolePermissionService.removePermissionsFromRole(
      removePermissionsDto,
      version,
    );
  }

  /**
   * Revokes a single feature permission from an application role.
   * Allows precise removal of a specific capability without affecting other permissions.
   */
  @Delete('remove-permission')
  @UseGuards(new AppIdGuard('application-role-permission.removePermissionFromRole'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiBody({
    type: RemovePermissionFromRoleDto,
    description: 'Remove permission from role data',
  })
  @ApiOperation({
    summary: 'Remove a single permission from a role',
    description: 'Revokes a single feature permission from an application role, allowing precise removal of a specific capability without affecting other permissions assigned to the role.',
    operationId: 'platformRolePermission_removePermission',
    tags: ['Platform Admin', 'Application Role Permission'],
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
        description: 'Permission removed successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async removePermissionFromRole(
    @Body() removePermissionDto: RemovePermissionFromRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'removePermissionFromRole',
        removePermissionDto,
        version,
      },
      ApplicationRolePermissionController.name,
    );

    return this.applicationRolePermissionService.removePermissionFromRole(
      removePermissionDto,
      version,
    );
  }
}
