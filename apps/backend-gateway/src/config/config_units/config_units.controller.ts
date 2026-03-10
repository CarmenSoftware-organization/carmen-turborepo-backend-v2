import {
  Controller,
  Get,
  ConsoleLogger,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_UnitsService } from './config_units.service';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UnitCreateRequestDto, UnitUpdateRequestDto } from './swagger/request';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  UnitsCreateDto,
  UnitsUpdateDto,
  IUpdateUnits,
  Serialize,
  ZodSerializerInterceptor,
  UnitDetailResponseSchema,
  UnitListItemResponseSchema,
  UnitMutationResponseSchema,
} from '@/common';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/units')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_UnitsController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_UnitsController.name,
  );

  constructor(private readonly config_unitsService: Config_UnitsService) {
    super();
  }

  /**
   * Retrieves a specific unit of measurement definition (e.g., kg, litre, piece, case)
   * used for product ordering, inventory counting, and recipe quantities.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('unit.findOne'))
  @Serialize(UnitDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a unit by ID',
    description: 'Retrieves a specific unit of measurement definition (e.g., kg, litre, piece, case) used for product ordering, inventory counting, and recipe ingredient quantities.',
    operationId: 'configUnits_findOne',
    tags: ['Configuration', 'Units'],
    responses: { 200: { description: 'Unit retrieved successfully' } },
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
      Config_UnitsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_unitsService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all configured units of measurement (kg, litre, piece, dozen, etc.)
   * referenced by products, recipes, and procurement documents.
   */
  @Get()
  @UseGuards(new AppIdGuard('unit.findAll'))
  @Serialize(UnitListItemResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all units',
    description: 'Returns all configured units of measurement available in the system. These units are referenced by products, recipes, and procurement documents to ensure consistent quantity tracking.',
    operationId: 'configUnits_findAll',
    tags: ['Configuration', 'Units'],
    responses: { 200: { description: 'Units retrieved successfully' } },
  })
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
      Config_UnitsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_unitsService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new unit of measurement for use in product definitions,
   * recipe ingredients, and procurement documents.
   */
  @Post()
  @UseGuards(new AppIdGuard('unit.create'))
  @Serialize(UnitMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new unit',
    description: 'Defines a new unit of measurement (e.g., kg, litre, dozen, case) in the system. The unit becomes available for assignment to products, recipe ingredients, and procurement documents.',
    operationId: 'configUnits_create',
    tags: ['Configuration', 'Units'],
    responses: { 201: { description: 'Unit created successfully' } },
  })
  @ApiBody({ type: UnitCreateRequestDto })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: UnitsCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_UnitsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_unitsService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing unit of measurement definition such as name or conversion factors.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('unit.update'))
  @Serialize(UnitMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a unit',
    description: 'Modifies an existing unit of measurement definition, such as updating its name or conversion factors. Changes affect how quantities are displayed across procurement and inventory modules.',
    operationId: 'configUnits_update',
    tags: ['Configuration', 'Units'],
    responses: { 200: { description: 'Unit updated successfully' } },
  })
  @ApiBody({ type: UnitUpdateRequestDto })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: UnitsUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_UnitsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateUnits = {
      ...updateDto,
      id,
    };
    const result = await this.config_unitsService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a unit of measurement from the system.
   * Existing references in historical data are preserved.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('unit.delete'))
  @Serialize(UnitMutationResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a unit',
    description: 'Removes a unit of measurement from the system. The unit will no longer be available for new product or procurement configurations, but existing references in historical data are preserved.',
    operationId: 'configUnits_delete',
    tags: ['Configuration', 'Units'],
    responses: { 200: { description: 'Unit deleted successfully' } },
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
      Config_UnitsController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_unitsService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
