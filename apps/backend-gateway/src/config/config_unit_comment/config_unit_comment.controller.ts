import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  ConsoleLogger,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_UnitCommentService as Config_UnitCommentService } from './config_unit_comment.service';
import { ZodSerializerInterceptor, BaseHttpController } from '@/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { UnitCommentCreateDto, UnitCommentUpdateDto } from 'src/common/dto/unit-comment/unit-comment.dto';

@Controller('api/config/:bu_code/unit-comment')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_UnitCommentController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_UnitCommentController.name,
  );
  constructor(
    private readonly configUnitCommentService: Config_UnitCommentService,
  ) {
    super();
  }

  /**
   * Retrieves a specific predefined comment/note template associated with unit operations,
   * used to streamline data entry for inventory and procurement transactions.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('unitComment.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a unit comment by ID', description: 'Retrieves a specific predefined comment/note template associated with unit operations. These standardized comments streamline data entry for inventory and procurement transactions.', operationId: 'findOneUnitComment', tags: ['Configuration', 'Unit Comment'] })
  async findOne(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      Config_UnitCommentController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUnitCommentService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all predefined comment templates for unit-related operations, providing
   * reusable notes to standardize remarks on procurement and inventory documents.
   */
  @Get()
  @UseGuards(new AppIdGuard('unitComment.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get all unit comments', description: 'Returns all predefined comment templates for unit-related operations. These reusable notes help standardize remarks on procurement and inventory documents.', operationId: 'findAllUnitComments', tags: ['Configuration', 'Unit Comment'] })
  async findAll(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_UnitCommentController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.configUnitCommentService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Defines a new predefined comment template for unit-related operations. Users can
   * quickly select these standardized notes when processing inventory or procurement transactions.
   */
  @Post()
  @UseGuards(new AppIdGuard('unitComment.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new unit comment', description: 'Defines a new predefined comment template for unit-related operations. Users can quickly select these standardized notes when processing inventory or procurement transactions.', operationId: 'createUnitComment', tags: ['Configuration', 'Unit Comment'] })
  async create(
    @Param('bu_code') bu_code: string,
    @Body() createDto: UnitCommentCreateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_UnitCommentController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUnitCommentService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing predefined comment template. Changes are reflected in the
   * comment options available for future transactions.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('unitComment.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a unit comment', description: 'Modifies an existing predefined comment template. Changes are reflected in the comment options available for future transactions.', operationId: 'updateUnitComment', tags: ['Configuration', 'Unit Comment'] })
  async update(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() updateDto: UnitCommentUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_UnitCommentController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUnitCommentService.update(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a predefined comment template from the available options. Historical
   * transactions that used this comment are not affected.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('unitComment.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a unit comment', description: 'Removes a predefined comment template from the available options. Historical transactions that used this comment are not affected.', operationId: 'deleteUnitComment', tags: ['Configuration', 'Unit Comment'] })
  async remove(
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_UnitCommentController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.configUnitCommentService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
