import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_DepartmentsService } from './config_departments.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  DepartmentsCreateDto,
  DepartmentsUpdateDto,
  IUpdateDepartments,
  Serialize,
  ZodSerializerInterceptor,
  DepartmentDetailResponseSchema,
  DepartmentListItemResponseSchema,
  DepartmentMutationResponseSchema,
} from '@/common';
import {
  ApiVersionMinRequest,
  ApiUserFilterQueries,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/departments')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_DepartmentsController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DepartmentsController.name,
  );

  constructor(
    private readonly config_departmentsService: Config_DepartmentsService,
  ) {
    super();
  }

  /**
   * Retrieves a specific hotel department (e.g., Kitchen, F&B, Housekeeping)
   * including cost center information for budget allocation and requisition routing.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('department.findOne'))
  @Serialize(DepartmentDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a department by ID',
    description: 'Retrieves a specific hotel department record (e.g., Kitchen, F&B, Housekeeping, Engineering). Department details include cost center information used for budget allocation and purchase request routing.',
    operationId: 'findOneDepartment',
    tags: ['Configuration', 'Departments'],
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
      Config_DepartmentsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentsService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all hotel departments configured in the business unit, used to organize
   * purchase requests, assign users, and track costs by operational area.
   */
  @Get()
  @UseGuards(new AppIdGuard('department.findAll'))
  @Serialize(DepartmentListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Returns all hotel departments configured in the business unit. Departments are used to organize purchase requests, assign users, and track costs by operational area.',
    operationId: 'findAllDepartments',
    tags: ['Configuration', 'Departments'],
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
      Config_DepartmentsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_departmentsService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new hotel department (e.g., Kitchen, Housekeeping, Spa) that can be
   * assigned users and used as a cost center for procurement requisitions.
   */
  @Post()
  @UseGuards(new AppIdGuard('department.create'))
  @Serialize(DepartmentMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new department',
    description: 'Creates a new hotel department (e.g., Kitchen, Housekeeping, Spa). The department can then be assigned users and used as a cost center for procurement and inventory requisitions.',
    operationId: 'createDepartment',
    tags: ['Configuration', 'Departments'],
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
    @Body() createDto: DepartmentsCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_DepartmentsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentsService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing department's configuration such as name or cost center settings.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('department.update'))
  @Serialize(DepartmentMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a department',
    description: 'Modifies an existing department configuration, such as its name or cost center settings. Changes affect how future purchase requests and inventory transactions are categorized.',
    operationId: 'updateDepartment',
    tags: ['Configuration', 'Departments'],
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
    @Body() updateDto: DepartmentsUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_DepartmentsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateDepartments = {
      ...updateDto,
      id,
    };
    const result = await this.config_departmentsService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a department from active configuration. Historical records are retained.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('department.delete'))
  @Serialize(DepartmentMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a department',
    description: 'Removes a department from the active configuration. The department will no longer be available for new requisitions or user assignments, but historical records are retained.',
    operationId: 'deleteDepartment',
    tags: ['Configuration', 'Departments'],
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
  async delete(
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
      Config_DepartmentsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentsService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
