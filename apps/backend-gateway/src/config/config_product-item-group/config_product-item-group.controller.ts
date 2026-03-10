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
  Req,
  Res,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_ProductItemGroupService } from './config_product-item-group.service';
import { ApiTags, ApiBearerAuth, ApiBody, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ProductItemGroupCreateRequest, ProductItemGroupUpdateRequest } from './swagger/request';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  IUpdateProductItemGroup,
  ProductItemGroupCreateDto,
  ProductItemGroupUpdateDto,
  Serialize,
  ZodSerializerInterceptor,
  ProductItemGroupDetailResponseSchema,
  ProductItemGroupListItemResponseSchema,
  ProductItemGroupMutationResponseSchema,
} from '@/common';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/products/item-group')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_ProductItemGroupController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ProductItemGroupController.name,
  );

  constructor(
    private readonly config_productItemGroupService: Config_ProductItemGroupService,
  ) {
    super();
  }

  /**
   * Retrieves a specific product item group definition used to group products for
   * procurement reporting and analysis (e.g., Food Items, Beverage Items, Operating Supplies).
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('productItemGroup.findOne'))
  @Serialize(ProductItemGroupDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a product item group by ID', description: 'Retrieves a specific product item group definition used to group products for procurement reporting and analysis (e.g., Food Items, Beverage Items, Operating Supplies).', operationId: 'configProductItemGroup_findOne', tags: ['Configuration', 'Product Item Group'] })
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
      Config_ProductItemGroupController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_productItemGroupService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all product item groups configured for the business unit, used to classify
   * products for aggregated procurement reporting, spend analysis, and inventory valuation.
   */
  @Get()
  @UseGuards(new AppIdGuard('productItemGroup.findAll'))
  @Serialize(ProductItemGroupListItemResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all product item groups', description: 'Returns all product item groups configured for the business unit. Item groups are used to classify products for aggregated procurement reporting, spend analysis, and inventory valuation.', operationId: 'configProductItemGroup_findAll', tags: ['Configuration', 'Product Item Group'] })
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
      Config_ProductItemGroupController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_productItemGroupService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new product grouping for reporting and procurement analysis. Products
   * assigned to this group will be aggregated together in spend reports and inventory summaries.
   */
  @Post()
  @UseGuards(new AppIdGuard('productItemGroup.create'))
  @Serialize(ProductItemGroupMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product item group', description: 'Defines a new product grouping for reporting and procurement analysis. Products assigned to this group will be aggregated together in spend reports and inventory summaries.', operationId: 'configProductItemGroup_create', tags: ['Configuration', 'Product Item Group'] })
  @ApiBody({ type: ProductItemGroupCreateRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: ProductItemGroupCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_ProductItemGroupController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_productItemGroupService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing product item group, such as renaming it or adjusting its classification.
   * Changes affect how products are grouped in procurement and inventory reports.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('productItemGroup.update'))
  @Serialize(ProductItemGroupMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a product item group', description: 'Modifies an existing product item group, such as renaming it or adjusting its classification. Changes affect how products are grouped in procurement and inventory reports.', operationId: 'configProductItemGroup_update', tags: ['Configuration', 'Product Item Group'] })
  @ApiBody({ type: ProductItemGroupUpdateRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: ProductItemGroupUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_ProductItemGroupController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateProductItemGroup = {
      ...updateDto,
      id,
    };
    const result = await this.config_productItemGroupService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a product item group from the system. Products currently assigned to this
   * group should be reassigned before deletion to maintain reporting accuracy.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('productItemGroup.delete'))
  @Serialize(ProductItemGroupMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product item group', description: 'Removes a product item group from the system. Products currently assigned to this group should be reassigned before deletion to maintain reporting accuracy.', operationId: 'configProductItemGroup_delete', tags: ['Configuration', 'Product Item Group'] })
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
      Config_ProductItemGroupController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_productItemGroupService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
