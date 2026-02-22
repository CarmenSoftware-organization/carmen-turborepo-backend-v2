import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_RecipeCuisineService } from './config_recipe-cuisine.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BaseHttpController, Serialize } from '@/common';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ApiUserFilterQueries, ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { TenantHeaderGuard } from 'src/common/guard/tenant-header.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  RecipeCuisineCreateDto, RecipeCuisineUpdateDto,
  RecipeCuisineResponseSchema, IUpdateRecipeCuisine,
} from './dto/recipe-cuisine.dto';

@Controller('api/config/:bu_code/recipe-cuisine')
@ApiTags('Config - Recipe Cuisine')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, TenantHeaderGuard)
@ApiBearerAuth()
export class Config_RecipeCuisineController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeCuisineController.name);

  constructor(private readonly recipeCuisineService: Config_RecipeCuisineService) {
    super();
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.findOne'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a recipe cuisine by ID', operationId: 'findOneRecipeCuisine', tags: ['config-recipe-cuisine', '[Method] Get - Config'] })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCuisineService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Get()
  @UseGuards(new AppIdGuard('recipe-cuisine.findAll'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipe cuisines', operationId: 'findAllRecipeCuisines', tags: ['config-recipe-cuisine', '[Method] Get - Config'] })
  @ApiUserFilterQueries()
  async findAll(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Query() query?: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query) as unknown;
    const result = await this.recipeCuisineService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  @Post()
  @UseGuards(new AppIdGuard('recipe-cuisine.create'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe cuisine', operationId: 'createRecipeCuisine', tags: ['config-recipe-cuisine', '[Method] Post - Config'] })
  async create(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Body() createDto: RecipeCuisineCreateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCuisineService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Put(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.update'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe cuisine', operationId: 'updateRecipeCuisine', tags: ['config-recipe-cuisine', '[Method] Put - Config'] })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCuisineUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCuisine = { ...updateDto, id };
    const result = await this.recipeCuisineService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.patch'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patch a recipe cuisine', operationId: 'patchRecipeCuisine', tags: ['config-recipe-cuisine', '[Method] Patch - Config'] })
  async patch(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCuisineUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'patch', id, updateDto, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCuisine = { ...updateDto, id };
    const result = await this.recipeCuisineService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.delete'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe cuisine', operationId: 'deleteRecipeCuisine', tags: ['config-recipe-cuisine', '[Method] Delete - Config'] })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCuisineService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
