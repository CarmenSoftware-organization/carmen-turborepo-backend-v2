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
import { ApplicationRoleService } from './application-role.service';
import {
  CreateApplicationRoleDto,
  UpdateApplicationRoleDto,
} from './dto/application-role.dto';
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

@Controller('api-system/role')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ApplicationRoleController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ApplicationRoleController.name,
  );

  constructor(
    private readonly applicationRoleService: ApplicationRoleService,
  ) {
    super();
  }

  /**
   * Lists all named role bundles (e.g., Admin, Purchaser, HOD, GM) defined in the platform.
   * These roles group permissions to simplify user access management across hotel properties.
   */
  @Get()
  @UseGuards(new AppIdGuard('application-role.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all application roles',
    description: 'Lists all named role bundles defined in the ERP platform, such as Admin, Purchaser, HOD, or General Manager. These roles group permissions together to simplify user access management across hotel properties.',
    operationId: 'platformRole_findAll',
    tags: ['Platform Admin', 'Application Role'],
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
        description: 'Application roles retrieved successfully',
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
      ApplicationRoleController.name,
    );

    const result = await this.applicationRoleService.findAll(version);
    this.respond(res, result);
  }

  /**
   * Retrieves the details of a specific application role, including its name and metadata.
   * Used to inspect role configuration before assigning it to users or modifying its permissions.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('application-role.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'id',
    description: 'Application role ID',
    type: 'string',
  })
  @ApiOperation({
    summary: 'Get application role by ID',
    description: 'Retrieves the details of a specific application role, including its name and associated metadata. Used to inspect role configuration before assigning it to users or modifying its permissions.',
    operationId: 'platformRole_findOne',
    tags: ['Platform Admin', 'Application Role'],
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
        description: 'Application role ID',
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
        description: 'Application role retrieved successfully',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Application role not found',
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
      ApplicationRoleController.name,
    );

    const result = await this.applicationRoleService.findOne(id, version);
    this.respond(res, result);
  }

  /**
   * Creates a new named role bundle in the ERP platform.
   * After creation, permissions can be assigned to define what actions users with this role can perform.
   */
  @Post()
  @UseGuards(new AppIdGuard('application-role.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiBody({
    type: CreateApplicationRoleDto,
    description: 'Create application role data',
  })
  @ApiOperation({
    summary: 'Create new application role',
    description: 'Creates a new named role bundle in the ERP platform, such as a custom department head or property-specific role. After creation, permissions can be assigned to this role to define what actions users with this role can perform.',
    operationId: 'platformRole_create',
    tags: ['Platform Admin', 'Application Role'],
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
        description: 'Application role created successfully',
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
    @Body() createApplicationRoleDto: CreateApplicationRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createApplicationRoleDto,
        version,
      },
      ApplicationRoleController.name,
    );

    const result = await this.applicationRoleService.create(
      createApplicationRoleDto,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing application role definition, such as renaming it or updating metadata.
   * This affects all users assigned to this role across the platform.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('application-role.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'id',
    description: 'Application role ID',
    type: 'string',
  })
  @ApiBody({
    type: UpdateApplicationRoleDto,
    description: 'Update application role data',
  })
  @ApiOperation({
    summary: 'Update application role',
    description: 'Modifies an existing application role definition, such as renaming it or updating its metadata. This affects all users assigned to this role across the platform.',
    operationId: 'platformRole_update',
    tags: ['Platform Admin', 'Application Role'],
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
        description: 'Application role ID',
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
        description: 'Application role updated successfully',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Application role not found',
      },
    },
  })
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateApplicationRoleDto: UpdateApplicationRoleDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateApplicationRoleDto,
        version,
      },
      ApplicationRoleController.name,
    );

    const result = await this.applicationRoleService.update(
      id,
      updateApplicationRoleDto,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an application role from the platform.
   * Users previously assigned this role will lose the associated permissions.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('application-role.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({
    name: 'id',
    description: 'Application role ID',
    type: 'string',
  })
  @ApiOperation({
    summary: 'Delete application role',
    description: 'Removes an application role from the platform. Users previously assigned this role will lose the associated permissions, so ensure affected users are reassigned to appropriate roles beforehand.',
    operationId: 'platformRole_delete',
    tags: ['Platform Admin', 'Application Role'],
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
        description: 'Application role ID',
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
        description: 'Application role deleted successfully',
      },
      401: {
        description: 'Unauthorized',
      },
      404: {
        description: 'Application role not found',
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
      ApplicationRoleController.name,
    );

    const result = await this.applicationRoleService.delete(id, version);
    this.respond(res, result);
  }
}
