import { Controller, HttpStatus } from '@nestjs/common';
import { JournalVoucherService } from './journal-voucher.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class JournalVoucherController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    JournalVoucherController.name,
  );
  constructor(private readonly journalVoucherService: JournalVoucherService) {
    super();
  }

  private createAuditContext(payload: MicroservicePayload): AuditContext {
    return {
      tenant_id: payload.bu_code,
      user_id: payload.user_id,
      request_id: payload.request_id,
      ip_address: payload.ip_address,
      user_agent: payload.user_agent,
    };
  }

  /**
   * Find a single journal voucher by ID
   * @param payload - Microservice payload containing journal voucher ID
   * @returns Journal voucher detail with line items
   */
  @MessagePattern({
    cmd: 'journal-voucher.findOne',
    service: 'journal-voucher',
  })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, JournalVoucherController.name);
    const id = payload.id;
    this.journalVoucherService.userId = payload.user_id;
    this.journalVoucherService.bu_code = payload.bu_code;
    await this.journalVoucherService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.journalVoucherService.findOne(id));
    return this.handleResult(result);
  }

  /**
   * Find all journal vouchers with pagination
   * @param payload - Microservice payload containing pagination parameters
   * @returns Paginated list of journal vouchers
   */
  @MessagePattern({
    cmd: 'journal-voucher.findAll',
    service: 'journal-voucher',
  })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, JournalVoucherController.name);
    this.journalVoucherService.userId = payload.user_id;
    this.journalVoucherService.bu_code = payload.bu_code;
    const paginate = payload.paginate;
    await this.journalVoucherService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.journalVoucherService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  /**
   * Create a new journal voucher with details
   * @param payload - Microservice payload containing journal voucher data
   * @returns Created journal voucher ID
   */
  @MessagePattern({ cmd: 'journal-voucher.create', service: 'journal-voucher' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, JournalVoucherController.name);
    const data = payload.data;
    this.journalVoucherService.userId = payload.user_id;
    this.journalVoucherService.bu_code = payload.bu_code;
    await this.journalVoucherService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.journalVoucherService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  /**
   * Update an existing journal voucher with details (add/update/delete)
   * @param payload - Microservice payload containing updated journal voucher data
   * @returns Updated journal voucher ID
   */
  @MessagePattern({ cmd: 'journal-voucher.update', service: 'journal-voucher' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, JournalVoucherController.name);
    const data = payload.data;
    this.journalVoucherService.userId = payload.user_id;
    this.journalVoucherService.bu_code = payload.bu_code;
    await this.journalVoucherService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.journalVoucherService.update(data));
    return this.handleResult(result);
  }

  /**
   * Delete a journal voucher (soft delete header + all details)
   * @param payload - Microservice payload containing journal voucher ID
   * @returns Deleted journal voucher ID
   */
  @MessagePattern({ cmd: 'journal-voucher.delete', service: 'journal-voucher' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, JournalVoucherController.name);
    const id = payload.id;
    this.journalVoucherService.userId = payload.user_id;
    this.journalVoucherService.bu_code = payload.bu_code;
    await this.journalVoucherService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.journalVoucherService.delete(id));
    return this.handleResult(result);
  }
}
