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
import { PurchaseRequestTemplateCommentService } from './purchase-request-template-comment.service';
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
  CreatePurchaseRequestTemplateCommentDto,
  UpdatePurchaseRequestTemplateCommentDto,
  AddAttachmentDto,
} from './dto/purchase-request-template-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseRequestTemplateCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseRequestTemplateCommentController.name,
  );

  constructor(
    private readonly purchaseRequestTemplateCommentService: PurchaseRequestTemplateCommentService,
  ) {}

  @Get(':bu_code/purchase-request-template/:purchase_request_template_id/comment')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a purchase-request-template',
    description: 'Retrieves all comments for a purchase-request-template.',
    operationId: 'findAllPurchaseRequestTemplateComments',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'PurchaseRequestTemplate not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPurchaseRequestTemplateId(
    @Param('bu_code') bu_code: string,
    @Param('purchase_request_template_id') purchase_request_template_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.purchaseRequestTemplateCommentService.findAllByPurchaseRequestTemplateId(
      purchase_request_template_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/purchase-request-template-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase-request-template comment by ID',
    operationId: 'findOnePurchaseRequestTemplateComment',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
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
    return this.purchaseRequestTemplateCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-request-template-comment')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new purchase-request-template comment',
    operationId: 'createPurchaseRequestTemplateComment',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'PurchaseRequestTemplate not found' },
    },
  } as any)
  @ApiBody({ type: CreatePurchaseRequestTemplateCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePurchaseRequestTemplateCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestTemplateCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/purchase-request-template-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase-request-template comment',
    operationId: 'updatePurchaseRequestTemplateComment',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdatePurchaseRequestTemplateCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseRequestTemplateCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.purchaseRequestTemplateCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-request-template-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase-request-template comment',
    operationId: 'deletePurchaseRequestTemplateComment',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
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
    return this.purchaseRequestTemplateCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/purchase-request-template-comment/:id/attachment')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a purchase-request-template comment',
    operationId: 'addAttachmentToPurchaseRequestTemplateComment',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
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
    return this.purchaseRequestTemplateCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/purchase-request-template-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('purchaseRequestTemplateComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a purchase-request-template comment',
    operationId: 'removeAttachmentFromPurchaseRequestTemplateComment',
    tags: ['Procurement', 'PurchaseRequestTemplate Comment'],
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
    return this.purchaseRequestTemplateCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
