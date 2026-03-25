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
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { CreditNoteService } from './credit-note.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateCreditNoteRequestDto,
  UpdateCreditNoteRequestDto,
} from './swagger/request';
import {
  BaseHttpController,
  Serialize,
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
import {
  EXAMPLE_CREATE_CREDIT_NOTE,
  EXAMPLE_UPDATE_CREDIT_NOTE,
} from './example/credit-note.example';

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
   * Get a credit note by ID with full details
   * ค้นหาใบลดหนี้เดียวตาม ID พร้อมรายละเอียดทั้งหมด
   * @param id - Credit note ID / รหัสใบลดหนี้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Credit note details / รายละเอียดใบลดหนี้
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
   * List all credit notes with pagination
   * ค้นหาใบลดหนี้ทั้งหมดพร้อมการแบ่งหน้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated credit note list / รายการใบลดหนี้แบบแบ่งหน้า
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
   * Create a new credit note for a vendor
   * สร้างใบลดหนี้ใหม่สำหรับผู้ขาย
   * @param createDto - Credit note creation data / ข้อมูลสำหรับสร้างใบลดหนี้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created credit note / ใบลดหนี้ที่สร้างขึ้น
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
  @ApiBody({
    type: CreateCreditNoteRequestDto,
    examples: {
      'Create Credit Note': {
        summary: 'Create a quantity return credit note',
        value: EXAMPLE_CREATE_CREDIT_NOTE,
      },
    },
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
   * Update a credit note before finalization
   * อัปเดตใบลดหนี้ก่อนการดำเนินการขั้นสุดท้าย
   * @param id - Credit note ID / รหัสใบลดหนี้
   * @param updateDto - Fields to update / ข้อมูลที่ต้องการอัปเดต
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated credit note / ใบลดหนี้ที่อัปเดตแล้ว
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
  @ApiBody({
    type: UpdateCreditNoteRequestDto,
    examples: {
      'Update Credit Note': {
        summary: 'Update credit note with add/update/delete details',
        value: EXAMPLE_UPDATE_CREDIT_NOTE,
      },
    },
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
   * Delete a credit note by ID
   * ลบใบลดหนี้ตาม ID
   * @param id - Credit note ID / รหัสใบลดหนี้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
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

  /**
   * Confirm a credit note and trigger inventory transaction
   * ยืนยันใบลดหนี้และสร้างรายการเคลื่อนไหวสินค้าคงคลัง
   */
  @Post(':id/confirm')
  @UseGuards(new AppIdGuard('creditNote.confirm'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Confirm a credit note',
    description: 'Confirms a draft credit note and triggers inventory: quantity_return deducts stock from GRN lots, amount_discount adjusts cost without stock movement.',
    operationId: 'confirmCreditNote',
    tags: ['Procurement', 'Credit Note'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Credit Note ID' },
    ],
    responses: {
      200: { description: 'Credit note confirmed and inventory updated' },
      400: { description: 'Credit note cannot be confirmed' },
      404: { description: 'Credit note not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async confirm(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'confirm', id, version },
      CreditNoteController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.creditNoteService.confirm(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
