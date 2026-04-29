import {
  BadRequestException,
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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PricelistCommentService } from './pricelist-comment.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadCommentWithFilesBodySchema, UploadCommentWithFilesDto } from './dto/upload-comment-with-files.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreatePricelistCommentDto, UpdatePricelistCommentDto, AddAttachmentDto } from './dto/pricelist-comment.dto';

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

@Controller('api')
@ApiTags('Procurement: Price Lists')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PricelistCommentController {
  private readonly logger: BackendLogger = new BackendLogger(PricelistCommentController.name);
  constructor(private readonly pricelistCommentService: PricelistCommentService) {}

  @Get(':bu_code/pricelist/:pricelist_id/comments')
  @UseGuards(new AppIdGuard('pricelistComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a pricelist', operationId: 'findAllPricelistComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByPricelistId(@Param('bu_code') bu_code: string, @Param('pricelist_id', new ParseUUIDPipe({ version: '4' })) pricelist_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.pricelistCommentService.findAllByPricelistId(pricelist_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/pricelist-comment/:id')
  @UseGuards(new AppIdGuard('pricelistComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a pricelist comment by ID', operationId: 'findOnePricelistComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-comment')
  @UseGuards(new AppIdGuard('pricelistComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new pricelist comment', operationId: 'createPricelistComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreatePricelistCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreatePricelistCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/pricelist-comment/:id')
  @UseGuards(new AppIdGuard('pricelistComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a pricelist comment', operationId: 'updatePricelistComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdatePricelistCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdatePricelistCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-comment/:id')
  @UseGuards(new AppIdGuard('pricelistComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a pricelist comment', operationId: 'deletePricelistComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/pricelist-comment/:id/attachment')
  @UseGuards(new AppIdGuard('pricelistComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a pricelist comment', operationId: 'addAttachmentToPricelistComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/pricelist-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('pricelistComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a pricelist comment', operationId: 'removeAttachmentFromPricelistComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
  @Post(':bu_code/pricelist-comment/upload')
  @UseGuards(new AppIdGuard('pricelistComment.createWithFiles'))
  @UseInterceptors(FilesInterceptor('files'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a pricelist comment with file uploads',
    operationId: 'createPricelistCommentWithFiles',
    responses: {
      201: { description: 'Comment created with attachments' },
      400: { description: 'Validation failed' },
      502: { description: 'File service upstream failure' },
    },
  } as any)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadCommentWithFilesDto })
  @HttpCode(HttpStatus.CREATED)
  async createWithFiles(
    @Param('bu_code') bu_code: string,
    @UploadedFiles() files: Express.Multer.File[] = [],
    @Body() rawBody: Record<string, unknown>,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const parsed = UploadCommentWithFilesBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid request body',
        errors: parsed.error.errors,
      });
    }
    const body = parsed.data as {
      pricelist_id: string;
      message?: string | null;
      type?: 'user' | 'system';
    };
    if (files.length > MAX_FILES) {
      throw new BadRequestException(
        `Too many files (max ${MAX_FILES}, received ${files.length})`,
      );
    }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        throw new BadRequestException(
          `File "${f.originalname}" exceeds max size of ${MAX_FILE_SIZE_BYTES} bytes`,
        );
      }
      if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(f.mimetype)) {
        throw new BadRequestException(
          `File "${f.originalname}" has unsupported mime type "${f.mimetype}"`,
        );
      }
    }

    const hasMessage =
      typeof body.message === 'string' && body.message.trim().length > 0;
    if (!hasMessage && files.length === 0) {
      throw new BadRequestException(
        'At least one of `message` or `files` must be provided',
      );
    }

    const { user_id } = ExtractRequestHeader(req);
    return this.pricelistCommentService.createWithFiles(
      files,
      body,
      user_id,
      bu_code,
      version,
    );
  }
}
