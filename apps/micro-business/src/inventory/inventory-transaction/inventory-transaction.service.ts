import { Inject, Injectable } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT, enum_inventory_doc_type, enum_transaction_type } from '@repo/prisma-shared-schema-tenant';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { format } from 'date-fns';
import { splitFifoCost } from '@/common/helpers/fifo-cost-split.helper';
import {
  calculateAverageCost,
  calculateNewAverageCost,
  calculateBalance,
  buildAvailableFifoLots,
  consumeFifoLots,
  calculateConsumptionTotalCost,
  calculateConsumptionCostPerUnit,
  sumReceivingTotals,
  calculateAverageCostAfterCreditNoteQty,
  type IFifoLot,
  type IConsumption,
  type ILotGroup,
} from '@/common/helpers/inventory-cost.formula';
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

export interface ITestIssuePayload {
  bu_code: string;
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  user_id: string;
}

export interface ITestTransferPayload {
  bu_code: string;
  product_id: string;
  from_location_id: string;
  from_location_code: string | null;
  to_location_id: string;
  to_location_code: string | null;
  qty: number;
  user_id: string;
}

export interface ITestAdjustmentInPayload {
  bu_code: string;
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  cost_per_unit: number;
  user_id: string;
}

export interface ITestAdjustmentOutPayload {
  bu_code: string;
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  user_id: string;
}

export interface IEopInPayload {
  bu_code: string;
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  cost_per_unit: number;
  user_id: string;
}

export interface IEopOutPayload {
  bu_code: string;
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  user_id: string;
}

export interface ICreditNoteQtyDetailItem {
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  cost_per_unit: number;
}

export interface ICreditNoteQtyPayload {
  bu_code: string;
  grn_id: string;
  detail_items: ICreditNoteQtyDetailItem[];
  user_id: string;
}

export interface ICreditNoteAmountDetailItem {
  product_id: string;
  location_id: string;
  location_code: string | null;
  /** The credit note amount (monetary discount to adjust) */
  amount: number;
}

export interface ICreditNoteAmountPayload {
  bu_code: string;
  grn_id: string;
  detail_items: ICreditNoteAmountDetailItem[];
  user_id: string;
}

export interface ICostLayerQuery {
  bu_code: string;
  product_id?: string;
  location_id?: string;
}

export interface IStockBalanceQuery {
  bu_code: string;
  product_id?: string;
}

interface IConsumptionParams {
  product_id: string;
  location_id: string;
  location_code: string | null;
  qty: number;
  transactionType: enum_transaction_type;
  docType: enum_inventory_doc_type;
  lotPrefix: string;
  note: string;
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
    const nowIso = now.toISOString();
    const grnDate = payload.grn_date;
    const grnDateIso = grnDate.toISOString();
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
        created_at: nowIso,
        updated_by_id: payload.user_id,
        updated_at: nowIso,
      },
    });

    // 2. Process each detail item — create transaction detail + FIFO cost layers
    for (const item of payload.detail_items) {
      const qty = item.received_base_qty;
      const totalCost = item.base_net_amount;

      if (qty <= 0) continue;

      const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
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
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
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
            lot_at_date: grnDateIso,
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
            created_at: nowIso,
          },
        });
      }

      // TODO: uncomment when GRN integration is wired
      // Link the inventory transaction back to the GRN detail item
      // await tx.tb_good_received_note_detail_item.update({
      //   where: { id: item.detail_item_id },
      //   data: {
      //     inventory_transaction_id: inventoryTransaction.id,
      //     updated_by_id: payload.user_id,
      //     updated_at: nowIso,
      //   },
      // });
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
    const nowIso = now.toISOString();
    const grnDate = payload.grn_date;
    const grnDateIso = grnDate.toISOString();
    const year = grnDate.getFullYear().toString();
    const month = (grnDate.getMonth() + 1).toString().padStart(2, '0');
    const atPeriod = format(grnDate, 'yyMM');

    // 1. Query existing receiving cost layers per product and compute totals
    // Formula: avg_cost = sum(in_qty * cost_per_unit) / sum(in_qty) for all receiving layers
    const uniqueProductIds = [...new Set(payload.detail_items.map(item => item.product_id))];

    const existingReceivingMap = new Map<string, { totalInQty: number; totalInCost: number }>();
    for (const productId of uniqueProductIds) {
      const layers = await this.getReceivingLayers(tx, productId);
      existingReceivingMap.set(productId, sumReceivingTotals(layers));
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

    // 3. Compute new weighted average cost per product using formula:
    // new_avg = (existing_total_cost + new_total_cost) / (existing_total_qty + new_qty)
    const newAvgCostMap = new Map<string, number>();
    for (const [productId, newReceipt] of newReceiptsPerProduct) {
      const existing = existingReceivingMap.get(productId) || { totalInQty: 0, totalInCost: 0 };
      const newAvgCost = calculateNewAverageCost(
        existing.totalInQty, existing.totalInCost,
        newReceipt.totalQty, newReceipt.totalCost,
      );
      newAvgCostMap.set(productId, newAvgCost);
    }

    // 4. Create the inventory transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        note: `GRN ${payload.grn_no || ''} approved`,
        created_by_id: payload.user_id,
        created_at: nowIso,
        updated_by_id: payload.user_id,
        updated_at: nowIso,
      },
    });

    // 5. Process each detail item — create transaction detail + single cost layer
    for (const item of payload.detail_items) {
      const qty = item.received_base_qty;
      const totalCost = item.base_net_amount;

      if (qty <= 0) continue;

      const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
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
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      // Split cost into per-unit layers (same split logic as FIFO)
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
            lot_at_date: grnDateIso,
            lot_seq_no: lotSeqNo,
            product_id: item.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.good_received_note,
            in_qty: layer.qty,
            out_qty: 0,
            cost_per_unit: layer.costPerUnit,
            total_cost: layer.totalCost,
            diff_amount: 0,
            average_cost_per_unit: newAvgCost,
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }

      // TODO: uncomment when GRN integration is wired
      // Link the inventory transaction back to the GRN detail item
      // await tx.tb_good_received_note_detail_item.update({
      //   where: { id: item.detail_item_id },
      //   data: {
      //     inventory_transaction_id: inventoryTransaction.id,
      //     updated_by_id: payload.user_id,
      //     updated_at: nowIso,
      //   },
      // });
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

  // ============================================================
  // HELPERS
  // ============================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getAvailableFifoLots(tx: any, productId: string, locationId: string): Promise<IFifoLot[]> {
    // Get all receive layers (in_qty > 0)
    const receiveLayers = await tx.tb_inventory_transaction_cost_layer.findMany({
      where: {
        product_id: productId,
        location_id: locationId,
        in_qty: { gt: 0 },
        deleted_at: null,
      },
      orderBy: [
        { lot_at_date: 'asc' },
        { lot_seq_no: 'asc' },
        { lot_index: 'asc' },
      ],
    });

    // Group by lot_no → { totalIn, totalCost, lotAtDate, lotSeqNo }
    const lotGroups = new Map<string, ILotGroup>();
    for (const layer of receiveLayers) {
      const lotNo = layer.lot_no!;
      const existing = lotGroups.get(lotNo);
      if (existing) {
        existing.totalIn += Number(layer.in_qty);
        existing.totalCost += Number(layer.total_cost);
      } else {
        lotGroups.set(lotNo, {
          totalIn: Number(layer.in_qty),
          totalCost: Number(layer.total_cost),
          lotAtDate: layer.lot_at_date!,
          lotSeqNo: layer.lot_seq_no!,
        });
      }
    }

    // Get consumed amounts per parent_lot_no
    const lotNos = [...lotGroups.keys()];
    const consumedLayers = lotNos.length > 0
      ? await tx.tb_inventory_transaction_cost_layer.findMany({
        where: {
          parent_lot_no: { in: lotNos },
          out_qty: { gt: 0 },
          deleted_at: null,
        },
      })
      : [];

    const consumedPerLot = new Map<string, number>();
    for (const layer of consumedLayers) {
      const key = layer.parent_lot_no!;
      consumedPerLot.set(key, (consumedPerLot.get(key) || 0) + Number(layer.out_qty));
    }

    // Build available lots sorted oldest-first using formula
    return buildAvailableFifoLots(lotGroups, consumedPerLot);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getNextLotSeqNo(tx: any, atPeriod: string): Promise<number> {
    const maxLayer = await tx.tb_inventory_transaction_cost_layer.findFirst({
      where: { at_period: atPeriod, deleted_at: null },
      orderBy: { lot_seq_no: 'desc' },
      select: { lot_seq_no: true },
    });
    return (maxLayer?.lot_seq_no || 0) + 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getCurrentAverageCost(tx: any, productId: string): Promise<number> {
    const layers = await this.getReceivingLayers(tx, productId);
    return calculateAverageCost(layers);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getReceivingLayers(tx: any, productId: string) {
    const rawLayers = await tx.tb_inventory_transaction_cost_layer.findMany({
      where: { product_id: productId, in_qty: { gt: 0 }, deleted_at: null },
      select: { in_qty: true, cost_per_unit: true },
    });
    return rawLayers.map((l: any) => ({ in_qty: Number(l.in_qty), cost_per_unit: Number(l.cost_per_unit) }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getLocationBalance(tx: any, productId: string, locationId: string): Promise<number> {
    const result = await tx.tb_inventory_transaction_cost_layer.aggregate({
      where: { product_id: productId, location_id: locationId, deleted_at: null },
      _sum: { in_qty: true, out_qty: true },
    });
    // balance = sum(in_qty) - sum(out_qty)
    return calculateBalance(Number(result._sum.in_qty || 0), Number(result._sum.out_qty || 0));
  }

  // ============================================================
  // FIFO CONSUMPTION (issue, adjustment_out)
  // ============================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createFifoConsumption(
    tx: any,
    params: IConsumptionParams,
    existingTransactionId?: string,
  ): Promise<{ transactionId: string; consumptions: IConsumption[] }> {
    const now = new Date();
    const nowIso = now.toISOString();
    const atPeriod = format(now, 'yyMM');
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const availableLots = await this.getAvailableFifoLots(tx, params.product_id, params.location_id);
    const consumptions = consumeFifoLots(availableLots, params.qty);

    // Transaction header
    const transactionId = existingTransactionId || (await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: params.docType,
        inventory_doc_no: crypto.randomUUID(),
        note: params.note,
        created_by_id: params.user_id,
        created_at: nowIso,
        updated_by_id: params.user_id,
        updated_at: nowIso,
      },
    })).id;

    const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
    const outLotNo = `${params.lotPrefix}-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;

    // total_cost = sum(qty × costPerUnit) for each consumption
    const totalCost = calculateConsumptionTotalCost(consumptions);
    // cost_per_unit = total_cost / total_qty
    const costPerUnit = calculateConsumptionCostPerUnit(consumptions, params.qty);

    // Transaction detail (negative qty for outgoing)
    const txnDetail = await tx.tb_inventory_transaction_detail.create({
      data: {
        inventory_transaction_id: transactionId,
        product_id: params.product_id,
        location_id: params.location_id,
        location_code: params.location_code,
        current_lot_no: outLotNo,
        qty: -params.qty,
        cost_per_unit: costPerUnit,
        total_cost: totalCost,
        created_by_id: params.user_id,
        created_at: nowIso,
        updated_by_id: params.user_id,
        updated_at: nowIso,
      },
    });

    // Cost layers — one per consumed lot
    for (let i = 0; i < consumptions.length; i++) {
      const c = consumptions[i];
      await tx.tb_inventory_transaction_cost_layer.create({
        data: {
          inventory_transaction_detail_id: txnDetail.id,
          lot_no: outLotNo,
          lot_index: i + 1,
          location_id: params.location_id,
          location_code: params.location_code,
          lot_at_date: nowIso,
          lot_seq_no: lotSeqNo,
          product_id: params.product_id,
          parent_lot_no: c.lotNo,
          at_period: atPeriod,
          transaction_type: params.transactionType,
          in_qty: 0,
          out_qty: c.qty,
          cost_per_unit: c.costPerUnit,
          total_cost: Math.round(c.qty * c.costPerUnit * 100) / 100,
          diff_amount: 0,
          average_cost_per_unit: 0,
          created_by_id: params.user_id,
          created_at: nowIso,
        },
      });
    }

    return { transactionId, consumptions };
  }

  // ============================================================
  // AVERAGE CONSUMPTION (issue, adjustment_out)
  // ============================================================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createAverageConsumption(
    tx: any,
    params: IConsumptionParams,
    existingTransactionId?: string,
  ): Promise<{ transactionId: string }> {
    const now = new Date();
    const nowIso = now.toISOString();
    const atPeriod = format(now, 'yyMM');
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const avgCost = await this.getCurrentAverageCost(tx, params.product_id);
    const balance = await this.getLocationBalance(tx, params.product_id, params.location_id);

    if (balance < params.qty) {
      throw new Error(`Insufficient stock. Requested: ${params.qty}, Available: ${balance}`);
    }

    // Transaction header
    const transactionId = existingTransactionId || (await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: params.docType,
        inventory_doc_no: crypto.randomUUID(),
        note: params.note,
        created_by_id: params.user_id,
        created_at: nowIso,
        updated_by_id: params.user_id,
        updated_at: nowIso,
      },
    })).id;

    const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
    const outLotNo = `${params.lotPrefix}-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;
    const totalCost = Math.round(params.qty * avgCost * 100) / 100;

    // Transaction detail (negative qty)
    const txnDetail = await tx.tb_inventory_transaction_detail.create({
      data: {
        inventory_transaction_id: transactionId,
        product_id: params.product_id,
        location_id: params.location_id,
        location_code: params.location_code,
        current_lot_no: outLotNo,
        qty: -params.qty,
        cost_per_unit: avgCost,
        total_cost: totalCost,
        created_by_id: params.user_id,
        created_at: nowIso,
        updated_by_id: params.user_id,
        updated_at: nowIso,
      },
    });

    // Single cost layer
    await tx.tb_inventory_transaction_cost_layer.create({
      data: {
        inventory_transaction_detail_id: txnDetail.id,
        lot_no: outLotNo,
        lot_index: 1,
        location_id: params.location_id,
        location_code: params.location_code,
        lot_at_date: nowIso,
        lot_seq_no: lotSeqNo,
        product_id: params.product_id,
        at_period: atPeriod,
        transaction_type: params.transactionType,
        in_qty: 0,
        out_qty: params.qty,
        cost_per_unit: avgCost,
        total_cost: totalCost,
        diff_amount: 0,
        average_cost_per_unit: avgCost,
        created_by_id: params.user_id,
        created_at: nowIso,
      },
    });

    return { transactionId };
  }

  // ============================================================
  // PUBLIC TEST METHODS
  // ============================================================

  @TryCatch
  async createIssueTransaction(
    data: ITestIssuePayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createIssueTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);
    const method = await this.getCalculationMethod(data.bu_code);

    let transactionId = '';

    await prisma.$transaction(async (tx: unknown) => {
      const params: IConsumptionParams = {
        product_id: data.product_id,
        location_id: data.location_id,
        location_code: data.location_code,
        qty: data.qty,
        transactionType: enum_transaction_type.issue,
        docType: enum_inventory_doc_type.store_requisition,
        lotPrefix: 'ISS',
        note: 'Test issue transaction',
        user_id: data.user_id,
      };

      if (method === 'fifo') {
        const result = await this.createFifoConsumption(tx, params);
        transactionId = result.transactionId;
      } else {
        const result = await this.createAverageConsumption(tx, params);
        transactionId = result.transactionId;
      }
    });

    return Result.ok({ id: transactionId });
  }

  @TryCatch
  async createAdjustmentOutTransaction(
    data: ITestAdjustmentOutPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createAdjustmentOutTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);
    const method = await this.getCalculationMethod(data.bu_code);

    let transactionId = '';

    await prisma.$transaction(async (tx: unknown) => {
      const params: IConsumptionParams = {
        product_id: data.product_id,
        location_id: data.location_id,
        location_code: data.location_code,
        qty: data.qty,
        transactionType: enum_transaction_type.adjustment_out,
        docType: enum_inventory_doc_type.stock_out,
        lotPrefix: 'ADO',
        note: 'Test adjustment out transaction',
        user_id: data.user_id,
      };

      if (method === 'fifo') {
        const result = await this.createFifoConsumption(tx, params);
        transactionId = result.transactionId;
      } else {
        const result = await this.createAverageConsumption(tx, params);
        transactionId = result.transactionId;
      }
    });

    return Result.ok({ id: transactionId });
  }

  @TryCatch
  async createAdjustmentInTransaction(
    data: ITestAdjustmentInPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createAdjustmentInTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);
    const method = await this.getCalculationMethod(data.bu_code);

    let transactionId = '';

    await prisma.$transaction(async (tx: unknown) => {
      const now = new Date();
      const nowIso = now.toISOString();
      const atPeriod = format(now, 'yyMM');
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      // Create transaction header
      const inventoryTransaction = await (tx as any).tb_inventory_transaction.create({
        data: {
          inventory_doc_type: enum_inventory_doc_type.stock_in,
          inventory_doc_no: crypto.randomUUID(),
          note: 'Test adjustment in transaction',
          created_by_id: data.user_id,
          created_at: nowIso,
          updated_by_id: data.user_id,
          updated_at: nowIso,
        },
      });
      transactionId = inventoryTransaction.id;

      const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const lotNo = `ADI-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;
      const totalCost = Math.round(data.qty * data.cost_per_unit * 100) / 100;

      // Transaction detail (positive qty for incoming)
      const txnDetail = await (tx as any).tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code,
          current_lot_no: lotNo,
          qty: data.qty,
          cost_per_unit: data.cost_per_unit,
          total_cost: totalCost,
          created_by_id: data.user_id,
          created_at: nowIso,
          updated_by_id: data.user_id,
          updated_at: nowIso,
        },
      });

      if (method === 'fifo') {
        // FIFO: split cost into layers
        const costLayers = splitFifoCost(data.qty, totalCost, 2);
        for (let i = 0; i < costLayers.length; i++) {
          const layer = costLayers[i];
          await (tx as any).tb_inventory_transaction_cost_layer.create({
            data: {
              inventory_transaction_detail_id: txnDetail.id,
              lot_no: lotNo,
              lot_index: i + 1,
              location_id: data.location_id,
              location_code: data.location_code,
              lot_at_date: nowIso,
              lot_seq_no: lotSeqNo,
              product_id: data.product_id,
              at_period: atPeriod,
              transaction_type: enum_transaction_type.adjustment_in,
              in_qty: layer.qty,
              out_qty: 0,
              cost_per_unit: layer.costPerUnit,
              total_cost: layer.totalCost,
              diff_amount: 0,
              average_cost_per_unit: 0,
              created_by_id: data.user_id,
              created_at: nowIso,
            },
          });
        }
      } else {
        // Average: recalculate from all receiving layers using formula:
        // new_avg = (existing_total_cost + new_total_cost) / (existing_total_qty + new_qty)
        const layers = await this.getReceivingLayers(tx, data.product_id);
        const { totalInQty, totalInCost } = sumReceivingTotals(layers);
        const newAvgCost = calculateNewAverageCost(totalInQty, totalInCost, data.qty, totalCost);

        // Create cost layers (split per unit like FIFO)
        const costLayers = splitFifoCost(data.qty, totalCost, 2);
        for (let i = 0; i < costLayers.length; i++) {
          const layer = costLayers[i];
          await (tx as any).tb_inventory_transaction_cost_layer.create({
            data: {
              inventory_transaction_detail_id: txnDetail.id,
              lot_no: lotNo,
              lot_index: i + 1,
              location_id: data.location_id,
              location_code: data.location_code,
              lot_at_date: nowIso,
              lot_seq_no: lotSeqNo,
              product_id: data.product_id,
              at_period: atPeriod,
              transaction_type: enum_transaction_type.adjustment_in,
              in_qty: layer.qty,
              out_qty: 0,
              cost_per_unit: layer.costPerUnit,
              total_cost: layer.totalCost,
              diff_amount: 0,
              average_cost_per_unit: newAvgCost,
              created_by_id: data.user_id,
              created_at: nowIso,
            },
          });
        }

        // Update average_cost_per_unit on ALL existing layers for this product
        await (tx as any).tb_inventory_transaction_cost_layer.updateMany({
          where: { product_id: data.product_id, deleted_at: null },
          data: { average_cost_per_unit: newAvgCost },
        });
      }
    });

    return Result.ok({ id: transactionId });
  }

  @TryCatch
  async createEopInTransaction(
    data: IEopInPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createEopInTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);
    const method = await this.getCalculationMethod(data.bu_code);

    let transactionId = '';

    await prisma.$transaction(async (tx: unknown) => {
      const now = new Date();
      const nowIso = now.toISOString();
      const atPeriod = format(now, 'yyMM');
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      // Create transaction header
      const inventoryTransaction = await (tx as any).tb_inventory_transaction.create({
        data: {
          inventory_doc_type: enum_inventory_doc_type.stock_in,
          inventory_doc_no: crypto.randomUUID(),
          note: 'EOP in — period close adjustment (increase)',
          created_by_id: data.user_id,
          created_at: nowIso,
          updated_by_id: data.user_id,
          updated_at: nowIso,
        },
      });
      transactionId = inventoryTransaction.id;

      const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const lotNo = `EPI-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;
      const totalCost = Math.round(data.qty * data.cost_per_unit * 100) / 100;

      // Transaction detail (positive qty for incoming)
      const txnDetail = await (tx as any).tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: data.product_id,
          location_id: data.location_id,
          location_code: data.location_code,
          current_lot_no: lotNo,
          qty: data.qty,
          cost_per_unit: data.cost_per_unit,
          total_cost: totalCost,
          created_by_id: data.user_id,
          created_at: nowIso,
          updated_by_id: data.user_id,
          updated_at: nowIso,
        },
      });

      if (method === 'fifo') {
        const costLayers = splitFifoCost(data.qty, totalCost, 2);
        for (let i = 0; i < costLayers.length; i++) {
          const layer = costLayers[i];
          await (tx as any).tb_inventory_transaction_cost_layer.create({
            data: {
              inventory_transaction_detail_id: txnDetail.id,
              lot_no: lotNo,
              lot_index: i + 1,
              location_id: data.location_id,
              location_code: data.location_code,
              lot_at_date: nowIso,
              lot_seq_no: lotSeqNo,
              product_id: data.product_id,
              at_period: atPeriod,
              transaction_type: enum_transaction_type.eop_in,
              in_qty: layer.qty,
              out_qty: 0,
              cost_per_unit: layer.costPerUnit,
              total_cost: layer.totalCost,
              diff_amount: 0,
              average_cost_per_unit: 0,
              created_by_id: data.user_id,
              created_at: nowIso,
            },
          });
        }
      } else {
        const layers = await this.getReceivingLayers(tx, data.product_id);
        const { totalInQty, totalInCost } = sumReceivingTotals(layers);
        const newAvgCost = calculateNewAverageCost(totalInQty, totalInCost, data.qty, totalCost);

        const costLayers = splitFifoCost(data.qty, totalCost, 2);
        for (let i = 0; i < costLayers.length; i++) {
          const layer = costLayers[i];
          await (tx as any).tb_inventory_transaction_cost_layer.create({
            data: {
              inventory_transaction_detail_id: txnDetail.id,
              lot_no: lotNo,
              lot_index: i + 1,
              location_id: data.location_id,
              location_code: data.location_code,
              lot_at_date: nowIso,
              lot_seq_no: lotSeqNo,
              product_id: data.product_id,
              at_period: atPeriod,
              transaction_type: enum_transaction_type.eop_in,
              in_qty: layer.qty,
              out_qty: 0,
              cost_per_unit: layer.costPerUnit,
              total_cost: layer.totalCost,
              diff_amount: 0,
              average_cost_per_unit: newAvgCost,
              created_by_id: data.user_id,
              created_at: nowIso,
            },
          });
        }

        // Update average_cost_per_unit on ALL existing layers for this product
        await (tx as any).tb_inventory_transaction_cost_layer.updateMany({
          where: { product_id: data.product_id, deleted_at: null },
          data: { average_cost_per_unit: newAvgCost },
        });
      }
    });

    return Result.ok({ id: transactionId });
  }

  @TryCatch
  async createEopOutTransaction(
    data: IEopOutPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createEopOutTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);
    const method = await this.getCalculationMethod(data.bu_code);

    let transactionId = '';

    await prisma.$transaction(async (tx: unknown) => {
      const params: IConsumptionParams = {
        product_id: data.product_id,
        location_id: data.location_id,
        location_code: data.location_code,
        qty: data.qty,
        transactionType: enum_transaction_type.eop_out,
        docType: enum_inventory_doc_type.stock_out,
        lotPrefix: 'EPO',
        note: 'EOP out — period close adjustment (decrease)',
        user_id: data.user_id,
      };

      if (method === 'fifo') {
        const result = await this.createFifoConsumption(tx, params);
        transactionId = result.transactionId;
      } else {
        const result = await this.createAverageConsumption(tx, params);
        transactionId = result.transactionId;
      }
    });

    return Result.ok({ id: transactionId });
  }

  @TryCatch
  async createTransferTransaction(
    data: ITestTransferPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createTransferTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);
    const method = await this.getCalculationMethod(data.bu_code);

    let transactionId = '';

    await prisma.$transaction(async (tx: unknown) => {
      const now = new Date();
      const nowIso = now.toISOString();
      const atPeriod = format(now, 'yyMM');
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');

      // Create shared transaction header
      const inventoryTransaction = await (tx as any).tb_inventory_transaction.create({
        data: {
          inventory_doc_type: enum_inventory_doc_type.store_requisition,
          inventory_doc_no: crypto.randomUUID(),
          note: 'Test transfer transaction',
          created_by_id: data.user_id,
          created_at: nowIso,
          updated_by_id: data.user_id,
          updated_at: nowIso,
        },
      });
      transactionId = inventoryTransaction.id;

      if (method === 'fifo') {
        // --- FIFO Transfer ---
        // 1. Consume from source (transfer_out)
        const outResult = await this.createFifoConsumption(tx, {
          product_id: data.product_id,
          location_id: data.from_location_id,
          location_code: data.from_location_code,
          qty: data.qty,
          transactionType: enum_transaction_type.transfer_out,
          docType: enum_inventory_doc_type.store_requisition,
          lotPrefix: 'TRO',
          note: 'Test transfer out',
          user_id: data.user_id,
        }, transactionId);

        // 2. Receive at target (transfer_in) with same costs
        const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
        const inLotNo = `TRI-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;

        // total_cost = sum(qty × costPerUnit) for each FIFO consumption
        const totalCost = calculateConsumptionTotalCost(outResult.consumptions);
        // cost_per_unit = total_cost / total_qty
        const costPerUnit = calculateConsumptionCostPerUnit(outResult.consumptions, data.qty);

        const inDetail = await (tx as any).tb_inventory_transaction_detail.create({
          data: {
            inventory_transaction_id: transactionId,
            product_id: data.product_id,
            location_id: data.to_location_id,
            location_code: data.to_location_code,
            current_lot_no: inLotNo,
            qty: data.qty,
            cost_per_unit: costPerUnit,
            total_cost: totalCost,
            created_by_id: data.user_id,
            created_at: nowIso,
            updated_by_id: data.user_id,
            updated_at: nowIso,
          },
        });

        // Create transfer_in cost layers preserving FIFO costs
        for (let i = 0; i < outResult.consumptions.length; i++) {
          const c = outResult.consumptions[i];
          await (tx as any).tb_inventory_transaction_cost_layer.create({
            data: {
              inventory_transaction_detail_id: inDetail.id,
              lot_no: inLotNo,
              lot_index: i + 1,
              location_id: data.to_location_id,
              location_code: data.to_location_code,
              lot_at_date: nowIso,
              lot_seq_no: lotSeqNo,
              product_id: data.product_id,
              parent_lot_no: c.lotNo,
              at_period: atPeriod,
              transaction_type: enum_transaction_type.transfer_in,
              in_qty: c.qty,
              out_qty: 0,
              cost_per_unit: c.costPerUnit,
              total_cost: Math.round(c.qty * c.costPerUnit * 100) / 100,
              diff_amount: 0,
              average_cost_per_unit: 0,
              created_by_id: data.user_id,
              created_at: nowIso,
            },
          });
        }
      } else {
        // --- Average Transfer ---
        // 1. Consume from source
        await this.createAverageConsumption(tx, {
          product_id: data.product_id,
          location_id: data.from_location_id,
          location_code: data.from_location_code,
          qty: data.qty,
          transactionType: enum_transaction_type.transfer_out,
          docType: enum_inventory_doc_type.store_requisition,
          lotPrefix: 'TRO',
          note: 'Test transfer out',
          user_id: data.user_id,
        }, transactionId);

        // 2. Receive at target with same average cost
        const avgCost = await this.getCurrentAverageCost(tx, data.product_id);
        const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
        const inLotNo = `TRI-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;
        const totalCost = Math.round(data.qty * avgCost * 100) / 100;

        const inDetail = await (tx as any).tb_inventory_transaction_detail.create({
          data: {
            inventory_transaction_id: transactionId,
            product_id: data.product_id,
            location_id: data.to_location_id,
            location_code: data.to_location_code,
            current_lot_no: inLotNo,
            qty: data.qty,
            cost_per_unit: avgCost,
            total_cost: totalCost,
            created_by_id: data.user_id,
            created_at: nowIso,
            updated_by_id: data.user_id,
            updated_at: nowIso,
          },
        });

        await (tx as any).tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: inDetail.id,
            lot_no: inLotNo,
            lot_index: 1,
            location_id: data.to_location_id,
            location_code: data.to_location_code,
            lot_at_date: nowIso,
            lot_seq_no: lotSeqNo,
            product_id: data.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.transfer_in,
            in_qty: data.qty,
            out_qty: 0,
            cost_per_unit: avgCost,
            total_cost: totalCost,
            diff_amount: 0,
            average_cost_per_unit: avgCost,
            created_by_id: data.user_id,
            created_at: nowIso,
          },
        });
      }
    });

    return Result.ok({ id: transactionId });
  }

  // ============================================================
  // CREDIT NOTE QUANTITY (FIFO / AVERAGE)
  // ============================================================

  @TryCatch
  async createCreditNoteQtyTransaction(
    data: ICreditNoteQtyPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createCreditNoteQtyTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    let transactionId = '';

    const method = await this.getCalculationMethod(data.bu_code);

    await prisma.$transaction(async (tx: unknown) => {
      if (method === 'average') {
        transactionId = await this.createAverageCreditNoteQty(tx, data);
      } else {
        transactionId = await this.createFifoCreditNoteQty(tx, data);
      }
    });

    return Result.ok({ id: transactionId });
  }

  /**
   * FIFO Credit Note Quantity — deduct stock referencing a specific GRN.
   *
   * Priority order for deduction:
   *   1. Cost layers from the original GRN lot (FIFO within that lot)
   *   2. Other available lots for the same product+location (FIFO)
   *   3. If no stock anywhere → out_qty = 0, diff_amount = cn_cost × remaining_qty
   *
   * Cost layer records:
   *   - cost_per_unit  = CN's cost (user-provided)
   *   - total_cost     = CN's cost × out_qty
   *   - diff_amount    = (CN cost − lot cost) × out_qty
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createFifoCreditNoteQty(
    tx: any,
    payload: ICreditNoteQtyPayload,
  ): Promise<string> {
    const now = new Date();
    const nowIso = now.toISOString();
    const atPeriod = format(now, 'yyMM');
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // 1. Create transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.credit_note,
        inventory_doc_no: payload.grn_id,
        note: `Credit Note (qty) for GRN ${payload.grn_id}`,
        created_by_id: payload.user_id,
        created_at: nowIso,
        updated_by_id: payload.user_id,
        updated_at: nowIso,
      },
    });

    // 2. Find the original GRN transaction to get its lot numbers
    const grnTransaction = await tx.tb_inventory_transaction.findFirst({
      where: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        deleted_at: null,
      },
      select: { id: true },
    });

    const grnLotNosPerProduct = new Map<string, string[]>();
    if (grnTransaction) {
      const grnDetails = await tx.tb_inventory_transaction_detail.findMany({
        where: {
          inventory_transaction_id: grnTransaction.id,
        },
        select: { product_id: true, current_lot_no: true },
      });
      for (const d of grnDetails) {
        const existing = grnLotNosPerProduct.get(d.product_id) || [];
        if (d.current_lot_no) existing.push(d.current_lot_no);
        grnLotNosPerProduct.set(d.product_id, existing);
      }
    }

    // 3. Process each CN detail item
    for (const item of payload.detail_items) {
      if (item.qty <= 0) continue;

      const cnCost = item.cost_per_unit;
      const cnQty = item.qty;
      const cnTotalCost = Math.round(cnCost * cnQty * 100) / 100;

      const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const cnLotNo = `CNQ-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;

      // Transaction detail (negative qty for outgoing)
      const txnDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: cnLotNo,
          qty: -cnQty,
          cost_per_unit: cnCost,
          total_cost: cnTotalCost,
          created_by_id: payload.user_id,
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      // Get all available FIFO lots for this product+location
      const allAvailableLots = await this.getAvailableFifoLots(tx, item.product_id, item.location_id);

      // Prioritize: GRN lots first (FIFO), then other lots (FIFO)
      const grnLotNos = grnLotNosPerProduct.get(item.product_id) || [];
      const grnLots = allAvailableLots.filter(l => grnLotNos.includes(l.lotNo));
      const otherLots = allAvailableLots.filter(l => !grnLotNos.includes(l.lotNo));
      const prioritizedLots = [...grnLots, ...otherLots];

      // Consume without throwing on insufficient stock
      let remaining = cnQty;
      const consumptions: { lotNo: string; qty: number; costPerUnit: number }[] = [];

      for (const lot of prioritizedLots) {
        if (remaining <= 0) break;
        const consume = Math.min(lot.available, remaining);
        consumptions.push({ lotNo: lot.lotNo, qty: consume, costPerUnit: lot.costPerUnit });
        remaining -= consume;
      }

      // Create cost layers for each consumed lot
      let layerIndex = 1;
      for (const c of consumptions) {
        const diffAmount = Math.round((cnCost - c.costPerUnit) * c.qty * 100) / 100;

        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: txnDetail.id,
            lot_no: cnLotNo,
            lot_index: layerIndex++,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: nowIso,
            lot_seq_no: lotSeqNo,
            product_id: item.product_id,
            parent_lot_no: c.lotNo,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.credit_note_quantity,
            in_qty: 0,
            out_qty: c.qty,
            cost_per_unit: cnCost,
            total_cost: Math.round(cnCost * c.qty * 100) / 100,
            diff_amount: diffAmount,
            average_cost_per_unit: 0,
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }

      // Case 3: No stock available — record with out_qty = 0
      if (remaining > 0) {
        const diffAmount = Math.round(cnCost * remaining * 100) / 100;

        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: txnDetail.id,
            lot_no: cnLotNo,
            lot_index: layerIndex++,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: nowIso,
            lot_seq_no: lotSeqNo,
            product_id: item.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.credit_note_quantity,
            in_qty: 0,
            out_qty: 0,
            cost_per_unit: cnCost,
            total_cost: 0,
            diff_amount: diffAmount,
            average_cost_per_unit: 0,
            note: `No stock available for ${remaining} units`,
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }
    }

    return inventoryTransaction.id;
  }

  // ============================================================
  // CREDIT NOTE QUANTITY (AVERAGE)
  // ============================================================

  /**
   * Average Credit Note Quantity — same lot deduction logic as FIFO,
   * but uses average cost for diff_amount calculation.
   *
   * Priority order for deduction:
   *   1. Cost layers from the original GRN lot (FIFO within that lot)
   *   2. Other available lots for the same product+location (FIFO)
   *   3. If no stock anywhere → out_qty = 0, diff_amount = cn_cost × remaining_qty
   *
   * Cost layer records:
   *   - cost_per_unit         = CN's cost (user-provided)
   *   - total_cost            = CN's cost × out_qty
   *   - diff_amount           = 0 (only non-zero when stock is insufficient)
   *   - average_cost_per_unit = recalculated: (totalInCost - cnTotalCost) / (totalInQty - cnQty)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createAverageCreditNoteQty(
    tx: any,
    payload: ICreditNoteQtyPayload,
  ): Promise<string> {
    const now = new Date();
    const nowIso = now.toISOString();
    const atPeriod = format(now, 'yyMM');
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // 1. Create transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.credit_note,
        inventory_doc_no: payload.grn_id,
        note: `Credit Note (qty) for GRN ${payload.grn_id}`,
        created_by_id: payload.user_id,
        created_at: nowIso,
        updated_by_id: payload.user_id,
        updated_at: nowIso,
      },
    });

    // 2. Find the original GRN transaction to get its lot numbers
    const grnTransaction = await tx.tb_inventory_transaction.findFirst({
      where: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        deleted_at: null,
      },
      select: { id: true },
    });

    const grnLotNosPerProduct = new Map<string, string[]>();
    if (grnTransaction) {
      const grnDetails = await tx.tb_inventory_transaction_detail.findMany({
        where: {
          inventory_transaction_id: grnTransaction.id,
        },
        select: { product_id: true, current_lot_no: true },
      });
      for (const d of grnDetails) {
        const existing = grnLotNosPerProduct.get(d.product_id) || [];
        if (d.current_lot_no) existing.push(d.current_lot_no);
        grnLotNosPerProduct.set(d.product_id, existing);
      }
    }

    // 3. Process each CN detail item
    for (const item of payload.detail_items) {
      if (item.qty <= 0) continue;

      const cnCost = item.cost_per_unit;
      const cnQty = item.qty;
      const cnTotalCost = Math.round(cnCost * cnQty * 100) / 100;

      const lotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const cnLotNo = `CNQ-${year}-${month}-${lotSeqNo.toString().padStart(4, '0')}`;

      // Get receiving totals for recalculating average after CN
      const receivingLayers = await this.getReceivingLayers(tx, item.product_id);
      const { totalInQty, totalInCost } = sumReceivingTotals(receivingLayers);
      const newAvgCost = calculateAverageCostAfterCreditNoteQty(totalInQty, totalInCost, cnQty, cnCost);

      // Transaction detail (negative qty for outgoing)
      const txnDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: cnLotNo,
          qty: -cnQty,
          cost_per_unit: cnCost,
          total_cost: cnTotalCost,
          created_by_id: payload.user_id,
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      // Get all available FIFO lots for this product+location
      const allAvailableLots = await this.getAvailableFifoLots(tx, item.product_id, item.location_id);

      // Prioritize: GRN lots first (FIFO), then other lots (FIFO)
      const grnLotNos = grnLotNosPerProduct.get(item.product_id) || [];
      const grnLots = allAvailableLots.filter(l => grnLotNos.includes(l.lotNo));
      const otherLots = allAvailableLots.filter(l => !grnLotNos.includes(l.lotNo));
      const prioritizedLots = [...grnLots, ...otherLots];

      // Consume without throwing on insufficient stock
      let remaining = cnQty;
      const consumptions: { lotNo: string; qty: number; costPerUnit: number }[] = [];

      for (const lot of prioritizedLots) {
        if (remaining <= 0) break;
        const consume = Math.min(lot.available, remaining);
        consumptions.push({ lotNo: lot.lotNo, qty: consume, costPerUnit: lot.costPerUnit });
        remaining -= consume;
      }

      // Create cost layers for each consumed lot (diff_amount = 0 when stock is enough)
      let layerIndex = 1;
      for (const c of consumptions) {
        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: txnDetail.id,
            lot_no: cnLotNo,
            lot_index: layerIndex++,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: nowIso,
            lot_seq_no: lotSeqNo,
            product_id: item.product_id,
            parent_lot_no: c.lotNo,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.credit_note_quantity,
            in_qty: 0,
            out_qty: c.qty,
            cost_per_unit: cnCost,
            total_cost: Math.round(cnCost * c.qty * 100) / 100,
            diff_amount: 0,
            average_cost_per_unit: newAvgCost,
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }

      // Case 3: No stock available — diff_amount only happens here
      if (remaining > 0) {
        const diffAmount = Math.round(cnCost * remaining * 100) / 100;

        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: txnDetail.id,
            lot_no: cnLotNo,
            lot_index: layerIndex++,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: nowIso,
            lot_seq_no: lotSeqNo,
            product_id: item.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.credit_note_quantity,
            in_qty: 0,
            out_qty: 0,
            cost_per_unit: cnCost,
            total_cost: 0,
            diff_amount: diffAmount,
            average_cost_per_unit: newAvgCost,
            note: `No stock available for ${remaining} units`,
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }
    }

    return inventoryTransaction.id;
  }

  // ============================================================
  // CREDIT NOTE AMOUNT (FIFO / AVERAGE)
  // ============================================================

  @TryCatch
  async createCreditNoteAmountTransaction(
    data: ICreditNoteAmountPayload,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'createCreditNoteAmountTransaction', data }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    let transactionId = '';

    const method = await this.getCalculationMethod(data.bu_code);

    await prisma.$transaction(async (tx: unknown) => {
      if (method === 'average') {
        transactionId = await this.createAverageCreditNoteAmount(tx, data);
      } else {
        transactionId = await this.createFifoCreditNoteAmount(tx, data);
      }
    });

    return Result.ok({ id: transactionId });
  }

  /**
   * FIFO Credit Note Amount — adjust cost by reversing remaining stock and re-receiving.
   *
   * For each CN detail item (1 GRN lot per product+location):
   *   1. Find the GRN lot's remaining qty/cost (after any prior consumption)
   *   2. SO (deduct) remaining qty at original cost
   *   3. Re-receive remaining qty at adjusted cost via splitFifoCost
   *
   * Case 1 — CN amount <= remaining cost:
   *   new_total_cost = remaining_cost − cn_amount
   *   Re-receive at new_total_cost / remaining_qty (splitFifoCost handles rounding)
   *
   * Case 2 — CN amount > remaining cost:
   *   Re-receive at same original cost (can't reduce below zero)
   *   diff_amount = cn_amount − remaining_cost (excess recorded)
   *
   * Net stock effect = 0.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createFifoCreditNoteAmount(
    tx: any,
    payload: ICreditNoteAmountPayload,
  ): Promise<string> {
    const now = new Date();
    const nowIso = now.toISOString();
    const atPeriod = format(now, 'yyMM');
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // 1. Create transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.credit_note,
        inventory_doc_no: payload.grn_id,
        note: `Credit Note (amount) for GRN ${payload.grn_id}`,
        created_by_id: payload.user_id,
        created_at: nowIso,
        updated_by_id: payload.user_id,
        updated_at: nowIso,
      },
    });

    // 2. Find the original GRN transaction to get its lot numbers
    const grnTransaction = await tx.tb_inventory_transaction.findFirst({
      where: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!grnTransaction) {
      throw new Error(`GRN transaction not found for grn_id: ${payload.grn_id}`);
    }

    const grnDetails = await tx.tb_inventory_transaction_detail.findMany({
      where: {
        inventory_transaction_id: grnTransaction.id,
      },
      select: {
        product_id: true,
        location_id: true,
        current_lot_no: true,
      },
    });

    // 3. Process each CN detail item
    for (const item of payload.detail_items) {
      if (item.amount <= 0) continue;

      // Find the GRN lot for this product+location (1 lot per product+location per GRN)
      const matchingGrnDetail = grnDetails.find(
        (d: any) => d.product_id === item.product_id && d.location_id === item.location_id,
      );
      if (!matchingGrnDetail?.current_lot_no) continue;

      const grnLotNo = matchingGrnDetail.current_lot_no as string;

      // Get the available lot (remaining qty & cost after prior consumption)
      const availableLots = await this.getAvailableFifoLots(tx, item.product_id, item.location_id);
      const grnLot = availableLots.find(l => l.lotNo === grnLotNo);

      if (!grnLot || grnLot.available <= 0) continue;

      const remainingQty = grnLot.available;
      const originalCostPerUnit = grnLot.costPerUnit;
      const remainingCost = Math.round(remainingQty * originalCostPerUnit * 100) / 100;

      // item.amount = new total cost for the remaining stock
      const newTotalCost = Math.round(item.amount * 100) / 100;
      const newCostPerUnit = Math.round((newTotalCost / remainingQty) * 100) / 100;
      const diffAmount = 0;

      // ── STEP A: SO (deduct) remaining qty at original cost ──

      const outLotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const outLotNo = `CNA-OUT-${year}-${month}-${outLotSeqNo.toString().padStart(4, '0')}`;

      const outDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: outLotNo,
          qty: -remainingQty,
          cost_per_unit: originalCostPerUnit,
          total_cost: remainingCost,
          created_by_id: payload.user_id,
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      // OUT cost layer referencing the original GRN lot
      await tx.tb_inventory_transaction_cost_layer.create({
        data: {
          inventory_transaction_detail_id: outDetail.id,
          lot_no: outLotNo,
          lot_index: 1,
          location_id: item.location_id,
          location_code: item.location_code,
          lot_at_date: nowIso,
          lot_seq_no: outLotSeqNo,
          product_id: item.product_id,
          parent_lot_no: grnLotNo,
          at_period: atPeriod,
          transaction_type: enum_transaction_type.credit_note_amount,
          in_qty: 0,
          out_qty: remainingQty,
          cost_per_unit: originalCostPerUnit,
          total_cost: remainingCost,
          diff_amount: 0,
          average_cost_per_unit: 0,
          created_by_id: payload.user_id,
          created_at: nowIso,
        },
      });

      // ── STEP B: Re-receive remaining qty at adjusted cost ──

      const inLotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const inLotNo = `CNA-IN-${year}-${month}-${inLotSeqNo.toString().padStart(4, '0')}`;

      const inDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: inLotNo,
          qty: remainingQty,
          cost_per_unit: newCostPerUnit,
          total_cost: newTotalCost,
          created_by_id: payload.user_id,
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      // IN cost layers via splitFifoCost for exact decimal reconciliation
      const costLayers = splitFifoCost(remainingQty, newTotalCost, 2);

      for (let i = 0; i < costLayers.length; i++) {
        const layer = costLayers[i];
        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: inDetail.id,
            lot_no: inLotNo,
            lot_index: i + 1,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: nowIso,
            lot_seq_no: inLotSeqNo,
            product_id: item.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.credit_note_amount,
            in_qty: layer.qty,
            out_qty: 0,
            cost_per_unit: layer.costPerUnit,
            total_cost: layer.totalCost,
            diff_amount: i === 0 ? diffAmount : 0, // Record excess on first layer (Case 2)
            average_cost_per_unit: 0,
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }
    }

    return inventoryTransaction.id;
  }

  /**
   * Average Credit Note Amount — same deduct/re-receive logic as FIFO,
   * but also recalculates the weighted average cost and updates all
   * existing layers for each affected product.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async createAverageCreditNoteAmount(
    tx: any,
    payload: ICreditNoteAmountPayload,
  ): Promise<string> {
    const now = new Date();
    const nowIso = now.toISOString();
    const atPeriod = format(now, 'yyMM');
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // 1. Create transaction header
    const inventoryTransaction = await tx.tb_inventory_transaction.create({
      data: {
        inventory_doc_type: enum_inventory_doc_type.credit_note,
        inventory_doc_no: payload.grn_id,
        note: `Credit Note (amount) for GRN ${payload.grn_id}`,
        created_by_id: payload.user_id,
        created_at: nowIso,
        updated_by_id: payload.user_id,
        updated_at: nowIso,
      },
    });

    // 2. Find the original GRN transaction
    const grnTransaction = await tx.tb_inventory_transaction.findFirst({
      where: {
        inventory_doc_type: enum_inventory_doc_type.good_received_note,
        inventory_doc_no: payload.grn_id,
        deleted_at: null,
      },
      select: { id: true },
    });

    if (!grnTransaction) {
      throw new Error(`GRN transaction not found for grn_id: ${payload.grn_id}`);
    }

    const grnDetails = await tx.tb_inventory_transaction_detail.findMany({
      where: {
        inventory_transaction_id: grnTransaction.id,
      },
      select: {
        product_id: true,
        location_id: true,
        current_lot_no: true,
      },
    });

    const affectedProductIds = new Set<string>();

    // 3. Process each CN detail item
    for (const item of payload.detail_items) {
      if (item.amount <= 0) continue;

      const matchingGrnDetail = grnDetails.find(
        (d: any) => d.product_id === item.product_id && d.location_id === item.location_id,
      );
      if (!matchingGrnDetail?.current_lot_no) continue;

      const grnLotNo = matchingGrnDetail.current_lot_no as string;

      // Check if this GRN lot has already been CN-Amount processed
      // (In Average mode, CNA-OUT/CNA-IN net to 0 on balance, so locationBalance alone can't detect duplicates)
      const priorCnaOut = await tx.tb_inventory_transaction_cost_layer.findFirst({
        where: {
          parent_lot_no: grnLotNo,
          product_id: item.product_id,
          location_id: item.location_id,
          out_qty: { gt: 0 },
          transaction_type: enum_transaction_type.credit_note_amount,
          deleted_at: null,
        },
      });
      if (priorCnaOut) {
        throw new Error(`GRN lot ${grnLotNo} has already been processed by Credit Note Amount`);
      }

      // For Average costing, use location balance as remaining qty
      // (getAvailableFifoLots doesn't work because Average out records don't set parent_lot_no)
      const remainingQty = await this.getLocationBalance(tx, item.product_id, item.location_id);
      if (remainingQty <= 0) continue;

      // Verify the GRN lot has cost layer data
      const grnCostLayerCount = await tx.tb_inventory_transaction_cost_layer.count({
        where: { lot_no: grnLotNo, in_qty: { gt: 0 }, deleted_at: null },
      });
      if (grnCostLayerCount === 0) continue;

      affectedProductIds.add(item.product_id);

      // Use current average cost for the OUT (not individual GRN lot cost)
      const avgCostBefore = await this.getCurrentAverageCost(tx, item.product_id);
      const remainingCost = Math.round(remainingQty * avgCostBefore * 100) / 100;

      // item.amount = new total cost for the remaining stock
      const newTotalCost = Math.round(item.amount * 100) / 100;
      const newCostPerUnit = Math.round((newTotalCost / remainingQty) * 100) / 100;
      const diffAmount = 0;

      // ── STEP A: SO (deduct) remaining qty at average cost ──

      const outLotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const outLotNo = `CNA-OUT-${year}-${month}-${outLotSeqNo.toString().padStart(4, '0')}`;

      const outDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: outLotNo,
          qty: -remainingQty,
          cost_per_unit: avgCostBefore,
          total_cost: remainingCost,
          created_by_id: payload.user_id,
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      await tx.tb_inventory_transaction_cost_layer.create({
        data: {
          inventory_transaction_detail_id: outDetail.id,
          lot_no: outLotNo,
          lot_index: 1,
          location_id: item.location_id,
          location_code: item.location_code,
          lot_at_date: nowIso,
          lot_seq_no: outLotSeqNo,
          product_id: item.product_id,
          parent_lot_no: grnLotNo,
          at_period: atPeriod,
          transaction_type: enum_transaction_type.credit_note_amount,
          in_qty: 0,
          out_qty: remainingQty,
          cost_per_unit: avgCostBefore,
          total_cost: remainingCost,
          diff_amount: 0,
          average_cost_per_unit: avgCostBefore,
          created_by_id: payload.user_id,
          created_at: nowIso,
        },
      });

      // ── STEP B: Re-receive remaining qty at adjusted cost ──

      const inLotSeqNo = await this.getNextLotSeqNo(tx, atPeriod);
      const inLotNo = `CNA-IN-${year}-${month}-${inLotSeqNo.toString().padStart(4, '0')}`;

      const inDetail = await tx.tb_inventory_transaction_detail.create({
        data: {
          inventory_transaction_id: inventoryTransaction.id,
          product_id: item.product_id,
          location_id: item.location_id,
          location_code: item.location_code,
          current_lot_no: inLotNo,
          qty: remainingQty,
          cost_per_unit: newCostPerUnit,
          total_cost: newTotalCost,
          created_by_id: payload.user_id,
          created_at: nowIso,
          updated_by_id: payload.user_id,
          updated_at: nowIso,
        },
      });

      const costLayers = splitFifoCost(remainingQty, newTotalCost, 2);

      for (let i = 0; i < costLayers.length; i++) {
        const layer = costLayers[i];
        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: inDetail.id,
            lot_no: inLotNo,
            lot_index: i + 1,
            location_id: item.location_id,
            location_code: item.location_code,
            lot_at_date: nowIso,
            lot_seq_no: inLotSeqNo,
            product_id: item.product_id,
            at_period: atPeriod,
            transaction_type: enum_transaction_type.credit_note_amount,
            in_qty: layer.qty,
            out_qty: 0,
            cost_per_unit: layer.costPerUnit,
            total_cost: layer.totalCost,
            diff_amount: i === 0 ? diffAmount : 0,
            average_cost_per_unit: 0, // Will be updated below
            created_by_id: payload.user_id,
            created_at: nowIso,
          },
        });
      }
    }

    // 4. Recalculate and update average cost for all affected products
    for (const productId of affectedProductIds) {
      const layers = await this.getReceivingLayers(tx, productId);
      const newAvgCost = calculateAverageCost(layers);

      await tx.tb_inventory_transaction_cost_layer.updateMany({
        where: { product_id: productId, deleted_at: null },
        data: { average_cost_per_unit: newAvgCost },
      });
    }

    return inventoryTransaction.id;
  }

  // ============================================================
  // QUERY METHODS
  // ============================================================

  @TryCatch
  async getCostLayers(
    query: ICostLayerQuery,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getCostLayers', query }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deleted_at: null };
    if (query.product_id) where.product_id = query.product_id;
    if (query.location_id) where.location_id = query.location_id;

    const layers = await prisma.tb_inventory_transaction_cost_layer.findMany({
      where,
      include: {
        tb_inventory_transaction_detail: {
          select: {
            tb_inventory_transaction: {
              select: { inventory_doc_no: true },
            },
          },
        },
      },
      orderBy: [
        { product_id: 'asc' },
        { lot_at_date: 'asc' },
        { lot_seq_no: 'asc' },
        { lot_index: 'asc' },
        { created_at: 'asc' },
      ],
    });

    const result = layers.map((layer: any) => ({
      id: layer.id,
      lot_no: layer.lot_no,
      lot_index: layer.lot_index,
      parent_lot_no: layer.parent_lot_no,
      transaction_type: layer.transaction_type,
      product_id: layer.product_id,
      location_id: layer.location_id,
      location_code: layer.location_code,
      in_qty: Number(layer.in_qty),
      out_qty: Number(layer.out_qty),
      balance: Number(layer.in_qty) - Number(layer.out_qty),
      cost_per_unit: Number(layer.cost_per_unit),
      total_cost: Number(layer.total_cost),
      diff_amount: Number(layer.diff_amount),
      average_cost_per_unit: Number(layer.average_cost_per_unit),
      lot_at_date: layer.lot_at_date,
      lot_seq_no: layer.lot_seq_no,
      at_period: layer.at_period,
      created_at: layer.created_at,
      inventory_doc_no: layer.tb_inventory_transaction_detail?.tb_inventory_transaction?.inventory_doc_no ?? null,
    }));

    return Result.ok(result);
  }

  @TryCatch
  async getStockBalance(
    query: IStockBalanceQuery,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug({ function: 'getStockBalance', query }, InventoryTransactionService.name);

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deleted_at: null };
    if (query.product_id) where.product_id = query.product_id;

    const layers = await prisma.tb_inventory_transaction_cost_layer.findMany({
      where,
      select: {
        product_id: true,
        location_id: true,
        location_code: true,
        in_qty: true,
        out_qty: true,
        cost_per_unit: true,
        average_cost_per_unit: true,
      },
    });

    // Aggregate per product + location
    const balanceMap = new Map<string, {
      product_id: string;
      location_id: string | null;
      location_code: string | null;
      total_in: number;
      total_out: number;
      latest_avg_cost: number;
    }>();

    for (const layer of layers) {
      const key = `${layer.product_id}|${layer.location_id}`;
      const existing = balanceMap.get(key);
      if (existing) {
        existing.total_in += Number(layer.in_qty);
        existing.total_out += Number(layer.out_qty);
        existing.latest_avg_cost = Number(layer.average_cost_per_unit) || existing.latest_avg_cost;
      } else {
        balanceMap.set(key, {
          product_id: layer.product_id!,
          location_id: layer.location_id,
          location_code: layer.location_code,
          total_in: Number(layer.in_qty),
          total_out: Number(layer.out_qty),
          latest_avg_cost: Number(layer.average_cost_per_unit),
        });
      }
    }

    const result = [...balanceMap.values()].map((item) => ({
      product_id: item.product_id,
      location_id: item.location_id,
      location_code: item.location_code,
      total_in_qty: item.total_in,
      total_out_qty: item.total_out,
      balance: item.total_in - item.total_out,
      latest_avg_cost: item.latest_avg_cost,
      total_value: Math.round((item.total_in - item.total_out) * item.latest_avg_cost * 100) / 100,
    }));

    return Result.ok(result);
  }

  // ──────────────────────────────────────────────────────────────────────
  // ⚠️ TEMPORARY — helper queries for the test frontend.
  // Remove these when proper master-data lookup is wired through the UI.
  // ──────────────────────────────────────────────────────────────────────

  /**
   * ⚠️ TEMPORARY — Returns active locations.
   * Remove when the frontend uses the proper master-data endpoints.
   */
  async getLocations(
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const locations = await prisma.tb_location.findMany({
      where: { is_active: true, deleted_at: null },
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { tb_product_location: { where: { deleted_at: null } } } },
      },
      orderBy: { code: 'asc' },
    });

    const result = locations
      .map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        product_count: l._count.tb_product_location,
      }))
      .sort((a, b) => b.product_count - a.product_count);

    return Result.ok(result);
  }

  /**
   * ⚠️ TEMPORARY — Returns all unique products that have at least one location assignment.
   * Remove when the frontend uses the proper master-data endpoints.
   */
  async getProducts(
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const productLocations = await prisma.tb_product_location.findMany({
      where: { deleted_at: null },
      select: {
        product_id: true,
        product_name: true,
        tb_product: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { product_name: 'asc' },
    });

    // Deduplicate by product_id
    const seen = new Set<string>();
    const result: { product_id: string; product_code: string | null; product_name: string | null }[] = [];
    for (const pl of productLocations) {
      if (seen.has(pl.product_id)) continue;
      seen.add(pl.product_id);
      result.push({
        product_id: pl.product_id,
        product_code: pl.tb_product?.code ?? null,
        product_name: pl.product_name ?? pl.tb_product?.name ?? null,
      });
    }

    return Result.ok(result);
  }

  /**
   * ⚠️ TEMPORARY — Returns products assigned to a given location.
   * Remove when the frontend uses the proper master-data endpoints.
   */
  async getProductsByLocation(
    location_id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    const productLocations = await prisma.tb_product_location.findMany({
      where: { location_id, deleted_at: null },
      select: {
        product_id: true,
        product_name: true,
        location_id: true,
        location_code: true,
        location_name: true,
        tb_product: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: { product_name: 'asc' },
    });

    const result = productLocations.map((pl) => ({
      product_id: pl.product_id,
      product_code: pl.tb_product?.code ?? null,
      product_name: pl.product_name ?? pl.tb_product?.name ?? null,
      location_id: pl.location_id,
      location_code: pl.location_code,
      location_name: pl.location_name,
    }));

    return Result.ok(result);
  }

  // ⚠️ TEMPORARY — Remove when the frontend uses proper master-data endpoints.
  async getCalculationMethodResult(bu_code: string): Promise<Result<unknown>> {
    const method = await this.getCalculationMethod(bu_code);
    return Result.ok({ calculation_method: method });
  }

  /**
   * ⚠️ TEST ONLY — DELETE. Clears inventory transactions by product or by transaction ID.
   */
  @TryCatch
  async clearProductTransactions(
    data: { product_id?: string; inventory_transaction_id?: string },
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    if (!data.product_id && !data.inventory_transaction_id) {
      return Result.error('Either product_id or inventory_transaction_id is required', ErrorCode.INVALID_ARGUMENT);
    }

    const tenant = await this.tenantService.getdb_connection(user_id, tenant_id);
    if (!tenant) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const prisma = await this.prismaTenant(tenant.tenant_id, tenant.db_connection);

    // Build detail filter based on input
    const detailWhere = data.inventory_transaction_id
      ? { inventory_transaction_id: data.inventory_transaction_id }
      : { product_id: data.product_id };

    // 1. Find transaction details matching the filter
    const details = await prisma.tb_inventory_transaction_detail.findMany({
      where: detailWhere,
      select: { id: true, product_id: true, inventory_transaction_id: true },
    });

    const detailIds = details.map((d) => d.id);
    const transactionIds = [...new Set(details.map((d) => d.inventory_transaction_id))];

    // 2. Delete cost layers linked to affected details
    const deletedLayers = await prisma.tb_inventory_transaction_cost_layer.deleteMany({
      where: { inventory_transaction_detail_id: { in: detailIds } },
    });

    // 3. Delete transaction details
    const deletedDetails = await prisma.tb_inventory_transaction_detail.deleteMany({
      where: { id: { in: detailIds } },
    });

    // 4. Delete transaction headers that have no remaining details
    let deletedHeaders = 0;
    for (const txnId of transactionIds) {
      const remaining = await prisma.tb_inventory_transaction_detail.count({
        where: { inventory_transaction_id: txnId },
      });
      if (remaining === 0) {
        await prisma.tb_inventory_transaction.delete({ where: { id: txnId } });
        deletedHeaders++;
      }
    }

    return Result.ok({
      deleted_cost_layers: deletedLayers.count,
      deleted_details: deletedDetails.count,
      deleted_headers: deletedHeaders,
    });
  }
}
