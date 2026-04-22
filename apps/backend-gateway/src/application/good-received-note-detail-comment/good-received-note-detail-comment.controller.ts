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
import { GoodReceivedNoteDetailCommentService } from './good-received-note-detail-comment.service';
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
  CreateGoodReceivedNoteDetailCommentDto,
  UpdateGoodReceivedNoteDetailCommentDto,
  AddAttachmentDto,
} from './dto/good-received-note-detail-comment.dto';

@Controller('api')
@ApiTags('Procurement: Good Received Notes')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class GoodReceivedNoteDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    GoodReceivedNoteDetailCommentController.name,
  );

  constructor(
    private readonly goodReceivedNoteDetailCommentService: GoodReceivedNoteDetailCommentService,
  ) {}

  @Get(':bu_code/good-received-note-detail/:good_received_note_detail_id/comments')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a good-received-note-detail',
    description: 'Retrieves all comments for a good-received-note-detail.',
    operationId: 'findAllGoodReceivedNoteDetailComments',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'GoodReceivedNoteDetail not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByGoodReceivedNoteDetailId(
    @Param('bu_code') bu_code: string,
    @Param('good_received_note_detail_id') good_received_note_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.goodReceivedNoteDetailCommentService.findAllByGoodReceivedNoteDetailId(
      good_received_note_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/good-received-note-detail-comment/:id')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a good-received-note-detail comment by ID',
    operationId: 'findOneGoodReceivedNoteDetailComment',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
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
    return this.goodReceivedNoteDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/good-received-note-detail-comment')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new good-received-note-detail comment',
    operationId: 'createGoodReceivedNoteDetailComment',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'GoodReceivedNoteDetail not found' },
    },
  } as any)
  @ApiBody({ type: CreateGoodReceivedNoteDetailCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateGoodReceivedNoteDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.goodReceivedNoteDetailCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/good-received-note-detail-comment/:id')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a good-received-note-detail comment',
    operationId: 'updateGoodReceivedNoteDetailComment',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdateGoodReceivedNoteDetailCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateGoodReceivedNoteDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.goodReceivedNoteDetailCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/good-received-note-detail-comment/:id')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a good-received-note-detail comment',
    operationId: 'deleteGoodReceivedNoteDetailComment',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
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
    return this.goodReceivedNoteDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/good-received-note-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a good-received-note-detail comment',
    operationId: 'addAttachmentToGoodReceivedNoteDetailComment',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
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
    return this.goodReceivedNoteDetailCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/good-received-note-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('goodReceivedNoteDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a good-received-note-detail comment',
    operationId: 'removeAttachmentFromGoodReceivedNoteDetailComment',
    tags: ['Procurement', 'GoodReceivedNoteDetail Comment'],
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
    return this.goodReceivedNoteDetailCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
