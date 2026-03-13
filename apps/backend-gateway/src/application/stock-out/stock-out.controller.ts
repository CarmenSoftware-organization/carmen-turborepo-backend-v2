import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { StockOutService } from './stock-out.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateStockOutSwaggerDto,
  UpdateStockOutSwaggerDto,
  CreateStockOutDetailSwaggerDto,
  UpdateStockOutDetailSwaggerDto,
} from './swagger/request';
import {
  BaseHttpController,
  Serialize,
  StockOutDetailResponseSchema,
  StockOutListItemResponseSchema,
  StockOutMutationResponseSchema,
  StockOutCreateDto,
  StockOutUpdateDto,
  StockOutDetailCreateDto,
  StockOutDetailUpdateDto,
  IStockOutUpdate,
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

@Controller('api/:bu_code/stock-out')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class StockOutController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(StockOutController.name);

  constructor(private readonly stockOutService: StockOutService) {
    super();
  }

  /**
   * Retrieve a stock-out record by ID with full line item details.
   * ค้นหารายการจ่ายสินค้าออกคลังเดียวตาม ID พร้อมรายละเอียดทั้งหมด
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Stock out record with details / รายการจ่ายสินค้าออกคลังพร้อมรายละเอียด
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('stockOut.findOne'))
  @Serialize(StockOutDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a Stock Out by ID',
    description: 'Retrieves the full details of a stock-out transaction including all items removed from inventory, their quantities, and the reason for removal (e.g., kitchen consumption, department usage, waste, or spoilage).',
    operationId: 'findOneStockOut',
    tags: ['Inventory', 'Stock Out'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
    ],
    responses: {
      200: { description: 'The Stock Out was successfully retrieved' },
      404: { description: 'The Stock Out was not found' },
    },
  })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * List all stock-out records with pagination.
   * ค้นหารายการจ่ายสินค้าออกคลังทั้งหมดพร้อมการแบ่งหน้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination and filter parameters / พารามิเตอร์การแบ่งหน้าและตัวกรอง
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of stock-out records / รายการจ่ายสินค้าออกคลังพร้อมการแบ่งหน้า
   */
  @Get()
  @UseGuards(new AppIdGuard('stockOut.findAll'))
  @Serialize(StockOutListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all Stock Out records',
    description: 'Lists all inventory removal records for the business unit with pagination and filtering. Used by inventory managers to track consumption by kitchens and departments, monitor waste levels, and analyze usage patterns.',
    operationId: 'findAllStockOut',
    tags: ['Inventory', 'Stock Out'],
    responses: {
      200: { description: 'Stock Out records retrieved successfully' },
      404: { description: 'No Stock Out records found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.stockOutService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Create a new stock-out record for removing items from inventory.
   * สร้างรายการจ่ายสินค้าออกคลังใหม่สำหรับหักสินค้าจากสินค้าคงคลัง
   * @param createDto - Stock out creation data / ข้อมูลสำหรับสร้างรายการจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created stock-out record / รายการจ่ายสินค้าออกคลังที่สร้างแล้ว
   */
  @Post()
  @UseGuards(new AppIdGuard('stockOut.create'))
  @Serialize(StockOutMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a Stock Out',
    description: 'Records an inventory removal to decrease stock levels. Used for issuing items to kitchens or departments, recording waste and spoilage, or correcting inventory discrepancies found during physical counts.',
    operationId: 'createStockOut',
    tags: ['Inventory', 'Stock Out'],
    responses: {
      201: { description: 'The Stock Out was successfully created' },
      400: { description: 'Invalid request body' },
    },
  })
  @ApiBody({ type: CreateStockOutSwaggerDto })
  async create(
    @Body() createDto: StockOutCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update an existing stock-out record while in draft status.
   * อัปเดตรายการจ่ายสินค้าออกคลังที่มีอยู่ขณะอยู่ในสถานะร่าง
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Stock out update data / ข้อมูลสำหรับอัปเดตรายการจ่ายสินค้าออกคลัง
   * @param version - API version / เวอร์ชัน API
   * @returns Updated stock-out record / รายการจ่ายสินค้าออกคลังที่อัปเดตแล้ว
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('stockOut.update'))
  @Serialize(StockOutMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Stock Out',
    description: 'Modifies an existing stock-out record to correct quantities, items, or removal reasons before the transaction is finalized. Used when staff need to amend an inventory deduction.',
    operationId: 'updateStockOut',
    tags: ['Inventory', 'Stock Out'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
    ],
    responses: {
      200: { description: 'The Stock Out was successfully updated' },
      404: { description: 'The Stock Out was not found' },
    },
  })
  @ApiBody({ type: UpdateStockOutSwaggerDto })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: StockOutUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const data: IStockOutUpdate = { ...updateDto, id };
    const result = await this.stockOutService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Delete a draft stock-out record.
   * ลบรายการจ่ายสินค้าออกคลังที่เป็นร่าง
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('stockOut.delete'))
  @Serialize(StockOutMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Stock Out',
    description: 'Removes a stock-out record that was created in error. Only applicable to draft transactions that have not yet been committed to inventory.',
    operationId: 'deleteStockOut',
    tags: ['Inventory', 'Stock Out'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
    ],
    responses: {
      200: { description: 'The Stock Out was successfully deleted' },
      404: { description: 'The Stock Out was not found' },
    },
  })
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Stock Out Detail CRUD ====================

  /**
   * List all line items for a specific stock-out record.
   * ค้นหารายการย่อยทั้งหมดของรายการจ่ายสินค้าออกคลังที่ระบุ
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns List of stock-out detail items / รายการย่อยของรายการจ่ายสินค้าออกคลัง
   */
  @Get(':id/details')
  @UseGuards(new AppIdGuard('stockOut.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a Stock Out',
    description: 'Lists all individual items being removed from inventory in this stock-out transaction, including product details, quantities, and the department or purpose receiving the items.',
    operationId: 'findAllStockOutDetails',
    tags: ['Inventory', 'Stock Out'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
    ],
    responses: {
      200: { description: 'Stock Out details retrieved successfully' },
      404: { description: 'Stock Out not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailsByStockOutId(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailsByStockOutId', id, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.findDetailsByStockOutId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieve a single stock-out line item by detail ID.
   * ค้นหารายการย่อยของรายการจ่ายสินค้าออกคลังเดียวตาม ID
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param detailId - Stock out detail ID / รหัสรายการย่อยจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Stock-out detail item / รายการย่อยของรายการจ่ายสินค้าออกคลัง
   */
  @Get(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('stockOut.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a specific Stock Out detail by ID',
    description: 'Retrieves a specific item line from a stock-out transaction with full product, quantity, and cost details. Used to inspect or verify a particular inventory removal.',
    operationId: 'findStockOutDetailById',
    tags: ['Inventory', 'Stock Out'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Stock Out Detail ID' },
    ],
    responses: {
      200: { description: 'Stock Out detail retrieved successfully' },
      404: { description: 'Stock Out detail not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailById(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailById', id, detailId, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Create a new line item for a draft stock-out record.
   * สร้างรายการย่อยใหม่สำหรับรายการจ่ายสินค้าออกคลังที่เป็นร่าง
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Detail creation data / ข้อมูลสำหรับสร้างรายการย่อย
   * @param version - API version / เวอร์ชัน API
   * @returns Created stock-out detail / รายการย่อยจ่ายสินค้าออกคลังที่สร้างแล้ว
   */
  @Post(':id/details')
  @UseGuards(new AppIdGuard('stockOut.update'))
  @Serialize(StockOutMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new Stock Out detail',
    description: 'Adds a new item line to a draft stock-out transaction, specifying the product and quantity to be removed from inventory for department use, kitchen consumption, or waste recording.',
    operationId: 'createStockOutDetail',
    tags: ['Inventory', 'Stock Out'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
    ],
    responses: {
      201: { description: 'Stock Out detail created successfully' },
      400: { description: 'Cannot add detail to non-draft Stock Out' },
      404: { description: 'Stock Out not found' },
    },
  })
  @ApiBody({ type: CreateStockOutDetailSwaggerDto })
  @HttpCode(HttpStatus.CREATED)
  async createDetail(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: StockOutDetailCreateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'createDetail', id, data, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.createDetail(id, data, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update an existing stock-out line item in a draft record.
   * อัปเดตรายการย่อยของรายการจ่ายสินค้าออกคลังที่เป็นร่าง
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param detailId - Stock out detail ID / รหัสรายการย่อยจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Detail update data / ข้อมูลสำหรับอัปเดตรายการย่อย
   * @param version - API version / เวอร์ชัน API
   * @returns Updated stock-out detail / รายการย่อยจ่ายสินค้าออกคลังที่อัปเดตแล้ว
   */
  @Put(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('stockOut.update'))
  @Serialize(StockOutMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Stock Out detail',
    description: 'Modifies an item line on a draft stock-out transaction to correct the product, quantity, or other details before the inventory deduction is committed.',
    operationId: 'updateStockOutDetail',
    tags: ['Inventory', 'Stock Out'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Stock Out Detail ID' },
    ],
    responses: {
      200: { description: 'Stock Out detail updated successfully' },
      400: { description: 'Cannot update detail of non-draft Stock Out' },
      404: { description: 'Stock Out detail not found' },
    },
  })
  @ApiBody({ type: UpdateStockOutDetailSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async updateDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Body() data: StockOutDetailUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'updateDetail', id, detailId, data, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.updateDetail(detailId, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Delete a line item from a draft stock-out record.
   * ลบรายการย่อยจากรายการจ่ายสินค้าออกคลังที่เป็นร่าง
   * @param id - Stock out record ID / รหัสรายการจ่ายสินค้าออกคลัง
   * @param detailId - Stock out detail ID / รหัสรายการย่อยจ่ายสินค้าออกคลัง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('stockOut.update'))
  @Serialize(StockOutMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Stock Out detail',
    description: 'Removes an item line from a draft stock-out transaction when the item was added in error or is no longer needed in this inventory removal.',
    operationId: 'deleteStockOutDetail',
    tags: ['Inventory', 'Stock Out'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Stock Out ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Stock Out Detail ID' },
    ],
    responses: {
      200: { description: 'Stock Out detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Stock Out' },
      404: { description: 'Stock Out detail not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async deleteDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'deleteDetail', id, detailId, version }, StockOutController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.stockOutService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
