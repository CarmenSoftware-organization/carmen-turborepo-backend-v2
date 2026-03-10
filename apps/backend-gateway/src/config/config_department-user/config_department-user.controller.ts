import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_DepartmentUserService } from './config_department-user.service';
import { ZodSerializerInterceptor, BaseHttpController } from '@/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiHideProperty,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiVersionMinRequest,
  ApiUserFilterQueries,
} from 'src/common/decorator/userfilter.decorator';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';


@Controller('api/config/:bu_code/department-user')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_DepartmentUserController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DepartmentUserController.name,
  );

  constructor(
    private readonly config_departmentUserService: Config_DepartmentUserService,
  ) {
    super();
  }

  /**
   * Retrieves a specific department-user assignment showing which users
   * belong to a hotel department for requisition and approval permissions.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('departmentUser.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a department by ID',
    description: 'Retrieves a specific department-user assignment record, showing which users are assigned to a particular hotel department for requisition and approval permissions.',
    operationId: 'findOneDepartment',
    tags: ['Configuration', 'Department User'],
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
      },
    ],
    responses: {
      200: {
        description: 'Department retrieved successfully',
      },
    },
  })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all department-user assignments for managing which staff members
   * belong to each hotel department for requisition routing.
   */
  @Get()
  @UseGuards(new AppIdGuard('departmentUser.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Returns all department-user assignments for the business unit. Used by administrators to manage which staff members belong to each hotel department for requisition routing.',
    operationId: 'findAllDepartments',
    tags: ['Configuration', 'Department User'],
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
        description: 'Departments retrieved successfully',
      },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_departmentUserService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new department-user assignment, linking a user to a hotel department
   * for requisition creation and approval workflow participation.
   */
  @Post()
  @UseGuards(new AppIdGuard('departmentUser.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new department',
    description: 'Creates a new department-user assignment, linking a user to a hotel department. This determines which department the user can create requisitions for and participate in approval workflows.',
    operationId: 'createDepartment',
    tags: ['Configuration', 'Department User'],
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
        description: 'Department created successfully',
      },
    },
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing department-user assignment such as changing the user's role within the department.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('departmentUser.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a department',
    description: 'Modifies an existing department-user assignment, such as changing the user role within the department or updating assignment details.',
    operationId: 'updateDepartment',
    tags: ['Configuration', 'Department User'],
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
      },
    ],
    responses: {
      200: {
        description: 'Department updated successfully',
      },
    },
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.update(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a department-user assignment, unlinking a user from a hotel department.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('departmentUser.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a department',
    description: 'Removes a department-user assignment, unlinking a user from a hotel department. The user will no longer be able to create requisitions for or approve documents in that department.',
    operationId: 'deleteDepartment',
    tags: ['Configuration', 'Department User'],
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
      },
    ],
    responses: {
      200: {
        description: 'Department deleted successfully',
      },
    },
  })
  async remove(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
