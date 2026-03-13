import {
  Controller,
  Get,
  HttpStatus,
  HttpCode,
  Param,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Config_ProductLocationService } from './config_product-location.service';
import { ZodSerializerInterceptor } from '@/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/product/location')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_ProductLocationController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ProductLocationController.name,
  );

  constructor(
    private readonly config_productLocationService: Config_ProductLocationService,
  ) {}

  /**
   * Retrieve all locations assigned to a product
   * ค้นหารายการสถานที่ทั้งหมดที่ผูกกับสินค้า
   * @param productId - Product ID / รหัสสินค้า
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param version - API version / เวอร์ชัน API
   * @returns List of locations for the product / รายการสถานที่ของสินค้า
   */
  @Get(':productId')
  @UseGuards(new AppIdGuard('productLocation.getLocationsByProductId'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get locations by product ID', description: 'Retrieves all storage locations where a specific product is stocked or available. This product-to-location mapping is essential for inventory tracking, replenishment, and stock transfer planning.', operationId: 'configProductLocation_findByProductId', tags: ['Configuration', 'Product Location'] })
  async getLocationsByProductId(
    @Param('productId') productId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getLocationsByProductId',
        productId,
        version,
      },
      Config_ProductLocationController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    return this.config_productLocationService.getLocationsByProductId(
      productId,
      user_id,
      bu_code,
      version,
    );
  }
}
