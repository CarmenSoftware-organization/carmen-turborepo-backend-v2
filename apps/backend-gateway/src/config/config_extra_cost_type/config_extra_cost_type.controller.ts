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
  Req,
  Res,
  HttpCode,
  HttpStatus,
  ConsoleLogger,
  Query,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_ExtraCostTypeService } from './config_extra_cost_type.service';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  ExtraCostTypeCreateDto,
  ExtraCostTypeUpdateDto,
  IUpdateExtraCostType,
  Serialize,
  ZodSerializerInterceptor,
  ExtraCostTypeDetailResponseSchema,
  ExtraCostTypeListItemResponseSchema,
  ExtraCostTypeMutationResponseSchema,
} from '@/common';
import {
  ApiVersionMinRequest,
  ApiUserFilterQueries,
} from 'src/common/decorator/userfilter.decorator';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@Controller('api/config/:bu_code/extra-cost-type')
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_ExtraCostTypeController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ExtraCostTypeController.name,
  );

  constructor(
    private readonly configExtraCostTypeService: Config_ExtraCostTypeService,
  ) {
    super();
  }

  /**
   * Retrieves a specific extra cost type definition (e.g., shipping, insurance, customs duty)
   * used to categorize additional charges on procurement documents beyond product prices.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('extraCostType.findOne'))
  @Serialize(ExtraCostTypeDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an extra cost type by ID', description: 'Retrieves a specific extra cost type definition (e.g., shipping, insurance, customs duty) used to categorize additional charges on procurement documents beyond product prices.', operationId: 'findOneExtraCostType', tags: ['Configuration', 'Extra Cost Type'] })
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
      Config_ExtraCostTypeController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configExtraCostTypeService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all configured extra cost categories for procurement, such as freight,
   * handling, and insurance charges added to purchase orders and goods received notes.
   */
  @Get()
  @UseGuards(new AppIdGuard('extraCostType.findAll'))
  @Serialize(ExtraCostTypeListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all extra cost types', description: 'Returns all configured extra cost categories for procurement. These types are used when adding supplementary charges (e.g., freight, handling, insurance) to purchase orders and goods received notes.', operationId: 'findAllExtraCostTypes', tags: ['Configuration', 'Extra Cost Type'] })
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
      Config_ExtraCostTypeController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.configExtraCostTypeService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new category for additional procurement costs (e.g., shipping, customs, handling fees)
   * that can be applied to purchase orders beyond the product line items.
   */
  @Post()
  @UseGuards(new AppIdGuard('extraCostType.create'))
  @Serialize(ExtraCostTypeMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new extra cost type', description: 'Defines a new category for additional procurement costs (e.g., shipping, customs, handling fees). Once created, it can be used to add supplementary charges to purchase orders.', operationId: 'createExtraCostType', tags: ['Configuration', 'Extra Cost Type'] })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: ExtraCostTypeCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_ExtraCostTypeController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configExtraCostTypeService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing extra cost type definition, such as renaming or reclassifying
   * the cost category. Changes apply to future procurement documents.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('extraCostType.update'))
  @Serialize(ExtraCostTypeMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update an extra cost type', description: 'Modifies an existing extra cost type definition, such as renaming or reclassifying the cost category. Changes apply to future procurement documents.', operationId: 'updateExtraCostType', tags: ['Configuration', 'Extra Cost Type'] })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: ExtraCostTypeUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_ExtraCostTypeController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateExtraCostType = {
      ...updateDto,
      id,
    };
    const result = await this.configExtraCostTypeService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an extra cost type from active use. Historical procurement records are preserved,
   * but it will no longer appear as an option for adding charges to new documents.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('extraCostType.delete'))
  @Serialize(ExtraCostTypeMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete an extra cost type', description: 'Removes an extra cost type from active use. It will no longer appear as an option for adding charges to procurement documents, but historical records are preserved.', operationId: 'deleteExtraCostType', tags: ['Configuration', 'Extra Cost Type'] })
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
      Config_ExtraCostTypeController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configExtraCostTypeService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
