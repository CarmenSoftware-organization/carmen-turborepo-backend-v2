import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ExchangeRateCommentService } from './exchange-rate-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateExchangeRateCommentDto, UpdateExchangeRateCommentDto, AddAttachmentDto } from './dto/exchange-rate-comment.dto';

@Controller('api')
@ApiTags('Config: Currencies & FX')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ExchangeRateCommentController {
  private readonly logger: BackendLogger = new BackendLogger(ExchangeRateCommentController.name);
  constructor(private readonly exchangeRateCommentService: ExchangeRateCommentService) {}

  @Get(':bu_code/exchange-rate/:exchange_rate_id/comments')
  @UseGuards(new AppIdGuard('exchangeRateComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a exchange-rate', operationId: 'findAllExchangeRateComments', tags: ['Master', 'ExchangeRate Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByExchangeRateId(@Param('bu_code') bu_code: string, @Param('exchange_rate_id') exchange_rate_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.exchangeRateCommentService.findAllByExchangeRateId(exchange_rate_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/exchange-rate-comment/:id')
  @UseGuards(new AppIdGuard('exchangeRateComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a exchange-rate comment by ID', operationId: 'findOneExchangeRateComment', tags: ['Master', 'ExchangeRate Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.exchangeRateCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/exchange-rate-comment')
  @UseGuards(new AppIdGuard('exchangeRateComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new exchange-rate comment', operationId: 'createExchangeRateComment', tags: ['Master', 'ExchangeRate Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateExchangeRateCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateExchangeRateCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.exchangeRateCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/exchange-rate-comment/:id')
  @UseGuards(new AppIdGuard('exchangeRateComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a exchange-rate comment', operationId: 'updateExchangeRateComment', tags: ['Master', 'ExchangeRate Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateExchangeRateCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateExchangeRateCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.exchangeRateCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/exchange-rate-comment/:id')
  @UseGuards(new AppIdGuard('exchangeRateComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a exchange-rate comment', operationId: 'deleteExchangeRateComment', tags: ['Master', 'ExchangeRate Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.exchangeRateCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/exchange-rate-comment/:id/attachment')
  @UseGuards(new AppIdGuard('exchangeRateComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a exchange-rate comment', operationId: 'addAttachmentToExchangeRateComment', tags: ['Master', 'ExchangeRate Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.exchangeRateCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/exchange-rate-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('exchangeRateComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a exchange-rate comment', operationId: 'removeAttachmentFromExchangeRateComment', tags: ['Master', 'ExchangeRate Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.exchangeRateCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
