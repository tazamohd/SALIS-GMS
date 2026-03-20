import { Router } from 'express';
import { db } from '../db';
import { spareParts, sparePartInventories, purchaseOrders, purchaseOrderItems, suppliers, supplierPerformance } from '../../shared/schema';
import { eq, sql, and, lte, desc } from 'drizzle-orm';

const router = Router();

// GET /api/inventory/overview — Stock summary
router.get('/inventory/overview', async (req, res) => {
  try {
    const garageId = (req as any).user?.garageId;

    // Total distinct items
    const totalItemsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sparePartInventories)
      .where(garageId ? eq(sparePartInventories.garageId, garageId) : undefined);

    const totalItems = Number(totalItemsResult[0]?.count ?? 0);

    // Total inventory value (stockQuantity * costPrice)
    const totalValueResult = await db
      .select({
        value: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.costPrice}), 0)`,
      })
      .from(sparePartInventories)
      .where(garageId ? eq(sparePartInventories.garageId, garageId) : undefined);

    const totalValue = parseFloat(totalValueResult[0]?.value ?? '0');

    // Low stock count (stockQuantity > 0 AND stockQuantity <= minThreshold)
    const lowStockResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sparePartInventories)
      .where(
        garageId
          ? and(
              eq(sparePartInventories.garageId, garageId),
              sql`${sparePartInventories.stockQuantity} > 0`,
              sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`
            )
          : and(
              sql`${sparePartInventories.stockQuantity} > 0`,
              sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`
            )
      );

    const lowStockCount = Number(lowStockResult[0]?.count ?? 0);

    // Out of stock count (stockQuantity = 0)
    const outOfStockResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(sparePartInventories)
      .where(
        garageId
          ? and(
              eq(sparePartInventories.garageId, garageId),
              eq(sparePartInventories.stockQuantity, 0)
            )
          : eq(sparePartInventories.stockQuantity, 0)
      );

    const outOfStockCount = Number(outOfStockResult[0]?.count ?? 0);

    // Category breakdown for chart
    const categoryBreakdown = await db
      .select({
        category: spareParts.category,
        count: sql<number>`count(*)`,
        totalQty: sql<number>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
        totalValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.costPrice}), 0)`,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(garageId ? eq(sparePartInventories.garageId, garageId) : undefined)
      .groupBy(spareParts.category);

    res.json({
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount,
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        count: Number(c.count),
        totalQuantity: Number(c.totalQty),
        totalValue: parseFloat(String(c.totalValue)),
      })),
    });
  } catch (error: any) {
    console.error('Inventory overview error:', error);
    res.json({
      totalItems: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categoryBreakdown: [],
    });
  }
});

// GET /api/inventory/items — All inventory items with stock levels, reorder points, supplier info
router.get('/inventory/items', async (req, res) => {
  try {
    const garageId = (req as any).user?.garageId;

    const items = await db
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
      .where(garageId ? eq(sparePartInventories.garageId, garageId) : undefined)
      .orderBy(spareParts.name);

    const enrichedItems = items.map((item) => {
      const qty = Number(item.stockQuantity ?? 0);
      const threshold = Number(item.minThreshold ?? 5);
      let status: 'in_stock' | 'low' | 'out_of_stock';
      if (qty === 0) status = 'out_of_stock';
      else if (qty <= threshold) status = 'low';
      else status = 'in_stock';

      return {
        ...item,
        stockQuantity: qty,
        minThreshold: threshold,
        costPrice: parseFloat(String(item.costPrice ?? '0')),
        purchasePrice: parseFloat(String(item.purchasePrice ?? '0')),
        sellingPrice: parseFloat(String(item.sellingPrice ?? '0')),
        status,
        reorderPoint: threshold, // reorder at minThreshold
        lineValue: qty * parseFloat(String(item.costPrice ?? '0')),
      };
    });

    res.json({ items: enrichedItems });
  } catch (error: any) {
    console.error('Inventory items error:', error);
    res.json({ items: [] });
  }
});

// GET /api/inventory/low-stock — Items below minimum threshold
router.get('/inventory/low-stock', async (req, res) => {
  try {
    const garageId = (req as any).user?.garageId;

    const items = await db
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
          ? and(
              eq(sparePartInventories.garageId, garageId),
              sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`
            )
          : sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`
      )
      .orderBy(sparePartInventories.stockQuantity);

    const enrichedItems = items.map((item) => {
      const qty = Number(item.stockQuantity ?? 0);
      const threshold = Number(item.minThreshold ?? 5);
      return {
        ...item,
        stockQuantity: qty,
        minThreshold: threshold,
        costPrice: parseFloat(String(item.costPrice ?? '0')),
        status: qty === 0 ? 'out_of_stock' : 'low',
        suggestedReorderQty: Math.max(threshold * 2 - qty, threshold),
      };
    });

    res.json({ items: enrichedItems });
  } catch (error: any) {
    console.error('Low stock error:', error);
    res.json({ items: [] });
  }
});

// POST /api/inventory/reorder — Create purchase order for restocking
router.post('/inventory/reorder', async (req, res) => {
  try {
    const user = (req as any).user;
    const garageId = user?.garageId;
    const userId = user?.id;

    if (!garageId || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { supplierId, items, notes } = req.body;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'supplierId and items array are required' });
    }

    // Generate PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.quantity || 0) * (item.unitPrice || 0);
    }
    const taxAmount = subtotal * 0.15; // 15% VAT (Saudi standard)
    const totalAmount = subtotal + taxAmount;

    // Insert purchase order
    const [po] = await db
      .insert(purchaseOrders)
      .values({
        poNumber,
        garageId,
        supplierId,
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        notes: notes || `Auto-generated reorder - ${new Date().toISOString().split('T')[0]}`,
        createdBy: userId,
      })
      .returning();

    // Insert PO items
    if (po) {
      for (const item of items) {
        const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
        await db.insert(purchaseOrderItems).values({
          purchaseOrderId: po.id,
          partNumber: item.partNumber || null,
          partName: item.partName,
          quantity: item.quantity,
          unitPrice: (item.unitPrice || 0).toFixed(2),
          lineTotal: lineTotal.toFixed(2),
        });
      }
    }

    res.json({
      success: true,
      purchaseOrder: po,
      message: `Purchase order ${poNumber} created successfully`,
    });
  } catch (error: any) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// GET /api/inventory/suppliers — Supplier list with performance metrics
router.get('/inventory/suppliers', async (req, res) => {
  try {
    const garageId = (req as any).user?.garageId;

    const supplierList = await db
      .select()
      .from(suppliers)
      .where(
        garageId
          ? and(eq(suppliers.garageId, garageId), eq(suppliers.isActive, true))
          : eq(suppliers.isActive, true)
      )
      .orderBy(suppliers.name);

    // Get latest performance data for each supplier
    const performance = await db
      .select()
      .from(supplierPerformance)
      .orderBy(desc(supplierPerformance.period));

    // Build performance map (latest period per supplier)
    const perfMap = new Map<string, typeof performance[0]>();
    for (const p of performance) {
      if (!perfMap.has(p.supplierId)) {
        perfMap.set(p.supplierId, p);
      }
    }

    const enrichedSuppliers = supplierList.map((s) => {
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

    res.json({ suppliers: enrichedSuppliers });
  } catch (error: any) {
    console.error('Suppliers error:', error);
    res.json({ suppliers: [] });
  }
});

// GET /api/inventory/turnover — Inventory turnover analysis by category
router.get('/inventory/turnover', async (req, res) => {
  try {
    const garageId = (req as any).user?.garageId;

    const turnoverData = await db
      .select({
        category: spareParts.category,
        totalItems: sql<number>`count(*)`,
        totalStock: sql<number>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
        totalValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.costPrice}), 0)`,
        avgCostPrice: sql<string>`coalesce(avg(${sparePartInventories.costPrice}), 0)`,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(garageId ? eq(sparePartInventories.garageId, garageId) : undefined)
      .groupBy(spareParts.category);

    const enriched = turnoverData.map((row) => {
      const totalStock = Number(row.totalStock);
      const totalValue = parseFloat(String(row.totalValue));
      // Estimated annual turnover ratio (higher stock = potentially lower turnover)
      const turnoverRatio = totalStock > 0 ? Math.round((totalValue / (totalStock * parseFloat(String(row.avgCostPrice)))) * 12 * 100) / 100 : 0;

      return {
        category: row.category,
        totalItems: Number(row.totalItems),
        totalStock,
        totalValue,
        avgCostPrice: parseFloat(String(row.avgCostPrice)),
        turnoverRatio,
        health: turnoverRatio >= 6 ? 'good' : turnoverRatio >= 3 ? 'moderate' : 'slow',
      };
    });

    res.json({ turnover: enriched });
  } catch (error: any) {
    console.error('Turnover error:', error);
    res.json({ turnover: [] });
  }
});

// GET /api/inventory/valuation — Total inventory value
router.get('/inventory/valuation', async (req, res) => {
  try {
    const garageId = (req as any).user?.garageId;

    const valuationByCategory = await db
      .select({
        category: spareParts.category,
        itemCount: sql<number>`count(*)`,
        totalQuantity: sql<number>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
        totalCostValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.costPrice}), 0)`,
        totalSellingValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.sellingPrice}), 0)`,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(garageId ? eq(sparePartInventories.garageId, garageId) : undefined)
      .groupBy(spareParts.category);

    let grandTotalCost = 0;
    let grandTotalSelling = 0;
    let grandTotalQuantity = 0;
    let grandTotalItems = 0;

    const categories = valuationByCategory.map((row) => {
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
        margin: sellingValue > 0 ? Math.round(((sellingValue - costValue) / sellingValue) * 100 * 100) / 100 : 0,
      };
    });

    res.json({
      totalCostValue: grandTotalCost,
      totalSellingValue: grandTotalSelling,
      totalQuantity: grandTotalQuantity,
      totalItems: grandTotalItems,
      potentialProfit: grandTotalSelling - grandTotalCost,
      categories,
    });
  } catch (error: any) {
    console.error('Valuation error:', error);
    res.json({
      totalCostValue: 0,
      totalSellingValue: 0,
      totalQuantity: 0,
      totalItems: 0,
      potentialProfit: 0,
      categories: [],
    });
  }
});

export default router;
