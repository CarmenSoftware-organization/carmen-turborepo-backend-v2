import { Controller, Get, Param, Query, Req, Res, UseGuards, UseInterceptors, HttpCode, HttpStatus } from '@nestjs/common'
import { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger'
import { KeycloakGuard } from '../../auth/guards/keycloak.guard'
import { ConfigPermissionService } from './config_permission.service'
import { ZodSerializerInterceptor, BaseHttpController } from '@/common'
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto'
import { ExtractRequestHeader } from 'src/common/helpers/extract_header'
import { BackendLogger } from 'src/common/helpers/backend.logger'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator'
import { ApiUserFilterQueries } from 'src/common/decorator/userfilter.decorator'

@Controller('api/config/:bu_code/permissions')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@ApiBearerAuth()
@UseGuards(KeycloakGuard)
export class ConfigPermissionController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    ConfigPermissionService.name,
  );
  constructor(
    private readonly configPermissionService: ConfigPermissionService,
  ) {
    super();
  }

  /**
   * Lists all granular permission definitions available in the system, used for
   * role-based access control to specific features and actions.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all permissions', description: 'Returns all granular permission definitions available in the system. Permissions control access to specific features and actions, and are assigned to application roles for role-based access control.', operationId: 'configPermission_findAll', tags: ['Configuration', 'Permission'] })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query?: IPaginateQuery,
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
      ConfigPermissionController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query)

    const result = await this.configPermissionService.findAll(paginate, user_id, bu_code, version);
    this.respond(res, result);
  }
}
