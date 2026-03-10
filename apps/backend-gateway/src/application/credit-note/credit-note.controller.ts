import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UsePipes,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
  Query,
  ConsoleLogger,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { CreditNoteService } from './credit-note.service';
import {
  ApiHeader,
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiResponseProperty,
} from '@nestjs/swagger';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  CreditNoteDetailResponseSchema,
  CreditNoteListItemResponseSchema,
  CreditNoteMutationResponseSchema,
} from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { CreateCreditNoteDto, UpdateCreditNoteDto } from '@/common';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/:bu_code/credit-note')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class CreditNoteController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    CreditNoteController.name,
  );

  constructor(private readonly creditNoteService: CreditNoteService) {
    super();
  }

  /**
   * Retrieves the full details of a vendor credit note, including returned/damaged
   * items and credited amounts, for accounts payable reconciliation.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('creditNote.findOne'))
  @Serialize(CreditNoteDetailResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a credit note by ID',
    description: 'Retrieves the full details of a vendor credit note, including the returned/damaged items and credited amounts, for review during accounts payable reconciliation.',
    operationId: 'findOneCreditNote',
    tags: ['Procurement', 'Credit Note'],
  })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      CreditNoteController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.creditNoteService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all vendor credit notes for the business unit with pagination,
   * used to track credits issued for returned or damaged goods.
   */
  @Get()
  @UseGuards(new AppIdGuard('creditNote.findAll'))
  @Serialize(CreditNoteListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all credit notes',
    description: 'Lists all vendor credit notes for the business unit, enabling procurement and finance staff to track credits received for returned or damaged goods.',
    operationId: 'findAllCreditNotes',
    tags: ['Procurement', 'Credit Note'],
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {

    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      CreditNoteController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.creditNoteService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new vendor credit note to record credits for returned, damaged,
   * or incorrect goods received from a supplier.
   */
  @Post()
  @UseGuards(new AppIdGuard('creditNote.create'))
  @Serialize(CreditNoteMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a credit note',
    description: 'Issues a new credit note against a vendor for returned, damaged, or incorrect goods received, adjusting the payable balance and triggering inventory corrections.',
    operationId: 'createCreditNote',
    tags: ['Procurement', 'Credit Note'],
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateCreditNoteDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      CreditNoteController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.creditNoteService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing vendor credit note, such as correcting item quantities
   * or adjusting credited amounts before final processing.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('creditNote.update'))
  @Serialize(CreditNoteMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a credit note',
    description: 'Modifies a credit note before it is finalized, such as correcting item quantities, amounts, or the reason for the credit against the vendor.',
    operationId: 'updateCreditNote',
    tags: ['Procurement', 'Credit Note'],
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCreditNoteDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      CreditNoteController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: UpdateCreditNoteDto = {
      ...updateDto,
      id,
    };
    const result = await this.creditNoteService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Soft-deletes a vendor credit note by ID, marking it as removed
   * while preserving the record for audit trail purposes.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('creditNote.delete'))
  @Serialize(CreditNoteMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a credit note',
    description: 'Removes a credit note that was created in error. Historical credit note data is retained for audit and financial reporting purposes.',
    operationId: 'deleteCreditNote',
    tags: ['Procurement', 'Credit Note'],
  })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      'delete',
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.creditNoteService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
