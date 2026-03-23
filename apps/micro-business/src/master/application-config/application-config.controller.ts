import { Controller, HttpStatus } from '@nestjs/common';
import { ApplicationConfigService } from './application-config.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class ApplicationConfigController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    ApplicationConfigController.name,
  );

  constructor(private readonly applicationConfigService: ApplicationConfigService) {
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

  @MessagePattern({ cmd: 'application-config.findOne', service: 'application-config' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, ApplicationConfigController.name);
    const id = payload.id;
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.applicationConfigService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'application-config.findAll', service: 'application-config' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, ApplicationConfigController.name);
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);
    const paginate = payload.paginate;

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.applicationConfigService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'application-config.create', service: 'application-config' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, ApplicationConfigController.name);
    const data = payload.data;
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.applicationConfigService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'application-config.update', service: 'application-config' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, ApplicationConfigController.name);
    const data = payload.data;
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.applicationConfigService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'application-config.delete', service: 'application-config' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, ApplicationConfigController.name);
    const id = payload.id;
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.applicationConfigService.delete(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'application-config.findByKey', service: 'application-config' })
  async findByKey(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findByKey', payload }, ApplicationConfigController.name);
    const key = payload.key;
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.applicationConfigService.findByKey(key));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'application-config.findUserConfig', service: 'application-config' })
  async findUserConfig(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findUserConfig', payload }, ApplicationConfigController.name);
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.applicationConfigService.findUserConfig(payload.user_id, payload.key),
    );
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'application-config.upsertUserConfig', service: 'application-config' })
  async upsertUserConfig(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'upsertUserConfig', payload }, ApplicationConfigController.name);
    this.applicationConfigService.userId = payload.user_id;
    this.applicationConfigService.bu_code = payload.bu_code;
    await this.applicationConfigService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () =>
      this.applicationConfigService.upsertUserConfig({
        user_id: payload.user_id,
        key: payload.key,
        value: payload.data?.value,
      }),
    );
    return this.handleResult(result);
  }
}
