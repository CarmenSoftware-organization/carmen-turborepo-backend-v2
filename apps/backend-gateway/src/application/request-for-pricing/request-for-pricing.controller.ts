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
import { RequestForPricingService } from './request-for-pricing.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  ZodSerializerInterceptor,
} from '@/common';

@Controller('api/:bu_code/request-for-pricing')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class RequestForPricingController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    RequestForPricingController.name,
  );

  constructor(
    private readonly requestForPricingService: RequestForPricingService,
  ) {
    super();
    this.logger.debug('RequestForPricingController initialized');
  }

  /**
   * Retrieves a specific Request for Pricing (RFP) document,
   * including requested items, vendor responses, and quoted prices for comparison.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('requestForPricing.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get request for pricing by ID',
    description: 'Retrieves a specific Request for Pricing (RFP) document sent to vendors, including the requested items, vendor responses, and quoted prices used for competitive procurement comparison.',
    operationId: 'findOneRequestForPricing',
    tags: ['Procurement', 'Request For Pricing'],
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
        description: 'Request for pricing was successfully retrieved',
      },
      404: {
        description: 'Request for pricing was not found',
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
      RequestForPricingController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.requestForPricingService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all RFP documents within the business unit, allowing procurement
   * staff to track and compare competitive pricing submissions from vendors.
   */
  @Get()
  @UseGuards(new AppIdGuard('requestForPricing.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get all request for pricing',
    description: 'Lists all Request for Pricing (RFP) documents within the business unit, allowing procurement staff to track and compare competitive pricing submissions from multiple vendors.',
    operationId: 'findAllRequestForPricing',
    tags: ['Procurement', 'Request For Pricing'],
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
        description: 'Request for pricing list was successfully retrieved',
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
      RequestForPricingController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.requestForPricingService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new RFP to solicit competitive quotes from vendors for specified items,
   * initiating the price comparison process before purchase order generation.
   */
  @Post()
  @UseGuards(new AppIdGuard('requestForPricing.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new request for pricing',
    description: 'Creates a new Request for Pricing (RFP) to solicit competitive quotes from vendors for specified items, initiating the price comparison process before purchase order generation.',
    operationId: 'createRequestForPricing',
    tags: ['Procurement', 'Request For Pricing'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    responses: {
      201: {
        description: 'Request for pricing was successfully created',
      },
      400: {
        description: 'Bad request',
      },
    },
  })
  async create(
    @Body() data: Record<string, unknown>,
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
      RequestForPricingController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.requestForPricingService.create(data, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing RFP to modify requested items, adjust quantities,
   * or record vendor pricing responses during the competitive bidding process.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('requestForPricing.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a request for pricing',
    description: 'Updates an existing Request for Pricing (RFP) to modify requested items, adjust quantities, or record vendor pricing responses during the competitive bidding process.',
    operationId: 'updateRequestForPricing',
    tags: ['Procurement', 'Request For Pricing'],
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
        description: 'Request for pricing was successfully updated',
      },
      404: {
        description: 'Request for pricing was not found',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
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
      RequestForPricingController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.requestForPricingService.update(
      { ...data, id },
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an RFP document that is no longer needed, such as cancelled
   * procurement inquiries or duplicate vendor pricing requests.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('requestForPricing.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a request for pricing',
    description: 'Removes a Request for Pricing (RFP) document that is no longer needed, such as cancelled procurement inquiries or duplicate vendor pricing requests.',
    operationId: 'deleteRequestForPricing',
    tags: ['Procurement', 'Request For Pricing'],
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
        description: 'Request for pricing was successfully deleted',
      },
      404: {
        description: 'Request for pricing was not found',
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
      RequestForPricingController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.requestForPricingService.remove(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
