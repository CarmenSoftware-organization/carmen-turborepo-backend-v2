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
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  RecipeCategoryCreateDto, RecipeCategoryUpdateDto,
  RecipeCategoryResponseSchema, IUpdateRecipeCategory,
} from './dto/recipe-category.dto';

@Controller('api/config/:bu_code/recipe-category')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_RecipeCategoryController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeCategoryController.name);

  constructor(private readonly recipeCategoryService: Config_RecipeCategoryService) {
    super();
  }

  /**
   * Retrieves a specific recipe category used to classify recipes by meal type or course
   * (e.g., Appetizers, Main Course, Desserts, Beverages) for menu planning and cost analysis.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('recipe-category.findOne'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a recipe category by ID', description: 'Retrieves a specific recipe category used to classify recipes (e.g., Appetizers, Main Course, Desserts, Beverages). Categories help organize the recipe catalog for menu planning and cost analysis.', operationId: 'findOneRecipeCategory', tags: ['Configuration', 'Recipe Category'] })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCategoryService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all recipe categories configured for the business unit, used to organize
   * recipes by meal type or course for structured menu management and kitchen operations.
   */
  @Get()
  @UseGuards(new AppIdGuard('recipe-category.findAll'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipe categories', description: 'Returns all recipe categories configured for the business unit. Used to organize recipes by meal type or course for structured menu management and kitchen operations.', operationId: 'findAllRecipeCategories', tags: ['Configuration', 'Recipe Category'] })
  @ApiUserFilterQueries()
  async findAll(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Query() query?: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query) as unknown;
    const result = await this.recipeCategoryService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Defines a new recipe classification category for organizing the recipe catalog.
   * Recipes can then be assigned to this category for structured menu planning.
   */
  @Post()
  @UseGuards(new AppIdGuard('recipe-category.create'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe category', description: 'Defines a new recipe classification category for organizing the recipe catalog. Recipes can then be assigned to this category for structured menu planning.', operationId: 'createRecipeCategory', tags: ['Configuration', 'Recipe Category'] })
  async create(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Body() createDto: RecipeCategoryCreateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCategoryService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Fully updates an existing recipe category, such as renaming it.
   * Changes affect how recipes are organized and filtered in the catalog.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('recipe-category.update'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe category', description: 'Fully updates an existing recipe category, such as renaming it. Changes affect how recipes are organized and filtered in the catalog.', operationId: 'updateRecipeCategory', tags: ['Configuration', 'Recipe Category'] })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCategoryUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCategory = { ...updateDto, id };
    const result = await this.recipeCategoryService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Partially updates specific fields of a recipe category without replacing
   * the entire record. Useful for toggling active status or making minor adjustments.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe-category.patch'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patch a recipe category', description: 'Partially updates specific fields of a recipe category without replacing the entire record. Useful for toggling active status or making minor adjustments.', operationId: 'patchRecipeCategory', tags: ['Configuration', 'Recipe Category'] })
  async patch(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCategoryUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'patch', id, updateDto, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCategory = { ...updateDto, id };
    const result = await this.recipeCategoryService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a recipe category from the system. Recipes currently assigned to this
   * category should be reassigned before deletion.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe-category.delete'))
  @Serialize(RecipeCategoryResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe category', description: 'Removes a recipe category from the system. Recipes currently assigned to this category should be reassigned before deletion.', operationId: 'deleteRecipeCategory', tags: ['Configuration', 'Recipe Category'] })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeCategoryController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCategoryService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
