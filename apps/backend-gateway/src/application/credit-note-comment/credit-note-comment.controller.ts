import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CreditNoteCommentService } from './credit-note-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  CreateCreditNoteCommentDto,
  UpdateCreditNoteCommentDto,
  AddAttachmentDto,
} from './dto/credit-note-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class CreditNoteCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    CreditNoteCommentController.name,
  );

  constructor(
    private readonly creditNoteCommentService: CreditNoteCommentService,
  ) {}

  @Get(':bu_code/credit-note/:credit_note_id/comments')
  @UseGuards(new AppIdGuard('creditNoteComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a credit-note',
    description: 'Retrieves all comments for a credit-note.',
    operationId: 'findAllCreditNoteComments',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'CreditNote not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByCreditNoteId(
    @Param('bu_code') bu_code: string,
    @Param('credit_note_id') credit_note_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.creditNoteCommentService.findAllByCreditNoteId(
      credit_note_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/credit-note-comment/:id')
  @UseGuards(new AppIdGuard('creditNoteComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a credit-note comment by ID',
    operationId: 'findOneCreditNoteComment',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      200: { description: 'Comment retrieved successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditNoteCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/credit-note-comment')
  @UseGuards(new AppIdGuard('creditNoteComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new credit-note comment',
    operationId: 'createCreditNoteComment',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'CreditNote not found' },
    },
  } as any)
  @ApiBody({ type: CreateCreditNoteCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateCreditNoteCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditNoteCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/credit-note-comment/:id')
  @UseGuards(new AppIdGuard('creditNoteComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a credit-note comment',
    operationId: 'updateCreditNoteComment',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdateCreditNoteCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditNoteCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditNoteCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/credit-note-comment/:id')
  @UseGuards(new AppIdGuard('creditNoteComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a credit-note comment',
    operationId: 'deleteCreditNoteComment',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      200: { description: 'Comment deleted successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditNoteCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/credit-note-comment/:id/attachment')
  @UseGuards(new AppIdGuard('creditNoteComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a credit-note comment',
    operationId: 'addAttachmentToCreditNoteComment',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      200: { description: 'Attachment added successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditNoteCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/credit-note-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('creditNoteComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a credit-note comment',
    operationId: 'removeAttachmentFromCreditNoteComment',
    tags: ['Procurement', 'CreditNote Comment'],
    responses: {
      200: { description: 'Attachment removed successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Param('fileToken') fileToken: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.creditNoteCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
