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
import { VendorBusinessTypeCommentService } from './vendor-business-type-comment.service';
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
import { CreateVendorBusinessTypeCommentDto, UpdateVendorBusinessTypeCommentDto, AddAttachmentDto } from './dto/vendor-business-type-comment.dto';

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
export class VendorBusinessTypeCommentController {
  private readonly logger: BackendLogger = new BackendLogger(VendorBusinessTypeCommentController.name);
  constructor(private readonly vendorBusinessTypeCommentService: VendorBusinessTypeCommentService) {}

  @Get(':bu_code/vendor-business-type/:vendor_business_type_id/comments')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a vendor-business-type', operationId: 'findAllVendorBusinessTypeComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByVendorBusinessTypeId(@Param('bu_code') bu_code: string, @Param('vendor_business_type_id', new ParseUUIDPipe({ version: '4' })) vendor_business_type_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.vendorBusinessTypeCommentService.findAllByVendorBusinessTypeId(vendor_business_type_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/vendor-business-type-comment/:id')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a vendor-business-type comment by ID', operationId: 'findOneVendorBusinessTypeComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorBusinessTypeCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/vendor-business-type-comment')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new vendor-business-type comment', operationId: 'createVendorBusinessTypeComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateVendorBusinessTypeCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateVendorBusinessTypeCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorBusinessTypeCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/vendor-business-type-comment/:id')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a vendor-business-type comment', operationId: 'updateVendorBusinessTypeComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateVendorBusinessTypeCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateVendorBusinessTypeCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorBusinessTypeCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/vendor-business-type-comment/:id')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a vendor-business-type comment', operationId: 'deleteVendorBusinessTypeComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorBusinessTypeCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/vendor-business-type-comment/:id/attachment')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a vendor-business-type comment', operationId: 'addAttachmentToVendorBusinessTypeComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorBusinessTypeCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/vendor-business-type-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a vendor-business-type comment', operationId: 'removeAttachmentFromVendorBusinessTypeComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.vendorBusinessTypeCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
  @Post(':bu_code/vendor-business-type-comment/upload')
  @UseGuards(new AppIdGuard('vendorBusinessTypeComment.createWithFiles'))
  @UseInterceptors(FilesInterceptor('files'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a vendor-business-type comment with file uploads',
    operationId: 'createVendorBusinessTypeCommentWithFiles',
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
      vendor_business_type_id: string;
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
    return this.vendorBusinessTypeCommentService.createWithFiles(
      files,
      body,
      user_id,
      bu_code,
      version,
    );
  }
}
