import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { Platform_UserClusterService } from './platform_user-cluster.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  IUserClusterUpdate,
  UserClusterDto,
  UserClusterUpdateDto,
} from './dto/user-cluster.dto';
import { ApiVersionMinRequest, ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BaseHttpController } from '@/common';

@Controller('api-system/user/cluster')
@ApiTags('Platform Admin')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Platform_UserClusterController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Platform_UserClusterController.name,
  );

  constructor(
    private readonly platform_userClusterService: Platform_UserClusterService,
  ) {
    super();
  }

  /**
   * Get a user-cluster mapping by ID
   * ค้นหาการเชื่อมโยงผู้ใช้กับคลัสเตอร์เดียวตาม ID
   * @param req - Request object / ออบเจกต์คำขอ
   * @param res - Response object / ออบเจกต์การตอบกลับ
   * @param id - Mapping ID / รหัสการเชื่อมโยง
   * @param version - API version / เวอร์ชัน API
   * @returns User-cluster mapping details / รายละเอียดการเชื่อมโยงผู้ใช้กับคลัสเตอร์
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('userCluster.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User-Cluster mapping ID', type: 'string' })
  @ApiOperation({
    summary: 'Get user-cluster mapping by ID',
    description: 'Retrieves the details of a specific user-to-organization membership, showing which user belongs to which hotel chain or company and their role within it.',
    operationId: 'platformUserCluster_findOne',
    tags: ['Platform Admin', 'User Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-cluster mapping retrieved successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'Mapping not found' },
    },
  })
  async getUserCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getUserCluster',
        id,
        version,
      },
      Platform_UserClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platform_userClusterService.getUserCluster(
      id,
      user_id,
      tenant_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * List all user-cluster mappings with pagination
   * ค้นหารายการการเชื่อมโยงผู้ใช้กับคลัสเตอร์ทั้งหมดพร้อมการแบ่งหน้า
   * @param req - Request object / ออบเจกต์คำขอ
   * @param res - Response object / ออบเจกต์การตอบกลับ
   * @param query - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated mapping list / รายการการเชื่อมโยงแบบแบ่งหน้า
   */
  @Get()
  @UseGuards(new AppIdGuard('userCluster.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all user-cluster mappings',
    description: 'Lists all user-to-organization memberships across the platform, showing which users belong to which hotel chains or companies. Used to manage and audit organizational-level access control.',
    operationId: 'platformUserCluster_findAll',
    tags: ['Platform Admin', 'User Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-cluster mappings retrieved successfully' },
      401: { description: 'Unauthorized' },
    },
  })
  async getUserClusterAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'getUserClusterAll',
        query,
        version,
      },
      Platform_UserClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.platform_userClusterService.getUserClusterAll(
      user_id,
      tenant_id,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Create a user-cluster mapping
   * สร้างการเชื่อมโยงผู้ใช้กับคลัสเตอร์
   * @param req - Request object / ออบเจกต์คำขอ
   * @param res - Response object / ออบเจกต์การตอบกลับ
   * @param body - Mapping creation data / ข้อมูลสำหรับสร้างการเชื่อมโยง
   * @param version - API version / เวอร์ชัน API
   * @returns Created mapping / การเชื่อมโยงที่ถูกสร้าง
   */
  @Post()
  @UseGuards(new AppIdGuard('userCluster.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiBody({ type: UserClusterDto, description: 'Create user-cluster mapping data' })
  @ApiOperation({
    summary: 'Create a user-cluster mapping',
    description: 'Adds a user to a hotel chain or company organization, granting them membership at the cluster level. This is typically the first step before assigning the user to individual business units (properties) within that cluster.',
    operationId: 'platformUserCluster_create',
    tags: ['Platform Admin', 'User Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      201: { description: 'User-cluster mapping created successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
    },
  })
  async CreateUserCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UserClusterDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'CreateUserCluster',
        body,
        version,
      },
      Platform_UserClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platform_userClusterService.createUserCluster(
      body,
      user_id,
      tenant_id,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update a user-cluster mapping
   * อัปเดตการเชื่อมโยงผู้ใช้กับคลัสเตอร์
   * @param req - Request object / ออบเจกต์คำขอ
   * @param res - Response object / ออบเจกต์การตอบกลับ
   * @param id - Mapping ID / รหัสการเชื่อมโยง
   * @param body - Mapping update data / ข้อมูลสำหรับอัปเดตการเชื่อมโยง
   * @param version - API version / เวอร์ชัน API
   * @returns Updated mapping / การเชื่อมโยงที่ถูกอัปเดต
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('userCluster.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User-Cluster mapping ID', type: 'string' })
  @ApiBody({ type: UserClusterUpdateDto, description: 'Update user-cluster mapping data' })
  @ApiOperation({
    summary: 'Update a user-cluster mapping',
    description: 'Modifies an existing user-to-organization membership, such as changing the user\'s role or access level within a hotel chain or company.',
    operationId: 'platformUserCluster_update',
    tags: ['Platform Admin', 'User Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-cluster mapping updated successfully' },
      400: { description: 'Bad request' },
      401: { description: 'Unauthorized' },
      404: { description: 'Mapping not found' },
    },
  })
  async UpdateUserCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: UserClusterUpdateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'UpdateUserCluster',
        id,
        body,
        version,
      },
      Platform_UserClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const data: IUserClusterUpdate = {
      ...body,
      id,
    };
    const result = await this.platform_userClusterService.updateUserCluster(
      data,
      user_id,
      tenant_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Delete a user-cluster mapping
   * ลบการเชื่อมโยงผู้ใช้กับคลัสเตอร์
   * @param req - Request object / ออบเจกต์คำขอ
   * @param res - Response object / ออบเจกต์การตอบกลับ
   * @param id - Mapping ID / รหัสการเชื่อมโยง
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('userCluster.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiParam({ name: 'id', description: 'User-Cluster mapping ID', type: 'string' })
  @ApiOperation({
    summary: 'Delete a user-cluster mapping',
    description: 'Removes a user\'s membership from a hotel chain or company organization. This revokes their organizational-level access and may cascade to remove their business unit assignments within that cluster.',
    operationId: 'platformUserCluster_delete',
    tags: ['Platform Admin', 'User Cluster'],
    deprecated: false,
    security: [{ bearerAuth: [] }],
    responses: {
      200: { description: 'User-cluster mapping deleted successfully' },
      401: { description: 'Unauthorized' },
      404: { description: 'Mapping not found' },
    },
  })
  async DeleteUserCluster(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'DeleteUserCluster',
        id,
        version,
      },
      Platform_UserClusterController.name,
    );
    const { user_id, tenant_id } = ExtractRequestHeader(req);
    const result = await this.platform_userClusterService.deleteUserCluster(
      id,
      user_id,
      tenant_id,
      version,
    );
    this.respond(res, result);
  }
}
