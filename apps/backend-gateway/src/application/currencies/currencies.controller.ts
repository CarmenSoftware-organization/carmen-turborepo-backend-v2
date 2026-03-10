import {
  ConsoleLogger,
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
import { CurrenciesService } from './currencies.service';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  CurrencyDetailResponseSchema,
  CurrencyListItemResponseSchema,
} from '@/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api')
@ApiTags('Master Data')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class CurrenciesController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    CurrenciesController.name,
  );

  constructor(private readonly currenciesService: CurrenciesService) {
    super();
  }

  /**
   * Lists all active currencies configured for the business unit,
   * used in procurement pricing, purchase orders, and invoice processing.
   */
  @Get(':bu_code/currencies')
  @UseGuards(new AppIdGuard('currencies.findAllActive'))
  @Serialize(CurrencyListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active currencies',
    description: 'Lists all currencies enabled for the business unit, used to populate currency selectors in purchase orders, price lists, and other multi-currency procurement documents.',
    operationId: 'findAllActiveCurrencies',
    tags: ['Master Data', 'Currencies'],
  })
  async findAllActive(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllActive',
        query,
        version,
      },
      CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.currenciesService.findAllActive(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all ISO 4217 standard currencies available in the system,
   * used when configuring which currencies a business unit should support.
   */
  @Get('iso')
  @UseGuards(new AppIdGuard('currencies.findAllISO'))
  @Serialize(CurrencyListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all ISO currencies',
    description: 'Lists all ISO 4217 standard currencies available in the system, used when configuring which currencies a business unit should support for international procurement.',
    operationId: 'findAllISOCurrencies',
    tags: ['Master Data', 'Currencies'],
  })
  async findAllISO(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAllISO',
        query,
        version,
      },
      CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.currenciesService.findAllISO(user_id, paginate, version);
    this.respond(res, result);
  }

  /**
   * Retrieves the default base currency for the business unit, used as
   * the primary currency for inventory valuation and cost calculations.
   */
  @Get(':bu_code/currencies/default')
  @UseGuards(new AppIdGuard('currencies.default'))
  @Serialize(CurrencyDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get default currency',
    description: 'Retrieves the default base currency for the business unit, which is used as the primary currency for inventory valuation and procurement cost calculations.',
    operationId: 'getDefaultCurrency',
    tags: ['Master Data', 'Currencies'],
  })
  async currency_default(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'currency_default',
        version,
      },
      CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.currenciesService.getDefault(user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves a specific currency including its code, symbol, and exchange
   * rate configuration for reviewing currency settings.
   */
  @Get(':bu_code/currencies/:id')
  @UseGuards(new AppIdGuard('currencies.findOne'))
  @Serialize(CurrencyDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a currency by ID',
    description: 'Retrieves the details of a specific currency including its code, symbol, and exchange rate configuration, used when reviewing currency settings for procurement documents.',
    operationId: 'findOneCurrency',
    tags: ['Master Data', 'Currencies'],
  })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.currenciesService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }


}
