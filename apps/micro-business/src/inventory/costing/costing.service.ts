import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/prisma-shared-schema-tenant';
import {
  GetCostInput,
  GetCostsBatchInput,
  TenantPrisma,
  costMapKey,
} from './costing.types';

@Injectable()
export class CostingService {
  /**
   * Returns the cost-per-unit (Decimal) for a single (product, location) using the given method.
   * Returns Decimal(0) when no source data is found (fallback policy per spec).
   */
  async getCostPerUnit(input: GetCostInput): Promise<Prisma.Decimal> {
    const map = await this.getCostsPerUnit({
      prisma: input.prisma,
      method: input.method,
      items: [{ product_id: input.product_id, location_id: input.location_id }],
    });
    return map.get(costMapKey(input.product_id, input.location_id)) ?? new Prisma.Decimal(0);
  }

  /**
   * Batch lookup. Returns Map keyed by `${product_id}:${location_id}`.
   * Missing entries imply Decimal(0) — callers should use `?? new Prisma.Decimal(0)`.
   */
  async getCostsPerUnit(input: GetCostsBatchInput): Promise<Map<string, Prisma.Decimal>> {
    if (input.items.length === 0) {
      return new Map();
    }

    switch (input.method) {
      case 'standard':
        return this.lookupStandard(input.prisma, input.items);
      case 'last_receiving':
        return this.lookupLastReceiving(input.prisma, input.items);
      case 'last':
        return this.lookupLast(input.prisma, input.items);
      case 'average':
        return this.lookupAverage(input.prisma, input.items);
    }
  }

  private async lookupStandard(
    _prisma: TenantPrisma,
    _items: GetCostsBatchInput['items'],
  ): Promise<Map<string, Prisma.Decimal>> {
    throw new Error('Not implemented');
  }

  private async lookupLastReceiving(
    _prisma: TenantPrisma,
    _items: GetCostsBatchInput['items'],
  ): Promise<Map<string, Prisma.Decimal>> {
    throw new Error('Not implemented');
  }

  private async lookupLast(
    _prisma: TenantPrisma,
    _items: GetCostsBatchInput['items'],
  ): Promise<Map<string, Prisma.Decimal>> {
    throw new Error('Not implemented');
  }

  private async lookupAverage(
    _prisma: TenantPrisma,
    _items: GetCostsBatchInput['items'],
  ): Promise<Map<string, Prisma.Decimal>> {
    throw new Error('Not implemented');
  }
}
