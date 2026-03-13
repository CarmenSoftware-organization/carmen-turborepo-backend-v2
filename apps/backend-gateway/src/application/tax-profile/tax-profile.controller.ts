import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { TaxProfileService } from './tax-profile.service';
import { CreateTaxProfileDto } from './dto/tax-profile.dto';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import {
  IPaginate,
  IPaginateQuery,
  PaginateQuery,
} from 'src/shared-dto/paginate.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  BaseHttpController,
  Serialize,
  ZodSerializerInterceptor,
  TaxProfileDetailResponseSchema,
  TaxProfileListItemResponseSchema,
} from '@/common';

@Controller('api/:bu_code/tax-profile')
@ApiTags('Master Data')
@ApiHeaderRequiredXAppId()
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
export class TaxProfileController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    TaxProfileController.name,
  );

  constructor(
    private readonly taxProfileService: TaxProfileService,
  ) {
    super();
  }

  /**
   * Retrieves a specific tax configuration profile including VAT rates,
   * withholding tax rules, and calculation parameters for procurement transactions.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('taxProfile.findOne'))
  @Serialize(TaxProfileDetailResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a tax profile by ID',
    description: 'Retrieves a specific tax configuration profile including VAT rates, withholding tax rules, and tax calculation parameters applied to procurement transactions and vendor invoices.',
    operationId: 'findOneTaxProfile',
    tags: ['Master Data', 'Tax Profile'],
    responses: {
      200: { description: 'Tax profile retrieved successfully' },
      404: { description: 'Tax profile not found' },
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
      TaxProfileController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.taxProfileService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all tax configuration profiles in the business unit, including
   * VAT rates and withholding tax settings for purchase orders and vendor payments.
   */
  @Get()
  @UseGuards(new AppIdGuard('taxProfile.findAll'))
  @Serialize(TaxProfileListItemResponseSchema)
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all tax profiles',
    description: 'Lists all tax configuration profiles available in the business unit, including VAT rates and withholding tax settings used for calculating taxes on purchase orders and vendor payments.',
    operationId: 'findAllTaxProfiles',
    tags: ['Master Data', 'Tax Profile'],
    responses: {
      200: { description: 'Tax profiles retrieved successfully' },
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
      TaxProfileController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.taxProfileService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }
}
