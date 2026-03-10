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
import { Config_DeliveryPointService } from './config_delivery-point.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  DeliveryPointCreateDto,
  DeliveryPointUpdateDto,
  IUpdateDeliveryPoint,
  Serialize,
  ZodSerializerInterceptor,
  DeliveryPointResponseSchema,
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

@Controller('api/config/:bu_code/delivery-point')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_DeliveryPointController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DeliveryPointController.name,
  );

  constructor(
    private readonly deliveryPointService: Config_DeliveryPointService,
  ) {
    super();
  }

  /**
   * Retrieves a specific delivery point where vendors deliver goods to the property,
   * used in purchase orders to specify the receiving location.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('delivery-point.findOne'))
  @Serialize(DeliveryPointResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a delivery point by ID',
    description: 'Retrieves a specific delivery point where vendors deliver goods to the property. Delivery points are used in purchase orders to specify the exact receiving location for vendor shipments.',
    operationId: 'findOneDeliveryPoint',
    tags: ['Configuration', 'Delivery Point'],
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
        description: 'The unique identifier of the delivery point',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      200: {
        description: 'Delivery point retrieved successfully',
      },
      404: {
        description: 'Delivery point not found',
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
      Config_DeliveryPointController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.deliveryPointService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all delivery points at the property (e.g., loading dock, back entrance, kitchen door)
   * where vendors can deliver goods.
   */
  @Get()
  @UseGuards(new AppIdGuard('delivery-point.findAll'))
  @Serialize(DeliveryPointResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all delivery points',
    description: 'Returns all delivery points configured for the property. These represent physical locations (e.g., loading dock, back entrance, kitchen door) where vendors can deliver goods.',
    operationId: 'findAllDeliveryPoints',
    tags: ['Configuration', 'Delivery Point'],
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
        description: 'Delivery points retrieved successfully',
      },
      404: {
        description: 'Delivery points not found',
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
      Config_DeliveryPointController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.deliveryPointService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new delivery location at the property for vendor shipments.
   * Once created, it can be specified in purchase orders.
   */
  @Post()
  @UseGuards(new AppIdGuard('delivery-point.create'))
  @Serialize(DeliveryPointResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new delivery point',
    description: 'Defines a new delivery location at the property where vendors can deliver goods. Once created, it can be specified in purchase orders to direct vendor shipments.',
    operationId: 'createDeliveryPoint',
    tags: ['Configuration', 'Delivery Point'],
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
        description: 'Delivery point created successfully',
      },
    },
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: DeliveryPointCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_DeliveryPointController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.deliveryPointService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Fully updates an existing delivery point configuration such as name, address, or operating hours.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('delivery-point.update'))
  @Serialize(DeliveryPointResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a delivery point',
    description: 'Modifies an existing delivery point configuration, such as updating its name, address, or operating hours. Changes affect how future purchase orders reference this delivery location.',
    operationId: 'updateDeliveryPoint',
    tags: ['Configuration', 'Delivery Point'],
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
        description: 'The unique identifier of the delivery point',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      200: {
        description: 'Delivery point updated successfully',
      },
      404: {
        description: 'Delivery point not found',
      },
    },
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: DeliveryPointUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_DeliveryPointController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateDeliveryPoint = {
      ...updateDto,
      id,
    };
    const result = await this.deliveryPointService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Partially updates specific fields of a delivery point such as toggling active status.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('delivery-point.patch'))
  @Serialize(DeliveryPointResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a delivery point',
    description: 'Partially updates specific fields of a delivery point without replacing the entire record. Useful for toggling active status or making minor adjustments.',
    operationId: 'patchDeliveryPoint',
    tags: ['Configuration', 'Delivery Point'],
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
        description: 'The unique identifier of the delivery point',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    responses: {
      200: {
        description: 'Delivery point updated successfully',
      },
      404: {
        description: 'Delivery point not found',
      },
    },
  })
  async patch(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: DeliveryPointUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'patch',
        id,
        updateDto,
        version,
      },
      Config_DeliveryPointController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateDeliveryPoint = {
      ...updateDto,
      id,
    };
    const result = await this.deliveryPointService.patch(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a delivery point from active use. Historical procurement records are preserved.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('delivery-point.delete'))
  @Serialize(DeliveryPointResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a delivery point',
    description: 'Removes a delivery point from active use. It will no longer be selectable in new purchase orders, but historical procurement records referencing this delivery point are preserved.',
    operationId: 'deleteDeliveryPoint',
    tags: ['Configuration', 'Delivery Point'],
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
        description: 'Delivery point deleted successfully',
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
      Config_DeliveryPointController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.deliveryPointService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
