import { Controller, HttpStatus } from '@nestjs/common';
import { CountStockService } from './count-stock.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class CountStockController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    CountStockController.name,
  );

  constructor(private readonly countStockService: CountStockService) {
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

  @MessagePattern({ cmd: 'count-stock.findOne', service: 'count-stock' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, CountStockController.name);
    const id = payload.id;
    this.countStockService.userId = payload.user_id;
    this.countStockService.bu_code = payload.bu_code;
    await this.countStockService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.countStockService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'count-stock.findAll', service: 'count-stock' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, CountStockController.name);
    this.countStockService.userId = payload.user_id;
    this.countStockService.bu_code = payload.bu_code;
    await this.countStockService.initializePrismaService(payload.bu_code, payload.user_id);
    const paginate = payload.paginate;

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.countStockService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'count-stock.create', service: 'count-stock' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, CountStockController.name);
    const data = payload.data;
    this.countStockService.userId = payload.user_id;
    this.countStockService.bu_code = payload.bu_code;
    await this.countStockService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.countStockService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'count-stock.update', service: 'count-stock' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, CountStockController.name);
    const data = payload.data;
    this.countStockService.userId = payload.user_id;
    this.countStockService.bu_code = payload.bu_code;
    await this.countStockService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.countStockService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'count-stock.delete', service: 'count-stock' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, CountStockController.name);
    const id = payload.id;
    this.countStockService.userId = payload.user_id;
    this.countStockService.bu_code = payload.bu_code;
    await this.countStockService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.countStockService.delete(id));
    return this.handleResult(result);
  }
}
