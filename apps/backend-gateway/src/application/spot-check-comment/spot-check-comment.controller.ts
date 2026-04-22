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
import { SpotCheckCommentService } from './spot-check-comment.service';
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
  CreateSpotCheckCommentDto,
  UpdateSpotCheckCommentDto,
  AddAttachmentDto,
} from './dto/spot-check-comment.dto';

@Controller('api')
@ApiTags('Inventory: Spot Check')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class SpotCheckCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    SpotCheckCommentController.name,
  );

  constructor(
    private readonly spotCheckCommentService: SpotCheckCommentService,
  ) {}

  @Get(':bu_code/spot-check/:spot_check_id/comments')
  @UseGuards(new AppIdGuard('spotCheckComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a spot-check',
    operationId: 'findAllSpotCheckComments',
    tags: ['Inventory', 'SpotCheck Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllBySpotCheckId(
    @Param('bu_code') bu_code: string,
    @Param('spot_check_id') spot_check_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.spotCheckCommentService.findAllBySpotCheckId(
      spot_check_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/spot-check-comment/:id')
  @UseGuards(new AppIdGuard('spotCheckComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a spot-check comment by ID',
    operationId: 'findOneSpotCheckComment',
    tags: ['Inventory', 'SpotCheck Comment'],
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
    return this.spotCheckCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/spot-check-comment')
  @UseGuards(new AppIdGuard('spotCheckComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new spot-check comment',
    operationId: 'createSpotCheckComment',
    tags: ['Inventory', 'SpotCheck Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateSpotCheckCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateSpotCheckCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.spotCheckCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/spot-check-comment/:id')
  @UseGuards(new AppIdGuard('spotCheckComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a spot-check comment',
    operationId: 'updateSpotCheckComment',
    tags: ['Inventory', 'SpotCheck Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateSpotCheckCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateSpotCheckCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.spotCheckCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/spot-check-comment/:id')
  @UseGuards(new AppIdGuard('spotCheckComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a spot-check comment',
    operationId: 'deleteSpotCheckComment',
    tags: ['Inventory', 'SpotCheck Comment'],
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
    return this.spotCheckCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/spot-check-comment/:id/attachment')
  @UseGuards(new AppIdGuard('spotCheckComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a spot-check comment',
    operationId: 'addAttachmentToSpotCheckComment',
    tags: ['Inventory', 'SpotCheck Comment'],
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
    return this.spotCheckCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/spot-check-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('spotCheckComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a spot-check comment',
    operationId: 'removeAttachmentFromSpotCheckComment',
    tags: ['Inventory', 'SpotCheck Comment'],
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
    return this.spotCheckCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
