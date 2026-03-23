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
import { Config_ApplicationConfigService } from './config_application-config.service';
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
  ApplicationConfigCreateDto,
  ApplicationConfigUpdateDto,
  IUpdateApplicationConfig,
  UserConfigUpsertDto,
} from './dto/application-config.dto';
import {
  ApplicationConfigCreateRequest,
  ApplicationConfigUpdateRequest,
  UserConfigUpsertRequest,
} from './swagger/request';

@Controller('api/config/:bu_code/application-config')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_ApplicationConfigController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_ApplicationConfigController.name,
  );

  constructor(
    private readonly config_applicationConfigService: Config_ApplicationConfigService,
  ) {
    super();
  }

  @Get('by-key/:key')
  @UseGuards(new AppIdGuard('applicationConfig.findByKey'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get application config by key', description: 'Retrieves a specific application config by its key.', operationId: 'configApplicationConfig_findByKey', tags: ['Configuration', 'Application Config'] })
  async findByKey(
    @Req() req: Request,
    @Res() res: Response,
    @Param('key') key: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findByKey', key, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_applicationConfigService.findByKey(
      key,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Get('user-config/:key')
  @UseGuards(new AppIdGuard('applicationConfig.findUserConfig'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user config by key', description: 'Retrieves a specific user-level config by key for the authenticated user.', operationId: 'configApplicationConfig_findUserConfig', tags: ['Configuration', 'Application Config'] })
  async findUserConfig(
    @Req() req: Request,
    @Res() res: Response,
    @Param('key') key: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findUserConfig', key, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_applicationConfigService.findUserConfig(
      key,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Put('user-config/:key')
  @UseGuards(new AppIdGuard('applicationConfig.upsertUserConfig'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upsert user config by key', description: 'Creates or updates a user-level config for the authenticated user.', operationId: 'configApplicationConfig_upsertUserConfig', tags: ['Configuration', 'Application Config'] })
  @ApiBody({ type: UserConfigUpsertRequest })
  async upsertUserConfig(
    @Req() req: Request,
    @Res() res: Response,
    @Param('key') key: string,
    @Param('bu_code') bu_code: string,
    @Body() upsertDto: UserConfigUpsertDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'upsertUserConfig', key, upsertDto, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_applicationConfigService.upsertUserConfig(
      key,
      upsertDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('applicationConfig.findOne'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get application config by ID', description: 'Retrieves a specific application config by ID.', operationId: 'configApplicationConfig_findOne', tags: ['Configuration', 'Application Config'] })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findOne', id, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_applicationConfigService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Get()
  @UseGuards(new AppIdGuard('applicationConfig.findAll'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all application configs', description: 'Returns all application configs with pagination.', operationId: 'configApplicationConfig_findAll', tags: ['Configuration', 'Application Config'] })
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
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_applicationConfigService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  @Post()
  @UseGuards(new AppIdGuard('applicationConfig.create'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new application config', description: 'Creates a new application-level config entry. Keys must be unique.', operationId: 'configApplicationConfig_create', tags: ['Configuration', 'Application Config'] })
  @ApiBody({ type: ApplicationConfigCreateRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: ApplicationConfigCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'create', createDto, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_applicationConfigService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Put(':id')
  @UseGuards(new AppIdGuard('applicationConfig.update'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an application config', description: 'Modifies the value of an existing application config.', operationId: 'configApplicationConfig_update', tags: ['Configuration', 'Application Config'] })
  @ApiBody({ type: ApplicationConfigUpdateRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: ApplicationConfigUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'update', id, updateDto, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateApplicationConfig = {
      ...updateDto,
      id,
    };
    const result = await this.config_applicationConfigService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  @Delete(':id')
  @UseGuards(new AppIdGuard('applicationConfig.delete'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an application config', description: 'Removes an application config from active use.', operationId: 'configApplicationConfig_delete', tags: ['Configuration', 'Application Config'] })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'delete', id, version },
      Config_ApplicationConfigController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_applicationConfigService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
