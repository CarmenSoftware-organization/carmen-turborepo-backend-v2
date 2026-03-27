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
import { StoreRequisitionCommentService } from './store-requisition-comment.service';
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
  CreateStoreRequisitionCommentDto,
  UpdateStoreRequisitionCommentDto,
  AddAttachmentDto,
} from './dto/store-requisition-comment.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class StoreRequisitionCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    StoreRequisitionCommentController.name,
  );

  constructor(
    private readonly storeRequisitionCommentService: StoreRequisitionCommentService,
  ) {}

  @Get(':bu_code/store-requisition/:store_requisition_id/comment')
  @UseGuards(new AppIdGuard('storeRequisitionComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a store-requisition',
    operationId: 'findAllStoreRequisitionComments',
    tags: ['Inventory', 'StoreRequisition Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByStoreRequisitionId(
    @Param('bu_code') bu_code: string,
    @Param('store_requisition_id') store_requisition_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.storeRequisitionCommentService.findAllByStoreRequisitionId(
      store_requisition_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/store-requisition-comment/:id')
  @UseGuards(new AppIdGuard('storeRequisitionComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a store-requisition comment by ID',
    operationId: 'findOneStoreRequisitionComment',
    tags: ['Inventory', 'StoreRequisition Comment'],
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
    return this.storeRequisitionCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/store-requisition-comment')
  @UseGuards(new AppIdGuard('storeRequisitionComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new store-requisition comment',
    operationId: 'createStoreRequisitionComment',
    tags: ['Inventory', 'StoreRequisition Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateStoreRequisitionCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateStoreRequisitionCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.storeRequisitionCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/store-requisition-comment/:id')
  @UseGuards(new AppIdGuard('storeRequisitionComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a store-requisition comment',
    operationId: 'updateStoreRequisitionComment',
    tags: ['Inventory', 'StoreRequisition Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateStoreRequisitionCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateStoreRequisitionCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.storeRequisitionCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/store-requisition-comment/:id')
  @UseGuards(new AppIdGuard('storeRequisitionComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a store-requisition comment',
    operationId: 'deleteStoreRequisitionComment',
    tags: ['Inventory', 'StoreRequisition Comment'],
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
    return this.storeRequisitionCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/store-requisition-comment/:id/attachment')
  @UseGuards(new AppIdGuard('storeRequisitionComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a store-requisition comment',
    operationId: 'addAttachmentToStoreRequisitionComment',
    tags: ['Inventory', 'StoreRequisition Comment'],
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
    return this.storeRequisitionCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/store-requisition-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('storeRequisitionComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a store-requisition comment',
    operationId: 'removeAttachmentFromStoreRequisitionComment',
    tags: ['Inventory', 'StoreRequisition Comment'],
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
    return this.storeRequisitionCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
