import { Test } from '@nestjs/testing';
import { Prisma } from '@repo/prisma-shared-schema-tenant';
import { CostingService } from './costing.service';
import { costMapKey } from './costing.types';

describe('CostingService', () => {
  let service: CostingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CostingService],
    }).compile();
    service = module.get(CostingService);
  });

  describe('standard', () => {
    it('returns tb_product.standard_cost (location-agnostic)', async () => {
      const prisma: any = {
        tb_product: {
          findMany: jest.fn().mockResolvedValue([
            { id: 'p1', standard_cost: new Prisma.Decimal(15.5) },
            { id: 'p2', standard_cost: new Prisma.Decimal(0) },
          ]),
        },
      };

      const result = await service.getCostsPerUnit({
        prisma,
        method: 'standard',
        items: [
          { product_id: 'p1', location_id: 'loc-a' },
          { product_id: 'p2', location_id: 'loc-b' },
          { product_id: 'p1', location_id: 'loc-c' }, // same product different location
        ],
      });

      expect(result.get(costMapKey('p1', 'loc-a'))?.toString()).toBe('15.5');
      expect(result.get(costMapKey('p1', 'loc-c'))?.toString()).toBe('15.5');
      expect(result.get(costMapKey('p2', 'loc-b'))?.toString()).toBe('0');
      expect(prisma.tb_product.findMany).toHaveBeenCalledTimes(1); // dedup
    });

    it('omits entries when product not found (caller will fallback to 0)', async () => {
      const prisma: any = {
        tb_product: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };

      const result = await service.getCostsPerUnit({
        prisma,
        method: 'standard',
        items: [{ product_id: 'p-missing', location_id: 'loc-a' }],
      });

      expect(result.get(costMapKey('p-missing', 'loc-a'))).toBeUndefined();
    });
  });
});
