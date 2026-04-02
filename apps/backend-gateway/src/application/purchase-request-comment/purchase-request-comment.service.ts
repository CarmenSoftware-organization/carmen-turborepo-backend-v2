import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ResponseLib } from 'src/libs/response.lib';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { Result, MicroserviceResponse } from '@/common';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';

import { getGatewayRequestContext } from '@/common/context/gateway-request-context';
@Injectable()
export class PurchaseRequestCommentService {
  private readonly logger: BackendLogger = new BackendLogger(
    PurchaseRequestCommentService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly procurementService: ClientProxy,
  ) {}

  /**
   * Find a comment by ID via microservice
   * ค้นหารายการเดียวตาม ID ของความคิดเห็นผ่านไมโครเซอร์วิส
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Comment data / ข้อมูลความคิดเห็น
   */
  async findById(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findById',
        id,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.find-by-id',
        service: 'purchase-request-comment',
      },
      { id, user_id, bu_code, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.success(response.data);
  }

  /**
   * Find all comments for a purchase request via microservice
   * ค้นหารายการทั้งหมดของความคิดเห็นสำหรับใบขอซื้อผ่านไมโครเซอร์วิส
   * @param purchase_request_id - Purchase request ID / รหัสใบขอซื้อ
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated comment list / รายการความคิดเห็นแบบแบ่งหน้า
   */
  async findAllByPurchaseRequestId(
    purchase_request_id: string,
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findAllByPurchaseRequestId',
        purchase_request_id,
        paginate,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.find-all-by-purchase-request-id',
        service: 'purchase-request-comment',
      },
      { purchase_request_id, user_id, bu_code, paginate, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.successWithPaginate(response.data, response.paginate);
  }

  /**
   * Create a new comment via microservice
   * สร้างความคิดเห็นใหม่ผ่านไมโครเซอร์วิส
   * @param data - Comment data / ข้อมูลความคิดเห็น
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Created comment / ความคิดเห็นที่สร้างแล้ว
   */
  async create(
    data: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'create',
        data,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.create',
        service: 'purchase-request-comment',
      },
      { data, user_id, bu_code, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.created(response.data);
  }

  /**
   * Update a comment via microservice
   * อัปเดตความคิดเห็นผ่านไมโครเซอร์วิส
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param data - Updated comment data / ข้อมูลความคิดเห็นที่อัปเดต
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated comment / ความคิดเห็นที่อัปเดตแล้ว
   */
  async update(
    id: string,
    data: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'update',
        id,
        data,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.update',
        service: 'purchase-request-comment',
      },
      { id, data, user_id, bu_code, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.success(response.data);
  }

  /**
   * Delete a comment via microservice
   * ลบความคิดเห็นผ่านไมโครเซอร์วิส
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  async delete(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.delete',
        service: 'purchase-request-comment',
      },
      { id, user_id, bu_code, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.success(response.data);
  }

  /**
   * Add an attachment to a comment via microservice
   * เพิ่มไฟล์แนบในความคิดเห็นผ่านไมโครเซอร์วิส
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param attachment - Attachment data / ข้อมูลไฟล์แนบ
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated comment with attachment / ความคิดเห็นที่เพิ่มไฟล์แนบแล้ว
   */
  async addAttachment(
    id: string,
    attachment: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'addAttachment',
        id,
        attachment,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.add-attachment',
        service: 'purchase-request-comment',
      },
      { id, attachment, user_id, bu_code, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.success(response.data);
  }

  /**
   * Remove an attachment from a comment via microservice
   * ลบไฟล์แนบจากความคิดเห็นผ่านไมโครเซอร์วิส
   * @param id - Comment ID / รหัสความคิดเห็น
   * @param fileToken - File token to remove / โทเคนไฟล์ที่ต้องการลบ
   * @param user_id - User ID / รหัสผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated comment without attachment / ความคิดเห็นที่ลบไฟล์แนบแล้ว
   */
  async removeAttachment(
    id: string,
    fileToken: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'removeAttachment',
        id,
        fileToken,
        version,
      },
      PurchaseRequestCommentService.name,
    );

    const res: Observable<MicroserviceResponse> = this.procurementService.send(
      {
        cmd: 'purchase-request-comment.remove-attachment',
        service: 'purchase-request-comment',
      },
      { id, fileToken, user_id, bu_code, version, ...getGatewayRequestContext() },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return ResponseLib.success(response.data);
  }
}
