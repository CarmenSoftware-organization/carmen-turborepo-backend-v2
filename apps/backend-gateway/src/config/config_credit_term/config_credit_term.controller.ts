import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Query,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_CreditTermService } from './config_credit_term.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  BaseHttpController,
  CreditTermCreateDto,
  CreditTermUpdateDto,
  IUpdateCreditTerm,
  Serialize,
  ZodSerializerInterceptor,
  CreditTermDetailResponseSchema,
  CreditTermListItemResponseSchema,
  CreditTermMutationResponseSchema,
} from '@/common';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { CreditTermCreateRequestDto, CreditTermUpdateRequestDto } from './swagger/request';

@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@Controller('api/config/:bu_code/credit-term')
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_CreditTermController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_CreditTermController.name,
  );

  constructor(
    private readonly configCreditTermService: Config_CreditTermService,
  ) {
    super();
  }

  /**
   * Retrieves a specific payment term definition (e.g., Net 30, Net 60, COD)
   * including due day calculation rules for vendor invoice payment deadlines.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('creditTerm.findOne'))
  @Serialize(CreditTermDetailResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a credit term by ID',
    description: 'Retrieves a specific payment term definition (e.g., Net 30, Net 60, COD) including its due day calculation rules. Credit terms are assigned to vendors to determine invoice payment deadlines.',
    operationId: 'configCreditTerm_findOne',
    tags: ['Configuration', 'Credit Term'],
    responses: {
      200: { description: 'Credit term retrieved successfully' },
      404: { description: 'Credit term not found' },
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
      Config_CreditTermController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configCreditTermService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all payment term definitions (Net 30, Net 60, COD, etc.) used for
   * vendor agreements and invoice due date calculations.
   */
  @Get()
  @UseGuards(new AppIdGuard('creditTerm.findAll'))
  @Serialize(CreditTermListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all credit terms',
    description: 'Returns all payment term definitions configured for the business unit. These terms are used when setting up vendor agreements and calculating invoice due dates for accounts payable.',
    operationId: 'configCreditTerm_findAll',
    tags: ['Configuration', 'Credit Term'],
    responses: { 200: { description: 'Credit terms retrieved successfully' } },
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
      Config_CreditTermController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.configCreditTermService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new payment term (e.g., Net 30, Net 60, COD) with due date calculation rules.
   * Once created, it can be assigned to vendors for invoice payment scheduling.
   */
  @Post()
  @UseGuards(new AppIdGuard('creditTerm.create'))
  @Serialize(CreditTermMutationResponseSchema)
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new credit term',
    description: 'Defines a new payment term (e.g., Net 30, Net 60, COD) with its due date calculation rules. Once created, the credit term can be assigned to vendors for invoice payment scheduling.',
    operationId: 'configCreditTerm_create',
    tags: ['Configuration', 'Credit Term'],
    responses: { 201: { description: 'Credit term created successfully' } },
  })
  @ApiBody({ type: CreditTermCreateRequestDto })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: CreditTermCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_CreditTermController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configCreditTermService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing payment term such as adjusting credit days or payment conditions.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('creditTerm.update'))
  @Serialize(CreditTermMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a credit term',
    description: 'Modifies an existing payment term definition, such as adjusting the number of credit days or payment conditions. Changes affect future invoice due date calculations for vendors using this term.',
    operationId: 'configCreditTerm_update',
    tags: ['Configuration', 'Credit Term'],
    responses: {
      200: { description: 'Credit term updated successfully' },
      404: { description: 'Credit term not found' },
    },
  })
  @ApiBody({ type: CreditTermUpdateRequestDto })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: CreditTermUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_CreditTermController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateCreditTerm = {
      ...updateDto,
      id,
    };
    const result = await this.configCreditTermService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a payment term from active use. Existing vendor agreements using it are preserved.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('creditTerm.delete'))
  @Serialize(CreditTermMutationResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a credit term',
    description: 'Removes a payment term from active use. The term will no longer be assignable to vendors, but existing vendor agreements and historical invoices using this term are preserved.',
    operationId: 'configCreditTerm_delete',
    tags: ['Configuration', 'Credit Term'],
    responses: {
      200: { description: 'Credit term deleted successfully' },
      404: { description: 'Credit term not found' },
    },
  })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_CreditTermController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configCreditTermService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
