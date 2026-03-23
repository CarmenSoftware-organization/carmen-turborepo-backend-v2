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
import { Config_DimensionService } from './config_dimension.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  DimensionCreateDto,
  DimensionUpdateDto,
  IUpdateDimension,
} from './dto/dimension.dto';
import {
  DimensionCreateRequest,
  DimensionUpdateRequest,
} from './swagger/request';

@Controller('api/config/:bu_code/dimension')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_DimensionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DimensionController.name,
  );

  constructor(
    private readonly config_dimensionService: Config_DimensionService,
  ) {
    super();
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('dimension.findOne'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a dimension by ID', description: 'Retrieves a specific dimension definition with its display-in configurations.', operationId: 'configDimension_findOne', tags: ['Configuration', 'Dimension'] })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findOne', id, version },
      Config_DimensionController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_dimensionService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Get()
  @UseGuards(new AppIdGuard('dimension.findAll'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all dimensions', description: 'Returns all configured dimensions with pagination.', operationId: 'configDimension_findAll', tags: ['Configuration', 'Dimension'] })
  @ApiUserFilterQueries()
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findAll', query, version },
      Config_DimensionController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_dimensionService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  @Post()
  @UseGuards(new AppIdGuard('dimension.create'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dimension', description: 'Creates a new dimension definition with optional display-in configurations.', operationId: 'configDimension_create', tags: ['Configuration', 'Dimension'] })
  @ApiBody({ type: DimensionCreateRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: DimensionCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'create', createDto, version },
      Config_DimensionController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_dimensionService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Put(':id')
  @UseGuards(new AppIdGuard('dimension.update'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a dimension', description: 'Modifies an existing dimension definition and its display-in configurations.', operationId: 'configDimension_update', tags: ['Configuration', 'Dimension'] })
  @ApiBody({ type: DimensionUpdateRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: DimensionUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'update', id, updateDto, version },
      Config_DimensionController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateDimension = {
      ...updateDto,
      id,
    };
    const result = await this.config_dimensionService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Delete(':id')
  @UseGuards(new AppIdGuard('dimension.delete'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a dimension', description: 'Removes a dimension and its display-in configurations from active use.', operationId: 'configDimension_delete', tags: ['Configuration', 'Dimension'] })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'delete', id, version },
      Config_DimensionController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_dimensionService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
