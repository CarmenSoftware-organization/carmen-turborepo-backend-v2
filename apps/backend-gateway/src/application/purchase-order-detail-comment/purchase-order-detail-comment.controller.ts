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
import { PurchaseOrderDetailCommentService } from './purchase-order-detail-comment.service';
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
  CreatePurchaseOrderDetailCommentDto,
  UpdatePurchaseOrderDetailCommentDto,
  AddAttachmentDto,
} from './dto/purchase-order-detail-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseOrderDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseOrderDetailCommentController.name,
  );

  constructor(
    private readonly purchaseOrderDetailCommentService: PurchaseOrderDetailCommentService,
  ) {}

  @Get(':bu_code/purchase-order-detail/:purchase_order_detail_id/comments')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a purchase-order-detail',
    description: 'Retrieves all comments for a purchase-order-detail.',
    operationId: 'findAllPurchaseOrderDetailComments',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'PurchaseOrderDetail not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPurchaseOrderDetailId(
    @Param('bu_code') bu_code: string,
    @Param('purchase_order_detail_id') purchase_order_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.purchaseOrderDetailCommentService.findAllByPurchaseOrderDetailId(
      purchase_order_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/purchase-order-detail-comment/:id')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase-order-detail comment by ID',
    operationId: 'findOnePurchaseOrderDetailComment',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
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
    return this.purchaseOrderDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-order-detail-comment')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new purchase-order-detail comment',
    operationId: 'createPurchaseOrderDetailComment',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'PurchaseOrderDetail not found' },
    },
  } as any)
  @ApiBody({ type: CreatePurchaseOrderDetailCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePurchaseOrderDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderDetailCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/purchase-order-detail-comment/:id')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase-order-detail comment',
    operationId: 'updatePurchaseOrderDetailComment',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdatePurchaseOrderDetailCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseOrderDetailCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-order-detail-comment/:id')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase-order-detail comment',
    operationId: 'deletePurchaseOrderDetailComment',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
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
    return this.purchaseOrderDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-order-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a purchase-order-detail comment',
    operationId: 'addAttachmentToPurchaseOrderDetailComment',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
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
    return this.purchaseOrderDetailCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-order-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('purchaseOrderDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a purchase-order-detail comment',
    operationId: 'removeAttachmentFromPurchaseOrderDetailComment',
    tags: ['Procurement', 'PurchaseOrderDetail Comment'],
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
    return this.purchaseOrderDetailCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
