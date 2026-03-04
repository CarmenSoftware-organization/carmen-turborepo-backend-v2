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
@ApiTags('Config - Recipe Equipment')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_RecipeEquipmentController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeEquipmentController.name);

  constructor(private readonly recipeEquipmentService: Config_RecipeEquipmentService) {
    super();
  }

  @Get(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.findOne'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a recipe equipment by ID', operationId: 'findOneRecipeEquipment', tags: ['config-recipe-equipment', '[Method] Get - Config'] })
  async findOne(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeEquipmentService.findOne(id, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Get()
  @UseGuards(new AppIdGuard('recipe-equipment.findAll'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all recipe equipment', operationId: 'findAllRecipeEquipment', tags: ['config-recipe-equipment', '[Method] Get - Config'] })
  @ApiUserFilterQueries()
  async findAll(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Query() query?: IPaginateQuery, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'findAll', query, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.recipeEquipmentService.findAll(user_id, bu_code, paginate, version);
    this.respond(res, result);
  }

  @Post()
  @UseGuards(new AppIdGuard('recipe-equipment.create'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new recipe equipment', operationId: 'createRecipeEquipment', tags: ['config-recipe-equipment', '[Method] Post - Config'] })
  async create(@Req() req: Request, @Res() res: Response, @Param('bu_code') bu_code: string, @Body() createDto: RecipeEquipmentCreateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeEquipmentService.create(createDto, user_id, bu_code, version);
    this.respond(res, result, HttpStatus.CREATED);
  }

  @Put(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.update'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a recipe equipment', operationId: 'updateRecipeEquipment', tags: ['config-recipe-equipment', '[Method] Put - Config'] })
  async update(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeEquipmentUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'update', id, updateDto, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeEquipment = { ...updateDto, id };
    const result = await this.recipeEquipmentService.update(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Patch(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.patch'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patch a recipe equipment', operationId: 'patchRecipeEquipment', tags: ['config-recipe-equipment', '[Method] Patch - Config'] })
  async patch(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Body() updateDto: RecipeEquipmentUpdateDto, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'patch', id, updateDto, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const data: IUpdateRecipeEquipment = { ...updateDto, id };
    const result = await this.recipeEquipmentService.patch(data, user_id, bu_code, version);
    this.respond(res, result);
  }

  @Delete(':id')
  @UseGuards(new AppIdGuard('recipe-equipment.delete'))
  @Serialize(RecipeEquipmentResponseSchema)
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recipe equipment', operationId: 'deleteRecipeEquipment', tags: ['config-recipe-equipment', '[Method] Delete - Config'] })
  async delete(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Param('bu_code') bu_code: string, @Query('version') version: string = 'latest'): Promise<void> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeEquipmentController.name);
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.recipeEquipmentService.delete(id, user_id, bu_code, version);
    this.respond(res, result);
  }
}
