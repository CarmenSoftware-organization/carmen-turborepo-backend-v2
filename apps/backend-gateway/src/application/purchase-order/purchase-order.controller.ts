import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderSwaggerDto } from './swagger/request';
import {
  ApprovePurchaseOrderDto,
  SavePurchaseOrderDto,
  RejectPurchaseOrderDto,
  ReviewPurchaseOrderDto,
  EXAMPLE_APPROVE_PO,
  EXAMPLE_SAVE_PO,
  EXAMPLE_REJECT_PO,
  EXAMPLE_REVIEW_PO,
} from './dto/state-change.dto';
import { PermissionGuard } from 'src/auth';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  PurchaseOrderDetailResponseSchema,
  PurchaseOrderListItemResponseSchema,
  PurchaseOrderMutationResponseSchema,
  PurchaseOrderUpdateDto,
} from '@/common';

@Controller('api/:bu_code/purchase-order')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseOrderController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseOrderController.name,
  );

  constructor(private readonly purchaseOrderService: PurchaseOrderService) {
    super();
  }

  /**
   * Retrieve full details of a specific purchase order
   * ค้นหารายการเดียวตาม ID ของใบสั่งซื้อพร้อมรายละเอียดทั้งหมด
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Purchase order details / รายละเอียดใบสั่งซื้อ
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('purchaseOrder.findOne'))
  @Serialize(PurchaseOrderDetailResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a purchase order by ID',
    description: 'Retrieves the full details of a specific purchase order including vendor information, line items, pricing, delivery dates, and current workflow status. Used to review PO contents before sending to a vendor or during goods receiving.',
    operationId: 'findOnePurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully retrieved',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * List all purchase orders with pagination and search
   * ค้นหารายการทั้งหมดของใบสั่งซื้อพร้อมการแบ่งหน้าและการค้นหา
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination and filter parameters / พารามิเตอร์การแบ่งหน้าและตัวกรอง
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of purchase orders / รายการใบสั่งซื้อแบบแบ่งหน้า
   */
  @Get()
  @UseGuards(new AppIdGuard('purchaseOrder.findAll'))
  @Serialize(PurchaseOrderListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all purchase orders',
    description: 'Lists all purchase orders for the business unit with pagination and search. Used by purchasers and managers to track outstanding orders, monitor delivery status, and manage vendor commitments.',
    operationId: 'findAllPurchaseOrders',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'The purchase orders were successfully retrieved',
      },
      404: {
        description: 'The purchase orders were not found',
      },
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
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.purchaseOrderService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Create a new purchase order to formalize procurement from a vendor
   * สร้างใบสั่งซื้อใหม่เพื่อยืนยันการจัดซื้อจากผู้ขาย
   * @param createDto - Purchase order creation data / ข้อมูลสำหรับสร้างใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created purchase order / ใบสั่งซื้อที่สร้างแล้ว
   */
  @Post()
  @UseGuards(new AppIdGuard('purchaseOrder.create'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a purchase order',
    description:
      'Creates a new purchase order to formalize procurement from a vendor. The PO groups approved PR line items by vendor, delivery date, and currency, establishing a binding order commitment that can be sent to the vendor.',
    operationId: 'createPurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      201: {
        description: 'The purchase order was successfully created',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({ type: CreatePurchaseOrderDto })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePurchaseOrderDto,
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update purchase order header and line item details
   * อัปเดตข้อมูลส่วนหัวและรายการของใบสั่งซื้อ
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Updated purchase order data / ข้อมูลใบสั่งซื้อที่อัปเดต
   * @param version - API version / เวอร์ชัน API
   * @returns Updated purchase order / ใบสั่งซื้อที่อัปเดตแล้ว
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('purchaseOrder.update'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a purchase order',
    description: 'Updates purchase order header and line item details such as quantities, pricing, delivery dates, or vendor terms. Only applicable to POs that have not yet been fully received or closed.',
    operationId: 'updatePurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully updated',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({ type: UpdatePurchaseOrderSwaggerDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: PurchaseOrderUpdateDto,
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Delete a purchase order that is no longer needed
   * ลบใบสั่งซื้อที่ไม่ต้องการแล้ว
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('purchaseOrder.delete'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase order',
    description: 'Removes a purchase order that is no longer needed. Typically used for draft POs that were created in error before being sent to a vendor.',
    operationId: 'deletePurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully deleted',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Save incremental changes to a purchase order being prepared
   * บันทึกการเปลี่ยนแปลงใบสั่งซื้อที่กำลังจัดเตรียม
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Save payload with add/update/remove details / ข้อมูลการบันทึกพร้อมรายละเอียดเพิ่ม/แก้ไข/ลบ
   * @param version - API version / เวอร์ชัน API
   * @returns Saved purchase order / ใบสั่งซื้อที่บันทึกแล้ว
   */
  @Patch(':id/save')
  @UseGuards(new AppIdGuard('purchaseOrder.save'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Save purchase order changes (add/update/remove details)',
    description:
      'Saves incremental changes to a purchase order that is still being prepared, including adding new items, modifying quantities or pricing, and removing line items. Used by purchasers to finalize PO details before submitting for approval.',
    operationId: 'savePurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully saved',
      },
      400: {
        description: 'Invalid data or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found or not in progress',
      },
    },
  })
  @ApiBody({
    type: SavePurchaseOrderDto,
    description: 'Save purchase order with header changes and detail add/update/remove',
    examples: {
      save: {
        value: EXAMPLE_SAVE_PO,
        summary: 'Save PO with add/update/remove details',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async save(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: SavePurchaseOrderDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'save',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.save(
      id,
      { ...data },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Approve a purchase order at the current workflow stage
   * อนุมัติใบสั่งซื้อในขั้นตอนปัจจุบันของเวิร์กโฟลว์
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Approval payload / ข้อมูลการอนุมัติ
   * @param version - API version / เวอร์ชัน API
   * @returns Approved purchase order / ใบสั่งซื้อที่อนุมัติแล้ว
   */
  @Patch(':id/approve')
  @UseGuards(new AppIdGuard('purchaseOrder.approve'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Approve a purchase order',
    description:
      'Advances a purchase order through its approval workflow at the current stage. Each authorized approver (e.g., FC, GM) signs off to authorize the vendor commitment and expenditure.',
    operationId: 'approvePurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully approved',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: ApprovePurchaseOrderDto,
    description: 'Approve purchase order payload',
    examples: {
      approve: {
        value: EXAMPLE_APPROVE_PO,
        summary: 'Approve PO at current workflow stage',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: ApprovePurchaseOrderDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'approve',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.approve(
      id,
      { ...data },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Reject a purchase order at the current approval stage
   * ปฏิเสธใบสั่งซื้อในขั้นตอนการอนุมัติปัจจุบัน
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Rejection payload with reason / ข้อมูลการปฏิเสธพร้อมเหตุผล
   * @param version - API version / เวอร์ชัน API
   * @returns Rejected purchase order / ใบสั่งซื้อที่ถูกปฏิเสธ
   */
  @Patch(':id/reject')
  @UseGuards(new AppIdGuard('purchaseOrder.reject'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Reject a purchase order',
    description:
      'Rejects a purchase order at the current approval stage, closing it and preventing it from being sent to the vendor. Used when an approver determines the order should not proceed due to budget, pricing, or business reasons.',
    operationId: 'rejectPurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully rejected',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: RejectPurchaseOrderDto,
    description: 'Reject purchase order payload',
    examples: {
      reject: {
        value: EXAMPLE_REJECT_PO,
        summary: 'Reject PO with message',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: RejectPurchaseOrderDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'reject',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.reject(
      id,
      { ...data },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Return a purchase order to a previous stage for review and corrections
   * ส่งใบสั่งซื้อกลับไปยังขั้นตอนก่อนหน้าเพื่อตรวจสอบและแก้ไข
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param data - Review payload / ข้อมูลการตรวจสอบ
   * @param version - API version / เวอร์ชัน API
   * @returns Reviewed purchase order / ใบสั่งซื้อที่ส่งกลับตรวจสอบ
   */
  @Patch(':id/review')
  @UseGuards(new AppIdGuard('purchaseOrder.review'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Review a purchase order',
    description:
      'Returns a purchase order to a previous workflow stage for corrections, such as adjusting vendor terms, quantities, or pricing. Allows approvers to request changes before giving final authorization.',
    operationId: 'reviewPurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully sent back for review',
      },
      400: {
        description: 'Invalid stage_role or user does not have permission',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @ApiBody({
    type: ReviewPurchaseOrderDto,
    description: 'Review purchase order payload',
    examples: {
      review: {
        value: EXAMPLE_REVIEW_PO,
        summary: 'Send PO back to previous stage for review',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async review(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() data: ReviewPurchaseOrderDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'review',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.review(
      id,
      { ...data },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Cancel a purchase order that has not been fully received
   * ยกเลิกใบสั่งซื้อที่ยังไม่ได้รับสินค้าครบถ้วน
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Cancelled purchase order / ใบสั่งซื้อที่ยกเลิกแล้ว
   */
  @Post(':id/cancel')
  @UseGuards(new AppIdGuard('purchaseOrder.cancel'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Cancel a purchase order',
    description:
      'Cancels a purchase order that has not been fully received, withdrawing the commitment to the vendor. Only draft, in-progress, or sent POs can be cancelled. Cancelled quantities are tracked on line items for reporting.',
    operationId: 'cancelPurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully cancelled',
      },
      400: {
        description: 'The purchase order cannot be cancelled due to invalid status',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'cancel',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.cancel(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Close a purchase order after all goods have been received
   * ปิดใบสั่งซื้อหลังจากได้รับสินค้าครบถ้วนแล้ว
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Closed purchase order / ใบสั่งซื้อที่ปิดแล้ว
   */
  @Post(':id/close')
  @UseGuards(new AppIdGuard('purchaseOrder.close'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Close a purchase order',
    description:
      'Finalizes a purchase order after all expected goods have been received or when no further deliveries are expected. Notifies the buyer and sends an email to the vendor. Unreceived quantities are recorded as cancelled for inventory and financial reconciliation.',
    operationId: 'closePurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'The purchase order was successfully closed',
      },
      400: {
        description: 'The purchase order cannot be closed due to invalid status',
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async closePO(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'closePO',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.closePO(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Preview grouping of PR line items into purchase orders by vendor
   * แสดงตัวอย่างการจัดกลุ่มรายการใบขอซื้อเป็นใบสั่งซื้อตามผู้ขาย
   * @param body - PR IDs to group / รหัสใบขอซื้อที่ต้องการจัดกลุ่ม
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Grouped purchase order preview / ตัวอย่างใบสั่งซื้อที่จัดกลุ่มแล้ว
   */
  @Post('group-pr')
  @UseGuards(new AppIdGuard('purchaseOrder.groupPr'))
  @Serialize(PurchaseOrderListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Group PR details for PO creation',
    description:
      'Previews how approved purchase request line items will be grouped into purchase orders by vendor, delivery date, and currency. Used by purchasers to review the PO structure before confirming the conversion from PRs to POs.',
    operationId: 'groupPrForPo',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'PR details grouped successfully',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pr_ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of PR IDs to group',
        },
      },
      required: ['pr_ids'],
    },
  })
  @HttpCode(HttpStatus.OK)
  async groupPrForPo(
    @Body() body: { pr_ids: string[] },
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'groupPrForPo',
        pr_ids: body.pr_ids,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.groupPrForPo(
      body.pr_ids,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Convert approved purchase requests into purchase orders
   * แปลงใบขอซื้อที่อนุมัติแล้วเป็นใบสั่งซื้อ
   * @param body - PR IDs to confirm / รหัสใบขอซื้อที่ต้องการยืนยัน
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created purchase orders / ใบสั่งซื้อที่สร้างจากใบขอซื้อ
   */
  @Post('confirm-pr')
  @UseGuards(new AppIdGuard('purchaseOrder.confirmPr'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Confirm PR and create PO(s)',
    description:
      'Converts approved purchase requests into purchase orders by grouping PR line items by vendor, delivery date, and currency. This is the primary action that transitions procurement from the request phase to the ordering phase.',
    operationId: 'confirmPrToPo',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      201: {
        description: 'Purchase Orders created successfully from PRs',
      },
      400: {
        description: 'Invalid request body',
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pr_ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of PR IDs to confirm and create POs from',
        },
      },
      required: ['pr_ids'],
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async confirmPrToPo(
    @Body() body: { pr_ids: string[] },
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'confirmPrToPo',
        pr_ids: body.pr_ids,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.confirmPrToPo(
      body.pr_ids,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Export a purchase order to an Excel spreadsheet
   * ส่งออกใบสั่งซื้อเป็นไฟล์ Excel
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Excel file buffer and filename / บัฟเฟอร์ไฟล์ Excel และชื่อไฟล์
   */
  @Get(':id/export')
  @UseGuards(new AppIdGuard('purchaseOrder.export'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Export a purchase order to Excel',
    description: 'Generates an Excel spreadsheet of the purchase order with vendor details, all line items, pricing, and delivery information. Used for record-keeping, sharing with finance, or sending to vendors who require spreadsheet formats.',
    operationId: 'exportPurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Purchase order ID',
      },
    ],
    responses: {
      200: {
        description: 'Excel file download',
        content: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async exportToExcel(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'exportToExcel',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.exportToExcel(id, user_id, bu_code, version);

    if (!result.isOk()) {
      this.respond(res, result);
      return;
    }

    const { buffer, filename } = result.value;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  /**
   * Generate a printable PDF of the purchase order
   * สร้างไฟล์ PDF สำหรับพิมพ์ใบสั่งซื้อ
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns PDF file buffer and filename / บัฟเฟอร์ไฟล์ PDF และชื่อไฟล์
   */
  @Get(':id/print')
  @UseGuards(new AppIdGuard('purchaseOrder.print'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Print a purchase order to PDF',
    description: 'Generates a printable PDF of the purchase order for sending to the vendor, obtaining physical signatures, or filing. Includes vendor details, line items, totals, terms, and approval signatures.',
    operationId: 'printPurchaseOrder',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Purchase order ID',
      },
    ],
    responses: {
      200: {
        description: 'PDF file download',
        content: {
          'application/pdf': {
            schema: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
      404: {
        description: 'The purchase order was not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async printToPdf(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'printToPdf',
        id,
        version,
      },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.printToPdf(id, user_id, bu_code, version);

    if (!result.isOk()) {
      this.respond(res, result);
      return;
    }

    const { buffer, filename } = result.value;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  // ==================== Purchase Order Detail CRUD ====================

  /**
   * List all line items on a purchase order
   * ค้นหารายการทั้งหมดของรายละเอียดใบสั่งซื้อ
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns List of purchase order details / รายการรายละเอียดใบสั่งซื้อ
   */
  @Get(':id/details')
  @UseGuards(new AppIdGuard('purchaseOrder.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all details for a purchase order',
    description: 'Lists all line items on a purchase order including product details, ordered quantities, unit prices, and received quantities. Used to review what has been ordered and track partial deliveries.',
    operationId: 'findAllPurchaseOrderDetails',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase order ID' },
    ],
    responses: {
      200: { description: 'The purchase order details were successfully retrieved' },
      404: { description: 'The purchase order was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllDetails(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findAllDetails', id, version },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.findDetailsByPurchaseOrderId(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieve a single line item from a purchase order by detail ID
   * ค้นหารายการเดียวตาม ID ของรายละเอียดใบสั่งซื้อ
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param detailId - Detail line item ID / รหัสรายการรายละเอียด
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Purchase order detail / รายละเอียดรายการใบสั่งซื้อ
   */
  @Get(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('purchaseOrder.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a single purchase order detail by ID',
    description: 'Retrieves a single line item from a purchase order with full product, pricing, and delivery details. Used to inspect a specific item when creating a Good Received Note or resolving discrepancies.',
    operationId: 'findOnePurchaseOrderDetail',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase order ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Detail ID' },
    ],
    responses: {
      200: { description: 'The purchase order detail was successfully retrieved' },
      404: { description: 'The purchase order detail was not found' },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findOneDetail(
    @Param('id') id: string,
    @Param('detail_id') detailId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findOneDetail', id, detailId, version },
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.findDetailById(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Remove a line item from a draft purchase order
   * ลบรายการจากใบสั่งซื้อฉบับร่าง
   * @param id - Purchase order ID / รหัสใบสั่งซื้อ
   * @param detailId - Detail line item ID / รหัสรายการรายละเอียด
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id/details/:detail_id')
  @UseGuards(new AppIdGuard('purchaseOrder.update'))
  @Serialize(PurchaseOrderMutationResponseSchema)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a purchase order detail',
    description: 'Removes a line item from a draft purchase order before it is sent to the vendor. Used when an item is no longer needed or was added in error.',
    operationId: 'deletePurchaseOrderDetail',
    tags: ['Procurement', 'Purchase Order'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Purchase order ID' },
      { name: 'detail_id', in: 'path', required: true, description: 'Detail ID' },
    ],
    responses: {
      200: { description: 'The purchase order detail was successfully deleted' },
      400: { description: 'Purchase order is not in draft status' },
      404: { description: 'The purchase order detail was not found' },
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
      PurchaseOrderController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.purchaseOrderService.deleteDetail(detailId, user_id, bu_code, version);
    this.respond(res, result);
  }
}
