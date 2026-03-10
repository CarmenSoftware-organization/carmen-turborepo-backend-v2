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
  Query,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { PhysicalCountPeriodService } from './physical-count-period.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  PhysicalCountPeriodCreateRequestDto,
  PhysicalCountPeriodUpdateRequestDto,
} from './swagger/request';
import { BaseHttpController } from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { PhysicalCountPeriodCreateDto, PhysicalCountPeriodUpdateDto } from 'src/common/dto/physical-count-period/physical-count-period.dto';

@Controller('api')
@ApiTags('Inventory')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class PhysicalCountPeriodController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PhysicalCountPeriodController.name,
  );

  constructor(
    private readonly physicalCountPeriodService: PhysicalCountPeriodService,
  ) {
    super();
  }

  /**
   * Finds the physical count period closest to today, helping warehouse staff
   * identify the current or upcoming inventory verification window.
   */
  @Get(':bu_code/physical-count-period/nearest')
  @UseGuards(new AppIdGuard('physicalCountPeriod.nearest'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get nearest physical count period',
    description: 'Finds the physical count period closest to today, helping warehouse staff quickly identify the current or upcoming inventory verification window they should be working on.',
    operationId: 'findNearestPhysicalCountPeriod',
    tags: ['Inventory', 'Physical Count Period'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Nearest physical count period retrieved successfully' },
      404: { description: 'No physical count period found' },
    },
  })
  async findNearest(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findNearest', version },
      PhysicalCountPeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountPeriodService.findNearest(user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Retrieves a specific physical count time window, including its date range
   * and status, to determine when inventory verification must be completed.
   */
  @Get(':bu_code/physical-count-period/:id')
  @UseGuards(new AppIdGuard('physicalCountPeriod.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a physical count period by ID',
    description: 'Retrieves the details of a specific physical count time window, including its date range and status, to determine when inventory verification must be completed.',
    operationId: 'findOnePhysicalCountPeriod',
    tags: ['Inventory', 'Physical Count Period'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count Period ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count period retrieved successfully' },
      404: { description: 'Physical count period not found' },
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
      { function: 'findOne', id, version },
      PhysicalCountPeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountPeriodService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all defined physical count periods for the business unit, allowing
   * inventory managers to plan and schedule recurring stock verification cycles.
   */
  @Get(':bu_code/physical-count-period/')
  @UseGuards(new AppIdGuard('physicalCountPeriod.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all physical count periods',
    description: 'Lists all defined physical count periods for the business unit, allowing inventory managers to plan and schedule recurring stock verification cycles.',
    operationId: 'findAllPhysicalCountPeriods',
    tags: ['Inventory', 'Physical Count Period'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count periods retrieved successfully' },
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
      { function: 'findAll', query, version },
      PhysicalCountPeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.physicalCountPeriodService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Defines a new time window during which physical inventory counts must
   * be completed, establishing the schedule for periodic stock verification.
   */
  @Post(':bu_code/physical-count-period')
  @UseGuards(new AppIdGuard('physicalCountPeriod.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new physical count period',
    description: 'Defines a new time window during which physical inventory counts must be completed, establishing the schedule for periodic stock verification across storage locations.',
    operationId: 'createPhysicalCountPeriod',
    tags: ['Inventory', 'Physical Count Period'],
    parameters: [
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      201: { description: 'Physical count period created successfully' },
      400: { description: 'Invalid request body' },
      409: { description: 'Physical count period with same dates already exists' },
    },
  })
  @ApiBody({ type: PhysicalCountPeriodCreateRequestDto })
  async create(
    @Body() createDto: PhysicalCountPeriodCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'create', createDto, version },
      PhysicalCountPeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountPeriodService.create({ ...createDto }, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies the date range or status of a physical count period, such as
   * extending the deadline when staff need more time for stock verification.
   */
  @Patch(':bu_code/physical-count-period/:id')
  @UseGuards(new AppIdGuard('physicalCountPeriod.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a physical count period',
    description: 'Modifies the date range or status of a physical count period, such as extending the deadline when warehouse staff need additional time to complete stock verification.',
    operationId: 'updatePhysicalCountPeriod',
    tags: ['Inventory', 'Physical Count Period'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count Period ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count period updated successfully' },
      404: { description: 'Physical count period not found' },
    },
  })
  @ApiBody({ type: PhysicalCountPeriodUpdateRequestDto })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: PhysicalCountPeriodUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'update', id, updateDto, version },
      PhysicalCountPeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountPeriodService.update(id, { ...updateDto }, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a physical count period created in error. Periods with
   * associated physical counts cannot be deleted.
   */
  @Delete(':bu_code/physical-count-period/:id')
  @UseGuards(new AppIdGuard('physicalCountPeriod.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a physical count period',
    description: 'Removes a physical count period that was created in error or is no longer needed. Periods with associated physical counts cannot be deleted.',
    operationId: 'deletePhysicalCountPeriod',
    tags: ['Inventory', 'Physical Count Period'],
    parameters: [
      { name: 'id', in: 'path', required: true, description: 'Physical Count Period ID' },
      { name: 'bu_code', in: 'path', required: true, description: 'Business Unit Code' },
    ],
    responses: {
      200: { description: 'Physical count period deleted successfully' },
      404: { description: 'Physical count period not found' },
    },
  })
  async delete(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'delete', id, version },
      PhysicalCountPeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.physicalCountPeriodService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
