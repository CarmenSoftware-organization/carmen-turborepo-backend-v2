import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common'
import { Response } from 'express';
import { KeycloakGuard } from 'src/auth'
import { ConfigApplicationRoleService } from './config_application_role.service'
import { ZodSerializerInterceptor, BaseHttpController } from '@/common'
import { CreateConfigApplicationRoleDto, UpdateConfigApplicationRoleDto } from './dto/application_role.dto'
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto'
import { ExtractRequestHeader } from 'src/common/helpers/extract_header'
import { BackendLogger } from 'src/common/helpers/backend.logger'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator'
import { CreateApplicationRoleRequest, UpdateApplicationRoleRequest } from './swagger/request'

@Controller('api/config/:bu_code/application-roles')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ConfigApplicationRoleController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ConfigApplicationRoleController.name,
  );
  constructor(
    private readonly configApplicationRoleService: ConfigApplicationRoleService,
  ) {
    super();
  }

  /**
   * Lists all defined application roles (e.g., Admin, Manager, Purchaser, Requestor)
   * that determine system feature access for each user.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all application roles', description: 'Returns all defined application roles (e.g., Admin, Manager, Purchaser, Requestor) used for access control. Roles determine which system features and data each user can access.', operationId: 'configApplicationRole_findAll', tags: ['Configuration', 'Application Role'] })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest'
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        user_id: ExtractRequestHeader(req).user_id,
        bu_code,
        query,
        version,
      },
      ConfigApplicationRoleController.name,
    )
    const { user_id } = ExtractRequestHeader(req)
    const paginate = PaginateQuery(query)

    const result = await this.configApplicationRoleService.findAll(paginate, user_id, bu_code, version)
    this.respond(res, result);
  }

  /**
   * Retrieves a specific application role with its associated permissions
   * to review what system capabilities are granted.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get an application role by ID', description: 'Retrieves a specific application role definition with its associated permissions. Used to review what system capabilities are granted to users assigned this role.', operationId: 'configApplicationRole_findOne', tags: ['Configuration', 'Application Role'] })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest'
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req)

    const result = await this.configApplicationRoleService.findOne(id, user_id, bu_code, version)
    this.respond(res, result);
  }

  /**
   * Defines a new application role (e.g., Department Head, Finance Controller)
   * that can be assigned permissions and then granted to users.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new application role', description: 'Defines a new application role for access control (e.g., Department Head, Finance Controller). Once created, the role can be assigned permissions and then assigned to users.', operationId: 'configApplicationRole_create', tags: ['Configuration', 'Application Role'] })
  @ApiBody({ type: CreateApplicationRoleRequest })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() createConfigApplicationRoleDto: CreateConfigApplicationRoleDto,
    @Query('version') version: string = 'latest'
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);

    const result = await this.configApplicationRoleService.create(createConfigApplicationRoleDto, user_id, bu_code, version)
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing application role's name or permission set.
   * Changes immediately affect all users assigned this role.
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an application role', description: 'Modifies an existing application role definition, such as updating its name or permission set. Changes immediately affect all users currently assigned this role.', operationId: 'configApplicationRole_update', tags: ['Configuration', 'Application Role'] })
  @ApiBody({ type: UpdateApplicationRoleRequest })
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() updateConfigApplicationRoleDto: UpdateConfigApplicationRoleDto,
    @Query('version') version: string = 'latest'
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);

    const result = await this.configApplicationRoleService.update({ id, ...updateConfigApplicationRoleDto }, user_id, bu_code, version)
    this.respond(res, result);
  }

  /**
   * Removes an application role from the system. Users with this role lose its permissions.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an application role', description: 'Removes an application role from the system. Users previously assigned this role will lose its associated permissions. Ensure users are reassigned to appropriate roles before deletion.', operationId: 'configApplicationRole_delete', tags: ['Configuration', 'Application Role'] })
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query('version') version: string = 'latest'
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);

    const result = await this.configApplicationRoleService.remove(id, user_id, bu_code, version)
    this.respond(res, result);
  }


}
