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
import { UnitCommentService } from './unit-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreateUnitCommentDto, UpdateUnitCommentDto, AddAttachmentDto } from './dto/unit-comment.dto';

@Controller('api')
@ApiTags('Config: Units')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class UnitCommentController {
  private readonly logger: BackendLogger = new BackendLogger(UnitCommentController.name);
  constructor(private readonly unitCommentService: UnitCommentService) {}

  @Get(':bu_code/unit/:unit_id/comments')
  @UseGuards(new AppIdGuard('unitComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a unit', operationId: 'findAllUnitComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByUnitId(@Param('bu_code') bu_code: string, @Param('unit_id', new ParseUUIDPipe({ version: '4' })) unit_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.unitCommentService.findAllByUnitId(unit_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/unit-comment/:id')
  @UseGuards(new AppIdGuard('unitComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a unit comment by ID', operationId: 'findOneUnitComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.unitCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/unit-comment')
  @UseGuards(new AppIdGuard('unitComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new unit comment', operationId: 'createUnitComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateUnitCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateUnitCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.unitCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/unit-comment/:id')
  @UseGuards(new AppIdGuard('unitComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a unit comment', operationId: 'updateUnitComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateUnitCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateUnitCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.unitCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/unit-comment/:id')
  @UseGuards(new AppIdGuard('unitComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a unit comment', operationId: 'deleteUnitComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.unitCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/unit-comment/:id/attachment')
  @UseGuards(new AppIdGuard('unitComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a unit comment', operationId: 'addAttachmentToUnitComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.unitCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/unit-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('unitComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a unit comment', operationId: 'removeAttachmentFromUnitComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.unitCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
