import { Injectable } from '@nestjs/common';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { enrichAuditUsersStorage } from '../context/enrich-audit-users.context';
import {
  collectTargetsByPaths,
  uniqueAuditUserIds,
  mutateToAuditShape,
} from './audit-shape';
import { UserNameResolverService } from './user-name-resolver.service';

@Injectable()
export class EnrichmentService {
  private readonly logger = new BackendLogger(EnrichmentService.name);

  constructor(private readonly resolver: UserNameResolverService) {}

  async enrichIfRequested(payload: unknown): Promise<unknown> {
    const options = enrichAuditUsersStorage.getStore();
    if (!options || payload == null) return payload;

    try {
      const targets = collectTargetsByPaths(payload, options.paths ?? ['']);
      if (targets.length === 0) return payload;

      const ids = uniqueAuditUserIds(targets);
      if (ids.length === 0) return payload;
      const nameMap = await this.resolver.resolveMany(ids);

      for (const target of targets) {
        mutateToAuditShape(target, nameMap);
      }
      return payload;
    } catch (err) {
      this.logger.warn(
        'audit user enrichment failed; returning original payload',
        { err },
      );
      return payload;
    }
  }
}
