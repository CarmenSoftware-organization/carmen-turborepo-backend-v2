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
import { PeriodCommentService } from './period-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreatePeriodCommentDto, UpdatePeriodCommentDto, AddAttachmentDto } from './dto/period-comment.dto';

@Controller('api')
@ApiTags('Inventory: Periods')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PeriodCommentController {
  private readonly logger: BackendLogger = new BackendLogger(PeriodCommentController.name);
  constructor(private readonly periodCommentService: PeriodCommentService) {}

  @Get(':bu_code/period/:period_id/comments')
  @UseGuards(new AppIdGuard('periodComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a period', operationId: 'findAllPeriodComments', tags: ['Master', 'Period Comment'], responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPeriodId(@Param('bu_code') bu_code: string, @Param('period_id', new ParseUUIDPipe({ version: '4' })) period_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.periodCommentService.findAllByPeriodId(period_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/period-comment/:id')
  @UseGuards(new AppIdGuard('periodComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a period comment by ID', operationId: 'findOnePeriodComment', tags: ['Master', 'Period Comment'], responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.periodCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/period-comment')
  @UseGuards(new AppIdGuard('periodComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new period comment', operationId: 'createPeriodComment', tags: ['Master', 'Period Comment'], responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreatePeriodCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreatePeriodCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.periodCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/period-comment/:id')
  @UseGuards(new AppIdGuard('periodComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a period comment', operationId: 'updatePeriodComment', tags: ['Master', 'Period Comment'], responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdatePeriodCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdatePeriodCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.periodCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/period-comment/:id')
  @UseGuards(new AppIdGuard('periodComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a period comment', operationId: 'deletePeriodComment', tags: ['Master', 'Period Comment'], responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.periodCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/period-comment/:id/attachment')
  @UseGuards(new AppIdGuard('periodComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a period comment', operationId: 'addAttachmentToPeriodComment', tags: ['Master', 'Period Comment'], responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.periodCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/period-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('periodComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a period comment', operationId: 'removeAttachmentFromPeriodComment', tags: ['Master', 'Period Comment'], responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.periodCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
