import { describe, it, expect, vi } from 'vitest';
import { InventoryDashboardService } from '../services/inventory-dashboard.service';
import type { IInventoryDashboardRepository } from '../repositories/inventory-dashboard.repository';

function makeRepo(overrides: Partial<IInventoryDashboardRepository> = {}): IInventoryDashboardRepository {
  return {
    countItems: vi.fn(async () => 0),
    sumValue: vi.fn(async () => 0),
    countLowStock: vi.fn(async () => 0),
    countOutOfStock: vi.fn(async () => 0),
    categoryBreakdown: vi.fn(async () => []),
    items: vi.fn(async () => []),
    lowStockItems: vi.fn(async () => []),
    activeSuppliers: vi.fn(async () => [] as never),
    supplierPerformance: vi.fn(async () => [] as never),
    turnoverByCategory: vi.fn(async () => []),
    valuationByCategory: vi.fn(async () => []),
    createPurchaseOrder: vi.fn(async () => ({ id: 'po1' }) as never),
    createPurchaseOrderItem: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('InventoryDashboardService.overview', () => {
  it('assembles counts and maps the category breakdown', async () => {
    const repo = makeRepo({
      countItems: vi.fn(async () => 12),
      sumValue: vi.fn(async () => 3400.5),
      countLowStock: vi.fn(async () => 3),
      countOutOfStock: vi.fn(async () => 1),
      categoryBreakdown: vi.fn(async () => [{ category: 'brakes', count: 4, totalQty: 40, totalValue: '900.00' }]),
    });
    const result = await new InventoryDashboardService(repo).overview('g1');
    expect(result).toMatchObject({ totalItems: 12, totalValue: 3400.5, lowStockCount: 3, outOfStockCount: 1 });
    expect(result.categoryBreakdown[0]).toEqual({ category: 'brakes', count: 4, totalQuantity: 40, totalValue: 900 });
  });
});

describe('InventoryDashboardService.items', () => {
  it('classifies stock status and computes line value', async () => {
    const repo = makeRepo({
      items: vi.fn(async () => [
        { stockQuantity: 0, minThreshold: 5, costPrice: '10' },
        { stockQuantity: 3, minThreshold: 5, costPrice: '10' },
        { stockQuantity: 20, minThreshold: 5, costPrice: '10' },
      ] as never),
    });
    const { items } = await new InventoryDashboardService(repo).items('g1');
    expect(items.map((i) => i.status)).toEqual(['out_of_stock', 'low', 'in_stock']);
    expect(items[2].lineValue).toBe(200); // 20 * 10
  });
});

describe('InventoryDashboardService.lowStock', () => {
  it('suggests a reorder quantity', async () => {
    const repo = makeRepo({
      lowStockItems: vi.fn(async () => [{ stockQuantity: 2, minThreshold: 5, costPrice: '4' }] as never),
    });
    const { items } = await new InventoryDashboardService(repo).lowStock('g1');
    // max(5*2 - 2, 5) = 8
    expect(items[0].suggestedReorderQty).toBe(8);
    expect(items[0].status).toBe('low');
  });
});

describe('InventoryDashboardService.turnover', () => {
  it('computes turnover ratio and health band', async () => {
    const repo = makeRepo({
      turnoverByCategory: vi.fn(async () => [
        { category: 'oil', totalItems: 2, totalStock: 10, totalValue: '100', avgCostPrice: '10' },
      ] as never),
    });
    const { turnover } = await new InventoryDashboardService(repo).turnover('g1');
    // (100 / (10*10)) * 12 = 12 → good
    expect(turnover[0].turnoverRatio).toBe(12);
    expect(turnover[0].health).toBe('good');
  });
});

describe('InventoryDashboardService.valuation', () => {
  it('accumulates grand totals and margin per category', async () => {
    const repo = makeRepo({
      valuationByCategory: vi.fn(async () => [
        { category: 'a', itemCount: 2, totalQuantity: 5, totalCostValue: '100', totalSellingValue: '200' },
      ] as never),
    });
    const result = await new InventoryDashboardService(repo).valuation('g1');
    expect(result.totalCostValue).toBe(100);
    expect(result.totalSellingValue).toBe(200);
    expect(result.potentialProfit).toBe(100);
    expect(result.categories[0].margin).toBe(50); // (200-100)/200 * 100
  });
});

describe('InventoryDashboardService.suppliers', () => {
  it('joins the latest performance period per supplier', async () => {
    const repo = makeRepo({
      activeSuppliers: vi.fn(async () => [{ id: 's1', name: 'Acme' }] as never),
      supplierPerformance: vi.fn(async () => [
        { supplierId: 's1', period: '2024-02', qualityScore: '9', totalOrders: 5 },
        { supplierId: 's1', period: '2024-01', qualityScore: '7', totalOrders: 3 },
      ] as never),
    });
    const { suppliers } = await new InventoryDashboardService(repo).suppliers('g1');
    expect(suppliers[0].qualityScore).toBe(9); // latest (first in desc order) wins
    expect(suppliers[0].totalOrders).toBe(5);
  });
});

describe('InventoryDashboardService.reorder', () => {
  it('creates a PO with VAT and one line item per input item', async () => {
    const createPO = vi.fn(async () => ({ id: 'po9' }) as never);
    const createItem = vi.fn(async () => undefined);
    const repo = makeRepo({ createPurchaseOrder: createPO, createPurchaseOrderItem: createItem });
    const { purchaseOrder } = await new InventoryDashboardService(repo).reorder('g1', 'u1', {
      supplierId: 'sup1',
      items: [
        { partName: 'Pad', quantity: 2, unitPrice: 50 },
        { partName: 'Filter', quantity: 1, unitPrice: 30 },
      ],
    });
    expect(purchaseOrder).toMatchObject({ id: 'po9' });
    // subtotal 130, tax 19.50, total 149.50
    expect(createPO).toHaveBeenCalledWith(
      expect.objectContaining({ garageId: 'g1', supplierId: 'sup1', subtotal: '130.00', taxAmount: '19.50', totalAmount: '149.50' }),
    );
    expect(createItem).toHaveBeenCalledTimes(2);
  });
});
