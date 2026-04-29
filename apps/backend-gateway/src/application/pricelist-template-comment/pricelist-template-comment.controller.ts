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
import { PricelistTemplateCommentService } from './pricelist-template-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreatePricelistTemplateCommentDto, UpdatePricelistTemplateCommentDto, AddAttachmentDto } from './dto/pricelist-template-comment.dto';

@Controller('api')
@ApiTags('Procurement: Price Lists')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PricelistTemplateCommentController {
  private readonly logger: BackendLogger = new BackendLogger(PricelistTemplateCommentController.name);
  constructor(private readonly pricelistTemplateCommentService: PricelistTemplateCommentService) {}

  @Get(':bu_code/pricelist-template/:pricelist_template_id/comments')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a pricelist-template', operationId: 'findAllPricelistTemplateComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPricelistTemplateId(@Param('bu_code') bu_code: string, @Param('pricelist_template_id', new ParseUUIDPipe({ version: '4' })) pricelist_template_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.pricelistTemplateCommentService.findAllByPricelistTemplateId(pricelist_template_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/pricelist-template-comment/:id')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a pricelist-template comment by ID', operationId: 'findOnePricelistTemplateComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-template-comment')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new pricelist-template comment', operationId: 'createPricelistTemplateComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreatePricelistTemplateCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreatePricelistTemplateCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/pricelist-template-comment/:id')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a pricelist-template comment', operationId: 'updatePricelistTemplateComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdatePricelistTemplateCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdatePricelistTemplateCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-template-comment/:id')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a pricelist-template comment', operationId: 'deletePricelistTemplateComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-template-comment/:id/attachment')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a pricelist-template comment', operationId: 'addAttachmentToPricelistTemplateComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-template-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('pricelistTemplateComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a pricelist-template comment', operationId: 'removeAttachmentFromPricelistTemplateComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistTemplateCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
