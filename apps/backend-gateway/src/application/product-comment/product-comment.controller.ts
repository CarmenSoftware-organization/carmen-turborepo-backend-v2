import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ProductCommentService } from './product-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateProductCommentDto, UpdateProductCommentDto, AddAttachmentDto } from './dto/product-comment.dto';

@Controller('api')
@ApiTags('Config: Products')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ProductCommentController {
  private readonly logger: BackendLogger = new BackendLogger(ProductCommentController.name);
  constructor(private readonly productCommentService: ProductCommentService) {}

  @Get(':bu_code/product/:product_id/comments')
  @UseGuards(new AppIdGuard('productComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a product', operationId: 'findAllProductComments', tags: ['Master', 'Product Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByProductId(@Param('bu_code') bu_code: string, @Param('product_id') product_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.productCommentService.findAllByProductId(product_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/product-comment/:id')
  @UseGuards(new AppIdGuard('productComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a product comment by ID', operationId: 'findOneProductComment', tags: ['Master', 'Product Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-comment')
  @UseGuards(new AppIdGuard('productComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new product comment', operationId: 'createProductComment', tags: ['Master', 'Product Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateProductCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateProductCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/product-comment/:id')
  @UseGuards(new AppIdGuard('productComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a product comment', operationId: 'updateProductComment', tags: ['Master', 'Product Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateProductCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateProductCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-comment/:id')
  @UseGuards(new AppIdGuard('productComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a product comment', operationId: 'deleteProductComment', tags: ['Master', 'Product Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-comment/:id/attachment')
  @UseGuards(new AppIdGuard('productComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a product comment', operationId: 'addAttachmentToProductComment', tags: ['Master', 'Product Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('productComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a product comment', operationId: 'removeAttachmentFromProductComment', tags: ['Master', 'Product Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
