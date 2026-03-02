import { Inject, Injectable } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT, enum_inventory_doc_type, enum_transaction_type } from '@repo/prisma-shared-schema-tenant';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { format } from 'date-fns';
import { splitFifoCost } from '@/common/helpers/fifo-cost-split.helper';
import {
  InventoryTransactionListItemResponseSchema,
  Result,
  ErrorCode,
  TryCatch,
} from '@/common';

/**
 * Input for a single GRN detail line when creating inventory transactions.
 */
export interface ICreateFromGrnDetailItem {
  /** tb_good_received_note_detail_item.id */
  detail_item_id: string;
  /** Product ID from the parent detail row */
  product_id: string;
  /** Location ID from the parent detail row */
  location_id: string;
  /** Location code (denormalized) */
  location_code: string | null;
  /** Received quantity in base unit */
  received_base_qty: number;
  /** Total cost in base currency (after discount, before tax) */
  base_net_amount: number;
}

/**
 * Input payload for creating inventory transactions from a GRN.
 */
export interface ICreateFromGrnPayload {
  bu_code: string;
  grn_id: string;
  grn_no: string | null;
  grn_date: Date;
  detail_items: ICreateFromGrnDetailItem[];
  user_id: string;
}

@Injectable()
export class InventoryTransactionService {
  private readonly logger: BackendLogger = new BackendLogger(
    InventoryTransactionService.name,
  );
  constructor(
    @Inject('PRISMA_SYSTEM')
    private readonly prismaSystem: typeof PrismaClient_SYSTEM,
    @Inject('PRISMA_TENANT')
    private readonly prismaTenant: typeof PrismaClient_TENANT,

    private readonly tenantService: TenantService,
  ) { }

  /**
   * Read the calculation_method from tb_business_unit (platform DB).
   * Returns 'fifo' or 'average'. Defaults to 'fifo' if not found.
   */
  async getCalculationMethod(bu_code: string): Promise<string> {
    const businessUnit = await this.prismaSystem.tb_business_unit.findFirst({
      where: { code: bu_code, deleted_at: null },
      select: { calculation_method: true },
    });

    return businessUnit?.calculation_method || 'fifo';
  }

  @TryCatch
  async findAllByIds(
    ids: string[],
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAllByIds', ids, user_id, tenant_id },
      InventoryTransactionService.name,
    );
    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );

    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(
      tenant.tenant_id,
      tenant.db_connection,
    );

    const inventoryTransactions =
      await prisma.tb_inventory_transaction.findMany({
        where: {
          id: { in: ids },
        },
      });

    const serializedInventoryTransactions = inventoryTransactions.map((item) =>
      InventoryTransactionListItemResponseSchema.parse(item)
    );

    return Result.ok(serializedInventoryTransactions);
  }

  @TryCatch
  async createFromGrn(
    data: ICreateFromGrnPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'createFromGrn', grn_id: data.grn_id, user_id, tenant_id },
      InventoryTransactionService.name,
    );

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) {
      return Result.error('Tenant not found', ErrorCode.NOT_FOUND);
    }

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    let inventoryTransactionId: string = '';

    await prisma.$transaction(async (tx: unknown) => {
      inventoryTransactionId = await this.createFromGoodReceivedNote(tx, data);
    });

    return Result.ok({ id: inventoryTransactionId });
  }

  /**
   * Create inventory transaction from an approved GRN.
   * Routes to the correct handler based on the BU's calculation_method.
   *
   * @param tx - Prisma transaction client from the caller's `$transaction`
   * @param payload - GRN header info + flattened detail items
   * @returns The created inventory transaction ID
   */
  async createFromGoodReceivedNote(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    payload: ICreateFromGrnPayload,
  ): Promise<string> {
    const method = await this.getCalculationMethod(payload.bu_code);

    this.logger.debug(
      { function: 'createFromGoodReceivedNote', grn_id: payload.grn_id, calculation_method: method },
      InventoryTransactionService.name,
    );

    switch (method) {
      case 'fifo':
        return this.createFifoTransaction(tx, payload);
      case 'average':
        return this.createAverageTransaction(tx, payload);
      default:
        throw new Error(`Unknown calculation method: ${method}`);
    }
  }

  /**
   * FIFO: Create inventory transaction + details + cost layers from an approved GRN.
   */
  private async createFifoTransaction(
    tx: any,
    payload: ICreateFromGrnPayload,
  ): Promise<string> {
    const now = new Date();
    const grnDate = payload.grn_date;
    const year = grnDate.getFullYear().toString();
    const month = (grnDate.getMonth() + 1).toString().padStart(2, '0');
    const atPeriod = format(grnDate, 'yyMM');

    // 1. Create the inventory transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        note: `GRN ${payload.grn_no || ''} approved`,
        created_by_id: payload.user_id,
        created_at: now,
        updated_by_id: payload.user_id,
        updated_at: now,
      },
    });

    // 2. Process each detail item — create transaction detail + FIFO cost layers
    let lotSeqNo = 0;

    for (const item of payload.detail_items) {
      const qty = item.received_base_qty;
      const totalCost = item.base_net_amount;

      if (qty <= 0) continue;

      lotSeqNo++;
      const lotNo = `LOT-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;

      // Overall cost_per_unit for the transaction detail (rounded to 2 decimals)
      const costPerUnit = Math.round((totalCost / qty) * 100) / 100;

      // Create inventory transaction detail
      const txnDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: lotNo,
          qty: qty,
          cost_per_unit: costPerUnit,
          total_cost: totalCost,
          created_by_id: payload.user_id,
          created_at: now,
          updated_by_id: payload.user_id,
          updated_at: now,
        },
      });

      // Split cost into FIFO layers with exact decimal reconciliation
      const costLayers = splitFifoCost(qty, totalCost, 2);

      for (let i = 0; i < costLayers.length; i++) {
        const layer = costLayers[i];

        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: txnDetail.id,
            lot_no: lotNo,
            lot_index: i + 1,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: grnDate,
            lot_seq_no: lotSeqNo,
            product_id: item.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.good_received_note,
            in_qty: layer.qty,
            out_qty: 0,
            cost_per_unit: layer.costPerUnit,
            total_cost: layer.totalCost,
            diff_amount: 0,
            average_cost_per_unit: 0,
            created_by_id: payload.user_id,
            created_at: now,
          },
        });
      }

      // Link the inventory transaction back to the GRN detail item
      await tx.tb_good_received_note_detail_item.update({
        where: { id: item.detail_item_id },
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          updated_by_id: payload.user_id,
          updated_at: now,
        },
      });
    }

    return inventoryTransaction.id;
  }

  /**
   * Average: Create inventory transaction + details + cost layers from an approved GRN.
   * Calculates weighted average cost per unit and updates all existing cost layers for the same product.
   */
  private async createAverageTransaction(
    tx: any,
    payload: ICreateFromGrnPayload,
  ): Promise<string> {
    const now = new Date();
    const grnDate = payload.grn_date;
    const year = grnDate.getFullYear().toString();
    const month = (grnDate.getMonth() + 1).toString().padStart(2, '0');
    const atPeriod = format(grnDate, 'yyMM');

    // 1. Query existing inventory per product (on-hand qty + current average cost)
    const uniqueProductIds = [...new Set(payload.detail_items.map(item => item.product_id))];

    const stockGrouped = await tx.tb_inventory_transaction_detail.groupBy({
      by: ['product_id'],
      where: { product_id: { in: uniqueProductIds } },
      _sum: { qty: true },
    });

    const onHandMap = new Map<string, number>();
    for (const group of stockGrouped) {
      const qty = Number(group._sum.qty || 0);
      onHandMap.set(group.product_id, qty > 0 ? qty : 0);
    }

    const avgCostMap = new Map<string, number>();
    for (const productId of uniqueProductIds) {
      const latestLayer = await tx.tb_inventory_transaction_cost_layer.findFirst({
        where: { product_id: productId, deleted_at: null },
        select: { average_cost_per_unit: true },
        orderBy: { created_at: 'desc' },
      });
      if (latestLayer) {
        avgCostMap.set(productId, Number(latestLayer.average_cost_per_unit || 0));
      }
    }

    // 2. Aggregate new receipts per product (handle multiple lines for same product in one GRN)
    const newReceiptsPerProduct = new Map<string, { totalQty: number; totalCost: number }>();
    for (const item of payload.detail_items) {
      if (item.received_base_qty <= 0) continue;
      const existing = newReceiptsPerProduct.get(item.product_id) || { totalQty: 0, totalCost: 0 };
      existing.totalQty += item.received_base_qty;
      existing.totalCost += item.base_net_amount;
      newReceiptsPerProduct.set(item.product_id, existing);
    }

    // 3. Compute new weighted average cost per product
    const newAvgCostMap = new Map<string, number>();
    for (const [productId, newReceipt] of newReceiptsPerProduct) {
      const existingQty = onHandMap.get(productId) || 0;
      const existingAvgCost = avgCostMap.get(productId) || 0;

      const existingTotalCost = existingQty * existingAvgCost;
      const combinedQty = existingQty + newReceipt.totalQty;
      const combinedCost = existingTotalCost + newReceipt.totalCost;

      const newAvgCost = combinedQty > 0
        ? Math.round((combinedCost / combinedQty) * 100) / 100
        : 0;

      newAvgCostMap.set(productId, newAvgCost);
    }

    // 4. Create the inventory transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        note: `GRN ${payload.grn_no || ''} approved`,
        created_by_id: payload.user_id,
        created_at: now,
        updated_by_id: payload.user_id,
        updated_at: now,
      },
    });

    // 5. Process each detail item — create transaction detail + single cost layer
    let lotSeqNo = 0;

    for (const item of payload.detail_items) {
      const qty = item.received_base_qty;
      const totalCost = item.base_net_amount;

      if (qty <= 0) continue;

      lotSeqNo++;
      const lotNo = `LOT-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;

      const costPerUnit = Math.round((totalCost / qty) * 100) / 100;
      const newAvgCost = newAvgCostMap.get(item.product_id) || costPerUnit;

      // Create inventory transaction detail
      const txnDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: lotNo,
          qty: qty,
          cost_per_unit: costPerUnit,
          total_cost: totalCost,
          created_by_id: payload.user_id,
          created_at: now,
          updated_by_id: payload.user_id,
          updated_at: now,
        },
      });

      // Create single cost layer (average doesn't split like FIFO)
      await tx.tb_inventory_transaction_cost_layer.create({
        data: {
          inventory_transaction_detail_id: txnDetail.id,
          lot_no: lotNo,
          lot_index: 1,
          location_id: item.location_id,
          location_code: item.location_code,
          lot_at_date: grnDate,
          lot_seq_no: lotSeqNo,
          product_id: item.product_id,
          at_period: atPeriod,
          transaction_type: enum_transaction_type.good_received_note,
          in_qty: qty,
          out_qty: 0,
          cost_per_unit: costPerUnit,
          total_cost: totalCost,
          diff_amount: 0,
          average_cost_per_unit: newAvgCost,
          created_by_id: payload.user_id,
          created_at: now,
        },
      });

      // Link the inventory transaction back to the GRN detail item
      await tx.tb_good_received_note_detail_item.update({
        where: { id: item.detail_item_id },
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          updated_by_id: payload.user_id,
          updated_at: now,
        },
      });
    }

    // 6. Update average_cost_per_unit on ALL existing cost layers for each affected product
    for (const [productId, newAvgCost] of newAvgCostMap) {
      await tx.tb_inventory_transaction_cost_layer.updateMany({
        where: {
          product_id: productId,
          deleted_at: null,
        },
        data: {
          average_cost_per_unit: newAvgCost,
        },
      });
    }

    return inventoryTransaction.id;
  }
}
