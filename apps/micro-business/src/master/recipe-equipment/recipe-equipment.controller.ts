import { Controller, HttpStatus } from '@nestjs/common';
import { RecipeEquipmentService } from './recipe-equipment.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { runWithAuditContext, AuditContext } from '@repo/log-events-library';
import { BaseMicroserviceController } from '@/common';

@Controller()
export class RecipeEquipmentController extends BaseMicroserviceController {
  private readonly logger: BackendLogger = new BackendLogger(
    RecipeEquipmentController.name,
  );

  constructor(private readonly recipeEquipmentService: RecipeEquipmentService) {
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

  @MessagePattern({ cmd: 'recipe-equipment.findOne', service: 'recipe-equipment' })
  async findOne(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'findOne', payload }, RecipeEquipmentController.name);
    const id = payload.id;
    this.recipeEquipmentService.userId = payload.user_id;
    this.recipeEquipmentService.bu_code = payload.bu_code;
    await this.recipeEquipmentService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeEquipmentService.findOne(id));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-equipment.findAll', service: 'recipe-equipment' })
  async findAll(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'findAll', payload }, RecipeEquipmentController.name);
    this.recipeEquipmentService.userId = payload.user_id;
    this.recipeEquipmentService.bu_code = payload.bu_code;
    const paginate = payload.paginate;
    await this.recipeEquipmentService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeEquipmentService.findAll(paginate));
    return this.handlePaginatedResult(result);
  }

  @MessagePattern({ cmd: 'recipe-equipment.create', service: 'recipe-equipment' })
  async create(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'create', payload }, RecipeEquipmentController.name);
    const data = payload.data;
    this.recipeEquipmentService.userId = payload.user_id;
    this.recipeEquipmentService.bu_code = payload.bu_code;
    await this.recipeEquipmentService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeEquipmentService.create(data));
    return this.handleResult(result, HttpStatus.CREATED);
  }

  @MessagePattern({ cmd: 'recipe-equipment.update', service: 'recipe-equipment' })
  async update(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'update', payload }, RecipeEquipmentController.name);
    const data = payload.data;
    this.recipeEquipmentService.userId = payload.user_id;
    this.recipeEquipmentService.bu_code = payload.bu_code;
    await this.recipeEquipmentService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeEquipmentService.update(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-equipment.patch', service: 'recipe-equipment' })
  async patch(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'patch', payload }, RecipeEquipmentController.name);
    const data = payload.data;
    this.recipeEquipmentService.userId = payload.user_id;
    this.recipeEquipmentService.bu_code = payload.bu_code;
    await this.recipeEquipmentService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeEquipmentService.patch(data));
    return this.handleResult(result);
  }

  @MessagePattern({ cmd: 'recipe-equipment.delete', service: 'recipe-equipment' })
  async delete(@Payload() payload: any): Promise<any> {
    this.logger.debug({ function: 'delete', payload }, RecipeEquipmentController.name);
    const id = payload.id;
    this.recipeEquipmentService.userId = payload.user_id;
    this.recipeEquipmentService.bu_code = payload.bu_code;
    await this.recipeEquipmentService.initializePrismaService(payload.bu_code, payload.user_id);

    const auditContext = this.createAuditContext(payload);
    const result = await runWithAuditContext(auditContext, () => this.recipeEquipmentService.delete(id));
    return this.handleResult(result);
  }
}
