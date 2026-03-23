import { Controller, HttpStatus } from '@nestjs/common';
import { DimensionService } from './dimension.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class DimensionController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    DimensionController.name,
  );

  constructor(private readonly dimensionService: DimensionService) {
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

  @MessagePattern({ cmd: 'dimension.findOne', service: 'dimension' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, DimensionController.name);
    const id = payload.id;
    this.dimensionService.userId = payload.user_id;
    this.dimensionService.bu_code = payload.bu_code;
    await this.dimensionService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.dimensionService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'dimension.findAll', service: 'dimension' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, DimensionController.name);
    this.dimensionService.userId = payload.user_id;
    this.dimensionService.bu_code = payload.bu_code;
    await this.dimensionService.initializePrismaService(payload.bu_code, payload.user_id);
    const paginate = payload.paginate;

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.dimensionService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'dimension.create', service: 'dimension' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, DimensionController.name);
    const data = payload.data;
    this.dimensionService.userId = payload.user_id;
    this.dimensionService.bu_code = payload.bu_code;
    await this.dimensionService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.dimensionService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'dimension.update', service: 'dimension' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, DimensionController.name);
    const data = payload.data;
    this.dimensionService.userId = payload.user_id;
    this.dimensionService.bu_code = payload.bu_code;
    await this.dimensionService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.dimensionService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'dimension.delete', service: 'dimension' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, DimensionController.name);
    const id = payload.id;
    this.dimensionService.userId = payload.user_id;
    this.dimensionService.bu_code = payload.bu_code;
    await this.dimensionService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.dimensionService.delete(id));
    return this.handleResult(result);
  }
}
