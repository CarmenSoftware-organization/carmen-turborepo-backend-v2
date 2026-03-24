import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_LocationProductService } from './config_location-product.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BaseHttpController } from 'src/common/http/base-http-controller';

@Controller('api/config/:bu_code/location-product')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_LocationProductController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_LocationProductController.name,
  );

  constructor(
    private readonly config_locationProductService: Config_LocationProductService,
  ) {
    super();
  }

  /**
   * ค้นหารายการ product_location ตาม location_id
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param locationId - Location ID / รหัสสถานที่
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns รายการ product_location ที่ผูกกับสถานที่ พร้อม product_code, product_name, product_local_name, product_sku, location_code, location_name
   */
  @Get(':locationId')
  @UseGuards(new AppIdGuard('locationProduct.getProductByLocationId'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get product-location mappings by location ID',
    description: 'Retrieves all product-location records for a specific location, including product_code, product_name, product_local_name, product_sku, location_code, location_name, and quantity settings (min/max/reorder/par).',
    operationId: 'configLocationProduct_findByLocationId',
    tags: ['Configuration', 'Location Product'],
  })
  async getProductByLocationId(
    @Req() req: Request,
    @Res() res: Response,
    @Param('locationId') locationId: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getProductByLocationId',
        locationId,
        version,
      },
      Config_LocationProductController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_locationProductService.getProductByLocationId(
      locationId,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Refresh denormalized fields ใน tb_product_location
   * อัปเดต location_code, location_name, product_name, product_code, product_local_name, product_sku
   * โดยดึงค่าจริงจาก tb_product และ tb_location ผ่าน product_id และ location_id
   */
  @Post('refresh')
  @UseGuards(new AppIdGuard('locationProduct.refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh product-location denormalized fields',
    description: 'Regenerates location_code, location_name, product_name, product_code, product_local_name, product_sku in tb_product_location by looking up actual values from tb_product and tb_location using product_id and location_id.',
    operationId: 'configLocationProduct_refresh',
    tags: ['Configuration', 'Location Product'],
  })
  async refreshProductLocations(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
  ): Promise<void> {
    this.logger.debug(
      { function: 'refreshProductLocations' },
      Config_LocationProductController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_locationProductService.refreshProductLocations(
      user_id,
      bu_code,
    );
    this.respond(res, result);
  }
}
