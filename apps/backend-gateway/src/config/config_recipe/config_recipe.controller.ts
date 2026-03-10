import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_RecipeService } from './config_recipe.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { BaseHttpController, Serialize } from '@/common';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import {
  RecipeCreateDto,
  RecipeUpdateDto,
  RecipeResponseSchema,
  IUpdateRecipe,
} from './dto/recipe.dto';

@Controller('api/config/:bu_code/recipe')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_RecipeController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_RecipeController.name,
  );

  constructor(private readonly recipeService: Config_RecipeService) {
    super();
  }

  /**
   * Retrieves a specific recipe with its full ingredient list, quantities,
   * preparation steps, and yield information for kitchen cost control.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('recipe.findOne'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a recipe by ID',
    description: 'Retrieves a specific recipe with its full ingredient list, quantities, preparation steps, and yield information. Used by kitchen and F&B teams to manage standardized recipes for cost control.',
    operationId: 'findOneRecipe',
    tags: ['Configuration', 'Recipe'],
  })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'findOne', id, version },
      Config_RecipeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Lists all configured recipes with ingredient compositions for menu costing
   * and ingredient demand forecasting.
   */
  @Get()
  @UseGuards(new AppIdGuard('recipe.findAll'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all recipes',
    description: 'Returns all configured recipes with their ingredient compositions. Used by administrators and chefs to manage the recipe catalog for menu costing and ingredient demand forecasting.',
    operationId: 'findAllRecipes',
    tags: ['Configuration', 'Recipe'],
  })
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
      Config_RecipeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query) as unknown;
    const result = await this.recipeService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  /**
   * Creates a new recipe linking products as ingredients with quantities and preparation steps
   * for menu costing, food cost analysis, and inventory consumption tracking.
   */
  @Post()
  @UseGuards(new AppIdGuard('recipe.create'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new recipe',
    description: 'Creates a new recipe linking products as ingredients with specified quantities and preparation steps. The recipe can then be used for menu costing, food cost analysis, and inventory consumption tracking.',
    operationId: 'createRecipe',
    tags: ['Configuration', 'Recipe'],
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: RecipeCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'create', createDto, version },
      Config_RecipeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Fully updates a recipe including its ingredient list, quantities, and preparation instructions.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('recipe.update'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a recipe',
    description: 'Fully updates a recipe including its ingredient list, quantities, and preparation instructions. Changes are reflected in menu cost calculations and ingredient demand projections.',
    operationId: 'updateRecipe',
    tags: ['Configuration', 'Recipe'],
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: RecipeUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'update', id, updateDto, version },
      Config_RecipeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipe = { ...updateDto, id };
    const result = await this.recipeService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Partially updates specific fields of a recipe such as individual ingredient quantities
   * or active status without replacing the entire record.
   */
  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe.patch'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Patch a recipe',
    description: 'Partially updates specific fields of a recipe without replacing the entire record. Useful for adjusting individual ingredient quantities or toggling active status.',
    operationId: 'patchRecipe',
    tags: ['Configuration', 'Recipe'],
  })
  async patch(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: RecipeUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'patch', id, updateDto, version },
      Config_RecipeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipe = { ...updateDto, id };
    const result = await this.recipeService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  /**
   * Removes a recipe from the active catalog. Historical cost data is preserved.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe.delete'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a recipe',
    description: 'Removes a recipe from the active catalog. The recipe will no longer be used for menu costing or ingredient consumption calculations, but historical cost data is preserved.',
    operationId: 'deleteRecipe',
    tags: ['Configuration', 'Recipe'],
  })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      { function: 'delete', id, version },
      Config_RecipeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
