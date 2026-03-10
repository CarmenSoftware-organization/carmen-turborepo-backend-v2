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
import { PeriodService } from './period.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
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
import {
  PeriodCreateDto,
  PeriodUpdateDto,
} from 'src/common/dto/period/period.dto';

@Controller('api')
@ApiTags('Application - Period')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class PeriodController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    PeriodController.name,
  );

  constructor(private readonly periodService: PeriodService) {
    super();
  }

  @Get(':bu_code/period/:id')
  @UseGuards(new AppIdGuard('period.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a period by ID',
    description: 'Retrieves a specific period by its ID',
    operationId: 'findOnePeriod',
    tags: ['Application - Period', '[Method] Get'],
    responses: {
      200: { description: 'Period retrieved successfully' },
      404: { description: 'Period not found' },
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
      PeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.periodService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Get(':bu_code/period')
  @UseGuards(new AppIdGuard('period.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all periods',
    description: 'Retrieves all periods with pagination support',
    operationId: 'findAllPeriods',
    tags: ['Application - Period', '[Method] Get'],
    responses: {
      200: { description: 'Periods retrieved successfully' },
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
      PeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.periodService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  @Post(':bu_code/period')
  @UseGuards(new AppIdGuard('period.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new period',
    description: 'Creates a new fiscal period',
    operationId: 'createPeriod',
    tags: ['Application - Period', '[Method] Post'],
    responses: {
      201: { description: 'Period created successfully' },
      409: { description: 'Period or fiscal year/month already exists' },
    },
  })
  @ApiBody({
    type: PeriodCreateDto,
    description: 'Period data to create',
  })
  async create(
    @Body() createDto: PeriodCreateDto,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'create', createDto, version },
      PeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.periodService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Patch(':bu_code/period/:id')
  @UseGuards(new AppIdGuard('period.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a period',
    description: 'Updates an existing period',
    operationId: 'updatePeriod',
    tags: ['Application - Period', '[Method] Patch'],
    responses: {
      200: { description: 'Period updated successfully' },
      404: { description: 'Period not found' },
    },
  })
  @ApiBody({
    type: PeriodUpdateDto,
    description: 'Period data to update',
  })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: PeriodUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'update', id, updateDto, version },
      PeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.periodService.update(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Post(':bu_code/period/next')
  @UseGuards(new AppIdGuard('period.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Generate next N open periods',
    description:
      'Generates the next N open periods after the last existing period. Skips periods that already exist.',
    operationId: 'generateNextPeriods',
    tags: ['Application - Period', '[Method] Post'],
    responses: {
      201: { description: 'Periods generated successfully' },
    },
  })
  @ApiBody({
    description: 'Number of periods to generate',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 12, description: 'Number of periods to generate' },
        start_day: { type: 'number', example: 1, default: 1, description: 'Start day of each period (1-28), default is 1' },
      },
      required: ['count'],
    },
  })
  async generateNext(
    @Body() body: { count: number; start_day?: number },
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    const startDay = body.start_day ?? 1;
    this.logger.debug(
      { function: 'generateNext', count: body.count, start_day: startDay, version },
      PeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.periodService.generateNext(
      body.count,
      startDay,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Delete(':bu_code/period/:id')
  @UseGuards(new AppIdGuard('period.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a period',
    description: 'Soft deletes an existing period',
    operationId: 'deletePeriod',
    tags: ['Application - Period', '[Method] Delete'],
    responses: {
      200: { description: 'Period deleted successfully' },
      404: { description: 'Period not found' },
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
      PeriodController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.periodService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
