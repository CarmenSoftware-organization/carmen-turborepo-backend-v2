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
import { PurchaseRequestDetailCommentService } from './purchase-request-detail-comment.service';
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
  CreatePurchaseRequestDetailCommentDto,
  UpdatePurchaseRequestDetailCommentDto,
  AddAttachmentDto,
} from './dto/purchase-request-detail-comment.dto';

@Controller('api')
@ApiTags('Procurement: Purchase Requests')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseRequestDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseRequestDetailCommentController.name,
  );

  constructor(
    private readonly purchaseRequestDetailCommentService: PurchaseRequestDetailCommentService,
  ) {}

  @Get(':bu_code/purchase-request-detail/:purchase_request_detail_id/comments')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a purchase-request-detail',
    description: 'Retrieves all comments for a purchase-request-detail.',
    operationId: 'findAllPurchaseRequestDetailComments',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'PurchaseRequestDetail not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPurchaseRequestDetailId(
    @Param('bu_code') bu_code: string,
    @Param('purchase_request_detail_id') purchase_request_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.purchaseRequestDetailCommentService.findAllByPurchaseRequestDetailId(
      purchase_request_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/purchase-request-detail-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase-request-detail comment by ID',
    operationId: 'findOnePurchaseRequestDetailComment',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
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
    return this.purchaseRequestDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-request-detail-comment')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new purchase-request-detail comment',
    operationId: 'createPurchaseRequestDetailComment',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'PurchaseRequestDetail not found' },
    },
  } as any)
  @ApiBody({ type: CreatePurchaseRequestDetailCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePurchaseRequestDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestDetailCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/purchase-request-detail-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase-request-detail comment',
    operationId: 'updatePurchaseRequestDetailComment',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdatePurchaseRequestDetailCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseRequestDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestDetailCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-request-detail-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase-request-detail comment',
    operationId: 'deletePurchaseRequestDetailComment',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
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
    return this.purchaseRequestDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-request-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a purchase-request-detail comment',
    operationId: 'addAttachmentToPurchaseRequestDetailComment',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
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
    return this.purchaseRequestDetailCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-request-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('purchaseRequestDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a purchase-request-detail comment',
    operationId: 'removeAttachmentFromPurchaseRequestDetailComment',
    tags: ['Procurement', 'PurchaseRequestDetail Comment'],
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
    return this.purchaseRequestDetailCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
