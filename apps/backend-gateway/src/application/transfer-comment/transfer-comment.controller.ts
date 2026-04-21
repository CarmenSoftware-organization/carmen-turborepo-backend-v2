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
import { TransferCommentService } from './transfer-comment.service';
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
  CreateTransferCommentDto,
  UpdateTransferCommentDto,
  AddAttachmentDto,
} from './dto/transfer-comment.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class TransferCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    TransferCommentController.name,
  );

  constructor(
    private readonly transferCommentService: TransferCommentService,
  ) {}

  @Get(':bu_code/transfer/:transfer_id/comments')
  @UseGuards(new AppIdGuard('transferComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a transfer',
    operationId: 'findAllTransferComments',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByTransferId(
    @Param('bu_code') bu_code: string,
    @Param('transfer_id') transfer_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.transferCommentService.findAllByTransferId(
      transfer_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/transfer-comment/:id')
  @UseGuards(new AppIdGuard('transferComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a transfer comment by ID',
    operationId: 'findOneTransferComment',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      200: { description: 'Comment retrieved successfully' },
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
    return this.transferCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/transfer-comment')
  @UseGuards(new AppIdGuard('transferComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new transfer comment',
    operationId: 'createTransferComment',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateTransferCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateTransferCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.transferCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/transfer-comment/:id')
  @UseGuards(new AppIdGuard('transferComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a transfer comment',
    operationId: 'updateTransferComment',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateTransferCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateTransferCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.transferCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/transfer-comment/:id')
  @UseGuards(new AppIdGuard('transferComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a transfer comment',
    operationId: 'deleteTransferComment',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      200: { description: 'Comment deleted successfully' },
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
    return this.transferCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/transfer-comment/:id/attachment')
  @UseGuards(new AppIdGuard('transferComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a transfer comment',
    operationId: 'addAttachmentToTransferComment',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      200: { description: 'Attachment added successfully' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto, description: 'Attachment data from file service' })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.transferCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/transfer-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('transferComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a transfer comment',
    operationId: 'removeAttachmentFromTransferComment',
    tags: ['Inventory', 'Transfer Comment'],
    responses: {
      200: { description: 'Attachment removed successfully' },
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
    return this.transferCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
