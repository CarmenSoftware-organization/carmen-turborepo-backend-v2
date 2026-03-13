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
} from '@nestjs/common';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  ProductLocationListItemResponseSchema,
} from '@/common';

@Controller('api')
@ApiTags('Master Data')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ProductsController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ProductsController.name,
  );

  constructor(private readonly productService: ProductsService) {
    super();
  }

  /**
   * Get all products by location ID
   * ค้นหารายการสินค้าทั้งหมดตามรหัสสถานที่
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param query - Pagination query parameters / พารามิเตอร์การแบ่งหน้า
   * @param id - Location ID / รหัสสถานที่
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of products at the location / รายการสินค้าที่สถานที่แบบแบ่งหน้า
   */
  @Get(':bu_code/products/locations/:id')
  @UseGuards(new AppIdGuard('products.getByLocation'))
  @Serialize(ProductLocationListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all products by location id',
    description: 'Retrieves all products assigned to a specific storage location or warehouse, used for inventory operations such as stock-in, physical counts, and requisition fulfillment.',
    operationId: 'findAllProductsByLocationId',
    tags: ['Master Data', 'Products'],
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
        description: 'The products were successfully retrieved',
      },
      404: {
        description: 'The products were not found',
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async GetByLocation(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'GetByLocation',
        id,
        version,
      },
      ProductsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.productService.getByLocation(
      user_id,
      bu_code,
      id,
      paginate,
      version,
    );
    this.respond(res, result);
  }
}
