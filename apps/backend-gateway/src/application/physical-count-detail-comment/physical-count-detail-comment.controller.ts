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
import { PhysicalCountDetailCommentService } from './physical-count-detail-comment.service';
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
  CreatePhysicalCountDetailCommentDto,
  UpdatePhysicalCountDetailCommentDto,
  AddAttachmentDto,
} from './dto/physical-count-detail-comment.dto';

@Controller('api')
@ApiTags('Inventory: Physical Count')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PhysicalCountDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PhysicalCountDetailCommentController.name,
  );

  constructor(
    private readonly physicalCountDetailCommentService: PhysicalCountDetailCommentService,
  ) {}

  @Get(':bu_code/physical-count-detail/:physical_count_detail_id/comments')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a physical-count-detail',
    operationId: 'findAllPhysicalCountDetailComments',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPhysicalCountDetailId(
    @Param('bu_code') bu_code: string,
    @Param('physical_count_detail_id') physical_count_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.physicalCountDetailCommentService.findAllByPhysicalCountDetailId(
      physical_count_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/physical-count-detail-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a physical-count-detail comment by ID',
    operationId: 'findOnePhysicalCountDetailComment',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
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
    return this.physicalCountDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/physical-count-detail-comment')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new physical-count-detail comment',
    operationId: 'createPhysicalCountDetailComment',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreatePhysicalCountDetailCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePhysicalCountDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountDetailCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/physical-count-detail-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a physical-count-detail comment',
    operationId: 'updatePhysicalCountDetailComment',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdatePhysicalCountDetailCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePhysicalCountDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountDetailCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/physical-count-detail-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a physical-count-detail comment',
    operationId: 'deletePhysicalCountDetailComment',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
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
    return this.physicalCountDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/physical-count-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a physical-count-detail comment',
    operationId: 'addAttachmentToPhysicalCountDetailComment',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
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
    return this.physicalCountDetailCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/physical-count-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('physicalCountDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a physical-count-detail comment',
    operationId: 'removeAttachmentFromPhysicalCountDetailComment',
    tags: ['Inventory', 'PhysicalCountDetail Comment'],
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
    return this.physicalCountDetailCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
