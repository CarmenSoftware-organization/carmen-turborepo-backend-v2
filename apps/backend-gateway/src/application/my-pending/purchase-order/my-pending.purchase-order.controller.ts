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
@ApiTags('Application - My Pending')
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

  @Get('pending')
  @UseGuards(new AppIdGuard('my-pending.purchaseOrder.findAllPending.count'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get count of all pending purchase orders',
    description: 'Retrieves count of all pending purchase orders',
    operationId: 'findAllPendingPurchaseOrdersCount',
    tags: ['Application - My Pending Purchase Order', '[Method] Get'],
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

  @Get(':bu_code/:id')
  @UseGuards(new AppIdGuard('my-pending.purchaseOrder.findOne'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a purchase order by ID',
    description: 'Retrieves a purchase order by its ID',
    operationId: 'findPurchaseOrderById',
    tags: ['Application - My Pending Purchase Order', '[Method] Get'],
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

  @Get()
  @UseGuards(new AppIdGuard('my-pending.purchaseOrder.findAll'))
  @ApiVersionMinRequest()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all purchase orders',
    description: 'Retrieves all purchase orders',
    operationId: 'findAllPurchaseOrders',
    tags: ['Application - My Pending Purchase Order', '[Method] Get'],
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
