import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CreditTermCommentService } from './credit-term-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateCreditTermCommentDto, UpdateCreditTermCommentDto, AddAttachmentDto } from './dto/credit-term-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class CreditTermCommentController {
  private readonly logger: BackendLogger = new BackendLogger(CreditTermCommentController.name);
  constructor(private readonly creditTermCommentService: CreditTermCommentService) {}

  @Get(':bu_code/credit-term/:credit_term_id/comments')
  @UseGuards(new AppIdGuard('creditTermComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a credit-term', operationId: 'findAllCreditTermComments', tags: ['Master', 'CreditTerm Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByCreditTermId(@Param('bu_code') bu_code: string, @Param('credit_term_id') credit_term_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.creditTermCommentService.findAllByCreditTermId(credit_term_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/credit-term-comment/:id')
  @UseGuards(new AppIdGuard('creditTermComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a credit-term comment by ID', operationId: 'findOneCreditTermComment', tags: ['Master', 'CreditTerm Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditTermCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/credit-term-comment')
  @UseGuards(new AppIdGuard('creditTermComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new credit-term comment', operationId: 'createCreditTermComment', tags: ['Master', 'CreditTerm Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateCreditTermCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateCreditTermCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditTermCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/credit-term-comment/:id')
  @UseGuards(new AppIdGuard('creditTermComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a credit-term comment', operationId: 'updateCreditTermComment', tags: ['Master', 'CreditTerm Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateCreditTermCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateCreditTermCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditTermCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/credit-term-comment/:id')
  @UseGuards(new AppIdGuard('creditTermComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a credit-term comment', operationId: 'deleteCreditTermComment', tags: ['Master', 'CreditTerm Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditTermCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/credit-term-comment/:id/attachment')
  @UseGuards(new AppIdGuard('creditTermComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a credit-term comment', operationId: 'addAttachmentToCreditTermComment', tags: ['Master', 'CreditTerm Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditTermCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/credit-term-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('creditTermComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a credit-term comment', operationId: 'removeAttachmentFromCreditTermComment', tags: ['Master', 'CreditTerm Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditTermCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
