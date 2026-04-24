import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PhysicalCountCommentService } from './physical-count-comment.service';
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
  CreatePhysicalCountCommentDto,
  UpdatePhysicalCountCommentDto,
  AddAttachmentDto,
} from './dto/physical-count-comment.dto';

@Controller('api')
@ApiTags('Inventory: Physical Count')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PhysicalCountCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PhysicalCountCommentController.name,
  );

  constructor(
    private readonly physicalCountCommentService: PhysicalCountCommentService,
  ) {}

  @Get(':bu_code/physical-count/:physical_count_id/comments')
  @UseGuards(new AppIdGuard('physicalCountComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a physical-count',
    operationId: 'findAllPhysicalCountComments',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPhysicalCountId(
    @Param('bu_code') bu_code: string,
    @Param('physical_count_id', new ParseUUIDPipe({ version: '4' })) physical_count_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.physicalCountCommentService.findAllByPhysicalCountId(
      physical_count_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/physical-count-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a physical-count comment by ID',
    operationId: 'findOnePhysicalCountComment',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      200: { description: 'Comment retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/physical-count-comment')
  @UseGuards(new AppIdGuard('physicalCountComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new physical-count comment',
    operationId: 'createPhysicalCountComment',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreatePhysicalCountCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePhysicalCountCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/physical-count-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a physical-count comment',
    operationId: 'updatePhysicalCountComment',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdatePhysicalCountCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdatePhysicalCountCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/physical-count-comment/:id')
  @UseGuards(new AppIdGuard('physicalCountComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a physical-count comment',
    operationId: 'deletePhysicalCountComment',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      200: { description: 'Comment deleted successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/physical-count-comment/:id/attachment')
  @UseGuards(new AppIdGuard('physicalCountComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a physical-count comment',
    operationId: 'addAttachmentToPhysicalCountComment',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      200: { description: 'Attachment added successfully' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto, description: 'Attachment data from file service' })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/physical-count-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('physicalCountComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a physical-count comment',
    operationId: 'removeAttachmentFromPhysicalCountComment',
    tags: ['Inventory', 'PhysicalCount Comment'],
    responses: {
      200: { description: 'Attachment removed successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('fileToken') fileToken: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.physicalCountCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
