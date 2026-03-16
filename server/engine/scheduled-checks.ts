/**
 * SALIS AUTO - Scheduled Checks
 * Periodic inventory and invoice checks that emit events via the workflow engine.
 */

import { db } from '../db';
import { sparePartInventories, spareParts, invoices, users } from '../../shared/schema';
import { eq, and, lt, sql, inArray } from 'drizzle-orm';
import { eventBus } from './event-bus';

/**
 * Run all scheduled checks for a garage.
 * Call periodically (e.g., every hour via cron or at server startup).
 */
export async function runScheduledChecks(garageId: string): Promise<{
  lowStockAlerts: number;
  overdueInvoices: number;
}> {
  const [lowStock, overdue] = await Promise.all([
    checkLowStockLevels(garageId),
    checkOverdueInvoices(garageId),
  ]);

  return {
    lowStockAlerts: lowStock,
    overdueInvoices: overdue,
  };
}

/** Check inventory levels and emit low_stock events */
async function checkLowStockLevels(garageId: string): Promise<number> {
  try {
    const lowStockItems = await db
      .select({
        inventoryId: sparePartInventories.id,
        sparePartId: sparePartInventories.sparePartId,
        partName: spareParts.name,
        partNumber: spareParts.sku,
        stockQuantity: sparePartInventories.stockQuantity,
        minThreshold: sparePartInventories.minThreshold,
      })
      .from(sparePartInventories)
      .innerJoin(spareParts, eq(sparePartInventories.sparePartId, spareParts.id))
      .where(
        and(
          eq(sparePartInventories.garageId, garageId),
          eq(sparePartInventories.isEnabled, true),
          sql`${sparePartInventories.stockQuantity} <= ${sparePartInventories.minThreshold}`,
        ),
      );

    for (const item of lowStockItems) {
      const isOutOfStock = (item.stockQuantity ?? 0) === 0;
      await eventBus.emit(
        eventBus.createEvent(
          isOutOfStock ? 'inventory.out_of_stock' : 'inventory.low_stock',
          'spare_part',
          item.sparePartId,
          garageId,
          {
            partName: item.partName,
            partNumber: item.partNumber,
            currentQty: item.stockQuantity,
            minQty: item.minThreshold,
          },
          'system',
        ),
      );
    }

    return lowStockItems.length;
  } catch (err) {
    console.error('[ScheduledChecks] Low stock check error:', err);
    return 0;
  }
}

/** Check for overdue invoices and emit overdue events */
async function checkOverdueInvoices(garageId: string): Promise<number> {
  try {
    const now = new Date();
    const overdueInvoiceList = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        totalAmount: invoices.totalAmount,
        balanceAmount: invoices.balanceAmount,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.garageId, garageId),
          inArray(invoices.status, ['sent']),
          lt(invoices.dueDate, now),
        ),
      );

    for (const inv of overdueInvoiceList) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24),
      );

      // Update status to overdue
      await db
        .update(invoices)
        .set({ status: 'overdue', updatedAt: now })
        .where(eq(invoices.id, inv.id));

      await eventBus.emit(
        eventBus.createEvent(
          'invoice.overdue',
          'invoice',
          inv.id,
          garageId,
          {
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerId: inv.customerId,
            amount: inv.balanceAmount,
            daysOverdue,
          },
          'system',
        ),
      );
    }

    return overdueInvoiceList.length;
  } catch (err) {
    console.error('[ScheduledChecks] Overdue invoice check error:', err);
    return 0;
  }
}
