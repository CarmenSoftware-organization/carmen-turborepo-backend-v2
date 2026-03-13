import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { LocationsService } from './locations.service';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  LocationDetailResponseSchema,
  LocationListItemResponseSchema,
} from '@/common';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPaginateQuery, PaginateDto } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import {
  ProductInventoryInfoDto,
  ProductInventoryInfoDtoSchema,
} from '@/common';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api')
@ApiTags('Master Data')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class LocationsController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    LocationsController.name,
  );

  constructor(private readonly locationsService: LocationsService) {
    super();
  }

  /**
   * List all locations accessible to the current user
   * ค้นหารายการสถานที่ทั้งหมดที่ผู้ใช้ปัจจุบันเข้าถึงได้
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @param query - Pagination query parameters / พารามิเตอร์การแบ่งหน้า
   * @returns List of locations for the user / รายการสถานที่ของผู้ใช้
   */
  @Get(':bu_code/locations')
  @UseGuards(new AppIdGuard('locations.findAll'))
  @Serialize(LocationListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get locations by user ID',
    description:
      'Lists all active storage locations and warehouses accessible to the current user, used to select destinations for stock-in, stock-out, transfers, and physical count operations.',
    operationId: 'findAllLocationsByUserId',
    tags: ['Master Data', 'Location'],
    deprecated: false,
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
        description: 'The version of the API',
        example: 'latest',
      },
    ],
    responses: {
      200: {
        description: 'Locations were successfully retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  code: { type: 'string' },
                  name: { type: 'string' },
                  location_type: { type: 'string' },
                  physical_count_type: { type: 'string' },
                  description: { type: 'string' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
    @Query() query?: IPaginateQuery,
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        version,
      },
      LocationsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.locationsService.findByUserId(
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Get a specific location by ID
   * ค้นหารายการสถานที่เดียวตาม ID
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param id - Location ID / รหัสสถานที่
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param withUser - Include assigned users / รวมผู้ใช้ที่ผูกไว้
   * @param withProducts - Include stocked products / รวมสินค้าที่มีในสต็อก
   * @param version - API version / เวอร์ชัน API
   * @returns Location details / รายละเอียดสถานที่
   */
  @Get(':bu_code/locations/:id')
  @UseGuards(new AppIdGuard('locations.findOne'))
  @Serialize(LocationDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get location by ID',
    description: 'Retrieves the full details of a storage location including its assigned users and stocked products, used for managing warehouse configuration and inventory assignments.',
    operationId: 'findOneLocation',
    tags: ['Master Data', 'Location'],
  })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('withUser') withUser: boolean = true,
    @Query('withProducts') withProducts: boolean = true,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
        withUser,
        withProducts,
      },
      LocationsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.locationsService.findOne(
      id,
      user_id,
      bu_code,
      withUser,
      withProducts,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Get product inventory levels at a specific location
   * ดึงข้อมูลระดับสินค้าคงคลังของสินค้าที่สถานที่เฉพาะ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param location_id - Location ID / รหัสสถานที่
   * @param product_id - Product ID / รหัสสินค้า
   * @param version - API version / เวอร์ชัน API
   * @returns Product inventory info (on-hand, on-order, reorder, restock) / ข้อมูลสินค้าคงคลัง (คงเหลือ, สั่งซื้อ, สั่งเติม, เติมสต็อก)
   */
  @Get(':bu_code/locations/:location_id/product/:product_id/inventory')
  @UseGuards(new AppIdGuard('locations.getProductInventory'))
  @Serialize(ProductInventoryInfoDtoSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get product inventory by location ID and product ID',
    description: 'Retrieves real-time inventory levels for a specific product at a given storage location, including on-hand, on-order, reorder, and restock quantities for procurement and replenishment decisions.',
    operationId: 'getProductInventory',
    tags: ['Master Data', 'Location'],
    deprecated: false,
    parameters: [
      {
        name: 'location_id',
        in: 'path',
        required: true,
        description: 'The ID of the location',
        example: '123',
      },
      {
        name: 'product_id',
        in: 'path',
        required: true,
        description: 'The ID of the product',
        example: '123',
      },
      {
        name: 'version',
        in: 'query',
        required: false,
        description: 'The version of the API',
        example: 'latest',
      },
    ],
    responses: {
      200: {
        description: 'Product inventory was successfully retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                on_hand_qty: { type: 'number' },
                on_order_qty: { type: 'number' },
                re_order_qty: { type: 'number' },
                re_stock_qty: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async getProductInventory(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('location_id') location_id: string,
    @Param('product_id') product_id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getProductInventory',
        location_id,
        product_id,
        version,
      },
      LocationsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.locationsService.getProductInventory(
      location_id,
      product_id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
