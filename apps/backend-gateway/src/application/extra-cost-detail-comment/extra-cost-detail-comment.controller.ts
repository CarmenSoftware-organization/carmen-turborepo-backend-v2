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
import { ExtraCostDetailCommentService } from './extra-cost-detail-comment.service';
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
  CreateExtraCostDetailCommentDto,
  UpdateExtraCostDetailCommentDto,
  AddAttachmentDto,
} from './dto/extra-cost-detail-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ExtraCostDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    ExtraCostDetailCommentController.name,
  );

  constructor(
    private readonly extraCostDetailCommentService: ExtraCostDetailCommentService,
  ) {}

  @Get(':bu_code/extra-cost-detail/:extra_cost_detail_id/comments')
  @UseGuards(new AppIdGuard('extraCostDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a extra-cost-detail',
    description: 'Retrieves all comments for a extra-cost-detail.',
    operationId: 'findAllExtraCostDetailComments',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'ExtraCostDetail not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByExtraCostDetailId(
    @Param('bu_code') bu_code: string,
    @Param('extra_cost_detail_id') extra_cost_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.extraCostDetailCommentService.findAllByExtraCostDetailId(
      extra_cost_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/extra-cost-detail-comment/:id')
  @UseGuards(new AppIdGuard('extraCostDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a extra-cost-detail comment by ID',
    operationId: 'findOneExtraCostDetailComment',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      200: { description: 'Comment retrieved successfully' },
      404: { description: 'Comment not found' },
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
    return this.extraCostDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/extra-cost-detail-comment')
  @UseGuards(new AppIdGuard('extraCostDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new extra-cost-detail comment',
    operationId: 'createExtraCostDetailComment',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'ExtraCostDetail not found' },
    },
  } as any)
  @ApiBody({ type: CreateExtraCostDetailCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateExtraCostDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.extraCostDetailCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/extra-cost-detail-comment/:id')
  @UseGuards(new AppIdGuard('extraCostDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a extra-cost-detail comment',
    operationId: 'updateExtraCostDetailComment',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdateExtraCostDetailCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateExtraCostDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.extraCostDetailCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/extra-cost-detail-comment/:id')
  @UseGuards(new AppIdGuard('extraCostDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a extra-cost-detail comment',
    operationId: 'deleteExtraCostDetailComment',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      200: { description: 'Comment deleted successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
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
    return this.extraCostDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/extra-cost-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('extraCostDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a extra-cost-detail comment',
    operationId: 'addAttachmentToExtraCostDetailComment',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      200: { description: 'Attachment added successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.extraCostDetailCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/extra-cost-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('extraCostDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a extra-cost-detail comment',
    operationId: 'removeAttachmentFromExtraCostDetailComment',
    tags: ['Procurement', 'ExtraCostDetail Comment'],
    responses: {
      200: { description: 'Attachment removed successfully' },
      404: { description: 'Comment not found' },
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
    return this.extraCostDetailCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
