import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { Result, MicroserviceResponse } from '@/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { httpStatusToErrorCode } from 'src/common/helpers/http-status-to-error-code';
import { ICreateRecipe, IUpdateRecipe } from './dto/recipe.dto';

@Injectable()
export class Config_RecipeService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_RecipeService.name,
  );

  constructor(
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  async findOne(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, version },
      Config_RecipeService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe.findOne', service: 'recipe' },
      { id, user_id, bu_code, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  async findAll(
    user_id: string,
    bu_code: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', paginate, version },
      Config_RecipeService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe.findAll', service: 'recipe' },
      { user_id, paginate, bu_code, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok({ data: response.data, paginate: response.paginate });
  }

  async create(
    createDto: ICreateRecipe,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', createDto, version },
      Config_RecipeService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe.create', service: 'recipe' },
      { data: createDto, user_id, bu_code, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.CREATED) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  async update(
    updateDto: IUpdateRecipe,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', updateDto, version },
      Config_RecipeService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe.update', service: 'recipe' },
      { data: updateDto, user_id, bu_code, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  async patch(
    updateDto: IUpdateRecipe,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'patch', updateDto, version },
      Config_RecipeService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe.patch', service: 'recipe' },
      { data: updateDto, user_id, bu_code, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }

  async delete(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, version },
      Config_RecipeService.name,
    );
    const res: Observable<MicroserviceResponse> = this.masterService.send(
      { cmd: 'recipe.delete', service: 'recipe' },
      { id, user_id, bu_code, version },
    );

    const response = await firstValueFrom(res);

    if (response.response.status !== HttpStatus.OK) {
      return Result.error(
        response.response.message,
        httpStatusToErrorCode(response.response.status),
      );
    }

    return Result.ok(response.data);
  }
}
