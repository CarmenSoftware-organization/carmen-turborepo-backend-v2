import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  ConsoleLogger,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_WorkflowsService } from './config_workflows.service';
import { ApiTags, ApiBearerAuth, ApiBody, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { WorkflowCreateRequestDto, WorkflowUpdateRequestDto } from './swagger/request';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  IUpdateWorkflow,
  WorkflowCreateDto,
  WorkflowUpdateDto,
  Serialize,
  ZodSerializerInterceptor,
  WorkflowDetailResponseSchema,
  WorkflowListItemResponseSchema,
  WorkflowMutationResponseSchema,
} from '@/common';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/workflows')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_WorkflowsController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_WorkflowsController.name,
  );
  constructor(
    private readonly config_workflowsService: Config_WorkflowsService,
  ) {
    super();
  }

  /**
   * Retrieves a specific approval workflow template including its stages,
   * approver roles, and routing rules for procurement document approvals.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('workflow.findOne'))
  @Serialize(WorkflowDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a workflow by ID',
    description: 'Retrieves a specific approval workflow template including its stages, approver roles, and routing rules. Workflows define the approval chain for procurement documents like purchase requests and purchase orders.',
    operationId: 'configWorkflows_findOne',
    tags: ['Configuration', 'Workflows'],
    responses: { 200: { description: 'Workflow retrieved successfully' } },
  })
  async findOne(
    @Param('bu_code') bu_code: string,
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
      Config_WorkflowsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_workflowsService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all configured approval workflow templates for managing document
   * approval chains (purchase requests, purchase orders, etc.).
   */
  @Get()
  @UseGuards(new AppIdGuard('workflow.findAll'))
  @Serialize(WorkflowListItemResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all workflows',
    description: 'Returns all configured approval workflow templates for the business unit. Administrators use these to manage document approval chains for purchase requests, purchase orders, and other procurement documents.',
    operationId: 'configWorkflows_findAll',
    tags: ['Configuration', 'Workflows'],
    responses: { 200: { description: 'Workflows retrieved successfully' } },
  })
  async findAll(
    @Param('bu_code') bu_code: string,
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
      Config_WorkflowsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_workflowsService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new approval workflow template defining stages and approver roles
   * (e.g., HOD, Purchaser, FC, GM) for procurement document routing.
   */
  @Post()
  @UseGuards(new AppIdGuard('workflow.create'))
  @Serialize(WorkflowMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new workflow',
    description: 'Creates a new approval workflow template defining the stages, approver roles (e.g., HOD, Purchaser, FC, GM), and routing rules for document approvals in the procurement process.',
    operationId: 'configWorkflows_create',
    tags: ['Configuration', 'Workflows'],
    responses: { 201: { description: 'Workflow created successfully' } },
  })
  @ApiBody({ type: WorkflowCreateRequestDto })
  async create(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createDto: WorkflowCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_WorkflowsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_workflowsService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing approval workflow template such as adding/removing stages
   * or changing approver role assignments.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('workflow.update'))
  @Serialize(WorkflowMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a workflow',
    description: 'Modifies an existing approval workflow template, such as adding/removing approval stages or changing approver role assignments. Changes affect all future documents using this workflow.',
    operationId: 'configWorkflows_update',
    tags: ['Configuration', 'Workflows'],
    responses: { 200: { description: 'Workflow updated successfully' } },
  })
  @ApiBody({ type: WorkflowUpdateRequestDto })
  async update(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: WorkflowUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_WorkflowsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateWorkflow = {
      ...updateDto,
      id,
    };
    const result = await this.config_workflowsService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an approval workflow template from active use.
   * In-progress documents are not affected; only new documents cannot use this workflow.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('workflow.delete'))
  @Serialize(WorkflowMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a workflow',
    description: 'Removes an approval workflow template from active use. Documents currently in progress using this workflow are not affected, but no new documents will use this workflow.',
    operationId: 'configWorkflows_delete',
    tags: ['Configuration', 'Workflows'],
    responses: { 200: { description: 'Workflow deleted successfully' } },
  })
  async delete(
    @Param('bu_code') bu_code: string,
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
      Config_WorkflowsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_workflowsService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
