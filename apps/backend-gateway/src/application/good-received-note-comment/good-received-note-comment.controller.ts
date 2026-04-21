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
import { GoodReceivedNoteCommentService } from './good-received-note-comment.service';
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
  CreateGoodReceivedNoteCommentDto,
  UpdateGoodReceivedNoteCommentDto,
  AddAttachmentDto,
} from './dto/good-received-note-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class GoodReceivedNoteCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    GoodReceivedNoteCommentController.name,
  );

  constructor(
    private readonly goodReceivedNoteCommentService: GoodReceivedNoteCommentService,
  ) {}

  @Get(':bu_code/good-received-note/:good_received_note_id/comments')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a good-received-note',
    description: 'Retrieves all comments for a good-received-note.',
    operationId: 'findAllGoodReceivedNoteComments',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'GoodReceivedNote not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByGoodReceivedNoteId(
    @Param('bu_code') bu_code: string,
    @Param('good_received_note_id') good_received_note_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.goodReceivedNoteCommentService.findAllByGoodReceivedNoteId(
      good_received_note_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/good-received-note-comment/:id')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a good-received-note comment by ID',
    operationId: 'findOneGoodReceivedNoteComment',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
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
    return this.goodReceivedNoteCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/good-received-note-comment')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new good-received-note comment',
    operationId: 'createGoodReceivedNoteComment',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'GoodReceivedNote not found' },
    },
  } as any)
  @ApiBody({ type: CreateGoodReceivedNoteCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateGoodReceivedNoteCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.goodReceivedNoteCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/good-received-note-comment/:id')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a good-received-note comment',
    operationId: 'updateGoodReceivedNoteComment',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdateGoodReceivedNoteCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateGoodReceivedNoteCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.goodReceivedNoteCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/good-received-note-comment/:id')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a good-received-note comment',
    operationId: 'deleteGoodReceivedNoteComment',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
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
    return this.goodReceivedNoteCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/good-received-note-comment/:id/attachment')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a good-received-note comment',
    operationId: 'addAttachmentToGoodReceivedNoteComment',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
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
    return this.goodReceivedNoteCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/good-received-note-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('goodReceivedNoteComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a good-received-note comment',
    operationId: 'removeAttachmentFromGoodReceivedNoteComment',
    tags: ['Procurement', 'GoodReceivedNote Comment'],
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
    return this.goodReceivedNoteCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
