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
import { CountStockDetailCommentService } from './count-stock-detail-comment.service';
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
  CreateCountStockDetailCommentDto,
  UpdateCountStockDetailCommentDto,
  AddAttachmentDto,
} from './dto/count-stock-detail-comment.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class CountStockDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    CountStockDetailCommentController.name,
  );

  constructor(
    private readonly countStockDetailCommentService: CountStockDetailCommentService,
  ) {}

  @Get(':bu_code/count-stock-detail/:count_stock_detail_id/comments')
  @UseGuards(new AppIdGuard('countStockDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a count-stock-detail',
    operationId: 'findAllCountStockDetailComments',
    tags: ['Inventory', 'CountStockDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByCountStockDetailId(
    @Param('bu_code') bu_code: string,
    @Param('count_stock_detail_id') count_stock_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.countStockDetailCommentService.findAllByCountStockDetailId(
      count_stock_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/count-stock-detail-comment/:id')
  @UseGuards(new AppIdGuard('countStockDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a count-stock-detail comment by ID',
    operationId: 'findOneCountStockDetailComment',
    tags: ['Inventory', 'CountStockDetail Comment'],
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
    return this.countStockDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/count-stock-detail-comment')
  @UseGuards(new AppIdGuard('countStockDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new count-stock-detail comment',
    operationId: 'createCountStockDetailComment',
    tags: ['Inventory', 'CountStockDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateCountStockDetailCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateCountStockDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.countStockDetailCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/count-stock-detail-comment/:id')
  @UseGuards(new AppIdGuard('countStockDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a count-stock-detail comment',
    operationId: 'updateCountStockDetailComment',
    tags: ['Inventory', 'CountStockDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateCountStockDetailCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCountStockDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.countStockDetailCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/count-stock-detail-comment/:id')
  @UseGuards(new AppIdGuard('countStockDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a count-stock-detail comment',
    operationId: 'deleteCountStockDetailComment',
    tags: ['Inventory', 'CountStockDetail Comment'],
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
    return this.countStockDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/count-stock-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('countStockDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a count-stock-detail comment',
    operationId: 'addAttachmentToCountStockDetailComment',
    tags: ['Inventory', 'CountStockDetail Comment'],
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
    return this.countStockDetailCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/count-stock-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('countStockDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a count-stock-detail comment',
    operationId: 'removeAttachmentFromCountStockDetailComment',
    tags: ['Inventory', 'CountStockDetail Comment'],
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
    return this.countStockDetailCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
