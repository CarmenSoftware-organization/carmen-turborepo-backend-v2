import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import {
  ApprovePurchaseOrderDto,
  SavePurchaseOrderDto,
  RejectPurchaseOrderDto,
  ReviewPurchaseOrderDto,
  EXAMPLE_APPROVE_PO,
  EXAMPLE_SAVE_PO,
  EXAMPLE_REJECT_PO,
  EXAMPLE_REVIEW_PO,
} from './dto/state-change.dto';
import { PermissionGuard } from 'src/auth';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  PurchaseOrderDetailResponseSchema,
  PurchaseOrderListItemResponseSchema,
  PurchaseOrderMutationResponseSchema,
  PurchaseOrderUpdateDto,
} from '@/common';

@Controller('api/:bu_code/purchase-order')
@ApiTags('Application - Purchase Order')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseOrderController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseOrderController.name,
  );

  constructor(private readonly purchaseOrderService: PurchaseOrderService) {
    super();
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('purchaseOrder.findOne'))
  @Serialize(PurchaseOrderDetailResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase order by ID',
    description: 'Retrieves a purchase order by its unique identifier',
    operationId: 'findOnePurchaseOrder',
    tags: ['[Method] Get'],
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
        description: 'The purchase order was successfully retrieved',
      },
      404: {
        description: 'The purchase order was not found',
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Get()
  @UseGuards(new AppIdGuard('purchaseOrder.findAll'))
  @Serialize(PurchaseOrderListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all purchase orders',
    description: 'Retrieves all purchase orders',
    operationId: 'findAllPurchaseOrders',
    tags: ['[Method] Get'],
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
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.purchaseOrderService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  @Post()
  @UseGuards(new AppIdGuard('purchaseOrder.create'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a purchase order',
    description:
      'Creates a new purchase order. PO groups items from PR by vendor_id -> delivery_date -> currency_id',
    operationId: 'createPurchaseOrder',
    tags: ['[Method] Post'],
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
        description: 'The purchase order was successfully created',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({ type: CreatePurchaseOrderDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePurchaseOrderDto,
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Put(':id')
  @UseGuards(new AppIdGuard('purchaseOrder.update'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase order',
    description: 'Updates an existing purchase order',
    operationId: 'updatePurchaseOrder',
    tags: ['[Method] Update'],
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
        description: 'The purchase order was successfully updated',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: PurchaseOrderUpdateDto,
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.update(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Delete(':id')
  @UseGuards(new AppIdGuard('purchaseOrder.delete'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase order',
    description: 'Deletes an existing purchase order',
    operationId: 'deletePurchaseOrder',
    tags: ['[Method] Delete'],
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
        description: 'The purchase order was successfully deleted',
      },
      404: {
        description: 'The purchase order was not found',
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Patch(':id/save')
  @UseGuards(new AppIdGuard('purchaseOrder.save'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Save purchase order detail changes',
    description:
      'Saves qty/price/tax/discount changes to purchase order details during the approval workflow.',
    operationId: 'savePurchaseOrder',
    tags: ['[Method] Patch'],
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
        description: 'The purchase order details were successfully saved',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: SavePurchaseOrderDto,
    description: 'Save purchase order detail changes (qty, price, tax, discount)',
    examples: {
      save: {
        value: EXAMPLE_SAVE_PO,
        summary: 'Save PO detail with qty/price changes',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async save(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: SavePurchaseOrderDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'save',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.save(
      id,
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Patch(':id/approve')
  @UseGuards(new AppIdGuard('purchaseOrder.approve'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Approve a purchase order',
    description:
      'Approves a purchase order at the current workflow stage. Validates user role and advances the workflow.',
    operationId: 'approvePurchaseOrder',
    tags: ['[Method] Patch'],
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
        description: 'The purchase order was successfully approved',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: ApprovePurchaseOrderDto,
    description: 'Approve purchase order payload',
    examples: {
      approve: {
        value: EXAMPLE_APPROVE_PO,
        summary: 'Approve PO at current workflow stage',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: ApprovePurchaseOrderDto,
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.approve(
      id,
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Patch(':id/reject')
  @UseGuards(new AppIdGuard('purchaseOrder.reject'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Reject a purchase order',
    description:
      'Rejects a purchase order at the current workflow stage. Sets status to closed.',
    operationId: 'rejectPurchaseOrder',
    tags: ['[Method] Patch'],
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
        description: 'The purchase order was successfully rejected',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: RejectPurchaseOrderDto,
    description: 'Reject purchase order payload',
    examples: {
      reject: {
        value: EXAMPLE_REJECT_PO,
        summary: 'Reject PO with message',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: RejectPurchaseOrderDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'reject',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.reject(
      id,
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Patch(':id/review')
  @UseGuards(new AppIdGuard('purchaseOrder.review'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Review a purchase order',
    description:
      'Sends a purchase order back to a previous workflow stage for review.',
    operationId: 'reviewPurchaseOrder',
    tags: ['[Method] Patch'],
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
        description: 'The purchase order was successfully sent back for review',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: ReviewPurchaseOrderDto,
    description: 'Review purchase order payload',
    examples: {
      review: {
        value: EXAMPLE_REVIEW_PO,
        summary: 'Send PO back to previous stage for review',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async review(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: ReviewPurchaseOrderDto,
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.review(
      id,
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Post(':id/cancel')
  @UseGuards(new AppIdGuard('purchaseOrder.cancel'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Cancel a purchase order',
    description:
      'Cancels an existing purchase order. Only orders with status draft, in_progress, or sent can be cancelled. Sets status to closed and updates cancelled_qty on line items.',
    operationId: 'cancelPurchaseOrder',
    tags: ['[Method] Post'],
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
        description: 'The purchase order was successfully cancelled',
      },
      400: {
        description: 'The purchase order cannot be cancelled due to invalid status',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'cancel',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.cancel(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Post(':id/close')
  @UseGuards(new AppIdGuard('purchaseOrder.close'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Close a purchase order',
    description:
      'Closes an existing purchase order and sends notification to buyer and email to vendor. Only orders with status sent, partial, or in_progress can be closed. Sets status to closed and updates cancelled_qty for unreceived items.',
    operationId: 'closePurchaseOrder',
    tags: ['[Method] Post'],
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
        description: 'The purchase order was successfully closed',
      },
      400: {
        description: 'The purchase order cannot be closed due to invalid status',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async closePO(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'closePO',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.closePO(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Post('group-pr')
  @UseGuards(new AppIdGuard('purchaseOrder.groupPr'))
  @Serialize(PurchaseOrderListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Group PR details for PO creation',
    description:
      'Groups PR details by vendor_id -> delivery_date -> currency_id for creating POs from PRs',
    operationId: 'groupPrForPo',
    tags: ['[Method] Post'],
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
        description: 'PR details grouped successfully',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pr_ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of PR IDs to group',
        },
      },
      required: ['pr_ids'],
    },
  })
  @HttpCode(HttpStatus.OK)
  async groupPrForPo(
    @Body() body: { pr_ids: string[] },
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'groupPrForPo',
        pr_ids: body.pr_ids,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.groupPrForPo(
      body.pr_ids,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Post('confirm-pr')
  @UseGuards(new AppIdGuard('purchaseOrder.confirmPr'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Confirm PR and create PO(s)',
    description:
      'Finds PRs by ID, groups PR details by vendor_id -> delivery_date -> currency_id, and creates Purchase Orders',
    operationId: 'confirmPrToPo',
    tags: ['[Method] Post'],
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
        description: 'Purchase Orders created successfully from PRs',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pr_ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of PR IDs to confirm and create POs from',
        },
      },
      required: ['pr_ids'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async confirmPrToPo(
    @Body() body: { pr_ids: string[] },
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'confirmPrToPo',
        pr_ids: body.pr_ids,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.confirmPrToPo(
      body.pr_ids,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Get(':id/export')
  @UseGuards(new AppIdGuard('purchaseOrder.export'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Export a purchase order to Excel',
    description: 'Exports a purchase order to Excel format (.xlsx) for download',
    operationId: 'exportPurchaseOrder',
    tags: ['[Method] Get'],
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
        description: 'Purchase order ID',
      },
    ],
    responses: {
      200: {
        description: 'Excel file download',
        content: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
      404: {
        description: 'The purchase order was not found',
      },
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
      {
        function: 'exportToExcel',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.exportToExcel(id, user_id, bu_code, version);

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

  @Get(':id/print')
  @UseGuards(new AppIdGuard('purchaseOrder.print'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Print a purchase order to PDF',
    description: 'Generates a PDF document of the purchase order for printing',
    operationId: 'printPurchaseOrder',
    tags: ['[Method] Get'],
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
        description: 'Purchase order ID',
      },
    ],
    responses: {
      200: {
        description: 'PDF file download',
        content: {
          'application/pdf': {
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
      404: {
        description: 'The purchase order was not found',
      },
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
      {
        function: 'printToPdf',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.printToPdf(id, user_id, bu_code, version);

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

  // ==================== Purchase Order Detail CRUD ====================

  @Get(':id/details')
  @UseGuards(new AppIdGuard('purchaseOrder.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a purchase order',
    description: 'Retrieves all line items/details for a specific purchase order',
    operationId: 'findAllPurchaseOrderDetails',
    tags: ['[Method] Get', 'Purchase Order Detail'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase order ID' },
    ],
    responses: {
      200: { description: 'The purchase order details were successfully retrieved' },
      404: { description: 'The purchase order was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllDetails(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findAllDetails', id, version },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.findDetailsByPurchaseOrderId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Get(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('purchaseOrder.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a single purchase order detail by ID',
    description: 'Retrieves a specific line item/detail from a purchase order',
    operationId: 'findOnePurchaseOrderDetail',
    tags: ['[Method] Get', 'Purchase Order Detail'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase order ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Detail ID' },
    ],
    responses: {
      200: { description: 'The purchase order detail was successfully retrieved' },
      404: { description: 'The purchase order detail was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findOneDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findOneDetail', id, detailId, version },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Delete(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('purchaseOrder.update'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase order detail',
    description: 'Removes a line item/detail from a purchase order (draft status only)',
    operationId: 'deletePurchaseOrderDetail',
    tags: ['[Method] Delete', 'Purchase Order Detail'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase order ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Detail ID' },
    ],
    responses: {
      200: { description: 'The purchase order detail was successfully deleted' },
      400: { description: 'Purchase order is not in draft status' },
      404: { description: 'The purchase order detail was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async deleteDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'deleteDetail', id, detailId, version },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
