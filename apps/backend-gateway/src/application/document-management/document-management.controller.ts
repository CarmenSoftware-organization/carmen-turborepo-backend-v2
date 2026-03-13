import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentManagementService } from './document-management.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import {
  BaseHttpController,
  Result,
  ErrorCode,
  ZodSerializerInterceptor,
} from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';

@Controller('api/:bu_code/documents')
@ApiTags('Document & Log')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class DocumentManagementController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    DocumentManagementController.name,
  );

  constructor(
    private readonly documentManagementService: DocumentManagementService,
  ) {
    super();
  }

  /**
   * Uploads a procurement document (e.g., invoice, contract, delivery receipt)
   * to file storage for attachment to purchase orders or goods received notes.
   */
  @Post('upload')
  @UseGuards(new AppIdGuard('documents.upload'))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload a document',
    description: 'Uploads a procurement-related document (e.g., vendor invoices, contracts, delivery receipts) to secure storage for attachment to purchase orders, GRNs, or other transaction records.',
    operationId: 'uploadDocument',
    tags: ['Document & Log', 'Document Management'],
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'uploadDocument',
        fileName: file?.originalname,
        bu_code,
      },
      DocumentManagementController.name,
    );

    if (!file) {
      const result = Result.error('No file provided', ErrorCode.INVALID_ARGUMENT);
      this.respond(res, result);
      return;
    }

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.documentManagementService.uploadDocument(
      file.buffer,
      file.originalname,
      file.mimetype,
      user_id,
      bu_code,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Lists all uploaded procurement documents for the business unit with pagination,
   * enabling staff to search and browse stored files.
   */
  @Get()
  @UseGuards(new AppIdGuard('documents.list'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List documents',
    description: 'Lists all uploaded procurement documents for the business unit with pagination, enabling staff to search and browse stored invoices, contracts, and delivery receipts.',
    operationId: 'listDocuments',
    tags: ['Document & Log', 'Document Management'],
  })
  @ApiUserFilterQueries()
  async listDocuments(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'listDocuments',
        bu_code,
        query,
      },
      DocumentManagementController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.documentManagementService.listDocuments(
      bu_code,
      user_id,
      paginate,
    );
    this.respond(res, result);
  }

  /**
   * Downloads a specific procurement document by its unique file token,
   * used to view attachments linked to transaction records.
   */
  @Get(':filetoken')
  @UseGuards(new AppIdGuard('documents.get'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get document by token',
    description: 'Downloads a specific procurement document by its unique file token, used to view attached invoices, contracts, or delivery receipts linked to transaction records.',
    operationId: 'getDocument',
    tags: ['Document & Log', 'Document Management'],
  })
  async getDocument(
    @Param('filetoken') fileToken: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getDocument',
        fileToken,
        bu_code,
      },
      DocumentManagementController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.documentManagementService.getDocument(fileToken, user_id, bu_code);
    this.respond(res, result);
  }

  /**
   * Retrieves metadata (file name, type, size, upload date) for a document
   * without downloading the file content, useful for document listing views.
   */
  @Get(':filetoken/info')
  @UseGuards(new AppIdGuard('documents.info'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get document info',
    description: 'Retrieves metadata (file name, type, size, upload date) for a procurement document without downloading the file content, useful for display in document listing views.',
    operationId: 'getDocumentInfo',
    tags: ['Document & Log', 'Document Management'],
  })
  async getDocumentInfo(
    @Param('filetoken') fileToken: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getDocumentInfo',
        fileToken,
        bu_code,
      },
      DocumentManagementController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.documentManagementService.getDocumentInfo(
      fileToken,
      user_id,
      bu_code,
    );
    this.respond(res, result);
  }

  /**
   * Generates a time-limited presigned URL for secure, direct access to a
   * document, enabling browser-based viewing without exposing storage credentials.
   */
  @Get(':filetoken/presigned-url')
  @UseGuards(new AppIdGuard('documents.presignedUrl'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get presigned URL',
    description: 'Generates a time-limited presigned URL for secure, direct access to a procurement document, enabling browser-based viewing or sharing without exposing permanent storage credentials.',
    operationId: 'getPresignedUrl',
    tags: ['Document & Log', 'Document Management'],
  })
  @ApiQuery({ name: 'expirySeconds', required: false, type: Number })
  async getPresignedUrl(
    @Param('filetoken') fileToken: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('expirySeconds') expirySeconds?: string,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getPresignedUrl',
        fileToken,
        bu_code,
        expirySeconds,
      },
      DocumentManagementController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const expiry = expirySeconds ? parseInt(expirySeconds) : undefined;
    const result = await this.documentManagementService.getPresignedUrl(
      fileToken,
      user_id,
      bu_code,
      expiry,
    );
    this.respond(res, result);
  }

  /**
   * Permanently removes a procurement document from storage when it was
   * uploaded in error or is no longer relevant to the transaction.
   */
  @Delete(':filetoken')
  @UseGuards(new AppIdGuard('documents.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete document',
    description: 'Permanently removes a procurement document from storage, used when files were uploaded in error or are no longer relevant to the associated transaction.',
    operationId: 'deleteDocument',
    tags: ['Document & Log', 'Document Management'],
  })
  async deleteDocument(
    @Param('filetoken') fileToken: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'deleteDocument',
        fileToken,
        bu_code,
      },
      DocumentManagementController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.documentManagementService.deleteDocument(
      fileToken,
      user_id,
      bu_code,
    );
    this.respond(res, result);
  }
}
