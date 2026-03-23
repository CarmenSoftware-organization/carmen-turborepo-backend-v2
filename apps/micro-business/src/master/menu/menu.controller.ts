import { Controller, HttpStatus } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class MenuController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    MenuController.name,
  );

  constructor(private readonly menuService: MenuService) {
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

  @MessagePattern({ cmd: 'menu.findOne', service: 'menu' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, MenuController.name);
    const id = payload.id;
    this.menuService.userId = payload.user_id;
    this.menuService.bu_code = payload.bu_code;
    await this.menuService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.menuService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'menu.findAll', service: 'menu' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, MenuController.name);
    this.menuService.userId = payload.user_id;
    this.menuService.bu_code = payload.bu_code;
    await this.menuService.initializePrismaService(payload.bu_code, payload.user_id);
    const paginate = payload.paginate;

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.menuService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'menu.create', service: 'menu' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, MenuController.name);
    const data = payload.data;
    this.menuService.userId = payload.user_id;
    this.menuService.bu_code = payload.bu_code;
    await this.menuService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.menuService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'menu.update', service: 'menu' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, MenuController.name);
    const data = payload.data;
    this.menuService.userId = payload.user_id;
    this.menuService.bu_code = payload.bu_code;
    await this.menuService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.menuService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'menu.delete', service: 'menu' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, MenuController.name);
    const id = payload.id;
    this.menuService.userId = payload.user_id;
    this.menuService.bu_code = payload.bu_code;
    await this.menuService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.menuService.delete(id));
    return this.handleResult(result);
  }
}
