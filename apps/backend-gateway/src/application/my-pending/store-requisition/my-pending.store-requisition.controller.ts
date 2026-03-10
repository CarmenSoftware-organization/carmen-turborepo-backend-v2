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
import { MyPendingStoreRequisitionService as MyPendingStoreRequisitionService } from './my-pending.store-requisition.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  BaseHttpController,
  ZodSerializerInterceptor,
} from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
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
import {
  CreateStoreRequisitionDto,
  UpdateStoreRequisitionDto,
} from '@/common';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { IgnoreGuards } from 'src/auth/decorators/ignore-guard.decorator';

@Controller('api/my-pending/store-requisition')
@ApiTags('Workflow & Approval')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class MyPendingStoreRequisitionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    MyPendingStoreRequisitionController.name,
  );

  constructor(
    private readonly myPendingStoreRequisitionService: MyPendingStoreRequisitionService,
  ) {
    super();
  }

  /**
   * Returns the count of store requisitions awaiting the current user's action,
   * used for dashboard badge notifications and workload tracking.
   */
  @Get('pending')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.findAllPending.count'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get count of all pending store requisitions',
    description: 'Returns the count of store requisitions currently awaiting the user\'s action in the approval pipeline, used for dashboard badge notifications and workload tracking.',
    operationId: 'findAllPendingStoreRequisitionsCount',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Pending store requisition count retrieved successfully',
        content: {
          'application/json': {
            examples: {
              default: {
                value: {
                  data: {
                    pending: 1,
                  },
                  message: 'Success',
                  status: 200,
                },
              },
            },
          },
        },
      },
      404: {
        description: 'No pending store requisitions found',
        content: {
          'application/json': {
            examples: {
              default: {
                value: {
                  data: {},
                  message: 'false',
                  status: 404,
                },
              },
            },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllPendingStoreRequisitionsCount(
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllPendingStoreRequisitionsCount',
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result =
      await this.myPendingStoreRequisitionService.findAllMyPendingStoreRequisitionsCount(
        user_id,
        version,
      );
    this.respond(res, result);
  }

  /**
   * Retrieves the approval workflow stages configured for store requisitions,
   * showing the sequence of approval steps internal stock requests must pass through.
   */
  @Get(':bu_code/workflow-stages')
  @UseGuards(
    new AppIdGuard('my-pending.storeRequisition.findAllWorkflowStagesBySr'),
  )
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get workflow stages of a store requisition',
    description: 'Retrieves the approval workflow stages configured for store requisitions in the business unit, showing the sequence of approval steps that internal stock requests must pass through before fulfillment.',
    operationId: 'findAllWorkflowStagesBySr',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Store requisition workflow stages retrieved successfully',
        content: {
          'application/json': {
            examples: {
              default: {
                value: {
                  data: {
                    workflowStages: [],
                  },
                  message: 'Success',
                  status: 200,
                },
              },
            },
          },
        },
      },
      404: {
        description: 'Workflow stages not found',
        content: {
          'application/json': {
            examples: {
              default: {
                value: {
                  data: {},
                  message: 'false',
                  status: 404,
                },
              },
            },
          },
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllWorkflowStagesBySr(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllWorkflowStagesBySr',
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result =
      await this.myPendingStoreRequisitionService.findAllMyPendingStages(
        user_id,
        bu_code,
        version,
      );
    this.respond(res, result);
  }

  /**
   * Retrieves the full details of a specific store requisition pending approval,
   * including requested items, quantities, requesting department, and approval status.
   */
  @Get(':bu_code/:id')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.findOne'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a store requisition by ID',
    description: 'Retrieves the full details of a specific store requisition pending in the approval pipeline, including requested items, quantities, requesting department, and current approval status.',
    operationId: 'findPendingStoreRequisitionById',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
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
  async findById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findById',
        bu_code,
        id,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.findById(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all store requisitions in the user's pending queue with pagination,
   * enabling department staff and approvers to track internal stock requests.
   */
  @Get()
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.findAll'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all store requisitions',
    description: 'Lists all store requisitions in the user\'s pending queue with pagination, enabling department staff and approvers to track internal stock requests through the approval and fulfillment process.',
    operationId: 'findAllPendingStoreRequisitions',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
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
      {
        name: 'bu_code',
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
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.myPendingStoreRequisitionService.findAll(
      user_id,
      paginate.bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Filters store requisitions by their current status (e.g., draft, pending,
   * approved, rejected) to view requests at a specific workflow stage.
   */
  @Get(':bu_code/status/:status')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.findAllByStatus'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all store requisitions by status',
    description: 'Filters store requisitions by their current status (e.g., draft, pending, approved, rejected), allowing users to view internal stock requests at a specific stage in the approval workflow.',
    operationId: 'findStoreRequisitionsByStatus',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    responses: {
      200: { description: 'Store requisitions retrieved successfully' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllByStatus(
    @Param('status') status: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllByStatus',
        status,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.findAllByStatus(
      status,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new store requisition for a hotel department to request items
   * from internal storage, initiating the approval workflow before fulfillment.
   */
  @Post(':bu_code')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.create'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a store requisition',
    description: 'Creates a new store requisition for a hotel department to request items from internal storage, initiating the approval workflow before the storeroom fulfills the request.',
    operationId: 'createPendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
        in: 'path',
        required: true,
      },
    ],
  })
  @ApiBody({ type: CreateStoreRequisitionDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateStoreRequisitionDto,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        body,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.create(
      body,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Saves changes to a draft store requisition, allowing the requestor to
   * modify requested items, quantities, or delivery details before submitting.
   */
  @Patch(':bu_code/:id/save')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.update'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a store requisition',
    description: 'Saves changes to a draft store requisition, allowing the requestor to modify requested items, quantities, or delivery details before submitting for approval.',
    operationId: 'updatePendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
        in: 'path',
        required: true,
      },
    ],
  })
  @ApiBody({ type: UpdateStoreRequisitionDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateStoreRequisitionDto,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        body,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.update(
      id,
      body,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Submits a draft store requisition into the approval workflow,
   * moving it from draft status to the first approval stage for review.
   */
  @Patch(':bu_code/:id/submit')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.submit'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a store requisition',
    description: 'Submits a draft store requisition into the approval workflow, moving it from draft status to the first approval stage for designated approvers to review.',
    operationId: 'submitPendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
        in: 'path',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'submit',
        id,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.submit(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Approves a store requisition at the current user's workflow stage,
   * advancing it to the next level or marking it as approved for fulfillment.
   */
  @Patch(':bu_code/:id/approve')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.approve'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve a store requisition',
    description: 'Approves a store requisition at the current user\'s workflow stage, advancing it to the next approval level or marking it as fully approved for storeroom fulfillment.',
    operationId: 'approvePendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
        in: 'path',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.approve(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Rejects a store requisition at the current approval stage,
   * sending it back to the requesting department for revision or cancellation.
   */
  @Patch(':bu_code/:id/reject')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.reject'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reject a store requisition',
    description: 'Rejects a store requisition at the current approval stage, sending it back to the requesting department for revision or cancellation.',
    operationId: 'rejectPendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
        in: 'path',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'reject',
        id,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.reject(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Allows an approver to review a store requisition and provide feedback
   * or modifications before making a final approve/reject decision.
   */
  @Patch(':bu_code/:id/review')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.review'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Review a store requisition',
    description: 'Allows an approver to review a store requisition and provide feedback or modifications before making a final approve/reject decision on the internal stock request.',
    operationId: 'reviewPendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
      {
        name: 'bu_code',
        in: 'path',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  async review(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'review',
        id,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.review(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a store requisition that is no longer needed, typically a draft
   * or rejected request that the department has decided to discard.
   */
  @Delete(':bu_code/:id')
  @UseGuards(new AppIdGuard('my-pending.storeRequisition.delete'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a store requisition',
    description: 'Removes a store requisition that is no longer needed, typically a draft or rejected request that the department has decided to discard rather than resubmit.',
    operationId: 'deletePendingStoreRequisition',
    tags: ['Workflow & Approval', 'My Pending - Store Requisition'],
    deprecated: false,
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
      {
        name: 'bu_code',
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
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      MyPendingStoreRequisitionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingStoreRequisitionService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
