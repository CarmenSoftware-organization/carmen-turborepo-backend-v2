import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { BaseHttpController } from '@/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Controller('api/:bu_code/dashboard')
@ApiTags('Dashboard')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class DashboardController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    DashboardController.name,
  );

  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List dashboards for current user' })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.findAll(user_id, bu_code);
    this.respond(res, result);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dashboard with widgets' })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.findOne(id, user_id, bu_code);
    this.respond(res, result);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dashboard' })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Body() body: unknown,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.create(user_id, bu_code, body);
    this.respond(res, result);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update dashboard metadata' })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.update(id, user_id, bu_code, body);
    this.respond(res, result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a dashboard' })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.delete(id, user_id, bu_code);
    this.respond(res, result);
  }

  @Put(':id/layout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch update widget positions' })
  async updateLayout(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.updateLayout(id, user_id, bu_code, body);
    this.respond(res, result);
  }

  @Post(':id/widget')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add widget to dashboard' })
  async addWidget(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.addWidget(id, user_id, bu_code, body);
    this.respond(res, result);
  }

  @Put(':id/widget/:widget_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update widget configuration' })
  async updateWidget(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Param('widget_id') widget_id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.updateWidget(id, widget_id, user_id, bu_code, body);
    this.respond(res, result);
  }

  @Delete(':id/widget/:widget_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove widget from dashboard' })
  async deleteWidget(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Param('id') id: string,
    @Param('widget_id') widget_id: string,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.dashboardService.deleteWidget(id, widget_id, user_id, bu_code);
    this.respond(res, result);
  }
}
