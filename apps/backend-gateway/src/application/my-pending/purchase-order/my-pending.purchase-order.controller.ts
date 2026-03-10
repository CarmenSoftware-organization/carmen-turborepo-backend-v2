import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MyPendingPurchaseOrderService } from './my-pending.purchase-order.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { BaseHttpController } from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/my-pending/purchase-order')
@ApiTags('Workflow & Approval')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class MyPendingPurchaseOrderController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    MyPendingPurchaseOrderController.name,
  );

  constructor(
    private readonly myPendingPurchaseOrderService: MyPendingPurchaseOrderService,
  ) {
    super();
  }

  /**
   * Returns the count of purchase orders awaiting the current user's action
   * in the approval pipeline, used for dashboard badge notifications.
   */
  @Get('pending')
  @UseGuards(new AppIdGuard('my-pending.purchaseOrder.findAllPending.count'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get count of all pending purchase orders',
    description: 'Returns the count of purchase orders currently awaiting the user\'s action in the approval pipeline, used for dashboard badge notifications and workload indicators.',
    operationId: 'findAllPendingPurchaseOrdersCount',
    tags: ['Workflow & Approval', 'My Pending - Purchase Order'],
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
        description: 'The purchase orders were successfully retrieved',
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
        description: 'The purchase orders were not found',
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
  async findAllPendingPurchaseOrdersCount(
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllPendingPurchaseOrdersCount',
        version,
      },
      MyPendingPurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result =
      await this.myPendingPurchaseOrderService.findAllMyPendingPurchaseOrdersCount(
        user_id,
        version,
      );
    this.respond(res, result);
  }

  /**
   * Retrieves the full details of a specific purchase order pending approval,
   * including vendor info, ordered items, pricing, and current workflow stage.
   */
  @Get(':bu_code/:id')
  @UseGuards(new AppIdGuard('my-pending.purchaseOrder.findOne'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a purchase order by ID',
    description: 'Retrieves the full details of a specific purchase order pending approval, including vendor information, ordered items, quantities, pricing, and current approval workflow stage.',
    operationId: 'findPurchaseOrderById',
    tags: ['Workflow & Approval', 'My Pending - Purchase Order'],
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
        description: 'The purchase order was successfully retrieved',
      },
      404: {
        description: 'The purchase order was not found',
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
      MyPendingPurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.myPendingPurchaseOrderService.findById(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all purchase orders in the user's pending approval queue,
   * allowing approvers to review vendor orders awaiting authorization.
   */
  @Get()
  @UseGuards(new AppIdGuard('my-pending.purchaseOrder.findAll'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all purchase orders',
    description: 'Lists all purchase orders in the user\'s pending approval queue with pagination, allowing approvers to review and process vendor orders awaiting authorization before goods are procured.',
    operationId: 'findAllPurchaseOrders',
    tags: ['Workflow & Approval', 'My Pending - Purchase Order'],
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
        description: 'The purchase orders were successfully retrieved',
      },
      404: {
        description: 'The purchase orders were not found',
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
      MyPendingPurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.myPendingPurchaseOrderService.findAll(
      user_id,
      paginate.bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }
}
