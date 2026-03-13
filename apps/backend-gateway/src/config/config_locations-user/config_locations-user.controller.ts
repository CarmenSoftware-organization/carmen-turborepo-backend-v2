import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Config_LocationsUserService } from './config_locations-user.service';
import { ZodSerializerInterceptor } from '@/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { LocationUserUpdateRequest } from './swagger/request';

@Controller('api/config/:bu_code/locations/user')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_LocationsUserController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_LocationsUserController.name,
  );

  constructor(
    private readonly config_locationsUserService: Config_LocationsUserService,
  ) {}

  /**
   * Retrieve all locations accessible to a user
   * ค้นหารายการสถานที่ทั้งหมดที่ผู้ใช้สามารถเข้าถึงได้
   * @param userId - Target user ID / รหัสผู้ใช้เป้าหมาย
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param version - API version / เวอร์ชัน API
   * @returns List of locations for the user / รายการสถานที่ของผู้ใช้
   */
  @Get(':userId')
  @UseGuards(new AppIdGuard('locationUser.getLocationByUserId'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get locations by user ID', description: 'Retrieves all storage locations accessible to a specific user. This controls which warehouses and stores a user can perform inventory operations in (stock-in, stock-out, transfers).', operationId: 'configLocationUser_findByUserId', tags: ['Configuration', 'Location User'] })
  async getLocationByUserId(
    @Param('userId') userId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getLocationByUserId',
        userId,
        version,
      },
      Config_LocationsUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    return this.config_locationsUserService.getLocationByUserId(
      userId,
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Update location assignments for a user
   * อัปเดตการกำหนดสถานที่ให้กับผู้ใช้
   * @param userId - Target user ID / รหัสผู้ใช้เป้าหมาย
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Location-user assignment update data / ข้อมูลสำหรับอัปเดตการกำหนดสถานที่-ผู้ใช้
   * @param req - HTTP request / คำขอ HTTP
   * @param version - API version / เวอร์ชัน API
   * @returns Updated assignment result / ผลลัพธ์การอัปเดตการกำหนด
   */
  @Put(':userId')
  @UseGuards(new AppIdGuard('locationUser.managerLocationUser'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Manage location-user assignments', description: 'Updates the set of storage locations a user has access to. Controls which warehouses and stores the user can perform inventory operations in, such as stock-in, stock-out, and transfers.', operationId: 'configLocationUser_manageAssignments', tags: ['Configuration', 'Location User'] })
  @ApiBody({ type: LocationUserUpdateRequest })
  async managerLocationUser(
    @Param('userId') userId: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: Record<string, unknown>,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'managerLocationUser',
        userId,
        version,
      },
      Config_LocationsUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    return this.config_locationsUserService.managerLocationUser(
      userId,
      updateDto,
      user_id,
      bu_code,
      version,
    );
  }
}
