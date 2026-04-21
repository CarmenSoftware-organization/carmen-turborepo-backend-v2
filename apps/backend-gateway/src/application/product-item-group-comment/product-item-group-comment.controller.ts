import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ProductItemGroupCommentService } from './product-item-group-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateProductItemGroupCommentDto, UpdateProductItemGroupCommentDto, AddAttachmentDto } from './dto/product-item-group-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ProductItemGroupCommentController {
  private readonly logger: BackendLogger = new BackendLogger(ProductItemGroupCommentController.name);
  constructor(private readonly productItemGroupCommentService: ProductItemGroupCommentService) {}

  @Get(':bu_code/product-item-group/:product_item_group_id/comments')
  @UseGuards(new AppIdGuard('productItemGroupComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a product-item-group', operationId: 'findAllProductItemGroupComments', tags: ['Master', 'ProductItemGroup Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByProductItemGroupId(@Param('bu_code') bu_code: string, @Param('product_item_group_id') product_item_group_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.productItemGroupCommentService.findAllByProductItemGroupId(product_item_group_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/product-item-group-comment/:id')
  @UseGuards(new AppIdGuard('productItemGroupComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a product-item-group comment by ID', operationId: 'findOneProductItemGroupComment', tags: ['Master', 'ProductItemGroup Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productItemGroupCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-item-group-comment')
  @UseGuards(new AppIdGuard('productItemGroupComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new product-item-group comment', operationId: 'createProductItemGroupComment', tags: ['Master', 'ProductItemGroup Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateProductItemGroupCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateProductItemGroupCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productItemGroupCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/product-item-group-comment/:id')
  @UseGuards(new AppIdGuard('productItemGroupComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a product-item-group comment', operationId: 'updateProductItemGroupComment', tags: ['Master', 'ProductItemGroup Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateProductItemGroupCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateProductItemGroupCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productItemGroupCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-item-group-comment/:id')
  @UseGuards(new AppIdGuard('productItemGroupComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a product-item-group comment', operationId: 'deleteProductItemGroupComment', tags: ['Master', 'ProductItemGroup Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productItemGroupCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-item-group-comment/:id/attachment')
  @UseGuards(new AppIdGuard('productItemGroupComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a product-item-group comment', operationId: 'addAttachmentToProductItemGroupComment', tags: ['Master', 'ProductItemGroup Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productItemGroupCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-item-group-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('productItemGroupComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a product-item-group comment', operationId: 'removeAttachmentFromProductItemGroupComment', tags: ['Master', 'ProductItemGroup Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productItemGroupCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
