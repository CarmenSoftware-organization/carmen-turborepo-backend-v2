import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { ICreateRecipeCuisine, IUpdateRecipeCuisine } from './dto/recipe-cuisine.dto';

@Injectable()
export class Config_RecipeCuisineService {
  private readonly logger: BackendLogger = new BackendLogger(Config_RecipeCuisineService.name);

  constructor(
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
  ) { }

  async findOne(id: string, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeCuisineService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-cuisine.findOne', service: 'recipe-cuisine' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async findAll(user_id: string, bu_code: string, paginate: IPaginate, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'findAll', paginate, version }, Config_RecipeCuisineService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-cuisine.findAll', service: 'recipe-cuisine' },
      { user_id, paginate, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok({ data: response.data, paginate: response.paginate });
  }

  async create(createDto: ICreateRecipeCuisine, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeCuisineService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-cuisine.create', service: 'recipe-cuisine' },
      { data: createDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async update(updateDto: IUpdateRecipeCuisine, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'update', updateDto, version }, Config_RecipeCuisineService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-cuisine.update', service: 'recipe-cuisine' },
      { data: updateDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async patch(updateDto: IUpdateRecipeCuisine, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'patch', updateDto, version }, Config_RecipeCuisineService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-cuisine.patch', service: 'recipe-cuisine' },
      { data: updateDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async delete(id: string, user_id: string, bu_code: string, version: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeCuisineService.name);
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe-cuisine.delete', service: 'recipe-cuisine' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }
}
