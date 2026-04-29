import {
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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { TransferDetailService } from './transfer-detail.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  TransferDetailCreateRequestDto,
  TransferDetailUpdateRequestDto,
} from './swagger/request';
import {
  BaseHttpController,
  Serialize,
  TransferMutationResponseSchema,
  TransferDetailCreateDto,
  TransferDetailUpdateDto,
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
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/:bu_code/transfer-detail')
@ApiTags('Inventory: Transfers')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class TransferDetailController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(TransferDetailController.name);

  constructor(private readonly transferDetailService: TransferDetailService) {
    super();
  }

  /**
   * List all transfer detail records with pagination.
   * ค้นหารายการย่อยโอนย้ายสินค้าทั้งหมดพร้อมการแบ่งหน้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination and filter parameters / พารามิเตอร์การแบ่งหน้าและตัวกรอง
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of transfer details / รายการย่อยโอนย้ายสินค้าพร้อมการแบ่งหน้า
   */
  @Get()
  @UseGuards(new AppIdGuard('transferDetail.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all Transfer Details with pagination',
    description: 'Lists all line items across inter-location transfer transactions, showing individual products and quantities being moved between storage locations within the hotel property.',
    operationId: 'findAllTransferDetails',
    responses: {
      200: { description: 'Transfer Details retrieved successfully' },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, TransferDetailController.name);

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.transferDetailService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Retrieve a transfer detail record by ID.
   * ค้นหารายการย่อยโอนย้ายสินค้าเดียวตาม ID
   * @param id - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Transfer detail record / รายการย่อยโอนย้ายสินค้า
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('transferDetail.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a Transfer Detail by ID',
    description: 'Retrieves a specific line item from an inventory transfer transaction, including the product, transfer quantity, and unit of measure for goods being moved between storage locations.',
    operationId: 'findOneTransferDetail',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer Detail retrieved successfully' },
      404: { description: 'Transfer Detail not found' },
    },
  })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, TransferDetailController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferDetailService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Create a new standalone transfer detail record.
   * สร้างรายการย่อยโอนย้ายสินค้าแบบแยกเดี่ยวใหม่
   * @param createDto - Detail creation data / ข้อมูลสำหรับสร้างรายการย่อย
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created transfer detail / รายการย่อยโอนย้ายสินค้าที่สร้างแล้ว
   */
  @Post()
  @UseGuards(new AppIdGuard('transferDetail.create'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new Transfer Detail',
    description: 'Adds a new product line item to a draft inventory transfer, specifying the product and quantity being moved from one storage location to another (e.g., main warehouse to kitchen storeroom).',
    operationId: 'createTransferDetail',
    responses: {
      201: { description: 'Transfer Detail created successfully' },
      400: { description: 'Cannot add detail to non-draft Transfer' },
      404: { description: 'Transfer not found' },
    },
  })
  @ApiBody({ type: TransferDetailCreateRequestDto })
  async create(
    @Body() createDto: TransferDetailCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, TransferDetailController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferDetailService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update an existing transfer detail record.
   * อัปเดตรายการย่อยโอนย้ายสินค้าที่มีอยู่
   * @param id - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Detail update data / ข้อมูลสำหรับอัปเดตรายการย่อย
   * @param version - API version / เวอร์ชัน API
   * @returns Updated transfer detail / รายการย่อยโอนย้ายสินค้าที่อัปเดตแล้ว
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('transferDetail.update'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Transfer Detail',
    description: 'Modifies a product line item in a draft inventory transfer, allowing corrections to transfer quantities or units before the transfer is finalized and inventory balances are adjusted across locations.',
    operationId: 'updateTransferDetail',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer Detail updated successfully' },
      400: { description: 'Cannot update detail of non-draft Transfer' },
      404: { description: 'Transfer Detail not found' },
    },
  })
  @ApiBody({ type: TransferDetailUpdateRequestDto })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: TransferDetailUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, TransferDetailController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferDetailService.update(id, updateDto, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Delete a transfer detail record.
   * ลบรายการย่อยโอนย้ายสินค้า
   * @param id - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('transferDetail.delete'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Transfer Detail',
    description: 'Removes a product line item from a draft inventory transfer, used when an item was added in error or is no longer needed for the inter-location movement.',
    operationId: 'deleteTransferDetail',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer Detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Transfer' },
      404: { description: 'Transfer Detail not found' },
    },
  })
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, TransferDetailController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferDetailService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
