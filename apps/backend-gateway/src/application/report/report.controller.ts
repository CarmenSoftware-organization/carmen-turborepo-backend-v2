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
import { GenerateReportRequestDto, ViewerRequestDto, ReportDataRequestDto } from './swagger/request';
import { ReportTypeResponseDto, ReportTemplateResponseDto, ViewerResponseDto } from './swagger/response';

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
    'x-description-th': 'สร้างรายงาน',
    operationId: 'generateReport',
  } as any)
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
  } as any)
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
    'x-description-th': 'แสดงรายการประเภทรายงานที่มีทั้งหมด',
    operationId: 'listReportTypes',
  } as any)
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by report category', example: 'inventory' })
  @ApiResponse({
    status: 200,
    description: 'Report types retrieved successfully',
    type: [ReportTypeResponseDto],
  } as any)
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
    'x-description-th': 'แสดงรายการแม่แบบรายงานทั้งหมด',
    operationId: 'listReportTemplates',
  } as any)
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiQuery({ name: 'report_group', required: false, description: 'Filter by report group', example: 'inventory' })
  @ApiResponse({
    status: 200,
    description: 'Report templates retrieved successfully',
    type: [ReportTemplateResponseDto],
  } as any)
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
    'x-description-th': 'ดึงข้อมูลแม่แบบรายงานรายการเดียวตาม ID',
    operationId: 'getReportTemplate',
  } as any)
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiParam({ name: 'id', description: 'Report template ID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Report template retrieved successfully',
    type: ReportTemplateResponseDto,
  } as any)
  @ApiResponse({ status: 404, description: 'Report template not found' })
  @HttpCode(HttpStatus.OK)
  async getTemplate(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.reportService.getTemplate(id);
    this.respond(res, { data: result });
  }

  /**
   * View report via external FastReport viewer
   * ส่งข้อมูลไป external viewer แล้วได้ URL กลับมา
   */
  @Post('viewer')
  @ApiOperation({
    summary: 'View report in external viewer',
    description: 'Sends template + data to external FastReport viewer and returns a viewer URL.',
    'x-description-th': 'ดูรายงานผ่าน external viewer',
    operationId: 'viewReport',
  } as any)
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiBody({ type: ViewerRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Viewer URL returned successfully',
    type: ViewerResponseDto,
  } as any)
  @HttpCode(HttpStatus.OK)
  async viewReport(
    @Param('bu_code') bu_code: string,
    @Body() body: ViewerRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      { function: 'viewReport', bu_code, template_id: body.template_id },
      ReportController.name,
    );

    const result = await this.reportService.viewReport(
      bu_code,
      body.template_id,
      body.filters,
    );
    this.respond(res, { data: result });
  }

  /**
   * Get report data as JSON (no PDF render)
   * ดึงข้อมูลรายงานเป็น JSON สำหรับ WebReport viewer
   */
  @Post('data')
  @ApiOperation({
    summary: 'Get report data',
    description: 'Returns JSON data rows for a template without rendering PDF. Used by WebReport viewer.',
    'x-description-th': 'ดึงข้อมูลรายงานเป็น JSON',
    operationId: 'getReportData',
  } as any)
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiBody({ type: ReportDataRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Report data returned successfully',
  } as any)
  @HttpCode(HttpStatus.OK)
  async reportData(
    @Param('bu_code') bu_code: string,
    @Body() body: ReportDataRequestDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      { function: 'reportData', bu_code, template_id: body.template_id },
      ReportController.name,
    );

    const result = await this.reportService.reportData(
      bu_code,
      body.template_id,
      body.filters,
    );
    this.respond(res, { data: result });
  }

  /**
   * Get lookup data for report filters
   * ดึงข้อมูล lookup สำหรับ filter (vendor, location, product, etc.)
   */
  @Get('lookups')
  @ApiOperation({
    summary: 'Get report lookups',
    description: 'Returns lookup data (vendor, location, product, category, etc.) for populating report filter dropdowns.',
    'x-description-th': 'ดึงข้อมูล lookup สำหรับตัวกรองรายงาน',
    operationId: 'getReportLookups',
  } as any)
  @ApiParam({ name: 'bu_code', description: 'Business unit code', example: 'BU001' })
  @ApiQuery({ name: 'types', required: false, description: 'Comma-separated lookup types', example: 'vendor,location,product,category' })
  @ApiResponse({
    status: 200,
    description: 'Lookup data returned successfully',
  } as any)
  @HttpCode(HttpStatus.OK)
  async lookups(
    @Param('bu_code') bu_code: string,
    @Query('types') types: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.debug(
      { function: 'lookups', bu_code, types },
      ReportController.name,
    );

    const result = await this.reportService.lookups(bu_code, types);
    this.respond(res, { data: result });
  }
}
