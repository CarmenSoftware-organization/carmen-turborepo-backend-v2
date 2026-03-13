import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Body,
  Put,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { StoreRequisitionService } from './store-requisition.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateStoreRequisitionSwaggerDto,
  UpdateStoreRequisitionSwaggerDto,
  SubmitStoreRequisitionSwaggerDto,
  ApproveStoreRequisitionSwaggerDto,
  RejectStoreRequisitionSwaggerDto,
  ReviewStoreRequisitionSwaggerDto,
} from './swagger/request';
import {
  ApiVersionMinRequest,
  ApiUserFilterQueries,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  StoreRequisitionDetailResponseSchema,
  StoreRequisitionListItemResponseSchema,
  StoreRequisitionMutationResponseSchema,
  CreateStoreRequisitionDto,
  UpdateStoreRequisitionDto,
  SubmitStoreRequisitionDto,
  RejectStoreRequisitionDto,
  ReviewStoreRequisitionDto,
  ApproveStoreRequisitionByStageRoleDto,
} from '@/common';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class StoreRequisitionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    StoreRequisitionController.name,
  );

  constructor(
    private readonly storeRequisitionService: StoreRequisitionService,
  ) {
    super();
  }

  /**
   * Retrieves full details of a store requisition including requested items,
   * quantities, and current approval status. Store requisitions represent
   * internal requests from departments to draw items from the central store.
   */
  @Get('/:bu_code/store-requisition/:id')
  @UseGuards(new AppIdGuard('storeRequisition.findOne'))
  @Serialize(StoreRequisitionDetailResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a store requisition by ID',
    description: 'Retrieves the full details of a store requisition including requested items, quantities, requesting department, and current approval status. Used to review an internal stock request before approving or issuing items from the store.',
    operationId: 'findOneStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
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
        description: 'The store requisition was successfully retrieved',
      },
      404: {
        description: 'The store requisition was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const buDatasHeader = (req.headers as unknown as Record<string, string>)['x-bu-datas'];
    const userDatas: {
      bu_id: string;
      bu_code: string;
      role: string;
      permissions: Record<string, string[]>;
    }[] = buDatasHeader ? JSON.parse(buDatasHeader) : [];
    const userData = userDatas.find((ud) => ud.bu_code === bu_code);
    const result = await this.storeRequisitionService.findOne(
      id,
      user_id,
      bu_code,
      userData,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all store requisitions with pagination and filtering. Used by store
   * managers and department staff to track internal stock requests and their status.
   */
  @Get('store-requisition')
  @UseGuards(new AppIdGuard('storeRequisition.findAll'))
  @Serialize(StoreRequisitionListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all store requisitions',
    description: 'Lists all store requisitions across business units with pagination and filtering. Used by department staff to track their internal stock requests and by store managers to view pending issuance requests.',
    operationId: 'findAllStoreRequisitions',
    tags: ['Procurement', 'Store Requisition'],
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
        description: 'The store requisitions were successfully retrieved',
      },
      404: {
        description: 'The store requisitions were not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const bu_code = query.bu_code
      ? Array.isArray(query.bu_code)
        ? query.bu_code
        : [query.bu_code]
      : [];
    const buDatasHeader = (req.headers as unknown as Record<string, string>)['x-bu-datas'];
    const userDatas: {
      bu_id: string;
      bu_code: string;
      role: string;
      permissions: Record<string, string[]>;
    }[] = buDatasHeader ? JSON.parse(buDatasHeader) : [];
    const result = await this.storeRequisitionService.findAll(
      user_id,
      bu_code,
      paginate,
      userDatas,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new store requisition for a department to request items from the
   * central store. Starts in draft status and can be submitted for approval.
   */
  @Post(':bu_code/store-requisition')
  @UseGuards(new AppIdGuard('storeRequisition.create'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a store requisition',
    description: 'Creates a new internal store requisition for a department to request items from inventory (e.g., kitchen supplies, cleaning materials, office supplies). The SR starts in draft status and must be submitted for approval before items can be issued.',
    operationId: 'createStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
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
        description: 'The store requisition was successfully created',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({ type: CreateStoreRequisitionSwaggerDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateStoreRequisitionDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing store requisition's header and line items before
   * it is submitted for approval.
   */
  @Put(':bu_code/store-requisition/:id')
  @UseGuards(new AppIdGuard('storeRequisition.update'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a store requisition',
    description: 'Modifies a store requisition to adjust requested items, quantities, or other details. Used by department staff to refine their internal stock request before submitting for approval.',
    operationId: 'updateStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
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
        description: 'The store requisition was successfully updated',
      },
      404: {
        description: 'The store requisition was not found',
      },
    },
  })
  @ApiBody({ type: UpdateStoreRequisitionSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: UpdateStoreRequisitionDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Submits a draft store requisition into the approval workflow, making it
   * available for review by the store manager or designated approver.
   */
  @Patch(':bu_code/store-requisition/:id/submit')
  @UseGuards(new AppIdGuard('storeRequisition.submit'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Submit a store requisition',
    description: 'Submits a draft store requisition into the approval workflow, making it visible to approvers. Once submitted, the SR moves from draft to pending status and enters the configured approval chain.',
    operationId: 'submitStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
  })
  @ApiBody({ type: SubmitStoreRequisitionSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() payload: SubmitStoreRequisitionDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'submit',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.submit(
      id,
      { ...payload },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Approves a store requisition at the current workflow stage, authorizing
   * the issuance of requested items from the central store to the department.
   */
  @Patch(':bu_code/store-requisition/:id/approve')
  @UseGuards(new AppIdGuard('storeRequisition.approve'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Approve a store requisition',
    description: 'Advances a store requisition through its approval workflow at the current stage. Once fully approved, items can be issued from the store to the requesting department, triggering inventory deductions.',
    operationId: 'approveStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
  })
  @ApiBody({ type: ApproveStoreRequisitionSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() payload: ApproveStoreRequisitionByStageRoleDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.approve(
      id,
      { ...payload },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Rejects a store requisition, returning it to the requester with a reason.
   * Used when the requested items are not available or the request is not justified.
   */
  @Patch(':bu_code/store-requisition/:id/reject')
  @UseGuards(new AppIdGuard('storeRequisition.reject'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Reject a store requisition',
    description: 'Rejects a store requisition at the current approval stage, preventing items from being issued. Used when the request exceeds budget, items are unavailable, or the request is not justified.',
    operationId: 'rejectStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
  })
  @ApiBody({ type: RejectStoreRequisitionSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() payload: RejectStoreRequisitionDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'reject',
        id,
        payload,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.reject(
      id,
      { ...payload },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Sends a store requisition back to a previous workflow stage for corrections
   * or additional information before it can proceed through approval.
   */
  @Patch(':bu_code/store-requisition/:id/review')
  @UseGuards(new AppIdGuard('storeRequisition.review'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Review a store requisition',
    description: 'Returns a store requisition to a previous workflow stage for corrections, such as adjusting quantities or replacing unavailable items. Allows approvers to request changes before granting final authorization.',
    operationId: 'reviewStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
  })
  @ApiBody({ type: ReviewStoreRequisitionSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async review(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() payload: ReviewStoreRequisitionDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'review',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.review(
      id,
      { ...payload },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a store requisition that is no longer needed, typically a draft
   * created in error or no longer required by the department.
   */
  @Delete(':bu_code/store-requisition/:id')
  @UseGuards(new AppIdGuard('storeRequisition.delete'))
  @Serialize(StoreRequisitionMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a store requisition',
    description: 'Removes a store requisition that is no longer needed. Typically used for draft SRs that were created in error or when the department no longer requires the requested items.',
    operationId: 'deleteStoreRequisition',
    tags: ['Procurement', 'Store Requisition'],
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
        description: 'The store requisition was successfully deleted',
      },
      404: {
        description: 'The store requisition was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Mobile-specific endpoints ====================

  /**
   * Retrieves the workflow permissions for the current user on a store requisition,
   * determining which actions (approve, reject, review) are available.
   */
  @Get(':bu_code/store-requisition/:id/workflow-permission')
  @UseGuards(new AppIdGuard('storeRequisition.getWorkflowPermission'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get workflow permission for a store requisition',
    description: 'Checks what workflow actions (approve, reject, review) the current user is authorized to perform on a specific store requisition based on their role and the SR current stage.',
    operationId: 'getStoreRequisitionWorkflowPermission',
    tags: ['Procurement', 'Store Requisition'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Store Requisition ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Workflow permission retrieved successfully' },
      404: { description: 'Store requisition not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getWorkflowPermission(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getWorkflowPermission',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.getWorkflowPermission(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves the list of previous workflow steps for a store requisition,
   * used to determine which stage to send the document back to during review.
   */
  @Get(':bu_code/store-requisition/:id/workflow-previous-step-list')
  @UseGuards(new AppIdGuard('storeRequisition.getWorkflowPreviousStepList'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get workflow previous step list for a store requisition',
    description: 'Returns the list of earlier workflow stages that a store requisition can be sent back to for review. Used to populate the review target selection when an approver needs to return the SR for corrections.',
    operationId: 'getStoreRequisitionWorkflowPreviousStepList',
    tags: ['Procurement', 'Store Requisition'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Store Requisition ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Workflow previous step list retrieved successfully' },
      404: { description: 'Store requisition not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getWorkflowPreviousStepList(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getWorkflowPreviousStepList',
        id,
        version,
      },
      StoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.storeRequisitionService.getWorkflowPreviousStepList(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
