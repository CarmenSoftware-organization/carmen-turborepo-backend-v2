import { Controller, HttpStatus } from '@nestjs/common';
import { RecipeCategoryService } from './recipe-category.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController, MicroservicePayload, MicroserviceResponse } from '@/common';

@Controller()
export class RecipeCategoryController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    RecipeCategoryController.name,
  );

  constructor(private readonly recipeCategoryService: RecipeCategoryService) {
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

  @MessagePattern({ cmd: 'recipe-category.findOne', service: 'recipe-category' })
  async findOne(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findOne', payload }, RecipeCategoryController.name);
    const id = payload.id;
    this.recipeCategoryService.userId = payload.user_id;
    this.recipeCategoryService.bu_code = payload.bu_code;
    await this.recipeCategoryService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCategoryService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-category.findAll', service: 'recipe-category' })
  async findAll(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'findAll', payload }, RecipeCategoryController.name);
    this.recipeCategoryService.userId = payload.user_id;
    this.recipeCategoryService.bu_code = payload.bu_code;
    const paginate = payload.paginate;
    await this.recipeCategoryService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCategoryService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'recipe-category.create', service: 'recipe-category' })
  async create(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'create', payload }, RecipeCategoryController.name);
    const data = payload.data;
    this.recipeCategoryService.userId = payload.user_id;
    this.recipeCategoryService.bu_code = payload.bu_code;
    await this.recipeCategoryService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCategoryService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'recipe-category.update', service: 'recipe-category' })
  async update(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'update', payload }, RecipeCategoryController.name);
    const data = payload.data;
    this.recipeCategoryService.userId = payload.user_id;
    this.recipeCategoryService.bu_code = payload.bu_code;
    await this.recipeCategoryService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCategoryService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-category.patch', service: 'recipe-category' })
  async patch(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'patch', payload }, RecipeCategoryController.name);
    const data = payload.data;
    this.recipeCategoryService.userId = payload.user_id;
    this.recipeCategoryService.bu_code = payload.bu_code;
    await this.recipeCategoryService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCategoryService.patch(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-category.delete', service: 'recipe-category' })
  async delete(@Payload() payload: MicroservicePayload): Promise<MicroserviceResponse> {
    this.logger.debug({ function: 'delete', payload }, RecipeCategoryController.name);
    const id = payload.id;
    this.recipeCategoryService.userId = payload.user_id;
    this.recipeCategoryService.bu_code = payload.bu_code;
    await this.recipeCategoryService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeCategoryService.delete(id));
    return this.handleResult(result);
  }
}
