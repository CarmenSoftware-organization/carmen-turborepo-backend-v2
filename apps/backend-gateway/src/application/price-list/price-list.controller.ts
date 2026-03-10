import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { PriceListService } from './price-list.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginate, IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  PriceListDetailResponseSchema,
  PriceListListItemResponseSchema,
  PriceListMutationResponseSchema,
  PriceListCreateDto,
  PriceListUpdateDto,
  isValidDate,
  toISOStringOrThrow,
} from '@/common';
import {
  PriceListCreateRequestDto,
  PriceListUpdateRequestDto,
  PriceCompareQueryDto,
} from './swagger/request';

@Controller('api/:bu_code/price-list')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class PriceListController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PriceListController.name,
  );

  constructor(private readonly priceListService: PriceListService) {
    super();
    this.logger.debug('PriceListController initialized');
  }

  /**
   * Compares vendor prices for a specific product across all active price lists,
   * helping procurement staff identify the best-value supplier for purchase orders.
   */
  @Get('price-compare')
  @UseGuards(new AppIdGuard('priceList.priceCompare'))
  @Serialize(PriceListListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Compare price list',
    description: 'Compares vendor prices for a specific product across all active price lists, enabling procurement staff to identify the best-value supplier for purchase orders.',
    operationId: 'priceCompare',
    tags: ['Procurement', 'Price List'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      200: {
        description: 'Price comparison was successfully retrieved',
      },
    },
  })
  async priceCompare(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: Record<string, string>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'priceCompare',
        query,
        version,
      },
      PriceListController.name,
    );

    const { product_id, at_date, unit_id, currency_id } = query

    if (!product_id || !at_date || !currency_id) {
      throw new Error('product_id, at_date, and currency_id are required');
    }

    if (!isValidDate(at_date)) {
      throw new Error('at_date is invalid date format');
    }
    const due_date = toISOStringOrThrow(at_date);
    const { user_id } = ExtractRequestHeader(req);
    const queryData = {
      product_id,
      due_date,
      unit_id: unit_id || null,
      currency_id,
    }

    const result = await this.priceListService.priceCompare(queryData, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves the full details of a vendor price list including all product prices,
   * validity dates, and terms for reviewing or editing procurement pricing.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('priceList.findOne'))
  @Serialize(PriceListDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get price list by ID',
    description: 'Retrieves the full details of a vendor price list including all product prices, validity dates, and terms, used when reviewing or editing procurement pricing agreements.',
    operationId: 'findOnePriceListByBusinessUnit',
    tags: ['Procurement', 'Price List'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Price list was successfully retrieved',
      },
      404: {
        description: 'Price list was not found',
      },
    },
  })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      PriceListController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.priceListService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all active vendor price lists for the business unit, allowing
   * procurement staff to browse current pricing agreements and compare vendors.
   */
  @Get()
  @UseGuards(new AppIdGuard('priceList.findAll'))
  @Serialize(PriceListListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all price lists',
    description:
      'Lists all active vendor price lists for the business unit, allowing procurement staff to browse current pricing agreements and compare vendor offerings.',
    operationId: 'findAllPriceListsByBusinessUnit',
    tags: ['Procurement', 'Price List'],
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
        description: 'Price lists were successfully retrieved',
      },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      PriceListController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate: IPaginate = PaginateQuery(query) as IPaginate;
    const result = await this.priceListService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Records a new vendor price list with product prices and validity dates,
   * establishing the pricing basis for procurement purchase orders.
   */
  @Post()
  @UseGuards(new AppIdGuard('priceList.create'))
  @Serialize(PriceListMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new price list',
    description: 'Records a new vendor price list with product prices and validity dates, establishing the pricing basis for procurement purchase orders and cost comparison.',
    operationId: 'createPriceListByBusinessUnit',
    tags: ['Procurement', 'Price List'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      201: {
        description: 'Price list was successfully created',
      },
      400: {
        description: 'Bad request',
      },
    },
  })
  @ApiBody({ type: PriceListCreateRequestDto })
  async create(
    @Body() data: PriceListCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        data,
        version,
      },
      PriceListController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.priceListService.create({ ...data }, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing vendor price list, such as adjusting product prices,
   * extending validity dates, or correcting pricing errors.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('priceList.update'))
  @Serialize(PriceListMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a price list',
    description: 'Modifies an existing vendor price list, such as adjusting product prices, extending validity dates, or correcting pricing errors in procurement agreements.',
    operationId: 'updatePriceListByBusinessUnit',
    tags: ['Procurement', 'Price List'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Price list was successfully updated',
      },
      404: {
        description: 'Price list was not found',
      },
    },
  })
  @ApiBody({ type: PriceListUpdateRequestDto })
  async update(
    @Param('id') id: string,
    @Body() data: PriceListUpdateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        data,
        version,
      },
      PriceListController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.priceListService.update({ ...data, id }, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes an outdated or incorrect vendor price list from active use.
   * Historical pricing data is retained for audit purposes.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('priceList.delete'))
  @Serialize(PriceListMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a price list',
    description: 'Removes an outdated or incorrect vendor price list from active use. Historical pricing data is retained for audit purposes.',
    operationId: 'deletePriceListByBusinessUnit',
    tags: ['Procurement', 'Price List'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Price list was successfully deleted',
      },
      404: {
        description: 'Price list was not found',
      },
    },
  })
  async remove(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'remove',
        id,
        version,
      },
      PriceListController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.priceListService.remove(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
