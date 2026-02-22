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
import { TenantHeaderGuard } from 'src/common/guard/tenant-header.guard';
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
@ApiTags('Config - Recipe')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard, TenantHeaderGuard)
@ApiBearerAuth()
export class Config_RecipeController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_RecipeController.name,
  );

  constructor(private readonly recipeService: Config_RecipeService) {
    super();
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('recipe.findOne'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a recipe by ID',
    operationId: 'findOneRecipe',
    tags: ['config-recipe', '[Method] Get - Config'],
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

  @Get()
  @UseGuards(new AppIdGuard('recipe.findAll'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all recipes',
    operationId: 'findAllRecipes',
    tags: ['config-recipe', '[Method] Get - Config'],
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

  @Post()
  @UseGuards(new AppIdGuard('recipe.create'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new recipe',
    operationId: 'createRecipe',
    tags: ['config-recipe', '[Method] Post - Config'],
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

  @Put(':id')
  @UseGuards(new AppIdGuard('recipe.update'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a recipe',
    operationId: 'updateRecipe',
    tags: ['config-recipe', '[Method] Put - Config'],
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

  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe.patch'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Patch a recipe',
    operationId: 'patchRecipe',
    tags: ['config-recipe', '[Method] Patch - Config'],
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

  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe.delete'))
  @Serialize(RecipeResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a recipe',
    operationId: 'deleteRecipe',
    tags: ['config-recipe', '[Method] Delete - Config'],
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
