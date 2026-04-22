import { Controller, Delete, Get, Param, Body, Post, Query, Req, UseGuards, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { DimensionCommentService } from './dimension-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateDimensionCommentDto, UpdateDimensionCommentDto, AddAttachmentDto } from './dto/dimension-comment.dto';

@Controller('api')
@ApiTags('Config: System')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class DimensionCommentController {
  private readonly logger: BackendLogger = new BackendLogger(DimensionCommentController.name);
  constructor(private readonly dimensionCommentService: DimensionCommentService) {}

  @Get(':bu_code/dimension/:dimension_id/comments')
  @UseGuards(new AppIdGuard('dimensionComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a dimension', operationId: 'findAllDimensionComments', tags: ['Master', 'Dimension Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByDimensionId(@Param('bu_code') bu_code: string, @Param('dimension_id') dimension_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.dimensionCommentService.findAllByDimensionId(dimension_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/dimension-comment/:id')
  @UseGuards(new AppIdGuard('dimensionComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a dimension comment by ID', operationId: 'findOneDimensionComment', tags: ['Master', 'Dimension Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.dimensionCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/dimension-comment')
  @UseGuards(new AppIdGuard('dimensionComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new dimension comment', operationId: 'createDimensionComment', tags: ['Master', 'Dimension Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateDimensionCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateDimensionCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.dimensionCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/dimension-comment/:id')
  @UseGuards(new AppIdGuard('dimensionComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a dimension comment', operationId: 'updateDimensionComment', tags: ['Master', 'Dimension Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateDimensionCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() updateDto: UpdateDimensionCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.dimensionCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/dimension-comment/:id')
  @UseGuards(new AppIdGuard('dimensionComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a dimension comment', operationId: 'deleteDimensionComment', tags: ['Master', 'Dimension Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id') id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.dimensionCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/dimension-comment/:id/attachment')
  @UseGuards(new AppIdGuard('dimensionComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a dimension comment', operationId: 'addAttachmentToDimensionComment', tags: ['Master', 'Dimension Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.dimensionCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/dimension-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('dimensionComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a dimension comment', operationId: 'removeAttachmentFromDimensionComment', tags: ['Master', 'Dimension Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id') id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.dimensionCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
