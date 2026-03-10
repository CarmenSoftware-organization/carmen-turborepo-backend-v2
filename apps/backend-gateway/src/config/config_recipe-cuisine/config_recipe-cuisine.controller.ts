import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_RecipeCuisineService } from './config_recipe-cuisine.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecipeCuisineCreateRequest, RecipeCuisineUpdateRequest } from './swagger/request';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BaseHttpController, Serialize } from '@/common';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ApiUserFilterQueries, ApiVersionMinRequest } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  RecipeCuisineCreateDto, RecipeCuisineUpdateDto,
  RecipeCuisineResponseSchema, IUpdateRecipeCuisine,
} from './dto/recipe-cuisine.dto';

@Controller('api/config/:bu_code/recipe-cuisine')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_RecipeCuisineController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeCuisineController.name);

  constructor(private readonly recipeCuisineService: Config_RecipeCuisineService) {
    super();
  }

  /**
   * Retrieves a specific cuisine type definition (e.g., Thai, Italian, Japanese, Continental)
   * used to classify recipes by culinary origin for menu diversity management.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.findOne'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a recipe cuisine by ID', description: 'Retrieves a specific cuisine type definition (e.g., Thai, Italian, Japanese, Continental) used to classify recipes by culinary origin for menu diversity management.', operationId: 'configRecipeCuisine_findOne', tags: ['Configuration', 'Recipe Cuisine'] })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCuisineService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all cuisine types configured for recipe classification, used to tag recipes
   * by culinary tradition for menu planning and kitchen specialization management.
   */
  @Get()
  @UseGuards(new AppIdGuard('recipe-cuisine.findAll'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipe cuisines', description: 'Returns all cuisine types configured for recipe classification. Used to tag recipes by culinary tradition for menu planning and kitchen specialization management.', operationId: 'configRecipeCuisine_findAll', tags: ['Configuration', 'Recipe Cuisine'] })
  @ApiUserFilterQueries()
  async findAll(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Query() query?: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query) as unknown;
    const result = await this.recipeCuisineService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Defines a new cuisine type for recipe classification (e.g., Mediterranean, Mexican).
   * Recipes can then be tagged with this cuisine for organized menu planning.
   */
  @Post()
  @UseGuards(new AppIdGuard('recipe-cuisine.create'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe cuisine', description: 'Defines a new cuisine type for recipe classification (e.g., Mediterranean, Mexican). Recipes can then be tagged with this cuisine for organized menu planning.', operationId: 'configRecipeCuisine_create', tags: ['Configuration', 'Recipe Cuisine'] })
  @ApiBody({ type: RecipeCuisineCreateRequest })
  async create(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Body() createDto: RecipeCuisineCreateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCuisineService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Fully updates an existing cuisine type definition. Changes affect how recipes
   * tagged with this cuisine are categorized in the menu catalog.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.update'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe cuisine', description: 'Fully updates an existing cuisine type definition. Changes affect how recipes tagged with this cuisine are categorized.', operationId: 'configRecipeCuisine_update', tags: ['Configuration', 'Recipe Cuisine'] })
  @ApiBody({ type: RecipeCuisineUpdateRequest })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCuisineUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCuisine = { ...updateDto, id };
    const result = await this.recipeCuisineService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Partially updates specific fields of a cuisine type definition without replacing
   * the entire record.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.patch'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patch a recipe cuisine', description: 'Partially updates specific fields of a cuisine type definition without replacing the entire record.', operationId: 'configRecipeCuisine_patch', tags: ['Configuration', 'Recipe Cuisine'] })
  @ApiBody({ type: RecipeCuisineUpdateRequest })
  async patch(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeCuisineUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'patch', id, updateDto, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeCuisine = { ...updateDto, id };
    const result = await this.recipeCuisineService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a cuisine type from the system. Recipes currently tagged with this cuisine
   * should be reassigned before deletion.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe-cuisine.delete'))
  @Serialize(RecipeCuisineResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe cuisine', description: 'Removes a cuisine type from the system. Recipes currently tagged with this cuisine should be reassigned before deletion.', operationId: 'configRecipeCuisine_delete', tags: ['Configuration', 'Recipe Cuisine'] })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeCuisineController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeCuisineService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
