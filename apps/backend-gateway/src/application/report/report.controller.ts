import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { BaseHttpController } from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/:bu_code/report')
@ApiTags('Report')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class ReportController extends BaseHttpController {
  private readonly logger = new BackendLogger(ReportController.name);

  constructor(private readonly reportService: ReportService) {
    super();
  }

  /**
   * Generate a report synchronously
   */
  @Post('generate')
  @ApiOperation({
    summary: 'Generate report',
    description:
      'Generates a report synchronously. Returns file bytes for PDF/Excel/CSV or JSON data.',
    operationId: 'generateReport',
  })
  @HttpCode(HttpStatus.OK)
  async generate(
    @Param('bu_code') bu_code: string,
    @Body()
    body: {
      report_type: string;
      format?: string;
      filters?: Record<string, unknown>;
      options?: Record<string, unknown>;
      template_id?: string;
    },
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);

    this.logger.debug(
      { function: 'generate', report_type: body.report_type, bu_code },
      ReportController.name,
    );

    const format = body.format || 'json';
    const result = await this.reportService.generate(
      user_id,
      bu_code,
      body.report_type,
      format,
      body.filters as any,
      body.options as any,
      body.template_id,
    );

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.status(HttpStatus.OK).send(result.file_content);
      return;
    }

    // File download
    res.setHeader('Content-Type', result.content_type);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.file_name}"`,
    );
    res.setHeader('X-Row-Count', String(result.row_count));
    res.status(HttpStatus.OK).send(Buffer.from(result.file_content));
  }

  /**
   * List available report types
   */
  @Get('types')
  @ApiOperation({
    summary: 'List report types',
    description: 'Returns all available report types with metadata.',
    operationId: 'listReportTypes',
  })
  @HttpCode(HttpStatus.OK)
  async listTypes(
    @Query('category') category: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.reportService.listTypes(category || undefined);
    this.respond(res, { data: result.types });
  }

  /**
   * List report templates
   */
  @Get('templates')
  @ApiOperation({
    summary: 'List report templates',
    description: 'Returns all active report templates, optionally filtered by report_group.',
    operationId: 'listReportTemplates',
  })
  @HttpCode(HttpStatus.OK)
  async listTemplates(
    @Query('report_group') report_group: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.reportService.listTemplates(
      report_group || undefined,
    );
    this.respond(res, { data: result.templates });
  }

  /**
   * Get a specific template by ID
   */
  @Get('templates/:id')
  @ApiOperation({
    summary: 'Get report template',
    description: 'Returns a single report template by ID.',
    operationId: 'getReportTemplate',
  })
  @HttpCode(HttpStatus.OK)
  async getTemplate(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.reportService.getTemplate(id);
    this.respond(res, { data: result });
  }
}
