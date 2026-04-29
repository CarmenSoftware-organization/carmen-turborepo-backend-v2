import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductCategoryCommentService } from './product-category-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateProductCategoryCommentDto, UpdateProductCategoryCommentDto, AddAttachmentDto } from './dto/product-category-comment.dto';

@Controller('api')
@ApiTags('Config: Products')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ProductCategoryCommentController {
  private readonly logger: BackendLogger = new BackendLogger(ProductCategoryCommentController.name);
  constructor(private readonly productCategoryCommentService: ProductCategoryCommentService) {}

  @Get(':bu_code/product-category/:product_category_id/comments')
  @UseGuards(new AppIdGuard('productCategoryComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a product-category', operationId: 'findAllProductCategoryComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByProductCategoryId(@Param('bu_code') bu_code: string, @Param('product_category_id', new ParseUUIDPipe({ version: '4' })) product_category_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.productCategoryCommentService.findAllByProductCategoryId(product_category_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/product-category-comment/:id')
  @UseGuards(new AppIdGuard('productCategoryComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a product-category comment by ID', operationId: 'findOneProductCategoryComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCategoryCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-category-comment')
  @UseGuards(new AppIdGuard('productCategoryComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new product-category comment', operationId: 'createProductCategoryComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateProductCategoryCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateProductCategoryCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCategoryCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/product-category-comment/:id')
  @UseGuards(new AppIdGuard('productCategoryComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a product-category comment', operationId: 'updateProductCategoryComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateProductCategoryCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateProductCategoryCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCategoryCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-category-comment/:id')
  @UseGuards(new AppIdGuard('productCategoryComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a product-category comment', operationId: 'deleteProductCategoryComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCategoryCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/product-category-comment/:id/attachment')
  @UseGuards(new AppIdGuard('productCategoryComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a product-category comment', operationId: 'addAttachmentToProductCategoryComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCategoryCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/product-category-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('productCategoryComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a product-category comment', operationId: 'removeAttachmentFromProductCategoryComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.productCategoryCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
