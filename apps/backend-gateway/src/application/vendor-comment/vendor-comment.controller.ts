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
import { VendorCommentService } from './vendor-comment.service';
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
import { CreateVendorCommentDto, UpdateVendorCommentDto, AddAttachmentDto } from './dto/vendor-comment.dto';

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
@ApiTags('Config: Vendors')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class VendorCommentController {
  private readonly logger: BackendLogger = new BackendLogger(VendorCommentController.name);
  constructor(private readonly vendorCommentService: VendorCommentService) {}

  @Get(':bu_code/vendor/:vendor_id/comments')
  @UseGuards(new AppIdGuard('vendorComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a vendor', operationId: 'findAllVendorComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByVendorId(@Param('bu_code') bu_code: string, @Param('vendor_id', new ParseUUIDPipe({ version: '4' })) vendor_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.vendorCommentService.findAllByVendorId(vendor_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/vendor-comment/:id')
  @UseGuards(new AppIdGuard('vendorComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a vendor comment by ID', operationId: 'findOneVendorComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/vendor-comment')
  @UseGuards(new AppIdGuard('vendorComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new vendor comment', operationId: 'createVendorComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateVendorCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateVendorCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/vendor-comment/:id')
  @UseGuards(new AppIdGuard('vendorComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a vendor comment', operationId: 'updateVendorComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateVendorCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateVendorCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/vendor-comment/:id')
  @UseGuards(new AppIdGuard('vendorComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a vendor comment', operationId: 'deleteVendorComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/vendor-comment/:id/attachment')
  @UseGuards(new AppIdGuard('vendorComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a vendor comment', operationId: 'addAttachmentToVendorComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/vendor-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('vendorComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a vendor comment', operationId: 'removeAttachmentFromVendorComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
  @Post(':bu_code/vendor-comment/upload')
  @UseGuards(new AppIdGuard('vendorComment.createWithFiles'))
  @UseInterceptors(FilesInterceptor('files'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a vendor comment with file uploads',
    operationId: 'createVendorCommentWithFiles',
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
      vendor_id: string;
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
    return this.vendorCommentService.createWithFiles(
      files,
      body,
      user_id,
      bu_code,
      version,
    );
  }
}
