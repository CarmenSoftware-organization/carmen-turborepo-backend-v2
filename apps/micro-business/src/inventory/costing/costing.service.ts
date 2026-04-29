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
    prisma: TenantPrisma,
    items: GetCostsBatchInput['items'],
  ): Promise<Map<string, Prisma.Decimal>> {
    const productIds = Array.from(new Set(items.map((i) => i.product_id)));
    const products = await prisma.tb_product.findMany({
      where: { id: { in: productIds }, deleted_at: null },
      select: { id: true, standard_cost: true },
    });

    const productCost = new Map<string, Prisma.Decimal>();
    for (const p of products) {
      productCost.set(p.id, p.standard_cost ?? new Prisma.Decimal(0));
    }

    const result = new Map<string, Prisma.Decimal>();
    for (const item of items) {
      const cost = productCost.get(item.product_id);
      if (cost !== undefined) {
        result.set(costMapKey(item.product_id, item.location_id), cost);
      }
    }
    return result;
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
