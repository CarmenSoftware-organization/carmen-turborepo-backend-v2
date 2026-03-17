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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { BaseHttpController } from '@/common';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { GenerateReportRequestDto } from './swagger/request';
import { ReportTypeResponseDto, ReportTemplateResponseDto } from './swagger/response';

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
   * สร้างรายงานแบบ synchronous
   */
  @Post('generate')
  @ApiOperation({
    summary: 'Generate report',
    description:
      'Generates a report synchronously. Returns file bytes for PDF/Excel/CSV or JSON data.',
    operationId: 'generateReport',
  })
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiBody({ type: GenerateReportRequestDto, description: 'Report generation parameters' })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully. Returns JSON data or file download depending on format.',
    content: {
      'application/json': {
        example: {
          data: [],
          message: 'Success',
          status: 200,
        },
      },
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { schema: { type: 'string', format: 'binary' } },
      'text/csv': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @HttpCode(HttpStatus.OK)
  async generate(
    @Param('bu_code') bu_code: string,
    @Body() body: GenerateReportRequestDto,
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
   * ดึงรายการประเภทรายงานที่มี
   */
  @Get('types')
  @ApiOperation({
    summary: 'List report types',
    description: 'Returns all available report types with metadata including supported formats and category.',
    operationId: 'listReportTypes',
  })
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by report category', example: 'inventory' })
  @ApiResponse({
    status: 200,
    description: 'Report types retrieved successfully',
    type: [ReportTypeResponseDto],
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
   * ดึงรายการเทมเพลตรายงาน
   */
  @Get('templates')
  @ApiOperation({
    summary: 'List report templates',
    description: 'Returns all active report templates, optionally filtered by report_group.',
    operationId: 'listReportTemplates',
  })
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiQuery({ name: 'report_group', required: false, description: 'Filter by report group', example: 'inventory' })
  @ApiResponse({
    status: 200,
    description: 'Report templates retrieved successfully',
    type: [ReportTemplateResponseDto],
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
   * ดึงเทมเพลตรายงานตาม ID
   */
  @Get('templates/:id')
  @ApiOperation({
    summary: 'Get report template',
    description: 'Returns a single report template by ID with full configuration including dialog and content.',
    operationId: 'getReportTemplate',
  })
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiParam({ name: 'id', description: 'Report template ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Report template retrieved successfully',
    type: ReportTemplateResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report template not found' })
  @HttpCode(HttpStatus.OK)
  async getTemplate(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.reportService.getTemplate(id);
    this.respond(res, { data: result });
  }
}
