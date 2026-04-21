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
import { CountStockCommentService } from './count-stock-comment.service';
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
  CreateCountStockCommentDto,
  UpdateCountStockCommentDto,
  AddAttachmentDto,
} from './dto/count-stock-comment.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class CountStockCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    CountStockCommentController.name,
  );

  constructor(
    private readonly countStockCommentService: CountStockCommentService,
  ) {}

  @Get(':bu_code/count-stock/:count_stock_id/comments')
  @UseGuards(new AppIdGuard('countStockComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a count-stock',
    operationId: 'findAllCountStockComments',
    tags: ['Inventory', 'CountStock Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByCountStockId(
    @Param('bu_code') bu_code: string,
    @Param('count_stock_id') count_stock_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.countStockCommentService.findAllByCountStockId(
      count_stock_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/count-stock-comment/:id')
  @UseGuards(new AppIdGuard('countStockComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a count-stock comment by ID',
    operationId: 'findOneCountStockComment',
    tags: ['Inventory', 'CountStock Comment'],
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
    return this.countStockCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/count-stock-comment')
  @UseGuards(new AppIdGuard('countStockComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new count-stock comment',
    operationId: 'createCountStockComment',
    tags: ['Inventory', 'CountStock Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateCountStockCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateCountStockCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.countStockCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/count-stock-comment/:id')
  @UseGuards(new AppIdGuard('countStockComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a count-stock comment',
    operationId: 'updateCountStockComment',
    tags: ['Inventory', 'CountStock Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateCountStockCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCountStockCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.countStockCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/count-stock-comment/:id')
  @UseGuards(new AppIdGuard('countStockComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a count-stock comment',
    operationId: 'deleteCountStockComment',
    tags: ['Inventory', 'CountStock Comment'],
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
    return this.countStockCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/count-stock-comment/:id/attachment')
  @UseGuards(new AppIdGuard('countStockComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a count-stock comment',
    operationId: 'addAttachmentToCountStockComment',
    tags: ['Inventory', 'CountStock Comment'],
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
    return this.countStockCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/count-stock-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('countStockComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a count-stock comment',
    operationId: 'removeAttachmentFromCountStockComment',
    tags: ['Inventory', 'CountStock Comment'],
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
    return this.countStockCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
