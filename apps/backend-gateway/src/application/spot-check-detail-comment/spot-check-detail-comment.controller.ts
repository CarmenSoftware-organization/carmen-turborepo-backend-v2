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
import { SpotCheckDetailCommentService } from './spot-check-detail-comment.service';
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
  CreateSpotCheckDetailCommentDto,
  UpdateSpotCheckDetailCommentDto,
  AddAttachmentDto,
} from './dto/spot-check-detail-comment.dto';

@Controller('api')
@ApiTags('Inventory: Spot Check')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class SpotCheckDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    SpotCheckDetailCommentController.name,
  );

  constructor(
    private readonly spotCheckDetailCommentService: SpotCheckDetailCommentService,
  ) {}

  @Get(':bu_code/spot-check-detail/:spot_check_detail_id/comments')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a spot-check-detail',
    operationId: 'findAllSpotCheckDetailComments',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllBySpotCheckDetailId(
    @Param('bu_code') bu_code: string,
    @Param('spot_check_detail_id', new ParseUUIDPipe({ version: '4' })) spot_check_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.spotCheckDetailCommentService.findAllBySpotCheckDetailId(
      spot_check_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/spot-check-detail-comment/:id')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a spot-check-detail comment by ID',
    operationId: 'findOneSpotCheckDetailComment',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
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
    return this.spotCheckDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/spot-check-detail-comment')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new spot-check-detail comment',
    operationId: 'createSpotCheckDetailComment',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateSpotCheckDetailCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateSpotCheckDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.spotCheckDetailCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/spot-check-detail-comment/:id')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a spot-check-detail comment',
    operationId: 'updateSpotCheckDetailComment',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateSpotCheckDetailCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateSpotCheckDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.spotCheckDetailCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/spot-check-detail-comment/:id')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a spot-check-detail comment',
    operationId: 'deleteSpotCheckDetailComment',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
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
    return this.spotCheckDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/spot-check-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a spot-check-detail comment',
    operationId: 'addAttachmentToSpotCheckDetailComment',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
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
    return this.spotCheckDetailCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/spot-check-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('spotCheckDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a spot-check-detail comment',
    operationId: 'removeAttachmentFromSpotCheckDetailComment',
    tags: ['Inventory', 'SpotCheckDetail Comment'],
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
    return this.spotCheckDetailCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
