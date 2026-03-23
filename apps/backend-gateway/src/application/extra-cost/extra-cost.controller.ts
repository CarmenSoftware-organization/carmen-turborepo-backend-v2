import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { ExtraCostService } from './extra-cost.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  ExtraCostCreateDto,
  ExtraCostUpdateDto,
  Serialize,
} from '@/common';
import {
  ExtraCostDetailResponseSchema,
  ExtraCostListItemResponseSchema,
  ExtraCostMutationResponseSchema,
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
import { ExtraCostCreateRequest, ExtraCostUpdateRequest } from './swagger/request';
import type { IUpdateExtraCost } from '@/common';

@ApiTags('Extra Cost')
@ApiHeaderRequiredXAppId()
@Controller('api/application/:bu_code/extra-cost')
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ExtraCostController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ExtraCostController.name,
  );

  constructor(
    private readonly extraCostService: ExtraCostService,
  ) {
    super();
  }

  /**
   * Retrieves a specific extra cost record with its detail items
   * @param req - HTTP request
   * @param res - HTTP response
   * @param id - Extra cost ID
   * @param bu_code - Business unit code
   * @param version - API version
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('extraCost.findOne'))
  @Serialize(ExtraCostDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an extra cost by ID', description: 'Retrieves a specific extra cost record with its detail line items.', operationId: 'extraCost_findOne', tags: ['Extra Cost'] })
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
      ExtraCostController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.extraCostService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all extra costs with pagination
   * @param req - HTTP request
   * @param res - HTTP response
   * @param bu_code - Business unit code
   * @param query - Pagination parameters
   * @param version - API version
   */
  @Get()
  @UseGuards(new AppIdGuard('extraCost.findAll'))
  @Serialize(ExtraCostListItemResponseSchema)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all extra costs', description: 'Returns all extra cost records with pagination support.', operationId: 'extraCost_findAll', tags: ['Extra Cost'] })
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
      ExtraCostController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.extraCostService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Creates a new extra cost with detail items
   * @param req - HTTP request
   * @param res - HTTP response
   * @param bu_code - Business unit code
   * @param createDto - Creation data
   * @param version - API version
   */
  @Post()
  @UseGuards(new AppIdGuard('extraCost.create'))
  @Serialize(ExtraCostMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new extra cost', description: 'Creates a new extra cost record with optional detail line items.', operationId: 'extraCost_create', tags: ['Extra Cost'] })
  @ApiBody({ type: ExtraCostCreateRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: ExtraCostCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      ExtraCostController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.extraCostService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing extra cost with detail operations (add/update/delete)
   * @param req - HTTP request
   * @param res - HTTP response
   * @param id - Extra cost ID
   * @param bu_code - Business unit code
   * @param updateDto - Update data
   * @param version - API version
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('extraCost.update'))
  @Serialize(ExtraCostMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update an extra cost', description: 'Updates an existing extra cost record. Supports add/update/delete operations on detail line items.', operationId: 'extraCost_update', tags: ['Extra Cost'] })
  @ApiBody({ type: ExtraCostUpdateRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: ExtraCostUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      ExtraCostController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateExtraCost = {
      ...updateDto,
      id,
    };
    const result = await this.extraCostService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Soft deletes an extra cost and all its detail items
   * @param req - HTTP request
   * @param res - HTTP response
   * @param id - Extra cost ID
   * @param bu_code - Business unit code
   * @param version - API version
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('extraCost.delete'))
  @Serialize(ExtraCostMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete an extra cost', description: 'Soft deletes an extra cost and all its associated detail line items.', operationId: 'extraCost_delete', tags: ['Extra Cost'] })
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
      ExtraCostController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.extraCostService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
