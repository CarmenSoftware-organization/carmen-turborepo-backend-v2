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
import { StockOutCommentService } from './stock-out-comment.service';
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
  CreateStockOutCommentDto,
  UpdateStockOutCommentDto,
  AddAttachmentDto,
} from './dto/stock-out-comment.dto';

@Controller('api')
@ApiTags('Inventory: Stock Out')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class StockOutCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    StockOutCommentController.name,
  );

  constructor(
    private readonly stockOutCommentService: StockOutCommentService,
  ) {}

  @Get(':bu_code/stock-out/:stock_out_id/comments')
  @UseGuards(new AppIdGuard('stockOutComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a stock-out',
    operationId: 'findAllStockOutComments',
    tags: ['Inventory', 'StockOut Comment'],
    responses: {
      200: { description: 'Comments retrieved successfully' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByStockOutId(
    @Param('bu_code') bu_code: string,
    @Param('stock_out_id') stock_out_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.stockOutCommentService.findAllByStockOutId(
      stock_out_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/stock-out-comment/:id')
  @UseGuards(new AppIdGuard('stockOutComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a stock-out comment by ID',
    operationId: 'findOneStockOutComment',
    tags: ['Inventory', 'StockOut Comment'],
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
    return this.stockOutCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/stock-out-comment')
  @UseGuards(new AppIdGuard('stockOutComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new stock-out comment',
    operationId: 'createStockOutComment',
    tags: ['Inventory', 'StockOut Comment'],
    responses: {
      201: { description: 'Comment created successfully' },
    },
  } as any)
  @ApiBody({ type: CreateStockOutCommentDto, description: 'Comment data with optional attachments' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateStockOutCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.stockOutCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Patch(':bu_code/stock-out-comment/:id')
  @UseGuards(new AppIdGuard('stockOutComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a stock-out comment',
    operationId: 'updateStockOutComment',
    tags: ['Inventory', 'StockOut Comment'],
    responses: {
      200: { description: 'Comment updated successfully' },
    },
  } as any)
  @ApiBody({ type: UpdateStockOutCommentDto, description: 'Updated comment data' })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateStockOutCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.stockOutCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/stock-out-comment/:id')
  @UseGuards(new AppIdGuard('stockOutComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a stock-out comment',
    operationId: 'deleteStockOutComment',
    tags: ['Inventory', 'StockOut Comment'],
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
    return this.stockOutCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/stock-out-comment/:id/attachment')
  @UseGuards(new AppIdGuard('stockOutComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a stock-out comment',
    operationId: 'addAttachmentToStockOutComment',
    tags: ['Inventory', 'StockOut Comment'],
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
    return this.stockOutCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  @Delete(':bu_code/stock-out-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('stockOutComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a stock-out comment',
    operationId: 'removeAttachmentFromStockOutComment',
    tags: ['Inventory', 'StockOut Comment'],
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
    return this.stockOutCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
