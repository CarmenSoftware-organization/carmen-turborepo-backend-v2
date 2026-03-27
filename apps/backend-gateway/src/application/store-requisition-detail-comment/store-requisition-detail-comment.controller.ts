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
import { StoreRequisitionDetailCommentService } from './store-requisition-detail-comment.service';
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
  CreateStoreRequisitionDetailCommentDto,
  UpdateStoreRequisitionDetailCommentDto,
  AddAttachmentDto,
} from './dto/store-requisition-detail-comment.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class StoreRequisitionDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    StoreRequisitionDetailCommentController.name,
  );

  constructor(
    private readonly storeRequisitionDetailCommentService: StoreRequisitionDetailCommentService,
  ) {}

  @Get(':bu_code/store-requisition-detail/:store_requisition_detail_id/comment')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a store-requisition-detail',
    operationId: 'findAllStoreRequisitionDetailComments',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByStoreRequisitionDetailId(
    @Param('bu_code') bu_code: string,
    @Param('store_requisition_detail_id') store_requisition_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.storeRequisitionDetailCommentService.findAllByStoreRequisitionDetailId(
      store_requisition_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/store-requisition-detail-comment/:id')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a store-requisition-detail comment by ID',
    operationId: 'findOneStoreRequisitionDetailComment',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
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
    return this.storeRequisitionDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/store-requisition-detail-comment')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new store-requisition-detail comment',
    operationId: 'createStoreRequisitionDetailComment',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateStoreRequisitionDetailCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateStoreRequisitionDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.storeRequisitionDetailCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/store-requisition-detail-comment/:id')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a store-requisition-detail comment',
    operationId: 'updateStoreRequisitionDetailComment',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateStoreRequisitionDetailCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateStoreRequisitionDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.storeRequisitionDetailCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/store-requisition-detail-comment/:id')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a store-requisition-detail comment',
    operationId: 'deleteStoreRequisitionDetailComment',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
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
    return this.storeRequisitionDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/store-requisition-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a store-requisition-detail comment',
    operationId: 'addAttachmentToStoreRequisitionDetailComment',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
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
    return this.storeRequisitionDetailCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/store-requisition-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('storeRequisitionDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a store-requisition-detail comment',
    operationId: 'removeAttachmentFromStoreRequisitionDetailComment',
    tags: ['Inventory', 'StoreRequisitionDetail Comment'],
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
    return this.storeRequisitionDetailCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
