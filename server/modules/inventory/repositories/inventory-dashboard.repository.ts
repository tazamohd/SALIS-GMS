/**
 * Inventory dashboard repository (Phase E4 — Repository Pattern).
 *
 * Owns every Drizzle query behind the inventory analytics dashboards and the
 * reorder purchase-order writes — all previously inlined in the route handlers.
 * Returns raw query rows / primitives; the JS-side enrichment and computation
 * live in the service.
 */

import { db } from '../../../db';
import {
  spareParts,
  sparePartInventories,
  purchaseOrders,
  purchaseOrderItems,
  suppliers,
  supplierPerformance,
} from '@shared/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

const scoped = (garageId: string | undefined) =>
  garageId ? eq(sparePartInventories.garageId, garageId) : undefined;

export interface IInventoryDashboardRepository {
  countItems(garageId: string | undefined): Promise<number>;
  sumValue(garageId: string | undefined): Promise<number>;
  countLowStock(garageId: string | undefined): Promise<number>;
  countOutOfStock(garageId: string | undefined): Promise<number>;
  categoryBreakdown(garageId: string | undefined): Promise<any[]>;
  items(garageId: string | undefined): Promise<any[]>;
  lowStockItems(garageId: string | undefined): Promise<any[]>;
  activeSuppliers(garageId: string | undefined): Promise<Array<typeof suppliers.$inferSelect>>;
  supplierPerformance(): Promise<Array<typeof supplierPerformance.$inferSelect>>;
  turnoverByCategory(garageId: string | undefined): Promise<any[]>;
  valuationByCategory(garageId: string | undefined): Promise<any[]>;
  createPurchaseOrder(
    values: typeof purchaseOrders.$inferInsert,
  ): Promise<typeof purchaseOrders.$inferSelect>;
  createPurchaseOrderItem(values: typeof purchaseOrderItems.$inferInsert): Promise<void>;
}

export class InventoryDashboardRepository implements IInventoryDashboardRepository {
  async countItems(garageId: string | undefined): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(sparePartInventories)
      .where(scoped(garageId));
    return Number(rows[0]?.count ?? 0);
  }

  async sumValue(garageId: string | undefined): Promise<number> {
    const rows = await db
      .select({
        value: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * coalesce(${sparePartInventories.costPrice}, ${sparePartInventories.purchasePrice})), 0)`,
      })
      .from(sparePartInventories)
      .where(scoped(garageId));
    return parseFloat(rows[0]?.value ?? '0');
  }

  async countLowStock(garageId: string | undefined): Promise<number> {
    const lowStock = and(
      sql`${sparePartInventories.stockQuantity} > 0`,
      sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`,
    );
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(sparePartInventories)
      .where(garageId ? and(eq(sparePartInventories.garageId, garageId), lowStock) : lowStock);
    return Number(rows[0]?.count ?? 0);
  }

  async countOutOfStock(garageId: string | undefined): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(sparePartInventories)
      .where(
        garageId
          ? and(eq(sparePartInventories.garageId, garageId), eq(sparePartInventories.stockQuantity, 0))
          : eq(sparePartInventories.stockQuantity, 0),
      );
    return Number(rows[0]?.count ?? 0);
  }

  categoryBreakdown(garageId: string | undefined) {
    return db
      .select({
        category: spareParts.category,
        count: sql<number>`count(*)`,
        totalQty: sql<number>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
        totalValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * coalesce(${sparePartInventories.costPrice}, ${sparePartInventories.purchasePrice})), 0)`,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(scoped(garageId))
      .groupBy(spareParts.category);
  }

  items(garageId: string | undefined) {
    return db
      .select({
        inventoryId: sparePartInventories.id,
        sparePartId: sparePartInventories.sparePartId,
        garageId: sparePartInventories.garageId,
        stockQuantity: sparePartInventories.stockQuantity,
        minThreshold: sparePartInventories.minThreshold,
        purchasePrice: sparePartInventories.purchasePrice,
        sellingPrice: sparePartInventories.sellingPrice,
        costPrice: sparePartInventories.costPrice,
        currency: sparePartInventories.currency,
        location: sparePartInventories.location,
        lastRestockedAt: sparePartInventories.lastRestockedAt,
        isEnabled: sparePartInventories.isEnabled,
        partName: spareParts.name,
        partNumber: spareParts.sku,
        category: spareParts.category,
        subcategory: spareParts.subcategory,
        brand: spareParts.brand,
        manufacturer: spareParts.manufacturer,
        barcode: spareParts.barcode,
        partType: spareParts.partType,
        unitOfMeasure: spareParts.unitOfMeasure,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(scoped(garageId))
      .orderBy(spareParts.name);
  }

  lowStockItems(garageId: string | undefined) {
    const belowThreshold = sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`;
    return db
      .select({
        inventoryId: sparePartInventories.id,
        sparePartId: sparePartInventories.sparePartId,
        stockQuantity: sparePartInventories.stockQuantity,
        minThreshold: sparePartInventories.minThreshold,
        costPrice: sparePartInventories.costPrice,
        partName: spareParts.name,
        partNumber: spareParts.sku,
        category: spareParts.category,
        brand: spareParts.brand,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(
        garageId
          ? and(eq(sparePartInventories.garageId, garageId), belowThreshold)
          : belowThreshold,
      )
      .orderBy(sparePartInventories.stockQuantity);
  }

  activeSuppliers(garageId: string | undefined) {
    return db
      .select()
      .from(suppliers)
      .where(
        garageId
          ? and(eq(suppliers.garageId, garageId), eq(suppliers.isActive, true))
          : eq(suppliers.isActive, true),
      )
      .orderBy(suppliers.name);
  }

  supplierPerformance() {
    return db.select().from(supplierPerformance).orderBy(desc(supplierPerformance.period));
  }

  turnoverByCategory(garageId: string | undefined) {
    return db
      .select({
        category: spareParts.category,
        totalItems: sql<number>`count(*)`,
        totalStock: sql<number>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
        totalValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * coalesce(${sparePartInventories.costPrice}, ${sparePartInventories.purchasePrice})), 0)`,
        avgCostPrice: sql<string>`coalesce(avg(${sparePartInventories.costPrice}), 0)`,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(scoped(garageId))
      .groupBy(spareParts.category);
  }

  valuationByCategory(garageId: string | undefined) {
    return db
      .select({
        category: spareParts.category,
        itemCount: sql<number>`count(*)`,
        totalQuantity: sql<number>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
        totalCostValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * coalesce(${sparePartInventories.costPrice}, ${sparePartInventories.purchasePrice})), 0)`,
        totalSellingValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.sellingPrice}), 0)`,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(scoped(garageId))
      .groupBy(spareParts.category);
  }

  async createPurchaseOrder(values: typeof purchaseOrders.$inferInsert) {
    const [po] = await db.insert(purchaseOrders).values(values).returning();
    return po;
  }

  async createPurchaseOrderItem(values: typeof purchaseOrderItems.$inferInsert) {
    await db.insert(purchaseOrderItems).values(values);
  }
}
