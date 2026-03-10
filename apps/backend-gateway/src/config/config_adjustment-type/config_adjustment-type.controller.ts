import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_AdjustmentTypeService } from './config_adjustment-type.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BaseHttpController } from '@/common';
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
import {
  AdjustmentTypeCreateDto,
  AdjustmentTypeUpdateDto,
  IUpdateAdjustmentType,
} from './dto/adjustment-type.dto';

@Controller('api/config/:bu_code/adjustment-type')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_AdjustmentTypeController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_AdjustmentTypeController.name,
  );

  constructor(
    private readonly config_adjustmentTypeService: Config_AdjustmentTypeService,
  ) {
    super();
  }

  /**
   * Retrieves a specific inventory adjustment type (e.g., spoilage, breakage, theft)
   * that categorizes reasons for stock quantity changes outside normal operations.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('adjustment-type.findOne'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an adjustment type by ID', description: 'Retrieves a specific inventory adjustment type definition (e.g., spoilage, breakage, theft, expiration). Adjustment types categorize the reason for inventory quantity changes outside normal operations.', operationId: 'findOneAdjustmentType', tags: ['Configuration', 'Adjustment Type'] })
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
      Config_AdjustmentTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_adjustmentTypeService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all configured inventory adjustment type categories used when recording
   * stock discrepancies in warehouse operations.
   */
  @Get()
  @UseGuards(new AppIdGuard('adjustment-type.findAll'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all adjustment types', description: 'Returns all configured inventory adjustment type categories. These types are used when recording inventory adjustments to classify the reason for stock discrepancies.', operationId: 'findAllAdjustmentTypes', tags: ['Configuration', 'Adjustment Type'] })
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
      Config_AdjustmentTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_adjustmentTypeService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new inventory adjustment category (e.g., spoilage, breakage, theft)
   * for warehouse staff to select when recording inventory discrepancies.
   */
  @Post()
  @UseGuards(new AppIdGuard('adjustment-type.create'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new adjustment type', description: 'Defines a new inventory adjustment category (e.g., spoilage, breakage, theft). Once created, warehouse staff can select this type when recording inventory discrepancies.', operationId: 'createAdjustmentType', tags: ['Configuration', 'Adjustment Type'] })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: AdjustmentTypeCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_AdjustmentTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_adjustmentTypeService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing inventory adjustment type definition such as renaming or reclassifying.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('adjustment-type.update'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an adjustment type', description: 'Modifies an existing inventory adjustment type definition, such as renaming or updating its classification. Changes apply to all future inventory adjustment records.', operationId: 'updateAdjustmentType', tags: ['Configuration', 'Adjustment Type'] })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: AdjustmentTypeUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_AdjustmentTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateAdjustmentType = {
      ...updateDto,
      id,
    };
    const result = await this.config_adjustmentTypeService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an inventory adjustment type from active use. Historical records are preserved.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('adjustment-type.delete'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an adjustment type', description: 'Removes an inventory adjustment type from active use. Historical adjustment records using this type are preserved, but it will no longer appear as an option for new adjustments.', operationId: 'deleteAdjustmentType', tags: ['Configuration', 'Adjustment Type'] })
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
      Config_AdjustmentTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_adjustmentTypeService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
