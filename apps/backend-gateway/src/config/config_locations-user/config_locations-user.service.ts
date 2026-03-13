import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class Config_LocationsUserService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_LocationsUserService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly _masterService: ClientProxy,
  ) {}

  /**
   * Get all locations accessible to a user via microservice
   * ค้นหารายการสถานที่ทั้งหมดที่ผู้ใช้สามารถเข้าถึงได้ผ่านไมโครเซอร์วิส
   * @param userId - Target user ID / รหัสผู้ใช้เป้าหมาย
   * @param user_id - Requesting user ID / รหัสผู้ใช้ที่ร้องขอ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns List of locations for the user / รายการสถานที่ของผู้ใช้
   */
  async getLocationByUserId(
    userId: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getLocationByUserId',
        userId,
        version,
      },
      Config_LocationsUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }

  /**
   * Update location-user assignments via microservice
   * อัปเดตการกำหนดสถานที่-ผู้ใช้ผ่านไมโครเซอร์วิส
   * @param userId - Target user ID / รหัสผู้ใช้เป้าหมาย
   * @param updateDto - Location-user assignment update data / ข้อมูลสำหรับอัปเดตการกำหนดสถานที่-ผู้ใช้
   * @param user_id - Requesting user ID / รหัสผู้ใช้ที่ร้องขอ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Updated assignment result / ผลลัพธ์การอัปเดตการกำหนด
   */
  async managerLocationUser(
    userId: string,
    updateDto: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'managerLocationUser',
        userId,
        version,
      },
      Config_LocationsUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }
}
