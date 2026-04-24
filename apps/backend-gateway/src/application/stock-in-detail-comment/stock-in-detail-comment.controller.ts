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
import { StockInDetailCommentService } from './stock-in-detail-comment.service';
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
  CreateStockInDetailCommentDto,
  UpdateStockInDetailCommentDto,
  AddAttachmentDto,
} from './dto/stock-in-detail-comment.dto';

@Controller('api')
@ApiTags('Inventory: Stock In')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class StockInDetailCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    StockInDetailCommentController.name,
  );

  constructor(
    private readonly stockInDetailCommentService: StockInDetailCommentService,
  ) {}

  @Get(':bu_code/stock-in-detail/:stock_in_detail_id/comments')
  @UseGuards(new AppIdGuard('stockInDetailComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a stock-in-detail',
    operationId: 'findAllStockInDetailComments',
    tags: ['Inventory', 'StockInDetail Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByStockInDetailId(
    @Param('bu_code') bu_code: string,
    @Param('stock_in_detail_id', new ParseUUIDPipe({ version: '4' })) stock_in_detail_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.stockInDetailCommentService.findAllByStockInDetailId(
      stock_in_detail_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/stock-in-detail-comment/:id')
  @UseGuards(new AppIdGuard('stockInDetailComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a stock-in-detail comment by ID',
    operationId: 'findOneStockInDetailComment',
    tags: ['Inventory', 'StockInDetail Comment'],
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
    return this.stockInDetailCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/stock-in-detail-comment')
  @UseGuards(new AppIdGuard('stockInDetailComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new stock-in-detail comment',
    operationId: 'createStockInDetailComment',
    tags: ['Inventory', 'StockInDetail Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateStockInDetailCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateStockInDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.stockInDetailCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/stock-in-detail-comment/:id')
  @UseGuards(new AppIdGuard('stockInDetailComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a stock-in-detail comment',
    operationId: 'updateStockInDetailComment',
    tags: ['Inventory', 'StockInDetail Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateStockInDetailCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateStockInDetailCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.stockInDetailCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/stock-in-detail-comment/:id')
  @UseGuards(new AppIdGuard('stockInDetailComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a stock-in-detail comment',
    operationId: 'deleteStockInDetailComment',
    tags: ['Inventory', 'StockInDetail Comment'],
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
    return this.stockInDetailCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/stock-in-detail-comment/:id/attachment')
  @UseGuards(new AppIdGuard('stockInDetailComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a stock-in-detail comment',
    operationId: 'addAttachmentToStockInDetailComment',
    tags: ['Inventory', 'StockInDetail Comment'],
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
    return this.stockInDetailCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/stock-in-detail-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('stockInDetailComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a stock-in-detail comment',
    operationId: 'removeAttachmentFromStockInDetailComment',
    tags: ['Inventory', 'StockInDetail Comment'],
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
    return this.stockInDetailCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
