import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post, Put, Query, Req, Res, UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_RecipeEquipmentService } from './config_recipe-equipment.service';
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
  RecipeEquipmentCreateDto, RecipeEquipmentUpdateDto,
  RecipeEquipmentResponseSchema, IUpdateRecipeEquipment,
} from './dto/recipe-equipment.dto';

@Controller('api/config/:bu_code/recipe-equipment')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_RecipeEquipmentController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeEquipmentController.name);

  constructor(private readonly recipeEquipmentService: Config_RecipeEquipmentService) {
    super();
  }

  /**
   * Retrieves a specific kitchen equipment definition (e.g., oven, mixer, blender, sous vide)
   * that can be associated with recipes to track required equipment for preparation.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.findOne'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a recipe equipment by ID', description: 'Retrieves a specific kitchen equipment definition (e.g., oven, mixer, blender, sous vide) that can be associated with recipes to track required equipment for preparation.', operationId: 'findOneRecipeEquipment', tags: ['Configuration', 'Recipe Equipment'] })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeEquipmentService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all kitchen equipment types configured for the business unit, used to tag
   * recipes with required equipment for kitchen capacity planning and feasibility assessment.
   */
  @Get()
  @UseGuards(new AppIdGuard('recipe-equipment.findAll'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipe equipment', description: 'Returns all kitchen equipment types configured for the business unit. Used to tag recipes with required equipment for kitchen capacity planning and recipe feasibility assessment.', operationId: 'findAllRecipeEquipment', tags: ['Configuration', 'Recipe Equipment'] })
  @ApiUserFilterQueries()
  async findAll(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Query() query?: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query) as unknown;
    const result = await this.recipeEquipmentService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Defines a new kitchen equipment type that can be associated with recipes,
   * helping track which tools and appliances are needed for recipe preparation.
   */
  @Post()
  @UseGuards(new AppIdGuard('recipe-equipment.create'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe equipment', description: 'Defines a new kitchen equipment type that can be associated with recipes. Helps track which tools and appliances are needed for recipe preparation.', operationId: 'createRecipeEquipment', tags: ['Configuration', 'Recipe Equipment'] })
  async create(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Body() createDto: RecipeEquipmentCreateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeEquipmentService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Fully updates an existing kitchen equipment type definition.
   * Changes affect how recipes reference this equipment.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.update'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe equipment', description: 'Fully updates an existing kitchen equipment type definition. Changes affect how recipes reference this equipment.', operationId: 'updateRecipeEquipment', tags: ['Configuration', 'Recipe Equipment'] })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeEquipmentUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeEquipment = { ...updateDto, id };
    const result = await this.recipeEquipmentService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Partially updates specific fields of a kitchen equipment definition without
   * replacing the entire record.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.patch'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patch a recipe equipment', description: 'Partially updates specific fields of a kitchen equipment definition without replacing the entire record.', operationId: 'patchRecipeEquipment', tags: ['Configuration', 'Recipe Equipment'] })
  async patch(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeEquipmentUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'patch', id, updateDto, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeEquipment = { ...updateDto, id };
    const result = await this.recipeEquipmentService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a kitchen equipment type from the system. Recipes referencing this
   * equipment should be updated before deletion.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.delete'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe equipment', description: 'Removes a kitchen equipment type from the system. Recipes referencing this equipment should be updated before deletion.', operationId: 'deleteRecipeEquipment', tags: ['Configuration', 'Recipe Equipment'] })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeEquipmentService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
