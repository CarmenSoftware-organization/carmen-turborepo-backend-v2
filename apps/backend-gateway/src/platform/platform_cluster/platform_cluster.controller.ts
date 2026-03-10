import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ConsoleLogger,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Platform_ClusterService } from './platform_cluster.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ClusterCreateDto, ClusterUpdateDto } from './dto/cluster.dto';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BaseHttpController } from '@/common';

@Controller('api-system/cluster')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Platform_ClusterController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Platform_ClusterController.name,
  );
  constructor(private readonly clusterService: Platform_ClusterService) {
    super();
  }

  /**
   * Lists all top-level organizations (hotel chains or companies) registered in the platform.
   * Supports pagination for managing large numbers of corporate entities.
   */
  @Get()
  @UseGuards(new AppIdGuard('cluster.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get list of clusters',
    description: 'Lists all top-level organizations (hotel chains or companies) registered in the platform with pagination. Each cluster groups multiple business units (hotel properties) under a single corporate entity.',
    operationId: 'getListCluster',
    tags: ['Platform Admin', 'Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Clusters retrieved successfully' },
      401: { description: 'Unauthorized' },
    },
  })
  async getListCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getListCluster',
        query,
        version,
      },
      Platform_ClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.clusterService.getlistCluster(
      user_id,
      tenant_id,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves the details of a specific hotel chain or company.
   * Includes its name, configuration, and the business units (properties) it contains.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('cluster.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'Cluster ID', type: 'string' })
  @ApiOperation({
    summary: 'Get cluster by ID',
    description: 'Retrieves the details of a specific hotel chain or company, including its name, configuration, and the business units (properties) it contains.',
    operationId: 'getClusterById',
    tags: ['Platform Admin', 'Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Cluster retrieved successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'Cluster not found' },
    },
  })
  async getClusterById(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getClusterById',
        id,
        version,
      },
      Platform_ClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.clusterService.getClusterById(id, user_id, tenant_id, version);
    this.respond(res, result);
  }

  /**
   * Onboards a new hotel chain or company into the Carmen ERP platform.
   * The cluster serves as the top-level grouping under which hotel properties are created.
   */
  @Post()
  @UseGuards(new AppIdGuard('cluster.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiBody({ type: ClusterCreateDto, description: 'Create cluster data' })
  @ApiOperation({
    summary: 'Create a new cluster',
    description: 'Onboards a new hotel chain or company into the Carmen ERP platform. The cluster serves as the top-level organizational grouping under which individual hotel properties (business units) will be created.',
    operationId: 'createCluster',
    tags: ['Platform Admin', 'Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      201: { description: 'Cluster created successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  })
  async createCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createClusterDto: ClusterCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'createCluster',
        createClusterDto,
        version,
      },
      Platform_ClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.clusterService.createCluster(
      createClusterDto,
      user_id,
      tenant_id,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies the details of an existing hotel chain or company.
   * Updates may include name, contact information, or subscription settings.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('cluster.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'Cluster ID', type: 'string' })
  @ApiBody({ type: ClusterUpdateDto, description: 'Update cluster data' })
  @ApiOperation({
    summary: 'Update a cluster',
    description: 'Modifies the details of an existing hotel chain or company, such as its name, contact information, or subscription settings.',
    operationId: 'updateCluster',
    tags: ['Platform Admin', 'Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Cluster updated successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
      404: { description: 'Cluster not found' },
    },
  })
  async updateCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateClusterDto: ClusterUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'updateCluster',
        id,
        updateClusterDto,
        version,
      },
      Platform_ClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    updateClusterDto.id = id;
    const result = await this.clusterService.updateCluster(
      updateClusterDto,
      user_id,
      tenant_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes a hotel chain or company from the platform.
   * Affects all business units and user assignments under this cluster.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('cluster.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'Cluster ID', type: 'string' })
  @ApiOperation({
    summary: 'Delete a cluster',
    description: 'Removes a hotel chain or company from the platform. This is a significant operation as it affects all business units and user assignments under this cluster.',
    operationId: 'deleteCluster',
    tags: ['Platform Admin', 'Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'Cluster deleted successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'Cluster not found' },
    },
  })
  async deleteCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'deleteCluster',
        id,
        version,
      },
      Platform_ClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.clusterService.deleteCluster(id, user_id, tenant_id, version);
    this.respond(res, result);
  }
}
