import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class Config_ProductLocationService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ProductLocationService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly _masterService: ClientProxy,
  ) {}

  /**
   * Get all locations assigned to a product via microservice
   * ค้นหารายการสถานที่ทั้งหมดที่ผูกกับสินค้าผ่านไมโครเซอร์วิส
   * @param productId - Product ID / รหัสสินค้า
   * @param user_id - Requesting user ID / รหัสผู้ใช้ที่ร้องขอ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns List of locations for the product / รายการสถานที่ของสินค้า
   */
  async getLocationsByProductId(
    productId: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getLocationsByProductId',
        productId,
        user_id,
        bu_code,
        version,
      },
      Config_ProductLocationService.name,
    );

    throw new NotImplementedException('Not implemented');
  }
}
