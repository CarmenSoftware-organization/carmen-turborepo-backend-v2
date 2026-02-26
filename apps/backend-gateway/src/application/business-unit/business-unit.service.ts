import { Injectable } from '@nestjs/common';
import { BackendLogger } from 'src/common/helpers/backend.logger';

@Injectable()
export class BusinessUnitService {
  private readonly logger: BackendLogger = new BackendLogger(
    BusinessUnitService.name,
  );
}
