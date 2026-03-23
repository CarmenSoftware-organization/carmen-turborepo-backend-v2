import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { JournalVoucherService } from './journal-voucher.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  JournalVoucherCreateDto,
  JournalVoucherUpdateDto,
  IUpdateJournalVoucher,
  Serialize,
  JournalVoucherDetailResponseSchema,
  JournalVoucherListItemResponseSchema,
  JournalVoucherMutationResponseSchema,
} from '@/common';
import {
  ApiVersionMinRequest,
  ApiUserFilterQueries,
} from 'src/common/decorator/userfilter.decorator';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { JournalVoucherCreateRequest, JournalVoucherUpdateRequest } from './swagger/request';

@ApiTags('Journal Voucher')
@ApiHeaderRequiredXAppId()
@Controller('api/application/:bu_code/journal-voucher')
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class JournalVoucherController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    JournalVoucherController.name,
  );

  constructor(
    private readonly journalVoucherService: JournalVoucherService,
  ) {
    super();
  }

  /**
   * Retrieves a specific journal voucher with detail lines
   * @param req - HTTP request
   * @param res - HTTP response
   * @param id - Journal voucher ID
   * @param bu_code - Business unit code
   * @param version - API version
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('journalVoucher.findOne'))
  @Serialize(JournalVoucherDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a journal voucher by ID', description: 'Retrieves a specific journal voucher header with all detail lines including account codes, debit/credit amounts, and currency information.', operationId: 'journalVoucher_findOne', tags: ['Journal Voucher'] })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      JournalVoucherController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.journalVoucherService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all journal vouchers with pagination
   * @param req - HTTP request
   * @param res - HTTP response
   * @param bu_code - Business unit code
   * @param query - Pagination parameters
   * @param version - API version
   */
  @Get()
  @UseGuards(new AppIdGuard('journalVoucher.findAll'))
  @Serialize(JournalVoucherListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all journal vouchers', description: 'Returns a paginated list of journal vouchers. Supports search by JV number and description, with default sort by JV date descending.', operationId: 'journalVoucher_findAll', tags: ['Journal Voucher'] })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      JournalVoucherController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.journalVoucherService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new journal voucher with detail lines
   * @param req - HTTP request
   * @param res - HTTP response
   * @param bu_code - Business unit code
   * @param createDto - Creation data with details array
   * @param version - API version
   */
  @Post()
  @UseGuards(new AppIdGuard('journalVoucher.create'))
  @Serialize(JournalVoucherMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new journal voucher', description: 'Creates a new journal voucher header with optional detail lines containing account codes, debit/credit amounts, and currency information.', operationId: 'journalVoucher_create', tags: ['Journal Voucher'] })
  @ApiBody({ type: JournalVoucherCreateRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: JournalVoucherCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      JournalVoucherController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.journalVoucherService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing journal voucher with detail operations (add/update/delete)
   * @param req - HTTP request
   * @param res - HTTP response
   * @param id - Journal voucher ID
   * @param bu_code - Business unit code
   * @param updateDto - Update data with detail operations
   * @param version - API version
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('journalVoucher.update'))
  @Serialize(JournalVoucherMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a journal voucher', description: 'Updates an existing journal voucher header and manages detail lines through add, update, and delete operations.', operationId: 'journalVoucher_update', tags: ['Journal Voucher'] })
  @ApiBody({ type: JournalVoucherUpdateRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: JournalVoucherUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      JournalVoucherController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateJournalVoucher = {
      ...updateDto,
      id,
    };
    const result = await this.journalVoucherService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Soft deletes a journal voucher and all its detail lines
   * @param req - HTTP request
   * @param res - HTTP response
   * @param id - Journal voucher ID
   * @param bu_code - Business unit code
   * @param version - API version
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('journalVoucher.delete'))
  @Serialize(JournalVoucherMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a journal voucher', description: 'Soft deletes a journal voucher header and all its associated detail lines. Historical records are preserved.', operationId: 'journalVoucher_delete', tags: ['Journal Voucher'] })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      JournalVoucherController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.journalVoucherService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
