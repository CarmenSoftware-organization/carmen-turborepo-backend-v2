import { Injectable, OnModuleInit, Inject, HttpException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { envConfig } from 'src/libs/config.env';

// gRPC service interface matching report.proto
interface ReportServiceGrpc {
  Generate(request: GenerateRequest): Observable<GenerateResponse>;
  GenerateAsync(request: GenerateRequest): Observable<AsyncResponse>;
  ListReportTypes(request: ListTypesRequest): Observable<ListTypesResponse>;
  GetJobStatus(request: JobStatusRequest): Observable<JobStatusResponse>;
  GetReportHistory(request: HistoryRequest): Observable<HistoryResponse>;
  ListReportTemplates(request: ListReportTemplatesRequest): Observable<ListReportTemplatesResponse>;
  GetReportTemplate(request: GetReportTemplateRequest): Observable<ReportTemplateResponse>;
  CreateSchedule(request: CreateScheduleRequest): Observable<ScheduleResponse>;
  ListSchedules(request: ListSchedulesRequest): Observable<ListSchedulesResponse>;
  DeleteSchedule(request: DeleteScheduleRequest): Observable<DeleteScheduleResponse>;
}

// Request/Response types
interface TenantContext {
  user_id: string;
  bu_codes: string[];
  cluster_id?: string;
  request_id?: string;
}

interface ReportFilters {
  date_from?: string;
  date_to?: string;
  location_ids?: string[];
  department_ids?: string[];
  vendor_ids?: string[];
  product_ids?: string[];
  category_ids?: string[];
  status?: string[];
}

interface ReportOptions {
  title?: string;
  locale?: string;
  timezone?: string;
  page_size?: string;
  orientation?: string;
  include_summary?: boolean;
  group_by?: string;
  sort_by?: string;
  sort_order?: string;
}

interface GenerateRequest {
  context: TenantContext;
  report_type: string;
  format: number;
  filters?: ReportFilters;
  options?: ReportOptions;
  template_id?: string;
}

interface GenerateResponse {
  file_content: Buffer;
  file_name: string;
  content_type: string;
  file_size: number;
  row_count: number;
}

interface AsyncResponse {
  job_id: string;
  message: string;
}

interface ListTypesRequest {
  context?: TenantContext;
  category?: string;
}

interface ListTypesResponse {
  types: Array<{
    report_type: string;
    name: string;
    description: string;
    category: number;
    supported_formats: number[];
  }>;
}

interface JobStatusRequest {
  context: TenantContext;
  job_id: string;
}

interface JobStatusResponse {
  job_id: string;
  report_type: string;
  format: number;
  status: number;
  file_url?: string;
  file_size?: number;
  row_count?: number;
  error_message?: string;
  file_name?: string;
}

interface HistoryRequest {
  context: TenantContext;
  page?: number;
  per_page?: number;
  report_type?: string;
}

interface HistoryResponse {
  jobs: JobStatusResponse[];
  total: number;
  page: number;
  per_page: number;
}

interface ListReportTemplatesRequest {
  context?: TenantContext;
  report_group?: string;
}

interface ListReportTemplatesResponse {
  templates: ReportTemplateResponse[];
}

interface GetReportTemplateRequest {
  context?: TenantContext;
  id: string;
}

interface ReportTemplateResponse {
  id: string;
  name: string;
  description?: string;
  report_group: string;
  dialog: string;
  content: string;
  is_standard: boolean;
  allow_business_unit: string[];
  deny_business_unit: string[];
  is_active: boolean;
}

// Schedule interfaces
interface ScheduleConfig {
  frequency: string;
  time: string;
  days_of_week?: number[];
  days_of_month?: number[];
}

interface CreateScheduleRequest {
  context: TenantContext;
  name: string;
  report_type: string;
  report_template_id?: string;
  format: number;
  cron_expression?: string;
  schedule_config?: ScheduleConfig;
  filters?: ReportFilters;
  options?: ReportOptions;
  recipients?: string[];
}

interface ScheduleResponse {
  id: string;
  name: string;
  report_type: string;
  report_template_id?: string;
  format: number;
  cron_expression: string;
  schedule_config?: ScheduleConfig;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
}

interface ListSchedulesRequest {
  context: TenantContext;
}

interface ListSchedulesResponse {
  schedules: ScheduleResponse[];
}

interface DeleteScheduleRequest {
  context: TenantContext;
  id: string;
}

interface DeleteScheduleResponse {
  success: boolean;
  message: string;
}

// Format enum mapping
const FORMAT_MAP: Record<string, number> = {
  pdf: 1,
  excel: 2,
  csv: 3,
  json: 4,
};

@Injectable()
export class ReportService implements OnModuleInit {
  private readonly logger = new BackendLogger(ReportService.name);
  private reportServiceGrpc: ReportServiceGrpc;
  private readonly reportHttpUrl = `http://${envConfig.REPORT_SERVICE_HOST}:${envConfig.REPORT_SERVICE_HTTP_PORT}`;

  constructor(
    @Inject('REPORT_SERVICE')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reportServiceGrpc =
      this.client.getService<ReportServiceGrpc>('ReportService');
  }

  async generate(
    user_id: string,
    bu_code: string,
    report_type: string,
    format: string,
    filters?: ReportFilters,
    options?: ReportOptions,
    template_id?: string,
  ): Promise<GenerateResponse> {
    this.logger.debug({ function: 'generate', report_type, format, bu_code }, ReportService.name);

    const request: GenerateRequest = {
      context: { user_id, bu_codes: [bu_code] },
      report_type,
      format: FORMAT_MAP[format] || 4,
      filters,
      options: {
        locale: 'th-TH',
        timezone: 'Asia/Bangkok',
        page_size: 'A4',
        orientation: 'portrait',
        include_summary: true,
        ...options,
      },
      template_id,
    };

    return firstValueFrom(this.reportServiceGrpc.Generate(request));
  }

  async listTypes(category?: string): Promise<ListTypesResponse> {
    this.logger.debug({ function: 'listTypes', category }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.ListReportTypes({ category }),
    );
  }

  async listTemplates(report_group?: string): Promise<ListReportTemplatesResponse> {
    this.logger.debug({ function: 'listTemplates', report_group }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.ListReportTemplates({ report_group }),
    );
  }

  async getTemplate(id: string): Promise<ReportTemplateResponse> {
    this.logger.debug({ function: 'getTemplate', id }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.GetReportTemplate({ id }),
    );
  }

  // --- Async job methods ---

  async generateAsync(
    user_id: string,
    bu_code: string,
    report_type: string,
    format: string,
    filters?: ReportFilters,
    options?: ReportOptions,
  ): Promise<AsyncResponse> {
    this.logger.debug({ function: 'generateAsync', report_type, format, bu_code }, ReportService.name);

    const request: GenerateRequest = {
      context: { user_id, bu_codes: [bu_code] },
      report_type,
      format: FORMAT_MAP[format] || 4,
      filters,
      options: {
        locale: 'th-TH',
        timezone: 'Asia/Bangkok',
        page_size: 'A4',
        orientation: 'portrait',
        include_summary: true,
        ...options,
      },
    };

    return firstValueFrom(this.reportServiceGrpc.GenerateAsync(request));
  }

  async getJobStatus(
    user_id: string,
    bu_code: string,
    job_id: string,
  ): Promise<JobStatusResponse> {
    this.logger.debug({ function: 'getJobStatus', job_id }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.GetJobStatus({
        context: { user_id, bu_codes: [bu_code] },
        job_id,
      }),
    );
  }

  async getHistory(
    user_id: string,
    bu_code: string,
    page?: number,
    per_page?: number,
    report_type?: string,
  ): Promise<HistoryResponse> {
    this.logger.debug({ function: 'getHistory', bu_code, page }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.GetReportHistory({
        context: { user_id, bu_codes: [bu_code] },
        page,
        per_page,
        report_type,
      }),
    );
  }

  // --- Schedule methods ---

  async createSchedule(
    user_id: string,
    bu_code: string,
    name: string,
    report_type: string,
    format: string,
    cron_expression?: string,
    filters?: ReportFilters,
    options?: ReportOptions,
    recipients?: string[],
    report_template_id?: string,
    schedule_config?: ScheduleConfig,
  ): Promise<ScheduleResponse> {
    this.logger.debug({ function: 'createSchedule', name, report_type, bu_code }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.CreateSchedule({
        context: { user_id, bu_codes: [bu_code] },
        name,
        report_type,
        report_template_id,
        format: FORMAT_MAP[format] || 4,
        cron_expression: cron_expression || '',
        schedule_config,
        raw_filters: filters ? Object.fromEntries(
          Object.entries(filters).map(([k, v]) => [k, String(v ?? '')])
        ) : {},
        options,
        recipients,
      }),
    );
  }

  async listSchedules(
    user_id: string,
    bu_code: string,
  ): Promise<ListSchedulesResponse> {
    this.logger.debug({ function: 'listSchedules', bu_code }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.ListSchedules({
        context: { user_id, bu_codes: [bu_code] },
      }),
    );
  }

  async deleteSchedule(
    user_id: string,
    bu_code: string,
    id: string,
  ): Promise<DeleteScheduleResponse> {
    this.logger.debug({ function: 'deleteSchedule', id, bu_code }, ReportService.name);
    return firstValueFrom(
      this.reportServiceGrpc.DeleteSchedule({
        context: { user_id, bu_codes: [bu_code] },
        id,
      }),
    );
  }

  // --- HTTP proxy methods (no gRPC counterpart) ---

  private async httpRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.reportHttpUrl}${endpoint}`;
    this.logger.debug({ function: 'httpRequest', url }, ReportService.name);

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new HttpException(
        error.error || error.message || 'Request failed',
        response.status,
      );
    }

    return response.json();
  }

  async viewReport(bu_code: string, template_id: string, filters?: any) {
    this.logger.debug({ function: 'viewReport', bu_code, template_id }, ReportService.name);
    return this.httpRequest(`/api/${bu_code}/report/viewer`, {
      method: 'POST',
      body: JSON.stringify({ template_id, filters: filters || {} }),
    });
  }

  async reportData(bu_code: string, template_id: string, filters?: any) {
    this.logger.debug({ function: 'reportData', bu_code, template_id }, ReportService.name);
    return this.httpRequest(`/api/${bu_code}/report/data`, {
      method: 'POST',
      body: JSON.stringify({ template_id, filters: filters || {} }),
    });
  }

  async lookups(bu_code: string, types?: string) {
    this.logger.debug({ function: 'lookups', bu_code, types }, ReportService.name);
    const query = types ? `?types=${encodeURIComponent(types)}` : '';
    return this.httpRequest(`/api/${bu_code}/report/lookups${query}`, {
      method: 'GET',
    });
  }
}
