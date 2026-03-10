import { Controller, Get, HttpCode, HttpStatus, Param, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { UnitConversionService } from './unit-conversion.service';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { TaxProfileController } from '../tax-profile/tax-profile.controller';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  ZodSerializerInterceptor,
} from '@/common';

@Controller('api/:bu_code/unit')
@ApiTags('Master Data')
@ApiHeaderRequiredXAppId()
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
export class UnitConversionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    UnitConversionController.name,
  );

  constructor(
    private readonly unitConversionService: UnitConversionService,
  ) {
    super();
  }

  /**
   * Retrieves the available ordering units for a product (e.g., case, carton),
   * used when creating purchase orders to select the vendor ordering unit.
   */
  @Get('order/product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order units for a product',
    description: 'Retrieves the available ordering units for a specific product (e.g., case, carton, bag), used when creating purchase orders to select the appropriate unit for vendor ordering.',
    operationId: 'getOrderUnitProduct',
    tags: ['Master Data', 'Unit Conversion'],
    responses: {
      200: { description: 'Order units retrieved successfully' },
      404: { description: 'Product not found' },
    },
  })
  async getOrderUnitProduct(
    @Param('productId') productId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getUnitProduct',
        productId,
        version,
      },
      UnitConversionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.unitConversionService.getOrderUnitProduct(
      productId,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves the available ingredient-level units for a product (e.g., grams, ml),
   * used in recipe management to define ingredient quantities in cooking measurements.
   */
  @Get('ingredient/product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ingredient units for a product',
    description: 'Retrieves the available ingredient-level units for a specific product (e.g., grams, milliliters, pieces), used in recipe management to define ingredient quantities in cooking measurements.',
    operationId: 'getIngredientUnitProduct',
    tags: ['Master Data', 'Unit Conversion'],
    responses: {
      200: { description: 'Ingredient units retrieved successfully' },
      404: { description: 'Product not found' },
    },
  })
  async getIngredientUnitProduct(
    @Param('productId') productId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getIngredientUnitProduct',
        productId,
        version,
      },
      UnitConversionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.unitConversionService.getIngredientUnitProduct(
      productId,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves all configured unit conversion rules for a product (e.g., kg to g, case to piece),
   * enabling accurate quantity conversion across procurement, inventory, and recipe operations.
   */
  @Get('available/product/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available units for a product',
    description: 'Retrieves all configured unit conversion rules for a specific product (e.g., kg to g, case to piece), enabling accurate quantity conversion across procurement, inventory, and recipe operations.',
    operationId: 'getAvailableUnitProduct',
    tags: ['Master Data', 'Unit Conversion'],
    responses: {
      200: { description: 'Available units retrieved successfully' },
      404: { description: 'Product not found' },
    },
  })
  async getAvailableUnitProduct(
    @Param('productId') productId: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getAvailableUnitProduct',
        productId,
        version,
      },
      UnitConversionController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.unitConversionService.getAvailableUnitProduct(
      productId,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}