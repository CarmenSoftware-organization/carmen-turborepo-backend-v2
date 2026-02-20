import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { ICreateRecipeCategory, IUpdateRecipeCategory } from './dto/recipe-category.dto';

@Injectable()
export class Config_RecipeCategoryService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_RecipeCategoryService.name,
  );

  constructor(
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  async findOne(id: string, user_id: string, bu_code: string, version: string): Promise<Result<any>> {
    this.logger.debug({ function: 'findOne', id, version }, Config_RecipeCategoryService.name);
    const res: Observable<any> = this.masterService.send(
      { cmd: 'recipe-category.findOne', service: 'recipe-category' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async findAll(user_id: string, bu_code: string, paginate: IPaginate, version: string): Promise<Result<any>> {
    this.logger.debug({ function: 'findAll', paginate, version }, Config_RecipeCategoryService.name);
    const res: Observable<any> = this.masterService.send(
      { cmd: 'recipe-category.findAll', service: 'recipe-category' },
      { user_id, paginate, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok({ data: response.data, paginate: response.paginate });
  }

  async create(createDto: ICreateRecipeCategory, user_id: string, bu_code: string, version: string): Promise<Result<any>> {
    this.logger.debug({ function: 'create', createDto, version }, Config_RecipeCategoryService.name);
    const res: Observable<any> = this.masterService.send(
      { cmd: 'recipe-category.create', service: 'recipe-category' },
      { data: createDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async update(updateDto: IUpdateRecipeCategory, user_id: string, bu_code: string, version: string): Promise<Result<any>> {
    this.logger.debug({ function: 'update', updateDto, version }, Config_RecipeCategoryService.name);
    const res: Observable<any> = this.masterService.send(
      { cmd: 'recipe-category.update', service: 'recipe-category' },
      { data: updateDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async patch(updateDto: IUpdateRecipeCategory, user_id: string, bu_code: string, version: string): Promise<Result<any>> {
    this.logger.debug({ function: 'patch', updateDto, version }, Config_RecipeCategoryService.name);
    const res: Observable<any> = this.masterService.send(
      { cmd: 'recipe-category.patch', service: 'recipe-category' },
      { data: updateDto, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }

  async delete(id: string, user_id: string, bu_code: string, version: string): Promise<Result<any>> {
    this.logger.debug({ function: 'delete', id, version }, Config_RecipeCategoryService.name);
    const res: Observable<any> = this.masterService.send(
      { cmd: 'recipe-category.delete', service: 'recipe-category' },
      { id, user_id, bu_code, version },
    );
    const response = await firstValueFrom(res);
    if (response.response.status !== HttpStatus.OK) {
      return Result.error(response.response.message, httpStatusToErrorCode(response.response.status));
    }
    return Result.ok(response.data);
  }
}
