import { Controller, HttpStatus } from '@nestjs/common';
import { ExtraCostService } from './extra-cost.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class ExtraCostController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    ExtraCostController.name,
  );
  constructor(private readonly extraCostService: ExtraCostService) {
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
   * Find a single extra cost by ID
   * @param payload - Microservice payload containing extra cost ID
   * @returns Extra cost detail with details
   */
  @MessagePattern({
    cmd: 'extra-cost.findOne',
    service: 'extra-cost',
  })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, ExtraCostController.name);
    const id = payload.id;
    this.extraCostService.userId = payload.user_id;
    this.extraCostService.bu_code = payload.bu_code;
    await this.extraCostService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.extraCostService.findOne(id));
    return this.handleResult(result);
  }

  /**
   * Find all extra costs with pagination
   * @param payload - Microservice payload containing pagination parameters
   * @returns Paginated list of extra costs
   */
  @MessagePattern({
    cmd: 'extra-cost.findAll',
    service: 'extra-cost',
  })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, ExtraCostController.name);
    this.extraCostService.userId = payload.user_id;
    this.extraCostService.bu_code = payload.bu_code;
    const paginate = payload.paginate;
    await this.extraCostService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.extraCostService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  /**
   * Create a new extra cost with details
   * @param payload - Microservice payload containing extra cost data
   * @returns Created extra cost ID
   */
  @MessagePattern({ cmd: 'extra-cost.create', service: 'extra-cost' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, ExtraCostController.name);
    const data = payload.data;
    this.extraCostService.userId = payload.user_id;
    this.extraCostService.bu_code = payload.bu_code;
    await this.extraCostService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.extraCostService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  /**
   * Update an existing extra cost with details
   * @param payload - Microservice payload containing updated extra cost data
   * @returns Updated extra cost ID
   */
  @MessagePattern({ cmd: 'extra-cost.update', service: 'extra-cost' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, ExtraCostController.name);
    const data = payload.data;
    this.extraCostService.userId = payload.user_id;
    this.extraCostService.bu_code = payload.bu_code;
    await this.extraCostService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.extraCostService.update(data));
    return this.handleResult(result);
  }

  /**
   * Delete an extra cost (soft delete header + details)
   * @param payload - Microservice payload containing extra cost ID
   * @returns Deleted extra cost ID
   */
  @MessagePattern({ cmd: 'extra-cost.delete', service: 'extra-cost' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, ExtraCostController.name);
    const id = payload.id;
    this.extraCostService.userId = payload.user_id;
    this.extraCostService.bu_code = payload.bu_code;
    await this.extraCostService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.extraCostService.delete(id));
    return this.handleResult(result);
  }
}
