import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_DepartmentUserService } from './config_department-user.service';
import { ZodSerializerInterceptor, BaseHttpController } from '@/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiHideProperty,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiVersionMinRequest,
  ApiUserFilterQueries,
} from 'src/common/decorator/userfilter.decorator';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { DepartmentUserCreateRequest, DepartmentUserUpdateRequest } from './swagger/request';


@Controller('api/config/:bu_code/department-user')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_DepartmentUserController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DepartmentUserController.name,
  );

  constructor(
    private readonly config_departmentUserService: Config_DepartmentUserService,
  ) {
    super();
  }

  /**
   * Retrieve a department-user assignment by ID
   * ค้นหารายการเดียวตาม ID ของการกำหนดแผนก-ผู้ใช้
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param id - Department-user assignment ID / รหัสการกำหนดแผนก-ผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Department-user assignment detail / รายละเอียดการกำหนดแผนก-ผู้ใช้
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('departmentUser.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Get a department-user assignment by ID',
    description: 'Retrieves a specific department-user assignment record, showing which users are assigned to a particular hotel department for requisition and approval permissions.',
    operationId: 'configDepartmentUser_findOne',
    tags: ['Configuration', 'Department User'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Department-user assignment retrieved successfully',
      },
    },
  })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * List all department-user assignments with pagination
   * ค้นหารายการทั้งหมดของการกำหนดแผนก-ผู้ใช้พร้อมการแบ่งหน้า
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param query - Pagination query parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of department-user assignments / รายการการกำหนดแผนก-ผู้ใช้แบบแบ่งหน้า
   */
  @Get()
  @UseGuards(new AppIdGuard('departmentUser.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all department-user assignments',
    description: 'Returns all department-user assignments for the business unit. Used by administrators to manage which staff members belong to each hotel department for requisition routing.',
    operationId: 'configDepartmentUser_findAll',
    tags: ['Configuration', 'Department User'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      200: {
        description: 'Department-user assignments retrieved successfully',
      },
    },
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_departmentUserService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Create a new department-user assignment
   * สร้างการกำหนดแผนก-ผู้ใช้ใหม่
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param createDto - Department-user assignment creation data / ข้อมูลสำหรับสร้างการกำหนดแผนก-ผู้ใช้
   * @param version - API version / เวอร์ชัน API
   * @returns Created department-user assignment / การกำหนดแผนก-ผู้ใช้ที่สร้างแล้ว
   */
  @Post()
  @UseGuards(new AppIdGuard('departmentUser.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Create a new department-user assignment',
    description: 'Creates a new department-user assignment, linking a user to a hotel department. This determines which department the user can create requisitions for and participate in approval workflows.',
    operationId: 'configDepartmentUser_create',
    tags: ['Configuration', 'Department User'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'version',
        in: 'query',
        required: false,
      },
    ],
    responses: {
      201: {
        description: 'Department-user assignment created successfully',
      },
    },
  })
  @ApiBody({ type: DepartmentUserCreateRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Update an existing department-user assignment
   * อัปเดตการกำหนดแผนก-ผู้ใช้ที่มีอยู่
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param id - Department-user assignment ID / รหัสการกำหนดแผนก-ผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Department-user assignment update data / ข้อมูลสำหรับอัปเดตการกำหนดแผนก-ผู้ใช้
   * @param version - API version / เวอร์ชัน API
   * @returns Updated department-user assignment / การกำหนดแผนก-ผู้ใช้ที่อัปเดตแล้ว
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('departmentUser.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Update a department-user assignment',
    description: 'Modifies an existing department-user assignment, such as changing the user role within the department or updating assignment details.',
    operationId: 'configDepartmentUser_update',
    tags: ['Configuration', 'Department User'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Department-user assignment updated successfully',
      },
    },
  })
  @ApiBody({ type: DepartmentUserUpdateRequest })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.update(
      id,
      updateDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Delete a department-user assignment by ID
   * ลบการกำหนดแผนก-ผู้ใช้ตาม ID
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param id - Department-user assignment ID / รหัสการกำหนดแผนก-ผู้ใช้
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param version - API version / เวอร์ชัน API
   * @returns Deletion result / ผลลัพธ์การลบ
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('departmentUser.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({
    summary: 'Delete a department-user assignment',
    description: 'Removes a department-user assignment, unlinking a user from a hotel department. The user will no longer be able to create requisitions for or approve documents in that department.',
    operationId: 'configDepartmentUser_delete',
    tags: ['Configuration', 'Department User'],
    deprecated: false,
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
    responses: {
      200: {
        description: 'Department-user assignment deleted successfully',
      },
    },
  })
  async remove(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_DepartmentUserController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_departmentUserService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
