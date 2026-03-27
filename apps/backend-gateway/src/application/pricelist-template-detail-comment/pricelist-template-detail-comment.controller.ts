import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { PricelistTemplateDetailCommentService } from './pricelist-template-detail-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreatePricelistTemplateDetailCommentDto, UpdatePricelistTemplateDetailCommentDto, AddAttachmentDto } from './dto/pricelist-template-detail-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PricelistTemplateDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(PricelistTemplateDetailCommentController.name);
  constructor(private readonly pricelistTemplateDetailCommentService: PricelistTemplateDetailCommentService) {}

  @Get(':bu_code/pricelist-template-detail/:pricelist_template_detail_id/comment')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a pricelist-template-detail', operationId: 'findAllPricelistTemplateDetailComments', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPricelistTemplateDetailId(@Param('bu_code') bu_code: string, @Param('pricelist_template_detail_id') pricelist_template_detail_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.pricelistTemplateDetailCommentService.findAllByPricelistTemplateDetailId(pricelist_template_detail_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/pricelist-template-detail-comment/:id')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a pricelist-template-detail comment by ID', operationId: 'findOnePricelistTemplateDetailComment', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-template-detail-comment')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new pricelist-template-detail comment', operationId: 'createPricelistTemplateDetailComment', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreatePricelistTemplateDetailCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreatePricelistTemplateDetailCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateDetailCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/pricelist-template-detail-comment/:id')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a pricelist-template-detail comment', operationId: 'updatePricelistTemplateDetailComment', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdatePricelistTemplateDetailCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdatePricelistTemplateDetailCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateDetailCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-template-detail-comment/:id')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a pricelist-template-detail comment', operationId: 'deletePricelistTemplateDetailComment', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-template-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a pricelist-template-detail comment', operationId: 'addAttachmentToPricelistTemplateDetailComment', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateDetailCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-template-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('pricelistTemplateDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a pricelist-template-detail comment', operationId: 'removeAttachmentFromPricelistTemplateDetailComment', tags: ['Master', 'PricelistTemplateDetail Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateDetailCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
