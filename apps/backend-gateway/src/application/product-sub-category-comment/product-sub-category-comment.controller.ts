import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ProductSubCategoryCommentService } from './product-sub-category-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateProductSubCategoryCommentDto, UpdateProductSubCategoryCommentDto, AddAttachmentDto } from './dto/product-sub-category-comment.dto';

@Controller('api')
@ApiTags('Config: Products')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ProductSubCategoryCommentController {
  private readonly logger: BackendLogger = new BackendLogger(ProductSubCategoryCommentController.name);
  constructor(private readonly productSubCategoryCommentService: ProductSubCategoryCommentService) {}

  @Get(':bu_code/product-sub-category/:product_sub_category_id/comments')
  @UseGuards(new AppIdGuard('productSubCategoryComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a product-sub-category', operationId: 'findAllProductSubCategoryComments', tags: ['Master', 'ProductSubCategory Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByProductSubCategoryId(@Param('bu_code') bu_code: string, @Param('product_sub_category_id') product_sub_category_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.productSubCategoryCommentService.findAllByProductSubCategoryId(product_sub_category_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/product-sub-category-comment/:id')
  @UseGuards(new AppIdGuard('productSubCategoryComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a product-sub-category comment by ID', operationId: 'findOneProductSubCategoryComment', tags: ['Master', 'ProductSubCategory Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productSubCategoryCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-sub-category-comment')
  @UseGuards(new AppIdGuard('productSubCategoryComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new product-sub-category comment', operationId: 'createProductSubCategoryComment', tags: ['Master', 'ProductSubCategory Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateProductSubCategoryCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateProductSubCategoryCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productSubCategoryCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/product-sub-category-comment/:id')
  @UseGuards(new AppIdGuard('productSubCategoryComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a product-sub-category comment', operationId: 'updateProductSubCategoryComment', tags: ['Master', 'ProductSubCategory Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateProductSubCategoryCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateProductSubCategoryCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productSubCategoryCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-sub-category-comment/:id')
  @UseGuards(new AppIdGuard('productSubCategoryComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a product-sub-category comment', operationId: 'deleteProductSubCategoryComment', tags: ['Master', 'ProductSubCategory Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productSubCategoryCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-sub-category-comment/:id/attachment')
  @UseGuards(new AppIdGuard('productSubCategoryComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a product-sub-category comment', operationId: 'addAttachmentToProductSubCategoryComment', tags: ['Master', 'ProductSubCategory Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productSubCategoryCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-sub-category-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('productSubCategoryComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a product-sub-category comment', operationId: 'removeAttachmentFromProductSubCategoryComment', tags: ['Master', 'ProductSubCategory Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productSubCategoryCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
