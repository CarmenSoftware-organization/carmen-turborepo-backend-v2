import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CurrencyCommentService } from './currency-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateCurrencyCommentDto, UpdateCurrencyCommentDto, AddAttachmentDto } from './dto/currency-comment.dto';

@Controller('api')
@ApiTags('Config: Currencies & FX')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class CurrencyCommentController {
  private readonly logger: BackendLogger = new BackendLogger(CurrencyCommentController.name);
  constructor(private readonly currencyCommentService: CurrencyCommentService) {}

  @Get(':bu_code/currency/:currency_id/comments')
  @UseGuards(new AppIdGuard('currencyComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a currency', operationId: 'findAllCurrencyComments', tags: ['Master', 'Currency Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByCurrencyId(@Param('bu_code') bu_code: string, @Param('currency_id') currency_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.currencyCommentService.findAllByCurrencyId(currency_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/currency-comment/:id')
  @UseGuards(new AppIdGuard('currencyComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a currency comment by ID', operationId: 'findOneCurrencyComment', tags: ['Master', 'Currency Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.currencyCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/currency-comment')
  @UseGuards(new AppIdGuard('currencyComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new currency comment', operationId: 'createCurrencyComment', tags: ['Master', 'Currency Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateCurrencyCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateCurrencyCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.currencyCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/currency-comment/:id')
  @UseGuards(new AppIdGuard('currencyComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a currency comment', operationId: 'updateCurrencyComment', tags: ['Master', 'Currency Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateCurrencyCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateCurrencyCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.currencyCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/currency-comment/:id')
  @UseGuards(new AppIdGuard('currencyComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a currency comment', operationId: 'deleteCurrencyComment', tags: ['Master', 'Currency Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.currencyCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/currency-comment/:id/attachment')
  @UseGuards(new AppIdGuard('currencyComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a currency comment', operationId: 'addAttachmentToCurrencyComment', tags: ['Master', 'Currency Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.currencyCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/currency-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('currencyComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a currency comment', operationId: 'removeAttachmentFromCurrencyComment', tags: ['Master', 'Currency Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.currencyCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
