import { Controller, HttpStatus } from '@nestjs/common';
import { RecipeCuisineService } from './recipe-cuisine.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class RecipeCuisineController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    RecipeCuisineController.name,
  );

  constructor(private readonly recipeCuisineService: RecipeCuisineService) {
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

  @MessagePattern({ cmd: 'recipe-cuisine.findOne', service: 'recipe-cuisine' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, RecipeCuisineController.name);
    const id = payload.id;
    this.recipeCuisineService.userId = payload.user_id;
    this.recipeCuisineService.bu_code = payload.bu_code;
    await this.recipeCuisineService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCuisineService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-cuisine.findAll', service: 'recipe-cuisine' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, RecipeCuisineController.name);
    this.recipeCuisineService.userId = payload.user_id;
    this.recipeCuisineService.bu_code = payload.bu_code;
    const paginate = payload.paginate;
    await this.recipeCuisineService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCuisineService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'recipe-cuisine.create', service: 'recipe-cuisine' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, RecipeCuisineController.name);
    const data = payload.data;
    this.recipeCuisineService.userId = payload.user_id;
    this.recipeCuisineService.bu_code = payload.bu_code;
    await this.recipeCuisineService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCuisineService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'recipe-cuisine.update', service: 'recipe-cuisine' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, RecipeCuisineController.name);
    const data = payload.data;
    this.recipeCuisineService.userId = payload.user_id;
    this.recipeCuisineService.bu_code = payload.bu_code;
    await this.recipeCuisineService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCuisineService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-cuisine.patch', service: 'recipe-cuisine' })
  async patch(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'patch', payload }, RecipeCuisineController.name);
    const data = payload.data;
    this.recipeCuisineService.userId = payload.user_id;
    this.recipeCuisineService.bu_code = payload.bu_code;
    await this.recipeCuisineService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCuisineService.patch(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-cuisine.delete', service: 'recipe-cuisine' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, RecipeCuisineController.name);
    const id = payload.id;
    this.recipeCuisineService.userId = payload.user_id;
    this.recipeCuisineService.bu_code = payload.bu_code;
    await this.recipeCuisineService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCuisineService.delete(id));
    return this.handleResult(result);
  }
}
