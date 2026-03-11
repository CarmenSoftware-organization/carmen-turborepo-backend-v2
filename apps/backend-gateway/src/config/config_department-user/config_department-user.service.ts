import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { IPaginate } from 'src/shared-dto/paginate.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ClientProxy } from '@nestjs/microservices';
@Injectable()
export class Config_DepartmentUserService {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_DepartmentUserService.name,
  );

  constructor(
    @Inject('BUSINESS_SERVICE')
    private readonly masterService: ClientProxy,
  ) {}

  async findOne(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      Config_DepartmentUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }

  async findAll(
    user_id: string,
    bu_code: string,
    query: IPaginate,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_DepartmentUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }

  async create(
    createDto: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_DepartmentUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }

  async update(
    id: string,
    updateDto: Record<string, unknown>,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_DepartmentUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }

  async delete(
    id: string,
    user_id: string,
    bu_code: string,
    version: string,
  ): Promise<unknown> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_DepartmentUserService.name,
    );
    throw new NotImplementedException('Not implemented');
  }
}
