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
import { RequestForPricingCommentService } from './request-for-pricing-comment.service';
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
import {
  CreateRequestForPricingCommentDto,
  UpdateRequestForPricingCommentDto,
  AddAttachmentDto,
} from './dto/request-for-pricing-comment.dto';

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
@ApiTags('Procurement: Request for Pricing')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class RequestForPricingCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    RequestForPricingCommentController.name,
  );

  constructor(
    private readonly requestForPricingCommentService: RequestForPricingCommentService,
  ) {}

  @Get(':bu_code/request-for-pricing/:request_for_pricing_id/comments')
  @UseGuards(new AppIdGuard('requestForPricingComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a request-for-pricing',
    description: 'Retrieves all comments for a request-for-pricing.',
    operationId: 'findAllRequestForPricingComments',
    responses: {
      200: { description: 'Comments retrieved successfully' },
      404: { description: 'RequestForPricing not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAllByRequestForPricingId(
    @Param('bu_code') bu_code: string,
    @Param('request_for_pricing_id', new ParseUUIDPipe({ version: '4' })) request_for_pricing_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    return this.requestForPricingCommentService.findAllByRequestForPricingId(
      request_for_pricing_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  @Get(':bu_code/request-for-pricing-comment/:id')
  @UseGuards(new AppIdGuard('requestForPricingComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a request-for-pricing comment by ID',
    operationId: 'findOneRequestForPricingComment',
    responses: {
      200: { description: 'Comment retrieved successfully' },
      404: { description: 'Comment not found' },
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
    return this.requestForPricingCommentService.findById(id, user_id, bu_code, version);
  }

  @Post(':bu_code/request-for-pricing-comment')
  @UseGuards(new AppIdGuard('requestForPricingComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new request-for-pricing comment',
    operationId: 'createRequestForPricingComment',
    responses: {
      201: { description: 'Comment created successfully' },
      404: { description: 'RequestForPricing not found' },
    },
  } as any)
  @ApiBody({ type: CreateRequestForPricingCommentDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreateRequestForPricingCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.requestForPricingCommentService.create({ ...createDto }, user_id, bu_code, version);
  }

  @Patch(':bu_code/request-for-pricing-comment/:id')
  @UseGuards(new AppIdGuard('requestForPricingComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a request-for-pricing comment',
    operationId: 'updateRequestForPricingComment',
    responses: {
      200: { description: 'Comment updated successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
    },
  } as any)
  @ApiBody({ type: UpdateRequestForPricingCommentDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateDto: UpdateRequestForPricingCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.requestForPricingCommentService.update(id, { ...updateDto }, user_id, bu_code, version);
  }

  @Delete(':bu_code/request-for-pricing-comment/:id')
  @UseGuards(new AppIdGuard('requestForPricingComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a request-for-pricing comment',
    operationId: 'deleteRequestForPricingComment',
    responses: {
      200: { description: 'Comment deleted successfully' },
      404: { description: 'Comment not found' },
      403: { description: 'Forbidden' },
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
    return this.requestForPricingCommentService.delete(id, user_id, bu_code, version);
  }

  @Post(':bu_code/request-for-pricing-comment/:id/attachment')
  @UseGuards(new AppIdGuard('requestForPricingComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a request-for-pricing comment',
    operationId: 'addAttachmentToRequestForPricingComment',
    responses: {
      200: { description: 'Attachment added successfully' },
      404: { description: 'Comment not found' },
    },
  } as any)
  @ApiBody({ type: AddAttachmentDto })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    const { user_id } = ExtractRequestHeader(req);
    return this.requestForPricingCommentService.addAttachment(id, { ...attachment }, user_id, bu_code, version);
  }

  @Delete(':bu_code/request-for-pricing-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('requestForPricingComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a request-for-pricing comment',
    operationId: 'removeAttachmentFromRequestForPricingComment',
    responses: {
      200: { description: 'Attachment removed successfully' },
      404: { description: 'Comment not found' },
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
    return this.requestForPricingCommentService.removeAttachment(id, fileToken, user_id, bu_code, version);
  }
  @Post(':bu_code/request-for-pricing-comment/upload')
  @UseGuards(new AppIdGuard('requestForPricingComment.createWithFiles'))
  @UseInterceptors(FilesInterceptor('files'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a request-for-pricing comment with file uploads',
    operationId: 'createRequestForPricingCommentWithFiles',
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
      request_for_pricing_id: string;
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
    return this.requestForPricingCommentService.createWithFiles(
      files,
      body,
      user_id,
      bu_code,
      version,
    );
  }
}
