import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { PricelistDetailCommentService } from './pricelist-detail-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreatePricelistDetailCommentDto, UpdatePricelistDetailCommentDto, AddAttachmentDto } from './dto/pricelist-detail-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PricelistDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(PricelistDetailCommentController.name);
  constructor(private readonly pricelistDetailCommentService: PricelistDetailCommentService) {}

  @Get(':bu_code/pricelist-detail/:pricelist_detail_id/comment')
  @UseGuards(new AppIdGuard('pricelistDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a pricelist-detail', operationId: 'findAllPricelistDetailComments', tags: ['Master', 'PricelistDetail Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPricelistDetailId(@Param('bu_code') bu_code: string, @Param('pricelist_detail_id') pricelist_detail_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.pricelistDetailCommentService.findAllByPricelistDetailId(pricelist_detail_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/pricelist-detail-comment/:id')
  @UseGuards(new AppIdGuard('pricelistDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a pricelist-detail comment by ID', operationId: 'findOnePricelistDetailComment', tags: ['Master', 'PricelistDetail Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-detail-comment')
  @UseGuards(new AppIdGuard('pricelistDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new pricelist-detail comment', operationId: 'createPricelistDetailComment', tags: ['Master', 'PricelistDetail Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreatePricelistDetailCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreatePricelistDetailCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistDetailCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/pricelist-detail-comment/:id')
  @UseGuards(new AppIdGuard('pricelistDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a pricelist-detail comment', operationId: 'updatePricelistDetailComment', tags: ['Master', 'PricelistDetail Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdatePricelistDetailCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdatePricelistDetailCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistDetailCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-detail-comment/:id')
  @UseGuards(new AppIdGuard('pricelistDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a pricelist-detail comment', operationId: 'deletePricelistDetailComment', tags: ['Master', 'PricelistDetail Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('pricelistDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a pricelist-detail comment', operationId: 'addAttachmentToPricelistDetailComment', tags: ['Master', 'PricelistDetail Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistDetailCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('pricelistDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a pricelist-detail comment', operationId: 'removeAttachmentFromPricelistDetailComment', tags: ['Master', 'PricelistDetail Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistDetailCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
