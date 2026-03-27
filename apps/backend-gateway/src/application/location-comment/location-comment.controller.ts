import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { LocationCommentService } from './location-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateLocationCommentDto, UpdateLocationCommentDto, AddAttachmentDto } from './dto/location-comment.dto';

@Controller('api')
@ApiTags('Master')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class LocationCommentController {
  private readonly logger: BackendLogger = new BackendLogger(LocationCommentController.name);
  constructor(private readonly locationCommentService: LocationCommentService) {}

  @Get(':bu_code/location/:location_id/comment')
  @UseGuards(new AppIdGuard('locationComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a location', operationId: 'findAllLocationComments', tags: ['Master', 'Location Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByLocationId(@Param('bu_code') bu_code: string, @Param('location_id') location_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.locationCommentService.findAllByLocationId(location_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/location-comment/:id')
  @UseGuards(new AppIdGuard('locationComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a location comment by ID', operationId: 'findOneLocationComment', tags: ['Master', 'Location Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.locationCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/location-comment')
  @UseGuards(new AppIdGuard('locationComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new location comment', operationId: 'createLocationComment', tags: ['Master', 'Location Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateLocationCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateLocationCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.locationCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/location-comment/:id')
  @UseGuards(new AppIdGuard('locationComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a location comment', operationId: 'updateLocationComment', tags: ['Master', 'Location Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateLocationCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateLocationCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.locationCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/location-comment/:id')
  @UseGuards(new AppIdGuard('locationComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a location comment', operationId: 'deleteLocationComment', tags: ['Master', 'Location Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.locationCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/location-comment/:id/attachment')
  @UseGuards(new AppIdGuard('locationComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a location comment', operationId: 'addAttachmentToLocationComment', tags: ['Master', 'Location Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.locationCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/location-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('locationComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a location comment', operationId: 'removeAttachmentFromLocationComment', tags: ['Master', 'Location Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.locationCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
