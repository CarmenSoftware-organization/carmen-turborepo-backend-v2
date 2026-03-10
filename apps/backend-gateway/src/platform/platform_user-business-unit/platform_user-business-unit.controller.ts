import {
  Controller,
  Get,
  ConsoleLogger,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { Platform_UserBusinessUnitService } from './platform_user-business-unit.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  IUserBusinessUnitUpdate,
  UserBusinessUnitDto,
  UserBusinessUnitUpdateDto,
} from './dto/platform_user-business-unit.dto';
import { ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { query } from 'winston';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BaseHttpController } from '@/common';

@Controller('api-system/user/business-unit')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Platform_UserBusinessUnitController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Platform_UserBusinessUnitController.name,
  );

  constructor(
    private readonly platform_userBusinessUnitService: Platform_UserBusinessUnitService,
  ) {
    super();
  }

  /**
   * Retrieves the details of a specific user-to-property access assignment.
   * Shows which user has access to which hotel property and with what role.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('userBusinessUnit.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User-Business Unit mapping ID', type: 'string' })
  @ApiOperation({
    summary: 'Get user-business unit mapping by ID',
    description: 'Retrieves the details of a specific user-to-property access assignment, showing which user has access to which hotel property and with what role.',
    operationId: 'platformUserBusinessUnit_findOne',
    tags: ['Platform Admin', 'User Business Unit'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-business unit mapping retrieved successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'Mapping not found' },
    },
  })
  async findOne(
    @Req() req: Request,
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
      Platform_UserBusinessUnitController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platform_userBusinessUnitService.findOne(id, user_id, version);
    this.respond(res, result);
  }

  /**
   * Lists all user-to-property access assignments across the platform.
   * Used for multi-tenant access management and auditing of hotel property access.
   */
  @Get()
  @UseGuards(new AppIdGuard('userBusinessUnit.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all user-business unit mappings',
    description: 'Lists all user-to-property access assignments across the platform, showing which users have been granted access to which hotel properties. Used for multi-tenant access management and auditing.',
    operationId: 'platformUserBusinessUnit_findAll',
    tags: ['Platform Admin', 'User Business Unit'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-business unit mappings retrieved successfully' },
      401: { description: 'Unauthorized' },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Platform_UserBusinessUnitController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.platform_userBusinessUnitService.findAll(
      user_id,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Grants a user access to a specific hotel property or operational unit.
   * Enables them to perform procurement and inventory operations within that property's tenant.
   */
  @Post()
  @UseGuards(new AppIdGuard('userBusinessUnit.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiBody({ type: UserBusinessUnitDto, description: 'Create user-business unit mapping data' })
  @ApiOperation({
    summary: 'Create a user-business unit mapping',
    description: 'Grants a user access to a specific hotel property or operational unit, enabling them to perform procurement, inventory, and other ERP operations within that business unit\'s tenant context.',
    operationId: 'platformUserBusinessUnit_create',
    tags: ['Platform Admin', 'User Business Unit'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      201: { description: 'User-business unit mapping created successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UserBusinessUnitDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        body,
        version,
      },
      Platform_UserBusinessUnitController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platform_userBusinessUnitService.create(body, user_id, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing user-to-property access assignment.
   * Can update the user's role or permissions within a specific hotel property.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('userBusinessUnit.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User-Business Unit mapping ID', type: 'string' })
  @ApiBody({ type: UserBusinessUnitUpdateDto, description: 'Update user-business unit mapping data' })
  @ApiOperation({
    summary: 'Update a user-business unit mapping',
    description: 'Modifies an existing user-to-property access assignment, such as changing the user\'s role or permissions within a specific hotel property.',
    operationId: 'platformUserBusinessUnit_update',
    tags: ['Platform Admin', 'User Business Unit'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-business unit mapping updated successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
      404: { description: 'Mapping not found' },
    },
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: UserBusinessUnitUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        body,
        version,
      },
      Platform_UserBusinessUnitController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const data: IUserBusinessUnitUpdate = {
      ...body,
      id,
    };
    const result = await this.platform_userBusinessUnitService.update(data, user_id, version);
    this.respond(res, result);
  }

  /**
   * Revokes a user's access to a specific hotel property or operational unit.
   * The user will no longer be able to perform ERP operations within that property.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('userBusinessUnit.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User-Business Unit mapping ID', type: 'string' })
  @ApiOperation({
    summary: 'Delete a user-business unit mapping',
    description: 'Revokes a user\'s access to a specific hotel property or operational unit. The user will no longer be able to perform any ERP operations within that business unit\'s tenant context.',
    operationId: 'platformUserBusinessUnit_delete',
    tags: ['Platform Admin', 'User Business Unit'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-business unit mapping deleted successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'Mapping not found' },
    },
  })
  async delete(
    @Req() req: Request,
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
      Platform_UserBusinessUnitController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.platform_userBusinessUnitService.delete(id, user_id, version);
    this.respond(res, result);
  }

}
