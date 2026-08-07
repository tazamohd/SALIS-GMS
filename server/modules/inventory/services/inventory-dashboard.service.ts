/**
 * Inventory dashboard service (Phase E5 — Domain Services).
 *
 * Owns the analytics computation for the inventory dashboards — stock status
 * classification, reorder suggestions, turnover ratios, valuation grand totals —
 * and the reorder purchase-order orchestration (PO number, VAT, line items). All
 * data access flows through the injected repository. The math mirrors the legacy
 * handlers exactly.
 */

import type { IInventoryDashboardRepository } from '../repositories/inventory-dashboard.repository';
import { type InventoryOverview, type ReorderInput } from '../domain/inventory-dashboard.types';

const DEFAULT_MIN_THRESHOLD = 5;
const VAT_RATE = 0.15; // Saudi standard

export class InventoryDashboardService {
  constructor(private readonly repository: IInventoryDashboardRepository) {}

  async overview(garageId: string | undefined): Promise<InventoryOverview> {
    const [totalItems, totalValue, lowStockCount, outOfStockCount, categoryRows] = await Promise.all([
      this.repository.countItems(garageId),
      this.repository.sumValue(garageId),
      this.repository.countLowStock(garageId),
      this.repository.countOutOfStock(garageId),
      this.repository.categoryBreakdown(garageId),
    ]);
    return {
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      categoryBreakdown: categoryRows.map((c) => ({
        category: c.category,
        count: Number(c.count),
        totalQuantity: Number(c.totalQty),
        totalValue: parseFloat(String(c.totalValue)),
      })),
    };
  }

  async items(garageId: string | undefined) {
    const rows = await this.repository.items(garageId);
    const items = rows.map((item) => {
      const qty = Number(item.stockQuantity ?? 0);
      const threshold = Number(item.minThreshold ?? DEFAULT_MIN_THRESHOLD);
      const status = qty === 0 ? 'out_of_stock' : qty <= threshold ? 'low' : 'in_stock';
      return {
        ...item,
        stockQuantity: qty,
        minThreshold: threshold,
        costPrice: parseFloat(String(item.costPrice ?? '0')),
        purchasePrice: parseFloat(String(item.purchasePrice ?? '0')),
        sellingPrice: parseFloat(String(item.sellingPrice ?? '0')),
        status,
        reorderPoint: threshold,
        lineValue: qty * parseFloat(String(item.costPrice ?? '0')),
      };
    });
    return { items };
  }

  async lowStock(garageId: string | undefined) {
    const rows = await this.repository.lowStockItems(garageId);
    const items = rows.map((item) => {
      const qty = Number(item.stockQuantity ?? 0);
      const threshold = Number(item.minThreshold ?? DEFAULT_MIN_THRESHOLD);
      return {
        ...item,
        stockQuantity: qty,
        minThreshold: threshold,
        costPrice: parseFloat(String(item.costPrice ?? '0')),
        status: qty === 0 ? 'out_of_stock' : 'low',
        suggestedReorderQty: Math.max(threshold * 2 - qty, threshold),
      };
    });
    return { items };
  }

  async suppliers(garageId: string | undefined) {
    const [supplierList, performance] = await Promise.all([
      this.repository.activeSuppliers(garageId),
      this.repository.supplierPerformance(),
    ]);
    // Latest performance period per supplier.
    const perfMap = new Map<string, (typeof performance)[number]>();
    for (const p of performance) {
      if (!perfMap.has(p.supplierId)) perfMap.set(p.supplierId, p);
    }
    const suppliers = supplierList.map((s) => {
      const perf = perfMap.get(s.id);
      return {
        ...s,
        onTimeDeliveryRate: perf ? parseFloat(String(perf.onTimeDeliveryRate ?? '0')) : null,
        averageLeadTime: perf ? parseFloat(String(perf.averageLeadTime ?? '0')) : null,
        qualityScore: perf ? parseFloat(String(perf.qualityScore ?? '0')) : null,
        overallRating: perf ? parseFloat(String(perf.overallRating ?? '0')) : null,
        totalOrders: perf ? Number(perf.totalOrders ?? 0) : 0,
      };
    });
    return { suppliers };
  }

  async turnover(garageId: string | undefined) {
    const rows = await this.repository.turnoverByCategory(garageId);
    const turnover = rows.map((row) => {
      const totalStock = Number(row.totalStock);
      const totalValue = parseFloat(String(row.totalValue));
      const avgCostPrice = parseFloat(String(row.avgCostPrice));
      const turnoverRatio =
        totalStock > 0
          ? Math.round((totalValue / (totalStock * avgCostPrice)) * 12 * 100) / 100
          : 0;
      return {
        category: row.category,
        totalItems: Number(row.totalItems),
        totalStock,
        totalValue,
        avgCostPrice,
        turnoverRatio,
        health: turnoverRatio >= 6 ? 'good' : turnoverRatio >= 3 ? 'moderate' : 'slow',
      };
    });
    return { turnover };
  }

  async valuation(garageId: string | undefined) {
    const rows = await this.repository.valuationByCategory(garageId);
    let grandTotalCost = 0;
    let grandTotalSelling = 0;
    let grandTotalQuantity = 0;
    let grandTotalItems = 0;
    const categories = rows.map((row) => {
      const costValue = parseFloat(String(row.totalCostValue));
      const sellingValue = parseFloat(String(row.totalSellingValue));
      const qty = Number(row.totalQuantity);
      const items = Number(row.itemCount);
      grandTotalCost += costValue;
      grandTotalSelling += sellingValue;
      grandTotalQuantity += qty;
      grandTotalItems += items;
      return {
        category: row.category,
        itemCount: items,
        totalQuantity: qty,
        costValue,
        sellingValue,
        potentialProfit: sellingValue - costValue,
        margin:
          sellingValue > 0
            ? Math.round(((sellingValue - costValue) / sellingValue) * 100 * 100) / 100
            : 0,
      };
    });
    return {
      totalCostValue: grandTotalCost,
      totalSellingValue: grandTotalSelling,
      totalQuantity: grandTotalQuantity,
      totalItems: grandTotalItems,
      potentialProfit: grandTotalSelling - grandTotalCost,
      categories,
    };
  }

  /** Create a draft purchase order for restocking. Inputs are validated by the controller. */
  async reorder(garageId: string, userId: string, input: ReorderInput) {
    const items = input.items ?? [];
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    let subtotal = 0;
    for (const item of items) subtotal += (item.quantity || 0) * (item.unitPrice || 0);
    const taxAmount = subtotal * VAT_RATE;
    const totalAmount = subtotal + taxAmount;

    const po = await this.repository.createPurchaseOrder({
      poNumber,
      garageId,
      supplierId: input.supplierId as string,
      status: 'draft',
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      notes: input.notes || `Auto-generated reorder - ${new Date().toISOString().split('T')[0]}`,
      createdBy: userId,
    } as never);

    if (po) {
      for (const item of items) {
        const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
        await this.repository.createPurchaseOrderItem({
          purchaseOrderId: po.id,
          partNumber: item.partNumber || null,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: (item.unitPrice || 0).toFixed(2),
          lineTotal: lineTotal.toFixed(2),
        } as never);
      }
    }

    return { poNumber, purchaseOrder: po };
  }
}
