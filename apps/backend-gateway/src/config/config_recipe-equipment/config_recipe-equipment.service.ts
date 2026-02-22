import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { ICreateRecipeEquipment, IUpdateRecipeEquipment } from './dto/recipe-equipment.dto';

@Injectable()
export class Config_RecipeEquipmentService {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeEquipmentService.name);

  constructor(
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  async findOne(id: string, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeEquipmentService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-equipment.findOne', service: 'recipe-equipment' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async findAll(user_id: string, bu_code: string, paginate: IPaginate, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findAll', paginate, version }, Config_RecipeEquipmentService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-equipment.findAll', service: 'recipe-equipment' },
      { user_id, paginate, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok({ data: response.data, paginate: response.paginate });
  }

  async create(createDto: ICreateRecipeEquipment, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeEquipmentService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-equipment.create', service: 'recipe-equipment' },
      { data: createDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async update(updateDto: IUpdateRecipeEquipment, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'update', updateDto, version }, Config_RecipeEquipmentService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-equipment.update', service: 'recipe-equipment' },
      { data: updateDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async patch(updateDto: IUpdateRecipeEquipment, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'patch', updateDto, version }, Config_RecipeEquipmentService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-equipment.patch', service: 'recipe-equipment' },
      { data: updateDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async delete(id: string, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeEquipmentService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-equipment.delete', service: 'recipe-equipment' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }
}
