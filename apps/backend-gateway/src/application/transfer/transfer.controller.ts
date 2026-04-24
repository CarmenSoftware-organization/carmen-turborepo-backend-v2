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
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { TransferService } from './transfer.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateTransferSwaggerDto,
  UpdateTransferSwaggerDto,
  CreateTransferDetailSwaggerDto,
  UpdateTransferDetailSwaggerDto,
} from './swagger/request';
import {
  BaseHttpController,
  Serialize,
  TransferDetailResponseSchema,
  TransferListItemResponseSchema,
  TransferMutationResponseSchema,
  TransferCreateDto,
  TransferUpdateDto,
  TransferDetailCreateDto,
  TransferDetailUpdateDto,
  ITransferUpdate,
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

@Controller('api/:bu_code/transfer')
@ApiTags('Inventory: Transfers')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class TransferController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(TransferController.name);

  constructor(private readonly transferService: TransferService) {
    super();
  }

  /**
   * Retrieve a transfer record by ID with full line item details.
   * ค้นหารายการโอนย้ายสินค้าเดียวตาม ID พร้อมรายละเอียดทั้งหมด
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Transfer record with details / รายการโอนย้ายสินค้าพร้อมรายละเอียด
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('transfer.findOne'))
  @Serialize(TransferDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a Transfer by ID',
    description: 'Retrieves the full details of an inventory transfer including source and destination locations, all items being moved, and their quantities. Used to review or verify a transfer between stores or departments.',
    operationId: 'findOneTransfer',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'ดึงรายละเอียดทั้งหมดของรายการโอนย้ายสินค้าระหว่างคลังตาม ID รวมถึงสถานที่ต้นทางและปลายทาง รายการสินค้าที่ถูกย้าย และจำนวน',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'The Transfer was successfully retrieved' },
      404: { description: 'The Transfer was not found' },
    },
  } as any)
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * List all transfer records with pagination.
   * ค้นหารายการโอนย้ายสินค้าทั้งหมดพร้อมการแบ่งหน้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination and filter parameters / พารามิเตอร์การแบ่งหน้าและตัวกรอง
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of transfer records / รายการโอนย้ายสินค้าพร้อมการแบ่งหน้า
   */
  @Get()
  @UseGuards(new AppIdGuard('transfer.findAll'))
  @Serialize(TransferListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all Transfers',
    description: 'Lists all inventory transfer records for the business unit with pagination and filtering. Used by store managers to track item movements between locations such as main store to kitchen, or between hotel properties.',
    operationId: 'findAllTransfers',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'ดึงรายการโอนย้ายสินค้าระหว่างคลังทั้งหมดของหน่วยธุรกิจ พร้อมการแบ่งหน้าและตัวกรอง ใช้สำหรับติดตามการเคลื่อนย้ายสินค้าระหว่างสถานที่ต่างๆ',
    responses: {
      200: { description: 'Transfer records retrieved successfully' },
      404: { description: 'No Transfer records found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.transferService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Create a new inventory transfer between storage locations.
   * สร้างรายการโอนย้ายสินค้าใหม่ระหว่างคลังสินค้า
   * @param createDto - Transfer creation data / ข้อมูลสำหรับสร้างรายการโอนย้าย
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created transfer record / รายการโอนย้ายสินค้าที่สร้างแล้ว
   */
  @Post()
  @UseGuards(new AppIdGuard('transfer.create'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a Transfer',
    description: 'Initiates an inventory transfer to move items from one storage location to another (e.g., main warehouse to kitchen store, or between hotel properties). Specifies source, destination, and items to be transferred.',
    operationId: 'createTransfer',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'สร้างรายการโอนย้ายสินค้าใหม่เพื่อย้ายสินค้าจากคลังต้นทางไปยังคลังปลายทาง โดยระบุต้นทาง ปลายทาง และรายการสินค้าที่จะโอนย้าย',
    responses: {
      201: { description: 'The Transfer was successfully created' },
      400: { description: 'Invalid request body' },
    },
  } as any)
  @ApiBody({ type: CreateTransferSwaggerDto })
  async create(
    @Body() createDto: TransferCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update an existing transfer record while in draft status.
   * อัปเดตรายการโอนย้ายสินค้าที่มีอยู่ขณะอยู่ในสถานะร่าง
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Transfer update data / ข้อมูลสำหรับอัปเดตรายการโอนย้าย
   * @param version - API version / เวอร์ชัน API
   * @returns Updated transfer record / รายการโอนย้ายสินค้าที่อัปเดตแล้ว
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Transfer',
    description: 'Modifies a transfer record to adjust items, quantities, or locations before the transfer is finalized. Used when store staff need to correct a transfer before items are physically moved.',
    operationId: 'updateTransfer',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'แก้ไขรายการโอนย้ายสินค้าเพื่อปรับรายการสินค้า จำนวน หรือสถานที่ก่อนที่การโอนย้ายจะถูกยืนยัน',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'The Transfer was successfully updated' },
      404: { description: 'The Transfer was not found' },
    },
  } as any)
  @ApiBody({ type: UpdateTransferSwaggerDto })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: TransferUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const data: ITransferUpdate = { ...updateDto, id };
    const result = await this.transferService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Delete a draft transfer record.
   * ลบรายการโอนย้ายสินค้าที่เป็นร่าง
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('transfer.delete'))
  @Serialize(TransferMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Transfer',
    description: 'Removes a transfer record that was created in error or is no longer needed. Only applicable to draft transfers before items have been physically moved.',
    operationId: 'deleteTransfer',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'ลบรายการโอนย้ายสินค้าที่สร้างผิดพลาดหรือไม่ต้องการอีกต่อไป ใช้ได้เฉพาะรายการที่ยังเป็นร่างก่อนที่สินค้าจะถูกเคลื่อนย้ายจริง',
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'The Transfer was successfully deleted' },
      404: { description: 'The Transfer was not found' },
    },
  } as any)
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Transfer Detail CRUD ====================

  /**
   * List all line items for a specific transfer record.
   * ค้นหารายการย่อยทั้งหมดของรายการโอนย้ายสินค้าที่ระบุ
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns List of transfer detail items / รายการย่อยของรายการโอนย้ายสินค้า
   */
  @Get(':id/details')
  @UseGuards(new AppIdGuard('transfer.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a Transfer',
    description: 'Lists all items included in this transfer with their product details, quantities, and unit information. Used to verify the contents of a transfer before or after physical movement of goods.',
    operationId: 'findAllTransferDetails',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'ดึงรายการย่อยทั้งหมดของรายการโอนย้ายสินค้า รวมถึงรายละเอียดสินค้า จำนวน และข้อมูลหน่วย',
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      200: { description: 'Transfer details retrieved successfully' },
      404: { description: 'Transfer not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findDetailsByTransferId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailsByTransferId', id, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.findDetailsByTransferId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieve a single transfer line item by detail ID.
   * ค้นหารายการย่อยของรายการโอนย้ายสินค้าเดียวตาม ID
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param detailId - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Transfer detail item / รายการย่อยของรายการโอนย้ายสินค้า
   */
  @Get(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('transfer.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a specific Transfer detail by ID',
    description: 'Retrieves a specific item line from a transfer with full product, quantity, and location details. Used to inspect a particular item being moved between locations.',
    operationId: 'findTransferDetailById',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'ดึงรายการย่อยเฉพาะรายการจากรายการโอนย้ายสินค้า พร้อมรายละเอียดสินค้า จำนวน และสถานที่ทั้งหมด',
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer detail retrieved successfully' },
      404: { description: 'Transfer detail not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async findDetailById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('detail_id', new ParseUUIDPipe({ version: '4' })) detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'findDetailById', id, detailId, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Create a new line item for a draft transfer record.
   * สร้างรายการย่อยใหม่สำหรับรายการโอนย้ายสินค้าที่เป็นร่าง
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Detail creation data / ข้อมูลสำหรับสร้างรายการย่อย
   * @param version - API version / เวอร์ชัน API
   * @returns Created transfer detail / รายการย่อยโอนย้ายสินค้าที่สร้างแล้ว
   */
  @Post(':id/details')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new Transfer detail',
    description: 'Adds a new item to a draft transfer, specifying the product and quantity to be moved between storage locations.',
    operationId: 'createTransferDetail',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'เพิ่มรายการสินค้าใหม่ในรายการโอนย้ายที่เป็นร่าง โดยระบุสินค้าและจำนวนที่จะย้ายระหว่างคลังสินค้า',
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
    ],
    responses: {
      201: { description: 'Transfer detail created successfully' },
      400: { description: 'Cannot add detail to non-draft Transfer' },
      404: { description: 'Transfer not found' },
    },
  } as any)
  @ApiBody({ type: CreateTransferDetailSwaggerDto })
  @HttpCode(HttpStatus.CREATED)
  async createDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: TransferDetailCreateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'createDetail', id, data, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.createDetail(id, data, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update an existing transfer line item in a draft record.
   * อัปเดตรายการย่อยของรายการโอนย้ายสินค้าที่เป็นร่าง
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param detailId - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Detail update data / ข้อมูลสำหรับอัปเดตรายการย่อย
   * @param version - API version / เวอร์ชัน API
   * @returns Updated transfer detail / รายการย่อยโอนย้ายสินค้าที่อัปเดตแล้ว
   */
  @Put(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a Transfer detail',
    description: 'Modifies an item line on a draft transfer to correct the product, quantity, or other details before the inventory movement is executed.',
    operationId: 'updateTransferDetail',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'แก้ไขรายการย่อยของรายการโอนย้ายที่เป็นร่าง เพื่อปรับสินค้า จำนวน หรือรายละเอียดอื่นๆ ก่อนที่การเคลื่อนย้ายสินค้าคงคลังจะถูกดำเนินการ',
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer detail updated successfully' },
      400: { description: 'Cannot update detail of non-draft Transfer' },
      404: { description: 'Transfer detail not found' },
    },
  } as any)
  @ApiBody({ type: UpdateTransferDetailSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async updateDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('detail_id', new ParseUUIDPipe({ version: '4' })) detailId: string,
    @Param('bu_code') bu_code: string,
    @Body() data: TransferDetailUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'updateDetail', id, detailId, data, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.updateDetail(detailId, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Delete a line item from a draft transfer record.
   * ลบรายการย่อยจากรายการโอนย้ายสินค้าที่เป็นร่าง
   * @param id - Transfer record ID / รหัสรายการโอนย้ายสินค้า
   * @param detailId - Transfer detail ID / รหัสรายการย่อยโอนย้ายสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('transfer.update'))
  @Serialize(TransferMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Transfer detail',
    description: 'Removes an item from a draft transfer when it was added in error or is no longer needed in this inventory movement.',
    operationId: 'deleteTransferDetail',
    tags: ['Inventory', 'Transfer'],
    'x-description-th': 'ลบรายการย่อยจากรายการโอนย้ายที่เป็นร่าง เมื่อรายการถูกเพิ่มผิดพลาดหรือไม่ต้องการอีกต่อไป',
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Transfer ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Transfer Detail ID' },
    ],
    responses: {
      200: { description: 'Transfer detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Transfer' },
      404: { description: 'Transfer detail not found' },
    },
  } as any)
  @HttpCode(HttpStatus.OK)
  async deleteDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('detail_id', new ParseUUIDPipe({ version: '4' })) detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug({ function: 'deleteDetail', id, detailId, version }, TransferController.name);

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.transferService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
