import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class Config_LocationProductService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_LocationProductService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  /**
   * Get all products assigned to a location via microservice
   * ค้นหารายการสินค้าทั้งหมดที่ผูกกับสถานที่ผ่านไมโครเซอร์วิส
   * @param locationId - Location ID / รหัสสถานที่
   * @param user_id - Requesting user ID / รหัสผู้ใช้ที่ร้องขอ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns List of products for the location / รายการสินค้าของสถานที่
   */
  async getProductByLocationId(
    locationId: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getProductByLocationId',
        locationId,
        version,
      },
      Config_LocationProductService.name,
    );
    throw new NotImplementedException('Not implemented');
  }
}
