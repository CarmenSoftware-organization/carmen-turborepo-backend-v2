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
import { StockInCommentService } from './stock-in-comment.service';
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
  CreateStockInCommentDto,
  UpdateStockInCommentDto,
  AddAttachmentDto,
} from './dto/stock-in-comment.dto';

@Controller('api')
@ApiTags('Inventory: Stock In')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class StockInCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    StockInCommentController.name,
  );

  constructor(
    private readonly stockInCommentService: StockInCommentService,
  ) {}

  @Get(':bu_code/stock-in/:stock_in_id/comments')
  @UseGuards(new AppIdGuard('stockInComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a stock-in',
    operationId: 'findAllStockInComments',
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByStockInId(
    @Param('bu_code') bu_code: string,
    @Param('stock_in_id', new ParseUUIDPipe({ version: '4' })) stock_in_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.stockInCommentService.findAllByStockInId(
      stock_in_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/stock-in-comment/:id')
  @UseGuards(new AppIdGuard('stockInComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a stock-in comment by ID',
    operationId: 'findOneStockInComment',
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
    return this.stockInCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/stock-in-comment')
  @UseGuards(new AppIdGuard('stockInComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new stock-in comment',
    operationId: 'createStockInComment',
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateStockInCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateStockInCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.stockInCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/stock-in-comment/:id')
  @UseGuards(new AppIdGuard('stockInComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a stock-in comment',
    operationId: 'updateStockInComment',
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateStockInCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateStockInCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.stockInCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/stock-in-comment/:id')
  @UseGuards(new AppIdGuard('stockInComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a stock-in comment',
    operationId: 'deleteStockInComment',
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
    return this.stockInCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/stock-in-comment/:id/attachment')
  @UseGuards(new AppIdGuard('stockInComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a stock-in comment',
    operationId: 'addAttachmentToStockInComment',
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
    return this.stockInCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/stock-in-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('stockInComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a stock-in comment',
    operationId: 'removeAttachmentFromStockInComment',
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
    return this.stockInCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
