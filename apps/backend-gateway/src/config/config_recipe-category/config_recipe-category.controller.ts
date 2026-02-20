import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_RecipeCategoryService } from './config_recipe-category.service';
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
  RecipeCategoryCreateDto, RecipeCategoryUpdateDto,
  RecipeCategoryResponseSchema, IUpdateRecipeCategory,
} from './dto/recipe-category.dto';

@Controller('api/config/:bu_code/recipe-category')
@ApiTags('Config - Recipe Category')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, TenantHeaderGuard)
@ApiBearerAuth()
export class Config_RecipeCategoryController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeCategoryController.name);

  constructor(private readonly recipeCategoryService: Config_RecipeCategoryService) {
    super();
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('recipe-category.findOne'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a recipe category by ID', operationId: 'findOneRecipeCategory', tags: ['config-recipe-category', '[Method] Get - Config'] })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCategoryService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Get()
  @UseGuards(new AppIdGuard('recipe-category.findAll'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipe categories', operationId: 'findAllRecipeCategories', tags: ['config-recipe-category', '[Method] Get - Config'] })
  @ApiUserFilterQueries()
  async findAll(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Query() query?: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query) as any;
    const result = await this.recipeCategoryService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  @Post()
  @UseGuards(new AppIdGuard('recipe-category.create'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe category', operationId: 'createRecipeCategory', tags: ['config-recipe-category', '[Method] Post - Config'] })
  async create(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Body() createDto: RecipeCategoryCreateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCategoryService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Put(':id')
  @UseGuards(new AppIdGuard('recipe-category.update'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe category', operationId: 'updateRecipeCategory', tags: ['config-recipe-category', '[Method] Put - Config'] })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCategoryUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCategory = { ...updateDto, id };
    const result = await this.recipeCategoryService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe-category.patch'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patch a recipe category', operationId: 'patchRecipeCategory', tags: ['config-recipe-category', '[Method] Patch - Config'] })
  async patch(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCategoryUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'patch', id, updateDto, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCategory = { ...updateDto, id };
    const result = await this.recipeCategoryService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe-category.delete'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe category', operationId: 'deleteRecipeCategory', tags: ['config-recipe-category', '[Method] Delete - Config'] })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCategoryService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
