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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationPermissionService } from './application-permission.service';
import {
  CreateApplicationPermissionDto,
  UpdateApplicationPermissionDto,
} from './dto/application-permission.dto';
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
import { BaseHttpController } from '@/common';

@Controller('api-system/permission')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ApplicationPermissionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ApplicationPermissionController.name,
  );

  constructor(
    private readonly applicationPermissionService: ApplicationPermissionService,
  ) {
    super();
  }

  /**
   * Retrieves the full catalog of granular feature permissions available in the ERP system.
   * Used by platform administrators to review what access controls can be assigned to roles.
   */
  @Get()
  @UseGuards(new AppIdGuard('application-permission.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all application permissions',
    description: 'Lists all granular feature permissions available in the ERP system, such as "can create purchase request" or "can approve purchase order". Used by platform administrators to review and manage the full permission catalog.',
    operationId: 'platformPermission_findAll',
    tags: ['Platform Admin', 'Application Permission'],
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
        description: 'Application permissions retrieved successfully',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async findAll(
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        version,
      },
      ApplicationPermissionController.name,
    );

    const result = await this.applicationPermissionService.findAll(version);
    this.respond(res, result);
  }

  /**
   * Retrieves the details of a specific feature permission by its ID.
   * Useful for inspecting individual permission definitions before assigning them to roles.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('application-permission.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'id',
    description: 'Application permission ID',
    type: 'string',
  })
  @ApiOperation({
    summary: 'Get application permission by ID',
    description: 'Retrieves the details of a specific feature permission by its ID, including its name, code, and scope. Useful for inspecting individual permission definitions before assigning them to roles.',
    operationId: 'platformPermission_findOne',
    tags: ['Platform Admin', 'Application Permission'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Application permission ID',
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
        description: 'Application permission retrieved successfully',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Application permission not found',
      },
    },
  })
  async findOne(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      ApplicationPermissionController.name,
    );

    const result = await this.applicationPermissionService.findOne(id, version);
    this.respond(res, result);
  }

  /**
   * Defines a new granular feature permission in the ERP platform.
   * Once created, this permission can be assigned to application roles to control user access.
   */
  @Post()
  @UseGuards(new AppIdGuard('application-permission.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiBody({
    type: CreateApplicationPermissionDto,
    description: 'Create application permission data',
  })
  @ApiOperation({
    summary: 'Create new application permission',
    description: 'Defines a new granular feature permission in the ERP platform, such as access to create, approve, or view specific procurement or inventory operations. Once created, this permission can be assigned to application roles.',
    operationId: 'platformPermission_create',
    tags: ['Platform Admin', 'Application Permission'],
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
      201: {
        description: 'Application permission created successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  async create(
    @Res() res: Response,
    @Body() createApplicationPermissionDto: CreateApplicationPermissionDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createApplicationPermissionDto,
        version,
      },
      ApplicationPermissionController.name,
    );

    const result = await this.applicationPermissionService.create(
      createApplicationPermissionDto,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing feature permission definition.
   * Changes propagate to all roles that reference this permission across tenants.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('application-permission.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'id',
    description: 'Application permission ID',
    type: 'string',
  })
  @ApiBody({
    type: UpdateApplicationPermissionDto,
    description: 'Update application permission data',
  })
  @ApiOperation({
    summary: 'Update application permission',
    description: 'Modifies an existing feature permission definition, such as renaming it or changing its scope. Changes propagate to all roles that reference this permission across tenants.',
    operationId: 'platformPermission_update',
    tags: ['Platform Admin', 'Application Permission'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Application permission ID',
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
        description: 'Application permission updated successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Application permission not found',
      },
    },
  })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateApplicationPermissionDto: UpdateApplicationPermissionDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateApplicationPermissionDto,
        version,
      },
      ApplicationPermissionController.name,
    );

    const result = await this.applicationPermissionService.update(
      id,
      updateApplicationPermissionDto,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a feature permission from the ERP platform.
   * Affects all roles that include this permission, potentially revoking user access.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('application-permission.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'id',
    description: 'Application permission ID',
    type: 'string',
  })
  @ApiOperation({
    summary: 'Delete application permission',
    description: 'Removes a feature permission from the ERP platform. This should be done with caution as it will affect all roles that currently include this permission, potentially revoking user access to the associated feature.',
    operationId: 'platformPermission_delete',
    tags: ['Platform Admin', 'Application Permission'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Application permission ID',
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
        description: 'Application permission deleted successfully',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Application permission not found',
      },
    },
  })
  async delete(
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      ApplicationPermissionController.name,
    );

    const result = await this.applicationPermissionService.delete(id, version);
    this.respond(res, result);
  }
}
