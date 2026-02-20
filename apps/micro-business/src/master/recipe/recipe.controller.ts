import { Controller, HttpStatus } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController } from '@/common';

@Controller()
export class RecipeController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    RecipeController.name,
  );

  constructor(private readonly recipeService: RecipeService) {
    super();
  }

  private createAuditContext(payload: any): AuditContext {
    return {
      tenant_id: payload.bu_code,
      user_id: payload.user_id,
      request_id: payload.request_id,
      ip_address: payload.ip_address,
      user_agent: payload.user_agent,
    };
  }

  @MessagePattern({ cmd: 'recipe.findOne', service: 'recipe' })
  async findOne(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'findOne', payload }, RecipeController.name);
    const id = payload.id;
    this.recipeService.userId = payload.user_id;
    this.recipeService.bu_code = payload.bu_code;
    await this.recipeService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe.findAll', service: 'recipe' })
  async findAll(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'findAll', payload }, RecipeController.name);
    this.recipeService.userId = payload.user_id;
    this.recipeService.bu_code = payload.bu_code;
    const paginate = payload.paginate;
    await this.recipeService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'recipe.create', service: 'recipe' })
  async create(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'create', payload }, RecipeController.name);
    const data = payload.data;
    this.recipeService.userId = payload.user_id;
    this.recipeService.bu_code = payload.bu_code;
    await this.recipeService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'recipe.update', service: 'recipe' })
  async update(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'update', payload }, RecipeController.name);
    const data = payload.data;
    this.recipeService.userId = payload.user_id;
    this.recipeService.bu_code = payload.bu_code;
    await this.recipeService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe.patch', service: 'recipe' })
  async patch(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'patch', payload }, RecipeController.name);
    const data = payload.data;
    this.recipeService.userId = payload.user_id;
    this.recipeService.bu_code = payload.bu_code;
    await this.recipeService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeService.patch(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe.delete', service: 'recipe' })
  async delete(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'delete', payload }, RecipeController.name);
    const id = payload.id;
    this.recipeService.userId = payload.user_id;
    this.recipeService.bu_code = payload.bu_code;
    await this.recipeService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeService.delete(id));
    return this.handleResult(result);
  }
}
