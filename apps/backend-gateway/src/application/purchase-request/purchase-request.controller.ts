import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { PurchaseRequestService } from './purchase-request.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import {
  IPaginate,
  IPaginateQuery,
  PaginateQuery,
} from 'src/shared-dto/paginate.dto';
import { EXAMPLE_PURCHASE_REQUEST } from './example/purchase-request.example';
import { EXAMPLE_APPROVE_BY_APPROVE_ROLE, EXAMPLE_APPROVE_BY_PURCHASE_ROLE } from './example/approve-purchase-request.example';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  PurchaseRequestDetailResponseSchema,
  PurchaseRequestListItemResponseSchema,
  PurchaseRequestMutationResponseSchema,
  CreatePurchaseRequestDto,
  // IGetAllResponse,
  // IPurchaseRequest,
  UpdatePurchaseRequestDto,
  ReviewPurchaseRequestDto,
  ApproveByStageRoleSchema,
  RejectPurchaseRequestDto,
  SubmitPurchaseRequestDto
} from '@/common';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApproveByStageRoleDto2 } from './dto/state-change.dto';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { Permission } from 'src/auth/decorators/permission.decorator';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CalculatePurchaseRequestDetail } from './dto/CalculatePurchaseRequestDetail.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseRequestController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseRequestController.name,
  );

  constructor(
    private readonly purchaseRequestService: PurchaseRequestService,
  ) {
    super();
  }

  /**
   * Lists all purchase requests across business units for the current user.
   * Supports filtering by status, search term, and pagination for tracking
   * PR documents through the procurement approval workflow.
   */
  @Get('purchase-request')
  @Permission({ 'procurement.purchase_request': ['view'] })
  @UseGuards(new AppIdGuard('purchaseRequest.findAll'))
  @Serialize(PurchaseRequestListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all purchase requests',
    description: 'Lists all purchase requests for the current user across business units, filtered by status, search term, and pagination. Used by department staff and approvers to view and track PR documents in the procurement workflow.',
    operationId: 'findAllPurchaseRequests',
    tags: ['Procurement', 'Purchase Request'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'page',
        in: 'query',
        required: false,
      },
      {
        name: 'perpage',
        in: 'query',
        required: false,
      },
      {
        name: 'search',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'The purchase requests were successfully retrieved',
      },
      404: {
        description: 'The purchase requests were not found',
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
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const buDatasHeader = req.headers['x-bu-datas'] as string;
    const userData: {
      bu_id: string;
      bu_code: string;
      role: string;
      permissions: Record<string, string[]>;
    } = buDatasHeader ? JSON.parse(buDatasHeader) : {};

    if (paginate?.bu_code.length === 0) {
      throw new BadRequestException('bu_code is required');
    }

    const result = await this.purchaseRequestService.findAll(
      user_id,
      paginate.bu_code,
      paginate,
      userData,
      version,
    );

    this.respond(res, result);
  }

  /**
   * Retrieves the configured approval workflow stages (e.g., HOD, Purchaser, FC, GM)
   * for purchase requests in a business unit. Used to display workflow progress
   * and determine which approval steps a PR must pass through.
   */
  @Get(':bu_code/purchase-request/workflow-stages')
  @Permission({ 'procurement.purchase_request': ['view'] })
  @UseGuards(new AppIdGuard('purchaseRequest.findAll'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all workflow stages by purchase request',
    description: 'Returns the configured approval workflow stages (e.g., HOD, Purchaser, FC, GM) for purchase requests in this business unit. Used to display workflow progress and determine which approval steps a PR must pass through.',
    operationId: 'findAllWorkflowStagesByPr',
    tags: ['Procurement', 'Purchase Request'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'page',
        in: 'query',
        required: false,
      },
      {
        name: 'perpage',
        in: 'query',
        required: false,
      },
      {
        name: 'search',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'The purchase requests were successfully retrieved',
      },
      404: {
        description: 'The purchase requests were not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllWorkflowStagesByPr(
    @Req() req: Request,
    @Res() res: Response,
    @Query('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllWorkflowStagesByPr',
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    const result = await this.purchaseRequestService.findAllWorkflowStagesByPr(
      user_id,
      bu_code,
      version,
    );

    this.respond(res, result);
  }

  /**
   * Retrieves full details of a specific purchase request including line items,
   * quantities, pricing, and current approval status. Used to review PR contents
   * before approving, rejecting, or converting to a purchase order.
   */
  @Get(':bu_code/purchase-request/:id')
  @UseGuards(new AppIdGuard('purchaseRequest.findOne'))
  @Serialize(PurchaseRequestDetailResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase request by ID',
    description: 'Retrieves the full details of a specific purchase request including all line items, quantities, pricing, and current approval status. Used to review PR contents before approving, rejecting, or converting to a purchase order.',
    operationId: 'findOnePurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
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
        description: 'The purchase request was successfully retrieved',
      },
      404: {
        description: 'The purchase request was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
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
      PurchaseRequestController.name,
    );
    const buDatasHeader = req.headers['x-bu-datas'] as string;
    const userDatas: {
      bu_id: string;
      bu_code: string;
      role: string;
      permissions: Record<string, string[]>;
    }[] = buDatasHeader ? JSON.parse(buDatasHeader) : [];

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.findById(
      id,
      user_id,
      bu_code,
      userDatas[0],
      version,
    );
    this.respond(res, result);
  }


  /**
   * Filters purchase requests by a specific workflow status (e.g., draft, pending,
   * approved, rejected). Used by approvers and managers to view PRs at a particular
   * stage of the approval workflow.
   */
  @Get(':bu_code/purchase-request/:id/status/:status')
  @UseGuards(new AppIdGuard('purchaseRequest.approval'))
  @Serialize(PurchaseRequestListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get approval status of a purchase request',
    description: 'Filters purchase requests by a specific workflow status (e.g., draft, pending, approved, rejected). Used by approvers and managers to view PRs at a particular stage of the approval workflow.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async findAllByStatus(
    @Param('status') status: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllByStatus',
        status,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.findAllByStatus(
      status,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new purchase request for a department to request items or services.
   * The PR starts in draft status with line items, quantities, and estimated costs,
   * and can then be submitted for approval through the configured workflow.
   */
  @Post(':bu_code/purchase-request')
  @UseGuards(new AppIdGuard('purchaseRequest.create'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a purchase request',
    description: 'Creates a new purchase request for a department to request items or services they need. The PR starts in draft status and includes line items with product details, quantities, and estimated costs. Once created, it can be submitted for approval through the configured workflow.',
    operationId: 'createPurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      201: {
        description: 'The purchase request was successfully created',
      },
      404: {
        description: 'The purchase request was not found',
      },
      401: {
        description: 'Unauthorized',
      },
    },
  })
  @ApiBody({
    type: CreatePurchaseRequestDto || String || Object,
    description: 'Purchase request data',
    examples: {
      example1: {
        value: EXAMPLE_PURCHASE_REQUEST,
        summary: 'Sample purchase request',
      }
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePurchaseRequestDto,
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
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    const result = await this.purchaseRequestService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Duplicates one or more existing purchase requests, preserving their line items
   * and details. Useful for recurring procurement needs where departments regularly
   * order the same items.
   */
  @Post(':bu_code/purchase-request/duplicate-pr')
  @UseGuards(new AppIdGuard('purchaseRequest.duplicatePr'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Duplicate purchase requests',
    description: 'Creates copies of one or more existing purchase requests, preserving their line items and details. Useful for recurring procurement needs where departments regularly order the same items.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.CREATED)
  async duplicatePr(
    @Param('bu_code') bu_code: string,
    @Body() body: { ids: string[] },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'duplicatePr',
        body,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.duplicatePr(body, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Splits selected line items from an existing purchase request into a new separate PR.
   * Used when a purchaser needs to separate items for different vendors or delivery timelines.
   */
  @Post(':bu_code/purchase-request/:id/split')
  @UseGuards(new AppIdGuard('purchaseRequest.split'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Split purchase request',
    description: 'Moves selected line items from an existing purchase request into a new separate PR, preserving the original workflow status. Used when a purchaser needs to separate items for different vendors or delivery timelines.',
    operationId: 'splitPurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Original purchase request ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business unit code' },
    ],
    responses: {
      200: {
        description: 'The purchase request was successfully split',
      },
      400: {
        description: 'Invalid request - no valid detail IDs or cannot split all details',
      },
      404: {
        description: 'The purchase request was not found',
      },
    },
  })
  @ApiBody({
    description: 'Detail IDs to split into a new purchase request',
    schema: {
      type: 'object',
      properties: {
        detail_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of purchase request detail IDs to split',
        },
      },
      required: ['detail_ids'],
    },
  })
  @HttpCode(HttpStatus.OK)
  async splitPr(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() body: { detail_ids: string[] },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'splitPr',
        id,
        body,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.splitPr(id, body, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Submits a draft purchase request into the approval workflow.
   * The PR moves from draft to pending status and becomes available for
   * review by the next approver (e.g., HOD).
   */
  @Patch(':bu_code/purchase-request/:id/submit')
  @UseGuards(new AppIdGuard('purchaseRequest.submit'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Submit a purchase request',
    description: 'Submits a draft purchase request into the approval workflow, making it available for review by the next approver (e.g., HOD). Once submitted, the PR moves from draft to pending status and can no longer be freely edited.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() payload: SubmitPurchaseRequestDto,
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
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.submit(id, payload, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Advances a purchase request through the approval workflow at the current stage.
   * Approval roles (HOD, FC, GM) confirm the request; the purchase role adds vendor
   * selection, pricing, tax, and discount details to prepare for PO conversion.
   */
  @Patch(':bu_code/purchase-request/:id/approve')
  @UseGuards(new AppIdGuard('purchaseRequest.approve'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Approve a purchase request',
    description: 'Advances a purchase request through the approval workflow at the current stage. Approval roles (HOD, FC, GM) confirm the request, while the purchase role adds vendor selection, price list, tax, and discount details to prepare the PR for conversion into a purchase order.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @ApiBody({
    description: 'Approve purchase request payload. Use stage_role to determine which role is approving.',
    examples: {
      'Approve Role': {
        summary: 'Approve by approve role',
        value: EXAMPLE_APPROVE_BY_APPROVE_ROLE,
      },
      'Purchase Role': {
        summary: 'Approve by purchase role (with pricelist_type, vendor, tax, discount)',
        value: EXAMPLE_APPROVE_BY_PURCHASE_ROLE,
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() payload: ApproveByStageRoleDto2,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.approve(id, payload, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Rejects a purchase request at the current approval stage, returning it to the
   * requester with a reason. Used by approvers (HOD, Purchaser, FC, GM) when the
   * request does not meet requirements or budget constraints.
   */
  @Patch(':bu_code/purchase-request/:id/reject')
  @UseGuards(new AppIdGuard('purchaseRequest.reject'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Submit a purchase request',
    description: 'Rejects a purchase request at the current approval stage, returning it to the requester with a reason. Used by approvers (HOD, Purchaser, FC, GM) when the request does not meet requirements or budget constraints.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() payload: RejectPurchaseRequestDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        payload,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.reject(id, payload, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Sends a purchase request back to a previous workflow stage for corrections
   * or additional information before it can proceed through approval.
   */
  @Patch(':bu_code/purchase-request/:id/review')
  @UseGuards(new AppIdGuard('purchaseRequest.review'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Review a purchase request',
    description: 'Sends a purchase request back to a previous workflow stage for corrections or additional information. Used by approvers who need the requester or a prior approver to revise the PR before it can proceed.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async review(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() payload: ReviewPurchaseRequestDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.review(id, payload, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Saves changes to a purchase request including header information and line item
   * modifications (quantities, items, details) before submitting for approval.
   */
  @Patch(':bu_code/purchase-request/:id/save')
  @UseGuards(new AppIdGuard('purchaseRequest.update'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase request',
    description: 'Saves changes to a purchase request including header information and line item modifications. Used to update quantities, add or remove items, or adjust details before submitting the PR for approval.',
    operationId: 'updatePurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
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
        description: 'The purchase request was successfully updated',
      },
      404: {
        description: 'The purchase request was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: Record<string, unknown>,
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
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    const result = await this.purchaseRequestService.save(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Generates an Excel spreadsheet of the purchase request with all line items,
   * pricing, and approval details for offline review or archival.
   */
  @Get(':bu_code/purchase-request/:id/export')
  @UseGuards(new AppIdGuard('purchaseRequest.export'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Export a purchase request to Excel',
    description: 'Generates an Excel spreadsheet of the purchase request with all line items, pricing, and approval details. Used for offline review, sharing with stakeholders, or archival purposes.',
    operationId: 'exportPurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase request ID' },
    ],
    responses: {
      200: {
        description: 'Excel file download',
        content: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            schema: { type: 'string', format: 'binary' },
          },
        },
      },
      404: { description: 'The purchase request was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async exportToExcel(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'exportToExcel', id, version },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.exportToExcel(id, user_id, bu_code, version);

    if (!result.isOk()) {
      this.respond(res, result);
      return;
    }

    const { buffer, filename } = result.value;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  /**
   * Generates a printable PDF of the purchase request for physical signatures,
   * filing, or sending to vendors. Includes line items, totals, and approval history.
   */
  @Get(':bu_code/purchase-request/:id/print')
  @UseGuards(new AppIdGuard('purchaseRequest.print'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Print a purchase request to PDF',
    description: 'Generates a printable PDF document of the purchase request for physical signatures, filing, or sending to vendors. Includes all line items, totals, and approval history.',
    operationId: 'printPurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase request ID' },
    ],
    responses: {
      200: {
        description: 'PDF file download',
        content: {
          'application/pdf': {
            schema: { type: 'string', format: 'binary' },
          },
        },
      },
      404: { description: 'The purchase request was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async printToPdf(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'printToPdf', id, version },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.printToPdf(id, user_id, bu_code, version);

    if (!result.isOk()) {
      this.respond(res, result);
      return;
    }

    const { buffer, filename } = result.value;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  /**
   * Removes a purchase request that is no longer needed, typically a draft PR
   * created in error or no longer required by the department.
   */
  @Delete(':bu_code/purchase-request/:id')
  @UseGuards(new AppIdGuard('purchaseRequest.delete'))
  @Serialize(PurchaseRequestMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase request',
    description: 'Removes a purchase request that is no longer needed. Typically used for draft PRs that were created in error or are no longer required by the department.',
    operationId: 'deletePurchaseRequest',
    tags: ['Procurement', 'Purchase Request'],
    deprecated: false,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase request was successfully deleted',
      },
      404: {
        description: 'The purchase request was not found',
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
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseRequestService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves cost allocation dimensions (e.g., department, cost center, project)
   * for a specific PR line item. Used for financial reporting and budget tracking.
   */
  @Get(':bu_code/purchase-request/detail/:detail_id/dimension')
  @UseGuards(new AppIdGuard('purchaseRequest.detail.findDimensions'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get dimensions of a purchase request detail',
    description: 'Retrieves cost allocation dimensions (e.g., department, cost center, project) associated with a specific PR line item. Used for financial reporting and budget tracking across organizational units.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async findDimensionsByDetailId(
    @Param('detail_id') detail_id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findDimensionsByDetailId',
        detail_id,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestService.findDimensionsByDetailId(
      detail_id,
      user_id,
      bu_code,
      version,
    );
  }


  /**
   * Retrieves the change history and audit trail for a specific PR line item,
   * including price changes, quantity adjustments, and approval actions at each stage.
   */
  @Get(':bu_code/purchase-request/detail/:detail_id/history')
  @UseGuards(new AppIdGuard('purchaseRequest.detail.findhistory'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get history of a purchase request detail',
    description: 'Retrieves the change history and audit trail for a specific PR line item, including price changes, quantity adjustments, and approval actions taken at each workflow stage.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async findHistoryByDetailId(
    @Param('detail_id') detail_id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findHistoryByDetailId',
        detail_id,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestService.findHistoryByDetailId(
      detail_id,
      user_id,
      bu_code,
      version,
    );
  }


  /**
   * Calculates the total cost breakdown for a PR line item including unit price,
   * tax, discount, and net amount. Used by purchasers to evaluate pricing from
   * different vendors and price lists before finalizing the request.
   */
  @Get(':bu_code/purchase-request/detail/:detail_id/calculate')
  @UseGuards(new AppIdGuard('purchaseRequest.detail.findhistory'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get history of a purchase request detail',
    description: 'Calculates the total cost breakdown for a PR line item including unit price, tax, discount, and net amount. Used by purchasers to evaluate pricing from different vendors and price lists before finalizing the request.',
    tags: ['Procurement', 'Purchase Request'],
  })
  @HttpCode(HttpStatus.OK)
  async getCalculatePriceInfoByDetailId(
    @Param('detail_id') detail_id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Body() data: CalculatePurchaseRequestDetail,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getCalculatePriceInfoByDetailId',
        detail_id,
        version,
      },
      PurchaseRequestController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestService.getCalculatePriceInfoByDetailId(
      detail_id,
      data,
      user_id,
      bu_code,
      version,
    );
  }
}
