import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  ConsoleLogger,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_ProductCategoryService } from './config_product-category.service';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  IUpdateProductCategory,
  ProductCategoryCreateDto,
  ProductCategoryUpdateDto,
  Serialize,
  ZodSerializerInterceptor,
  ProductCategoryDetailResponseSchema,
  ProductCategoryListItemResponseSchema,
  ProductCategoryMutationResponseSchema,
} from '@/common';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import {
  IPaginate,
  IPaginateQuery,
  PaginateQuery,
} from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/products/category')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_ProductCategoryController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ProductCategoryController.name,
  );

  constructor(
    private readonly config_productCategoryService: Config_ProductCategoryService,
  ) {
    super();
  }

  /**
   * Retrieves a specific product category used to classify items in the master catalog
   * (e.g., Fresh Produce, Dry Goods, Beverages, Cleaning Supplies).
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('productCategory.findOne'))
  @Serialize(ProductCategoryDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a product category by ID', description: 'Retrieves a specific product category used to classify products in the master catalog (e.g., Fresh Produce, Dry Goods, Beverages, Cleaning Supplies). Categories form the top level of the product classification hierarchy.', operationId: 'findOneProductCategory', tags: ['Configuration', 'Product Category'] })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      Config_ProductCategoryController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_productCategoryService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all product categories configured for the business unit, providing the primary
   * classification for organizing the product catalog and generating procurement reports.
   */
  @Get()
  @UseGuards(new AppIdGuard('productCategory.findAll'))
  @Serialize(ProductCategoryListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all product categories', description: 'Returns all product categories configured for the business unit. Categories provide the primary classification for organizing the product catalog and generating procurement reports by product type.', operationId: 'findAllProductCategories', tags: ['Configuration', 'Product Category'] })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_ProductCategoryController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_productCategoryService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new top-level product category for classifying items in the master catalog.
   * Sub-categories can then be created under this category for more granular classification.
   */
  @Post()
  @UseGuards(new AppIdGuard('productCategory.create'))
  @Serialize(ProductCategoryMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product category', description: 'Defines a new top-level product category for classifying items in the master catalog. Sub-categories can then be created under this category for more granular classification.', operationId: 'createProductCategory', tags: ['Configuration', 'Product Category'] })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: ProductCategoryCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_ProductCategoryController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_productCategoryService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing product category, such as renaming it or adjusting its display order.
   * Changes affect how products are organized in the catalog and categorized in reports.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('productCategory.update'))
  @Serialize(ProductCategoryMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product category', description: 'Modifies an existing product category, such as renaming it or adjusting its display order. Changes affect how products are organized in the catalog and categorized in procurement reports.', operationId: 'updateProductCategory', tags: ['Configuration', 'Product Category'] })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: ProductCategoryUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_ProductCategoryController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateProductCategory = {
      ...updateDto,
      id,
    };
    const result = await this.config_productCategoryService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a product category from the classification hierarchy. Products currently
   * assigned to this category should be reassigned before deletion.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('productCategory.delete'))
  @Serialize(ProductCategoryMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product category', description: 'Removes a product category from the classification hierarchy. Products currently assigned to this category should be reassigned before deletion.', operationId: 'deleteProductCategory', tags: ['Configuration', 'Product Category'] })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_ProductCategoryController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_productCategoryService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
