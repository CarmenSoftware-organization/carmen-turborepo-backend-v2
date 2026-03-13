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
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { SpotCheckService } from './spot-check.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  SpotCheckCreateRequestDto,
  SpotCheckUpdateRequestDto,
  SpotCheckSaveItemsRequestDto,
} from './swagger/request';
import {
  BaseHttpController,
} from '@/common';
import { SpotCheckCreateDto, SpotCheckUpdateDto } from 'src/common/dto/spot-check/spot-check.dto';
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

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class SpotCheckController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    SpotCheckController.name,
  );

  constructor(
    private readonly spotCheckService: SpotCheckService,
  ) {
    super();
  }

  /**
   * Get pending spot check total for the current user
   * ดึงจำนวนการตรวจสอบแบบสุ่มที่รอดำเนินการของผู้ใช้ปัจจุบัน
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param version - API version / เวอร์ชัน API
   * @returns Pending spot check count / จำนวนการตรวจสอบแบบสุ่มที่รอดำเนินการ
   */
  @Get('spot-check/pending')
  @UseGuards(new AppIdGuard('spotCheck.findAllPending.count'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get pending spot check count',
    description: 'Returns the count of random inventory spot checks awaiting the current user, used to drive dashboard alerts for quality-control verification tasks.',
    operationId: 'findAllPendingSpotCheckCount',
    tags: ['Inventory', 'Spot Check'],
    responses: {
      200: { description: 'Pending spot check count retrieved successfully' },
    },
  })
  async findAllPendingSpotCheckCount(
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllPendingSpotCheckCount',
        version,
      },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.findAllPendingSpotCheckCount(
      user_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Get a spot check by ID with full details
   * ค้นหารายการตรวจสอบแบบสุ่มเดียวตาม ID พร้อมรายละเอียดทั้งหมด
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Spot check details / รายละเอียดการตรวจสอบแบบสุ่ม
   */
  @Get(':bu_code/spot-check/:id')
  @UseGuards(new AppIdGuard('spotCheck.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a spot check by ID',
    description: 'Retrieves the full details of a random inventory spot check, including the target location, selected products, and recorded quantities for quality-control review.',
    operationId: 'findOneSpotCheck',
    tags: ['Inventory', 'Spot Check'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot check retrieved successfully' },
      404: { description: 'Spot check not found' },
    },
  })
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
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * List all spot checks with pagination
   * ค้นหารายการตรวจสอบแบบสุ่มทั้งหมดพร้อมการแบ่งหน้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated spot check list / รายการตรวจสอบแบบสุ่มแบบแบ่งหน้า
   */
  @Get(':bu_code/spot-check/')
  @UseGuards(new AppIdGuard('spotCheck.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all spot checks',
    description: 'Lists all inventory spot checks for a business unit with pagination, enabling managers to track the frequency and results of random stock verification activities.',
    operationId: 'findAllSpotChecks',
    tags: ['Inventory', 'Spot Check'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot checks retrieved successfully' },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.spotCheckService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Create a new spot check for a storage location
   * สร้างรายการตรวจสอบแบบสุ่มใหม่สำหรับสถานที่จัดเก็บ
   * @param createDto - Spot check creation data / ข้อมูลสำหรับสร้างการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created spot check / การตรวจสอบแบบสุ่มที่สร้างขึ้น
   */
  @Post(':bu_code/spot-check')
  @UseGuards(new AppIdGuard('spotCheck.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new spot check',
    description: 'Initiates a random inventory spot check at a specific storage location, selecting products either randomly or manually to verify actual stock against system records for quality control.',
    operationId: 'createSpotCheck',
    tags: ['Inventory', 'Spot Check'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      201: { description: 'Spot check created successfully' },
      400: { description: 'Invalid request body' },
    },
  })
  @ApiBody({ type: SpotCheckCreateRequestDto })
  async create(
    @Body() createDto: SpotCheckCreateDto,
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
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update a spot check before submission
   * อัปเดตการตรวจสอบแบบสุ่มก่อนการส่ง
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Fields to update / ข้อมูลที่ต้องการอัปเดต
   * @param version - API version / เวอร์ชัน API
   * @returns Updated spot check / การตรวจสอบแบบสุ่มที่อัปเดตแล้ว
   */
  @Patch(':bu_code/spot-check/:id')
  @UseGuards(new AppIdGuard('spotCheck.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a spot check',
    description: 'Modifies a spot check record before submission, such as updating the location or adjusting which products are included in the verification.',
    operationId: 'updateSpotCheck',
    tags: ['Inventory', 'Spot Check'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot check updated successfully' },
      404: { description: 'Spot check not found' },
    },
  })
  @ApiBody({ type: SpotCheckUpdateRequestDto })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: SpotCheckUpdateDto,
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
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.update(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Delete a spot check by ID
   * ลบการตรวจสอบแบบสุ่มตาม ID
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':bu_code/spot-check/:id')
  @UseGuards(new AppIdGuard('spotCheck.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a spot check',
    description: 'Removes a spot check that was created in error or is no longer required for inventory quality control.',
    operationId: 'deleteSpotCheck',
    tags: ['Inventory', 'Spot Check'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot check deleted successfully' },
      404: { description: 'Spot check not found' },
    },
  })
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
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Spot Check Detail CRUD ====================

  /**
   * Get all line items for a spot check
   * ค้นหารายการสินค้าทั้งหมดในการตรวจสอบแบบสุ่ม
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Spot check detail items / รายการรายละเอียดการตรวจสอบแบบสุ่ม
   */
  @Get(':bu_code/spot-check/:id/details')
  @UseGuards(new AppIdGuard('spotCheck.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a Spot Check',
    description: 'Returns all product line items selected for a spot check, showing system quantities and any recorded actual quantities for variance analysis.',
    operationId: 'findAllSpotCheckDetails',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
    ],
    responses: {
      200: { description: 'Spot Check details retrieved successfully' },
      404: { description: 'Spot Check not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findDetailsBySpotCheckId(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findDetailsBySpotCheckId', id, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.findDetailsBySpotCheckId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Get a specific line item from a spot check by detail ID
   * ค้นหารายการสินค้าเฉพาะรายการเดียวตาม ID ของรายละเอียดการตรวจสอบแบบสุ่ม
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param detailId - Spot check detail ID / รหัสรายละเอียดการตรวจสอบ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Spot check detail item / รายละเอียดรายการตรวจสอบแบบสุ่ม
   */
  @Get(':bu_code/spot-check/:id/details/:detail_id')
  @UseGuards(new AppIdGuard('spotCheck.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a specific Spot Check detail by ID',
    description: 'Retrieves a specific product line item from a spot check, including its system quantity, actual counted quantity, and variance for detailed investigation.',
    operationId: 'findSpotCheckDetailById',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Spot Check Detail ID' },
    ],
    responses: {
      200: { description: 'Spot Check detail retrieved successfully' },
      404: { description: 'Spot Check detail not found' },
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
    this.logger.debug(
      { function: 'findDetailById', id, detailId, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Delete a line item from a draft spot check
   * ลบรายการสินค้าจากการตรวจสอบแบบสุ่มสถานะร่าง
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param detailId - Spot check detail ID / รหัสรายละเอียดการตรวจสอบ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':bu_code/spot-check/:id/details/:detail_id')
  @UseGuards(new AppIdGuard('spotCheck.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a Spot Check detail',
    description: 'Removes a product from a draft spot check, used when a product was incorrectly selected for the random verification.',
    operationId: 'deleteSpotCheckDetail',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Spot Check Detail ID' },
    ],
    responses: {
      200: { description: 'Spot Check detail deleted successfully' },
      400: { description: 'Cannot delete detail of non-draft Spot Check' },
      404: { description: 'Spot Check detail not found' },
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
    this.logger.debug(
      { function: 'deleteDetail', id, detailId, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  // ==================== Mobile-specific endpoints ====================

  /**
   * Save counted quantities as draft from mobile device
   * บันทึกจำนวนที่นับได้เป็นร่างจากอุปกรณ์มือถือ
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Items with actual quantities / รายการสินค้าพร้อมจำนวนจริง
   * @param version - API version / เวอร์ชัน API
   * @returns Save result / ผลลัพธ์การบันทึก
   */
  @Patch(':bu_code/spot-check/:id/save')
  @UseGuards(new AppIdGuard('spotCheck.save'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Save Spot Check items',
    description: 'Persists the actual counted quantities entered by staff on a mobile device as a draft, allowing them to pause and resume the spot check without finalizing results.',
    operationId: 'saveSpotCheckItems',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot Check items saved successfully' },
      400: { description: 'Invalid request body' },
      404: { description: 'Spot Check not found' },
    },
  })
  @ApiBody({ type: SpotCheckSaveItemsRequestDto })
  @HttpCode(HttpStatus.OK)
  async saveItems(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: { items: Array<{ product_id: string; actual_qty: number }> },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'saveItems', id, data, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.saveItems(id, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Calculate variances between actual and system quantities for spot check
   * คำนวณผลต่างระหว่างจำนวนจริงกับจำนวนในระบบสำหรับการตรวจสอบแบบสุ่ม
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Items with actual quantities / รายการสินค้าพร้อมจำนวนจริง
   * @param version - API version / เวอร์ชัน API
   * @returns Variance review result / ผลลัพธ์การตรวจสอบผลต่าง
   */
  @Patch(':bu_code/spot-check/:id/review')
  @UseGuards(new AppIdGuard('spotCheck.review'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Review Spot Check items',
    description: 'Compares the actual counted quantities against system stock levels and calculates variances for each spot-checked item, enabling staff to review discrepancies before submission.',
    operationId: 'reviewSpotCheckItems',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot Check items reviewed successfully with difference list' },
      400: { description: 'Invalid request body' },
      404: { description: 'Spot Check not found' },
    },
  })
  @ApiBody({ type: SpotCheckSaveItemsRequestDto })
  @HttpCode(HttpStatus.OK)
  async reviewItems(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: { items: Array<{ product_id: string; actual_qty: number }> },
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'reviewItems', id, data, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.reviewItems(id, data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Get the variance report for a spot check
   * ดึงรายงานผลต่างของการตรวจสอบแบบสุ่ม
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Variance report / รายงานผลต่าง
   */
  @Get(':bu_code/spot-check/:id/review')
  @UseGuards(new AppIdGuard('spotCheck.getReview'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get Spot Check review result',
    description: 'Retrieves the previously calculated variance report for a spot check, showing differences between system and actual quantities for management review.',
    operationId: 'getSpotCheckReview',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot Check review result retrieved successfully' },
      404: { description: 'Spot Check not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getReview(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'getReview', id, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.getReview(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Submit a spot check and finalize results
   * ส่งการตรวจสอบแบบสุ่มและสรุปผลลัพธ์ขั้นสุดท้าย
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Submission result / ผลลัพธ์การส่ง
   */
  @Patch(':bu_code/spot-check/:id/submit')
  @UseGuards(new AppIdGuard('spotCheck.submit'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Submit Spot Check',
    description: 'Finalizes a spot check by recording the verified quantities as the official result. Discrepancies found may trigger further investigation or inventory adjustments.',
    operationId: 'submitSpotCheck',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot Check submitted successfully' },
      400: { description: 'Spot Check cannot be submitted' },
      404: { description: 'Spot Check not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'submit', id, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.submit(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Reset a spot check to draft state
   * รีเซ็ตการตรวจสอบแบบสุ่มกลับเป็นสถานะร่าง
   * @param id - Spot check ID / รหัสการตรวจสอบแบบสุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Reset result / ผลลัพธ์การรีเซ็ต
   */
  @Post(':bu_code/spot-check/:id/reset')
  @UseGuards(new AppIdGuard('spotCheck.reset'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Reset Spot Check',
    description: 'Clears all recorded actual quantities and resets the spot check to draft state, allowing staff to restart the verification process from scratch if counts were inaccurate.',
    operationId: 'resetSpotCheck',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Spot Check ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Spot Check reset successfully' },
      400: { description: 'Spot Check cannot be reset' },
      404: { description: 'Spot Check not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async reset(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'reset', id, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.reset(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Get products stocked at a specific location
   * ดึงรายการสินค้าที่จัดเก็บในสถานที่เฉพาะ
   * @param locationId - Location ID / รหัสสถานที่จัดเก็บ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Products at location / สินค้าในสถานที่จัดเก็บ
   */
  @Get(':bu_code/locations/:location_id/products')
  @UseGuards(new AppIdGuard('spotCheck.getProductsByLocation'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get products by location',
    description: 'Retrieves the list of products stocked at a specific storage location, enabling staff to select items for a new spot check or verify location inventory assignments.',
    operationId: 'getProductsByLocationId',
    tags: ['Inventory', 'Spot Check'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'location_id', in: 'path', required: true, description: 'Location ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Products retrieved successfully' },
      404: { description: 'Location not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getProductsByLocationId(
    @Param('location_id') locationId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'getProductsByLocationId', locationId, version },
      SpotCheckController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.spotCheckService.getProductsByLocationId(locationId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
