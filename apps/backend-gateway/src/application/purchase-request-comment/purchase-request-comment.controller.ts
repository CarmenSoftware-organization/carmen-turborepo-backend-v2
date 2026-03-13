import {
  Controller,
  Delete,
  Get,
  Param,
  Body,
  Post,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { PurchaseRequestCommentService } from './purchase-request-comment.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  CreatePurchaseRequestCommentDto,
  UpdatePurchaseRequestCommentDto,
  AddAttachmentDto,
} from './dto/purchase-request-comment.dto';

@Controller('api')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, PermissionGuard)
@ApiBearerAuth()
export class PurchaseRequestCommentController {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseRequestCommentController.name,
  );

  constructor(
    private readonly purchaseRequestCommentService: PurchaseRequestCommentService,
  ) {}

  /**
   * Retrieve all comments for a purchase request
   * ค้นหารายการทั้งหมดของความคิดเห็นสำหรับใบขอซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param purchase_request_id - Purchase request ID / รหัสใบขอซื้อ
   * @param query - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns List of comments with pagination / รายการความคิดเห็นแบบแบ่งหน้า
   */
  @Get(':bu_code/purchase-request/:purchase_request_id/comment')
  @UseGuards(new AppIdGuard('purchaseRequestComment.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all comments for a purchase request',
    description:
      'Retrieves the full discussion thread on a purchase request, enabling requestors and approvers to review collaboration notes, clarification requests, and approval-related feedback.',
    operationId: 'findAllPurchaseRequestComments',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      200: {
        description: 'Comments retrieved successfully',
      },
      404: {
        description: 'Purchase request not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findAllByPurchaseRequestId(
    @Param('bu_code') bu_code: string,
    @Param('purchase_request_id') purchase_request_id: string,
    @Req() req: Request,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findAllByPurchaseRequestId',
        purchase_request_id,
        query,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);

    return this.purchaseRequestCommentService.findAllByPurchaseRequestId(
      purchase_request_id,
      user_id,
      bu_code,
      paginate,
      version,
    );
  }

  /**
   * Retrieve a specific comment by ID
   * ค้นหารายการเดียวตาม ID ของความคิดเห็น
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param version - API version / เวอร์ชัน API
   * @returns Comment details / รายละเอียดความคิดเห็น
   */
  @Get(':bu_code/purchase-request-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestComment.findOne'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a comment by ID',
    description: 'Retrieves a specific comment from a purchase request discussion thread, including its content, author, timestamp, and any attached supporting documents.',
    operationId: 'findOnePurchaseRequestComment',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      200: {
        description: 'Comment retrieved successfully',
      },
      404: {
        description: 'Comment not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findById',
        id,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.purchaseRequestCommentService.findById(
      id,
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Create a new comment on a purchase request
   * สร้างความคิดเห็นใหม่ในใบขอซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param createDto - Comment creation data / ข้อมูลสำหรับสร้างความคิดเห็น
   * @param version - API version / เวอร์ชัน API
   * @returns Created comment / ความคิดเห็นที่สร้างแล้ว
   */
  @Post(':bu_code/purchase-request-comment')
  @UseGuards(new AppIdGuard('purchaseRequestComment.create'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new comment',
    description: 'Posts a new comment on a purchase request discussion thread, allowing requestors and approvers to collaborate by asking questions, providing justifications, or requesting changes before approval.',
    operationId: 'createPurchaseRequestComment',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      201: {
        description: 'Comment created successfully',
      },
      404: {
        description: 'Purchase request not found',
      },
    },
  })
  @ApiBody({
    type: CreatePurchaseRequestCommentDto,
    description: 'Comment data with optional attachments',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreatePurchaseRequestCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.purchaseRequestCommentService.create(
      { ...createDto },
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Update an existing comment on a purchase request
   * อัปเดตความคิดเห็นที่มีอยู่ในใบขอซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param updateDto - Updated comment data / ข้อมูลความคิดเห็นที่อัปเดต
   * @param version - API version / เวอร์ชัน API
   * @returns Updated comment / ความคิดเห็นที่อัปเดตแล้ว
   */
  @Patch(':bu_code/purchase-request-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestComment.update'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a comment',
    description: 'Edits an existing comment in a purchase request discussion thread. Only the comment author can modify their own remarks, preserving accountability in the procurement collaboration process.',
    operationId: 'updatePurchaseRequestComment',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      200: {
        description: 'Comment updated successfully',
      },
      404: {
        description: 'Comment not found',
      },
      403: {
        description: 'Forbidden - can only update own comments',
      },
    },
  })
  @ApiBody({
    type: UpdatePurchaseRequestCommentDto,
    description: 'Updated comment data',
  })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseRequestCommentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.purchaseRequestCommentService.update(
      id,
      { ...updateDto },
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Delete a comment from a purchase request
   * ลบความคิดเห็นจากใบขอซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':bu_code/purchase-request-comment/:id')
  @UseGuards(new AppIdGuard('purchaseRequestComment.delete'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Removes a comment from a purchase request discussion thread. Only the comment author can delete their own remarks, maintaining an auditable collaboration history.',
    operationId: 'deletePurchaseRequestComment',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      200: {
        description: 'Comment deleted successfully',
      },
      404: {
        description: 'Comment not found',
      },
      403: {
        description: 'Forbidden - can only delete own comments',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.purchaseRequestCommentService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Add an attachment to a purchase request comment
   * เพิ่มไฟล์แนบในความคิดเห็นของใบขอซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param attachment - Attachment data / ข้อมูลไฟล์แนบ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated comment with attachment / ความคิดเห็นที่เพิ่มไฟล์แนบแล้ว
   */
  @Post(':bu_code/purchase-request-comment/:id/attachment')
  @UseGuards(new AppIdGuard('purchaseRequestComment.addAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Add an attachment to a comment',
    description:
      'Attaches a supporting document (e.g., quotation, specification sheet, or photo) to a purchase request comment, enabling stakeholders to share evidence and documentation during the procurement review process.',
    operationId: 'addAttachmentToPurchaseRequestComment',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      200: {
        description: 'Attachment added successfully',
      },
      404: {
        description: 'Comment not found',
      },
      403: {
        description: 'Forbidden - can only modify own comments',
      },
    },
  })
  @ApiBody({
    type: AddAttachmentDto,
    description: 'Attachment data from file service',
  })
  @HttpCode(HttpStatus.OK)
  async addAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() attachment: AddAttachmentDto,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'addAttachment',
        id,
        attachment,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.purchaseRequestCommentService.addAttachment(
      id,
      { ...attachment },
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Remove an attachment from a purchase request comment
   * ลบไฟล์แนบจากความคิดเห็นของใบขอซื้อ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param fileToken - File token to remove / โทเคนไฟล์ที่ต้องการลบ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated comment without attachment / ความคิดเห็นที่ลบไฟล์แนบแล้ว
   */
  @Delete(':bu_code/purchase-request-comment/:id/attachment/:fileToken')
  @UseGuards(new AppIdGuard('purchaseRequestComment.removeAttachment'))
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Remove an attachment from a comment',
    description:
      'Removes a previously attached supporting document from a purchase request comment, allowing the comment author to clean up outdated or incorrect attachments from the discussion thread.',
    operationId: 'removeAttachmentFromPurchaseRequestComment',
    tags: ['Procurement', 'Purchase Request Comment'],
    responses: {
      200: {
        description: 'Attachment removed successfully',
      },
      404: {
        description: 'Comment not found',
      },
      403: {
        description: 'Forbidden - can only modify own comments',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async removeAttachment(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Param('fileToken') fileToken: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'removeAttachment',
        id,
        fileToken,
        version,
      },
      PurchaseRequestCommentController.name,
    );

    const { user_id } = ExtractRequestHeader(req);

    return this.purchaseRequestCommentService.removeAttachment(
      id,
      fileToken,
      user_id,
      bu_code,
      version,
    );
  }
}
