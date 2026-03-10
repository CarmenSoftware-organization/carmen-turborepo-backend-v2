import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_CurrenciesService } from './config_currencies.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  CurrenciesCreateDto,
  CurrenciesUpdateDto,
  IUpdateCurrencies,
  Serialize,
  ZodSerializerInterceptor,
  CurrencyResponseSchema,
} from '@/common';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CurrencyCreateRequestDto, CurrencyUpdateRequestDto } from './swagger/request';

@Controller('api/config/:bu_code/currencies')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_CurrenciesController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_CurrenciesController.name,
  );

  constructor(private readonly currenciesService: Config_CurrenciesService) {
    super();
  }

  /**
   * Retrieves a specific currency configuration including code, symbol, and base currency status
   * for multi-currency procurement and vendor price lists.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('currencies.findOne'))
  @Serialize(CurrencyResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a currency by ID',
    description: 'Retrieves a specific currency configuration including its code, symbol, and base currency status. Currencies are used in multi-currency procurement for purchase orders and vendor price lists.',
    operationId: 'configCurrencies_findOne',
    tags: ['Configuration', 'Currencies'],
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
        description: 'The unique identifier of the currency',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      200: {
        description: 'Currency retrieved successfully',
      },
      404: {
        description: 'Currency not found',
      },
    },
  })
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
      Config_CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.currenciesService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all supported currencies for the business unit, including the base currency,
   * for international procurement and vendor payments.
   */
  @Get()
  @UseGuards(new AppIdGuard('currencies.findAll'))
  @Serialize(CurrencyResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all currencies',
    description: 'Returns all supported currencies configured for the business unit, including the base currency. Used to manage multi-currency support for international procurement and vendor payments.',
    operationId: 'configCurrencies_findAll',
    tags: ['Configuration', 'Currencies'],
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
        description: 'Currencies retrieved successfully',
      },
      404: {
        description: 'Currencies not found',
      },
    },
  })
  @ApiUserFilterQueries()
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
      Config_CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.currenciesService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Adds a new currency for multi-currency procurement. The currency can then be
   * assigned exchange rates and used in purchase orders and vendor price lists.
   */
  @Post()
  @UseGuards(new AppIdGuard('currencies.create'))
  @Serialize(CurrencyResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new currency',
    description: 'Adds a new currency to the system for use in multi-currency procurement. Once created, the currency can be assigned exchange rates and used in purchase orders and vendor price lists.',
    operationId: 'configCurrencies_create',
    tags: ['Configuration', 'Currencies'],
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
      201: {
        description: 'Currency created successfully',
      },
    },
  })
  @ApiBody({ type: CurrencyCreateRequestDto })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: CurrenciesCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.currenciesService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Fully updates a currency configuration such as symbol, decimal precision,
   * or base currency designation for procurement documents.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('currencies.update'))
  @Serialize(CurrencyResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a currency (full replacement)',
    description: 'Fully replaces a currency configuration, such as updating its symbol, decimal precision, or base currency designation. Changes affect how amounts are displayed and calculated in procurement documents.',
    operationId: 'configCurrencies_update',
    tags: ['Configuration', 'Currencies'],
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
        description: 'The unique identifier of the currency',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      200: {
        description: 'Currency updated successfully',
      },
      404: {
        description: 'Currency not found',
      },
    },
  })
  @ApiBody({ type: CurrencyUpdateRequestDto })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: CurrenciesUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateCurrencies = {
      ...updateDto,
      id,
    };
    const result = await this.currenciesService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Partially updates specific fields of a currency configuration,
   * such as toggling active status or adjusting display settings.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('currencies.patch'))
  @Serialize(CurrencyResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Partially update a currency',
    description: 'Partially updates specific fields of a currency configuration without replacing the entire record. Useful for toggling active status or adjusting display settings.',
    operationId: 'configCurrencies_patch',
    tags: ['Configuration', 'Currencies'],
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
        description: 'The unique identifier of the currency',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      200: {
        description: 'Currency updated successfully',
      },
      404: {
        description: 'Currency not found',
      },
    },
  })
  @ApiBody({ type: CurrencyUpdateRequestDto })
  async patch(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: CurrenciesUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'patch',
        id,
        updateDto,
        version,
      },
      Config_CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateCurrencies = {
      ...updateDto,
      id,
    };
    const result = await this.currenciesService.patch(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a currency from active use. Historical procurement records using it are preserved.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('currencies.delete'))
  @Serialize(CurrencyResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a currency',
    description: 'Removes a currency from active use. The currency will no longer be available for new procurement transactions, but historical records using this currency are preserved.',
    operationId: 'configCurrencies_delete',
    tags: ['Configuration', 'Currencies'],
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
        description: 'Currency deleted successfully',
      },
    },
  })
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
      Config_CurrenciesController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.currenciesService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
