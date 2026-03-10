import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Config_UserLocationService } from './config_user-location.service';
import { ZodSerializerInterceptor } from '@/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/user/location')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_UserLocationController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_UserLocationController.name,
  );
  constructor(
    private readonly config_userLocationService: Config_UserLocationService,
  ) {}

  /**
   * Retrieves all users who have access to a specific storage location, determining
   * which staff members can perform inventory operations at this warehouse or store.
   */
  @Get(':locationId')
  @UseGuards(new AppIdGuard('userLocation.getUsersByLocationId'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get users by location ID', description: 'Retrieves all users who have access to a specific storage location. This determines which staff members can perform inventory operations (stock-in, stock-out, transfers) at this location.', operationId: 'getUsersByLocationId', tags: ['Configuration', 'User Location'] })
  async getUsersByLocationId(
    @Param('bu_code') bu_code: string,
    @Param('locationId') locationId: string,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'getUsersByLocationId',
        locationId,
        version,
      },
      Config_UserLocationController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    return this.config_userLocationService.getUsersByLocationId(
      locationId,
      user_id,
      bu_code,
      version,
    );
  }

  /**
   * Updates the set of users assigned to a specific storage location, controlling
   * which staff members can perform inventory operations at this warehouse or store.
   */
  @Put(':locationId')
  @UseGuards(new AppIdGuard('userLocation.managerUserLocation'))
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Manage user-location assignments', description: 'Updates the set of users assigned to a specific storage location. Controls which staff members can perform inventory operations at this warehouse or store.', operationId: 'managerUserLocation', tags: ['Configuration', 'User Location'] })
  async managerUserLocation(
    @Param('bu_code') bu_code: string,
    @Param('locationId') locationId: string,
    @Body() updateDto: Record<string, unknown>,
    @Req() req: Request,
    @Query('version') version: string = 'latest',
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'managerUserLocation',
        locationId,
        updateDto,
        version,
      },
      Config_UserLocationController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    return this.config_userLocationService.managerUserLocation(
      locationId,
      updateDto,
      user_id,
      bu_code,
      version,
    );
  }
}
