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
import { TaxProfileCommentService } from './tax-profile-comment.service';
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
import { CreateTaxProfileCommentDto, UpdateTaxProfileCommentDto, AddAttachmentDto } from './dto/tax-profile-comment.dto';

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
@ApiTags('Config: Tax & Cost Types')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class TaxProfileCommentController {
  private readonly logger: BackendLogger = new BackendLogger(TaxProfileCommentController.name);
  constructor(private readonly taxProfileCommentService: TaxProfileCommentService) {}

  @Get(':bu_code/tax-profile/:tax_profile_id/comments')
  @UseGuards(new AppIdGuard('taxProfileComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all comments for a tax-profile', operationId: 'findAllTaxProfileComments', responses: { 200: { description: 'Comments retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByTaxProfileId(@Param('bu_code') bu_code: string, @Param('tax_profile_id', new ParseUUIDPipe({ version: '4' })) tax_profile_id: string, @Req() req: Request, @Query() query: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.taxProfileCommentService.findAllByTaxProfileId(tax_profile_id, user_id, bu_code, paginate, version);
  }

  @Get(':bu_code/tax-profile-comment/:id')
  @UseGuards(new AppIdGuard('taxProfileComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a tax-profile comment by ID', operationId: 'findOneTaxProfileComment', responses: { 200: { description: 'Comment retrieved successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.taxProfileCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/tax-profile-comment')
  @UseGuards(new AppIdGuard('taxProfileComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new tax-profile comment', operationId: 'createTaxProfileComment', responses: { 201: { description: 'Comment created successfully' } } } as any)
  @ApiBody({ type: CreateTaxProfileCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('bu_code') bu_code: string, @Body() createDto: CreateTaxProfileCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.taxProfileCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/tax-profile-comment/:id')
  @UseGuards(new AppIdGuard('taxProfileComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a tax-profile comment', operationId: 'updateTaxProfileComment', responses: { 200: { description: 'Comment updated successfully' } } } as any)
  @ApiBody({ type: UpdateTaxProfileCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() updateDto: UpdateTaxProfileCommentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.taxProfileCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/tax-profile-comment/:id')
  @UseGuards(new AppIdGuard('taxProfileComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a tax-profile comment', operationId: 'deleteTaxProfileComment', responses: { 200: { description: 'Comment deleted successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.taxProfileCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/tax-profile-comment/:id/attachment')
  @UseGuards(new AppIdGuard('taxProfileComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Add attachment to a tax-profile comment', operationId: 'addAttachmentToTaxProfileComment', responses: { 200: { description: 'Attachment added successfully' } } } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() attachment: AddAttachmentDto, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.taxProfileCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/tax-profile-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('taxProfileComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Remove attachment from a tax-profile comment', operationId: 'removeAttachmentFromTaxProfileComment', responses: { 200: { description: 'Attachment removed successfully' } } } as any)
  @HttpCode(HttpStatus.OK)
  async removeAttachment(@Param('bu_code') bu_code: string, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Param('fileToken') fileToken: string, @Req() req: Request, @Query('version') version: string = 'latest'): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.taxProfileCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
  @Post(':bu_code/tax-profile-comment/upload')
  @UseGuards(new AppIdGuard('taxProfileComment.createWithFiles'))
  @UseInterceptors(FilesInterceptor('files'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a tax-profile comment with file uploads',
    operationId: 'createTaxProfileCommentWithFiles',
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
      tax_profile_id: string;
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
    return this.taxProfileCommentService.createWithFiles(
      files,
      body,
      user_id,
      bu_code,
      version,
    );
  }
}
