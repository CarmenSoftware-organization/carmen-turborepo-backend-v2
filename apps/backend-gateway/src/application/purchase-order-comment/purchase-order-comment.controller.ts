import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { PurchaseOrderCommentService } from './purchase-order-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  CreatePurchaseOrderCommentDto,
  UpdatePurchaseOrderCommentDto,
  AddAttachmentDto,
} from './dto/purchase-order-comment.dto';

@Controller('api')
@ApiTags('Procurement: Purchase Orders')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseOrderCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseOrderCommentController.name,
  );

  constructor(
    private readonly purchaseOrderCommentService: PurchaseOrderCommentService,
  ) {}

  @Get(':bu_code/purchase-order/:purchase_order_id/comments')
  @UseGuards(new AppIdGuard('purchaseOrderComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a purchase-order',
    description: 'Retrieves all comments for a purchase-order.',
    operationId: 'findAllPurchaseOrderComments',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'PurchaseOrder not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPurchaseOrderId(
    @Param('bu_code') bu_code: string,
    @Param('purchase_order_id') purchase_order_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.purchaseOrderCommentService.findAllByPurchaseOrderId(
      purchase_order_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/purchase-order-comment/:id')
  @UseGuards(new AppIdGuard('purchaseOrderComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase-order comment by ID',
    operationId: 'findOnePurchaseOrderComment',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      200: { description: 'Comment retrieved successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-order-comment')
  @UseGuards(new AppIdGuard('purchaseOrderComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new purchase-order comment',
    operationId: 'createPurchaseOrderComment',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'PurchaseOrder not found' },
    },
  } as any)
  @ApiBody({ type: CreatePurchaseOrderCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePurchaseOrderCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/purchase-order-comment/:id')
  @UseGuards(new AppIdGuard('purchaseOrderComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase-order comment',
    operationId: 'updatePurchaseOrderComment',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdatePurchaseOrderCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-order-comment/:id')
  @UseGuards(new AppIdGuard('purchaseOrderComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase-order comment',
    operationId: 'deletePurchaseOrderComment',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      200: { description: 'Comment deleted successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-order-comment/:id/attachment')
  @UseGuards(new AppIdGuard('purchaseOrderComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a purchase-order comment',
    operationId: 'addAttachmentToPurchaseOrderComment',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      200: { description: 'Attachment added successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-order-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('purchaseOrderComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a purchase-order comment',
    operationId: 'removeAttachmentFromPurchaseOrderComment',
    tags: ['Procurement', 'PurchaseOrder Comment'],
    responses: {
      200: { description: 'Attachment removed successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Param('fileToken') fileToken: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
