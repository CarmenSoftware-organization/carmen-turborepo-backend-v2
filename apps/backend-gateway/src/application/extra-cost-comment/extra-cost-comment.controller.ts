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
import { ExtraCostCommentService } from './extra-cost-comment.service';
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
  CreateExtraCostCommentDto,
  UpdateExtraCostCommentDto,
  AddAttachmentDto,
} from './dto/extra-cost-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class ExtraCostCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    ExtraCostCommentController.name,
  );

  constructor(
    private readonly extraCostCommentService: ExtraCostCommentService,
  ) {}

  @Get(':bu_code/extra-cost/:extra_cost_id/comment')
  @UseGuards(new AppIdGuard('extraCostComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a extra-cost',
    description: 'Retrieves all comments for a extra-cost.',
    operationId: 'findAllExtraCostComments',
    tags: ['Procurement', 'ExtraCost Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'ExtraCost not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByExtraCostId(
    @Param('bu_code') bu_code: string,
    @Param('extra_cost_id') extra_cost_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.extraCostCommentService.findAllByExtraCostId(
      extra_cost_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/extra-cost-comment/:id')
  @UseGuards(new AppIdGuard('extraCostComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a extra-cost comment by ID',
    operationId: 'findOneExtraCostComment',
    tags: ['Procurement', 'ExtraCost Comment'],
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
    return this.extraCostCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/extra-cost-comment')
  @UseGuards(new AppIdGuard('extraCostComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new extra-cost comment',
    operationId: 'createExtraCostComment',
    tags: ['Procurement', 'ExtraCost Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'ExtraCost not found' },
    },
  } as any)
  @ApiBody({ type: CreateExtraCostCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateExtraCostCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.extraCostCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/extra-cost-comment/:id')
  @UseGuards(new AppIdGuard('extraCostComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a extra-cost comment',
    operationId: 'updateExtraCostComment',
    tags: ['Procurement', 'ExtraCost Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdateExtraCostCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateExtraCostCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.extraCostCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/extra-cost-comment/:id')
  @UseGuards(new AppIdGuard('extraCostComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a extra-cost comment',
    operationId: 'deleteExtraCostComment',
    tags: ['Procurement', 'ExtraCost Comment'],
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
    return this.extraCostCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/extra-cost-comment/:id/attachment')
  @UseGuards(new AppIdGuard('extraCostComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a extra-cost comment',
    operationId: 'addAttachmentToExtraCostComment',
    tags: ['Procurement', 'ExtraCost Comment'],
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
    return this.extraCostCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/extra-cost-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('extraCostComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a extra-cost comment',
    operationId: 'removeAttachmentFromExtraCostComment',
    tags: ['Procurement', 'ExtraCost Comment'],
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
    return this.extraCostCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
}
