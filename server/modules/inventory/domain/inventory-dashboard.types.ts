/**
 * Inventory dashboard domain types (Phase E2 — domain layer).
 *
 * Result shapes for the inventory analytics dashboards (overview, items,
 * low-stock, suppliers, turnover, valuation) and the reorder purchase-order
 * flow. The GET dashboards gracefully degrade to zeroed/empty defaults on a
 * query error (a deliberate UX choice preserved from the legacy handlers).
 */

export interface InventoryOverview {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryBreakdown: Array<{
    category: string | null;
    count: number;
    totalQuantity: number;
    totalValue: number;
  }>;
}

export const EMPTY_OVERVIEW: InventoryOverview = {
  totalItems: 0,
  totalValue: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  categoryBreakdown: [],
};

export interface ReorderInput {
  supplierId?: string;
  items?: Array<{
    partNumber?: string | null;
    partName?: string;
    quantity?: number;
    unitPrice?: number;
  }>;
  notes?: string;
}
