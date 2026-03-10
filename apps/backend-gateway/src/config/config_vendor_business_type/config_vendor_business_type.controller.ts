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
  ConsoleLogger,
  Query,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_VendorBusinessTypeService } from './config_vendor_business_type.service';
import { ZodSerializerInterceptor, BaseHttpController } from '@/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  VendorBusinessTypeCreateDto,
  VendorBusinessTypeUpdateDto,
  IUpdateVendorBusinessType,
} from './dto/vendor_business_type.dto';
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

@Controller('api/config/:bu_code/vendor-business-type')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_VendorBusinessTypeController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_VendorBusinessTypeController.name,
  );
  constructor(
    private readonly configVendorBusinessTypeService: Config_VendorBusinessTypeService,
  ) {
    super();
  }

  /**
   * Retrieves a specific vendor business type classification (e.g., food supplier,
   * cleaning supplies, equipment maintenance) used to categorize vendors by specialty.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('vendorBusinessType.findOne'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a vendor business type by ID', description: 'Retrieves a specific vendor business type classification (e.g., food supplier, cleaning supplies, equipment maintenance). Used to categorize vendors by their service or product specialty.', operationId: 'findOneVendorBusinessType', tags: ['Configuration', 'Vendor Business Type'] })
  async findOne(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      Config_VendorBusinessTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configVendorBusinessTypeService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all vendor business type classifications configured for the business unit,
   * helping categorize the vendor directory by industry or service specialty.
   */
  @Get()
  @UseGuards(new AppIdGuard('vendorBusinessType.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all vendor business types', description: 'Returns all vendor business type classifications configured for the business unit. These types help categorize the vendor directory by industry or service specialty for procurement sourcing.', operationId: 'findAllVendorBusinessTypes', tags: ['Configuration', 'Vendor Business Type'] })
  async findAll(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_VendorBusinessTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.configVendorBusinessTypeService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new vendor classification category (e.g., fresh food supplier, beverage distributor).
   * Vendors can then be tagged with this type for organized sourcing and reporting.
   */
  @Post()
  @UseGuards(new AppIdGuard('vendorBusinessType.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new vendor business type', description: 'Defines a new vendor classification category (e.g., fresh food supplier, beverage distributor, laundry service). Vendors can then be tagged with this type for organized sourcing and reporting.', operationId: 'createVendorBusinessType', tags: ['Configuration', 'Vendor Business Type'] })
  async create(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createDto: VendorBusinessTypeCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_VendorBusinessTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configVendorBusinessTypeService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing vendor business type classification, such as renaming or
   * reclassifying it. Changes affect how vendors tagged with this type are categorized.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('vendorBusinessType.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a vendor business type', description: 'Modifies an existing vendor business type classification, such as renaming or reclassifying it. Changes affect how vendors tagged with this type are categorized.', operationId: 'updateVendorBusinessType', tags: ['Configuration', 'Vendor Business Type'] })
  async update(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateDto: VendorBusinessTypeUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_VendorBusinessTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateVendorBusinessType = {
      ...updateDto,
      id,
    };
    const result = await this.configVendorBusinessTypeService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a vendor business type classification from the system. Vendors currently
   * tagged with this type should be reclassified before deletion.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('vendorBusinessType.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a vendor business type', description: 'Removes a vendor business type classification from the system. Vendors currently tagged with this type should be reclassified before deletion.', operationId: 'deleteVendorBusinessType', tags: ['Configuration', 'Vendor Business Type'] })
  async delete(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_VendorBusinessTypeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configVendorBusinessTypeService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
