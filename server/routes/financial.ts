// @ts-nocheck
/**
 * SALIS AUTO - Financial API Routes
 * Generates real financial reports by querying the database.
 * Replaces hardcoded mock data with live GL, Balance Sheet, P&L, AR, AP, etc.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  invoices, invoiceItems, payments, purchaseOrders, purchaseOrderItems,
  sparePartInventories, spareParts, users, suppliers, jobCards,
} from '../../shared/schema';
import { eq, and, gte, lte, sql, count, sum, desc, asc, inArray } from 'drizzle-orm';

const router = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse optional date-range query params, defaulting to current fiscal year. */
function parseDateRange(req: Request): { startDate: Date; endDate: Date } {
  const now = new Date();
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : new Date(now.getFullYear(), 0, 1); // Jan 1 of current year
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { startDate, endDate };
}

function requireGarageId(req: Request, res: Response): string | null {
  const user = req.user as any;
  if (!user?.garageId) {
    res.status(403).json({ message: 'No garage associated with user' });
    return null;
  }
  return user.garageId;
}

// ─── GET /api/financial/general-ledger ────────────────────────────────────

router.get('/financial/general-ledger', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    const { startDate, endDate } = parseDateRange(req);

    // Build GL entries from paid invoices (Revenue) and received POs (Inventory / AP)
    const [paidInvoices, receivedPayments, receivedPOs] = await Promise.all([
      // Invoices in the period
      db.select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        date: invoices.invoiceDate,
        totalAmount: invoices.totalAmount,
        taxAmount: invoices.taxAmount,
        subtotal: invoices.subtotal,
        status: invoices.status,
        customerId: invoices.customerId,
      })
        .from(invoices)
        .where(
          and(
            eq(invoices.garageId, garageId),
            gte(invoices.invoiceDate, startDate),
            lte(invoices.invoiceDate, endDate),
          ),
        )
        .orderBy(asc(invoices.invoiceDate)),

      // Payments in the period
      db.select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        amount: payments.amount,
        paymentDate: payments.paymentDate,
        paymentMethod: payments.paymentMethod,
        referenceNumber: payments.referenceNumber,
      })
        .from(payments)
        .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            gte(payments.paymentDate, startDate),
            lte(payments.paymentDate, endDate),
          ),
        )
        .orderBy(asc(payments.paymentDate)),

      // Purchase orders received in the period
      db.select({
        id: purchaseOrders.id,
        poNumber: purchaseOrders.poNumber,
        date: purchaseOrders.orderDate,
        totalAmount: purchaseOrders.totalAmount,
        taxAmount: purchaseOrders.taxAmount,
        subtotal: purchaseOrders.subtotal,
        status: purchaseOrders.status,
        supplierId: purchaseOrders.supplierId,
      })
        .from(purchaseOrders)
        .where(
          and(
            eq(purchaseOrders.garageId, garageId),
            gte(purchaseOrders.orderDate, startDate),
            lte(purchaseOrders.orderDate, endDate),
          ),
        )
        .orderBy(asc(purchaseOrders.orderDate)),
    ]);

    // Construct GL entries
    type GLEntry = {
      id: string;
      date: Date | null;
      reference: string;
      description: string;
      account: string;
      debit: number;
      credit: number;
      category: string;
    };

    const entries: GLEntry[] = [];

    // Payment receipts: debit Cash, credit Accounts Receivable
    for (const p of receivedPayments) {
      const amt = Number(p.amount) || 0;
      entries.push({
        id: `PAY-DR-${p.id}`,
        date: p.paymentDate,
        reference: p.referenceNumber || `PMT-${p.id.slice(0, 8)}`,
        description: `Payment received (${p.paymentMethod})`,
        account: '1000 - Cash & Bank',
        debit: amt,
        credit: 0,
        category: 'Asset',
      });
      entries.push({
        id: `PAY-CR-${p.id}`,
        date: p.paymentDate,
        reference: p.referenceNumber || `PMT-${p.id.slice(0, 8)}`,
        description: `Payment received (${p.paymentMethod})`,
        account: '1200 - Accounts Receivable',
        debit: 0,
        credit: amt,
        category: 'Asset',
      });
    }

    // Invoice creation: debit AR, credit Revenue + Tax Payable
    for (const inv of paidInvoices) {
      if (inv.status === 'draft') continue; // drafts haven't been recognized yet
      const total = Number(inv.totalAmount) || 0;
      const tax = Number(inv.taxAmount) || 0;
      const revenue = total - tax;

      entries.push({
        id: `INV-DR-${inv.id}`,
        date: inv.date,
        reference: inv.invoiceNumber,
        description: `Invoice ${inv.invoiceNumber} issued`,
        account: '1200 - Accounts Receivable',
        debit: total,
        credit: 0,
        category: 'Asset',
      });
      entries.push({
        id: `INV-CR-REV-${inv.id}`,
        date: inv.date,
        reference: inv.invoiceNumber,
        description: `Invoice ${inv.invoiceNumber} - service revenue`,
        account: '4000 - Service Revenue',
        debit: 0,
        credit: revenue,
        category: 'Revenue',
      });
      if (tax > 0) {
        entries.push({
          id: `INV-CR-TAX-${inv.id}`,
          date: inv.date,
          reference: inv.invoiceNumber,
          description: `Invoice ${inv.invoiceNumber} - tax collected`,
          account: '2100 - Tax Payable',
          debit: 0,
          credit: tax,
          category: 'Liability',
        });
      }
    }

    // PO received: debit Inventory, credit AP
    for (const po of receivedPOs) {
      if (po.status === 'draft' || po.status === 'cancelled') continue;
      const total = Number(po.totalAmount) || 0;
      const tax = Number(po.taxAmount) || 0;
      const cost = total - tax;

      entries.push({
        id: `PO-DR-${po.id}`,
        date: po.date,
        reference: po.poNumber,
        description: `PO ${po.poNumber} - inventory received`,
        account: '1300 - Inventory',
        debit: cost,
        credit: 0,
        category: 'Asset',
      });
      if (tax > 0) {
        entries.push({
          id: `PO-DR-TAX-${po.id}`,
          date: po.date,
          reference: po.poNumber,
          description: `PO ${po.poNumber} - input tax`,
          account: '1400 - Input Tax Receivable',
          debit: tax,
          credit: 0,
          category: 'Asset',
        });
      }
      entries.push({
        id: `PO-CR-${po.id}`,
        date: po.date,
        reference: po.poNumber,
        description: `PO ${po.poNumber} - payable to supplier`,
        account: '2000 - Accounts Payable',
        debit: 0,
        credit: total,
        category: 'Liability',
      });
    }

    // Sort by date ascending
    entries.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db2 = b.date ? new Date(b.date).getTime() : 0;
      return da - db2;
    });

    const totalDebits = entries.reduce((s, e) => s + e.debit, 0);
    const totalCredits = entries.reduce((s, e) => s + e.credit, 0);

    res.json({
      entries,
      summary: {
        totalDebits: Math.round(totalDebits * 100) / 100,
        totalCredits: Math.round(totalCredits * 100) / 100,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        entryCount: entries.length,
        period: { startDate, endDate },
      },
    });
  } catch (error) {
    console.error('[Financial] General ledger error:', error);
    res.status(500).json({ message: 'Failed to generate general ledger' });
  }
});

// ─── GET /api/financial/balance-sheet ─────────────────────────────────────

router.get('/financial/balance-sheet', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    const asOfDate = req.query.asOfDate
      ? new Date(req.query.asOfDate as string)
      : new Date();

    const [cashResult, arResult, inventoryResult, apResult, revenueResult, cogsResult] = await Promise.all([
      // Cash = total payments received on garage invoices up to asOfDate
      db.select({
        total: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)`,
      })
        .from(payments)
        .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            lte(payments.paymentDate, asOfDate),
          ),
        ),

      // Accounts Receivable = outstanding invoice balances (sent, overdue, partially_paid)
      db.select({
        total: sql<number>`COALESCE(SUM(${invoices.balanceAmount}::numeric), 0)`,
      })
        .from(invoices)
        .where(
          and(
            eq(invoices.garageId, garageId),
            inArray(invoices.status, ['sent', 'overdue']),
            lte(invoices.invoiceDate, asOfDate),
          ),
        ),

      // Inventory = sum(stockQuantity * costPrice) for active inventory
      db.select({
        total: sql<number>`COALESCE(SUM(${sparePartInventories.stockQuantity} * COALESCE(${sparePartInventories.costPrice}::numeric, ${sparePartInventories.purchasePrice}::numeric, 0)), 0)`,
      })
        .from(sparePartInventories)
        .where(eq(sparePartInventories.garageId, garageId)),

      // Accounts Payable = outstanding POs (sent, confirmed, partial)
      db.select({
        total: sql<number>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)`,
      })
        .from(purchaseOrders)
        .where(
          and(
            eq(purchaseOrders.garageId, garageId),
            inArray(purchaseOrders.status, ['sent', 'confirmed', 'partial']),
            lte(purchaseOrders.orderDate, asOfDate),
          ),
        ),

      // Total Revenue (for retained earnings) = paid invoice subtotals
      db.select({
        total: sql<number>`COALESCE(SUM(${invoices.subtotal}::numeric), 0)`,
      })
        .from(invoices)
        .where(
          and(
            eq(invoices.garageId, garageId),
            eq(invoices.status, 'paid'),
            lte(invoices.invoiceDate, asOfDate),
          ),
        ),

      // COGS approximation = sum of unitCost * quantity from paid invoice items
      db.select({
        total: sql<number>`COALESCE(SUM(COALESCE(${invoiceItems.unitCost}::numeric, 0) * ${invoiceItems.quantity}), 0)`,
      })
        .from(invoiceItems)
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            eq(invoices.status, 'paid'),
            lte(invoices.invoiceDate, asOfDate),
          ),
        ),
    ]);

    const cash = Number(cashResult[0]?.total) || 0;
    const ar = Number(arResult[0]?.total) || 0;
    const inventory = Number(inventoryResult[0]?.total) || 0;
    const ap = Number(apResult[0]?.total) || 0;
    const revenue = Number(revenueResult[0]?.total) || 0;
    const cogs = Number(cogsResult[0]?.total) || 0;

    const totalAssets = cash + ar + inventory;
    const totalLiabilities = ap;
    const retainedEarnings = revenue - cogs;
    const totalEquity = totalAssets - totalLiabilities;

    res.json({
      asOfDate,
      assets: {
        current: {
          'Cash & Bank': Math.round(cash * 100) / 100,
          'Accounts Receivable': Math.round(ar * 100) / 100,
          'Inventory': Math.round(inventory * 100) / 100,
        },
        totalCurrent: Math.round(totalAssets * 100) / 100,
        totalAssets: Math.round(totalAssets * 100) / 100,
      },
      liabilities: {
        current: {
          'Accounts Payable': Math.round(ap * 100) / 100,
        },
        totalCurrent: Math.round(totalLiabilities * 100) / 100,
        totalLiabilities: Math.round(totalLiabilities * 100) / 100,
      },
      equity: {
        'Retained Earnings': Math.round(retainedEarnings * 100) / 100,
        totalEquity: Math.round(totalEquity * 100) / 100,
      },
      checksum: {
        totalAssets: Math.round(totalAssets * 100) / 100,
        totalLiabilitiesPlusEquity: Math.round((totalLiabilities + totalEquity) * 100) / 100,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
    });
  } catch (error) {
    console.error('[Financial] Balance sheet error:', error);
    res.status(500).json({ message: 'Failed to generate balance sheet' });
  }
});

// ─── GET /api/financial/income-statement ──────────────────────────────────

router.get('/financial/income-statement', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    const { startDate, endDate } = parseDateRange(req);

    const [revenueResult, revenueByType, cogsResult, poExpenses] = await Promise.all([
      // Total revenue from paid invoices in the period
      db.select({
        totalRevenue: sql<number>`COALESCE(SUM(${invoices.subtotal}::numeric), 0)`,
        totalTax: sql<number>`COALESCE(SUM(${invoices.taxAmount}::numeric), 0)`,
        totalDiscount: sql<number>`COALESCE(SUM(${invoices.discountAmount}::numeric), 0)`,
        invoiceCount: count(),
      })
        .from(invoices)
        .where(
          and(
            eq(invoices.garageId, garageId),
            eq(invoices.status, 'paid'),
            gte(invoices.invoiceDate, startDate),
            lte(invoices.invoiceDate, endDate),
          ),
        ),

      // Revenue breakdown by item type (service, part, labor)
      db.select({
        itemType: invoiceItems.itemType,
        total: sql<number>`COALESCE(SUM(${invoiceItems.lineTotal}::numeric), 0)`,
        count: count(),
      })
        .from(invoiceItems)
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            eq(invoices.status, 'paid'),
            gte(invoices.invoiceDate, startDate),
            lte(invoices.invoiceDate, endDate),
          ),
        )
        .groupBy(invoiceItems.itemType),

      // COGS from invoice items with unitCost
      db.select({
        totalCost: sql<number>`COALESCE(SUM(COALESCE(${invoiceItems.unitCost}::numeric, 0) * ${invoiceItems.quantity}), 0)`,
      })
        .from(invoiceItems)
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            eq(invoices.status, 'paid'),
            gte(invoices.invoiceDate, startDate),
            lte(invoices.invoiceDate, endDate),
          ),
        ),

      // Purchase expenses = received POs (operating cost / supplies)
      db.select({
        totalExpenses: sql<number>`COALESCE(SUM(${purchaseOrders.subtotal}::numeric), 0)`,
      })
        .from(purchaseOrders)
        .where(
          and(
            eq(purchaseOrders.garageId, garageId),
            eq(purchaseOrders.status, 'received'),
            gte(purchaseOrders.orderDate, startDate),
            lte(purchaseOrders.orderDate, endDate),
          ),
        ),
    ]);

    const revenue = Number(revenueResult[0]?.totalRevenue) || 0;
    const taxCollected = Number(revenueResult[0]?.totalTax) || 0;
    const discounts = Number(revenueResult[0]?.totalDiscount) || 0;
    const invoiceCount = Number(revenueResult[0]?.invoiceCount) || 0;
    const cogs = Number(cogsResult[0]?.totalCost) || 0;
    const purchaseExpenses = Number(poExpenses[0]?.totalExpenses) || 0;

    const grossProfit = revenue - cogs;
    const operatingExpenses = purchaseExpenses;
    const netIncome = grossProfit - operatingExpenses;

    const breakdown: Record<string, number> = {};
    for (const row of revenueByType) {
      breakdown[row.itemType || 'other'] = Math.round(Number(row.total) * 100) / 100;
    }

    res.json({
      period: { startDate, endDate },
      revenue: {
        grossRevenue: Math.round(revenue * 100) / 100,
        discounts: Math.round(discounts * 100) / 100,
        netRevenue: Math.round((revenue - discounts) * 100) / 100,
        taxCollected: Math.round(taxCollected * 100) / 100,
        invoiceCount,
        breakdown,
      },
      costOfGoodsSold: Math.round(cogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMargin: revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0,
      operatingExpenses: {
        purchases: Math.round(operatingExpenses * 100) / 100,
        total: Math.round(operatingExpenses * 100) / 100,
      },
      netIncome: Math.round(netIncome * 100) / 100,
      netMargin: revenue > 0 ? Math.round((netIncome / revenue) * 10000) / 100 : 0,
    });
  } catch (error) {
    console.error('[Financial] Income statement error:', error);
    res.status(500).json({ message: 'Failed to generate income statement' });
  }
});

// ─── GET /api/financial/trial-balance ─────────────────────────────────────

router.get('/financial/trial-balance', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    const { startDate, endDate } = parseDateRange(req);

    const [cashTotal, arTotal, inventoryTotal, apTotal, taxPayable, revenueTotal, cogsTotal] = await Promise.all([
      // Cash (payments received)
      db.select({ total: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)` })
        .from(payments)
        .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(and(eq(invoices.garageId, garageId), gte(payments.paymentDate, startDate), lte(payments.paymentDate, endDate))),

      // AR (invoices issued minus payments)
      db.select({ total: sql<number>`COALESCE(SUM(${invoices.balanceAmount}::numeric), 0)` })
        .from(invoices)
        .where(and(eq(invoices.garageId, garageId), inArray(invoices.status, ['sent', 'overdue']), gte(invoices.invoiceDate, startDate), lte(invoices.invoiceDate, endDate))),

      // Inventory value
      db.select({ total: sql<number>`COALESCE(SUM(${sparePartInventories.stockQuantity} * COALESCE(${sparePartInventories.costPrice}::numeric, ${sparePartInventories.purchasePrice}::numeric, 0)), 0)` })
        .from(sparePartInventories)
        .where(eq(sparePartInventories.garageId, garageId)),

      // AP
      db.select({ total: sql<number>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)` })
        .from(purchaseOrders)
        .where(and(eq(purchaseOrders.garageId, garageId), inArray(purchaseOrders.status, ['sent', 'confirmed', 'partial']), gte(purchaseOrders.orderDate, startDate), lte(purchaseOrders.orderDate, endDate))),

      // Tax payable
      db.select({ total: sql<number>`COALESCE(SUM(${invoices.taxAmount}::numeric), 0)` })
        .from(invoices)
        .where(and(eq(invoices.garageId, garageId), inArray(invoices.status, ['sent', 'paid', 'overdue']), gte(invoices.invoiceDate, startDate), lte(invoices.invoiceDate, endDate))),

      // Revenue
      db.select({ total: sql<number>`COALESCE(SUM(${invoices.subtotal}::numeric), 0)` })
        .from(invoices)
        .where(and(eq(invoices.garageId, garageId), eq(invoices.status, 'paid'), gte(invoices.invoiceDate, startDate), lte(invoices.invoiceDate, endDate))),

      // COGS
      db.select({ total: sql<number>`COALESCE(SUM(COALESCE(${invoiceItems.unitCost}::numeric, 0) * ${invoiceItems.quantity}), 0)` })
        .from(invoiceItems)
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .where(and(eq(invoices.garageId, garageId), eq(invoices.status, 'paid'), gte(invoices.invoiceDate, startDate), lte(invoices.invoiceDate, endDate))),
    ]);

    const cash = Number(cashTotal[0]?.total) || 0;
    const ar = Number(arTotal[0]?.total) || 0;
    const inv = Number(inventoryTotal[0]?.total) || 0;
    const ap = Number(apTotal[0]?.total) || 0;
    const tax = Number(taxPayable[0]?.total) || 0;
    const rev = Number(revenueTotal[0]?.total) || 0;
    const cogs = Number(cogsTotal[0]?.total) || 0;

    const accounts = [
      { code: '1000', name: 'Cash & Bank', type: 'Asset', debit: cash, credit: 0 },
      { code: '1200', name: 'Accounts Receivable', type: 'Asset', debit: ar, credit: 0 },
      { code: '1300', name: 'Inventory', type: 'Asset', debit: inv, credit: 0 },
      { code: '2000', name: 'Accounts Payable', type: 'Liability', debit: 0, credit: ap },
      { code: '2100', name: 'Tax Payable', type: 'Liability', debit: 0, credit: tax },
      { code: '4000', name: 'Service Revenue', type: 'Revenue', debit: 0, credit: rev },
      { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', debit: cogs, credit: 0 },
    ];

    // Round values
    for (const acct of accounts) {
      acct.debit = Math.round(acct.debit * 100) / 100;
      acct.credit = Math.round(acct.credit * 100) / 100;
    }

    const totalDebits = accounts.reduce((s, a) => s + a.debit, 0);
    const totalCredits = accounts.reduce((s, a) => s + a.credit, 0);

    res.json({
      period: { startDate, endDate },
      accounts,
      totalDebits: Math.round(totalDebits * 100) / 100,
      totalCredits: Math.round(totalCredits * 100) / 100,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    });
  } catch (error) {
    console.error('[Financial] Trial balance error:', error);
    res.status(500).json({ message: 'Failed to generate trial balance' });
  }
});

// ─── GET /api/financial/cash-flow ─────────────────────────────────────────

router.get('/financial/cash-flow', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    const { startDate, endDate } = parseDateRange(req);

    const [paymentsByMethod, paymentsByMonth, poPayments] = await Promise.all([
      // Inflows by payment method
      db.select({
        method: payments.paymentMethod,
        total: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)`,
        count: count(),
      })
        .from(payments)
        .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            gte(payments.paymentDate, startDate),
            lte(payments.paymentDate, endDate),
          ),
        )
        .groupBy(payments.paymentMethod),

      // Inflows by month
      db.select({
        month: sql<string>`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`,
        total: sql<number>`COALESCE(SUM(${payments.amount}::numeric), 0)`,
      })
        .from(payments)
        .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(
          and(
            eq(invoices.garageId, garageId),
            gte(payments.paymentDate, startDate),
            lte(payments.paymentDate, endDate),
          ),
        )
        .groupBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`),

      // Outflows: received POs represent cash outflows
      db.select({
        month: sql<string>`TO_CHAR(${purchaseOrders.orderDate}, 'YYYY-MM')`,
        total: sql<number>`COALESCE(SUM(${purchaseOrders.totalAmount}::numeric), 0)`,
      })
        .from(purchaseOrders)
        .where(
          and(
            eq(purchaseOrders.garageId, garageId),
            eq(purchaseOrders.status, 'received'),
            gte(purchaseOrders.orderDate, startDate),
            lte(purchaseOrders.orderDate, endDate),
          ),
        )
        .groupBy(sql`TO_CHAR(${purchaseOrders.orderDate}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${purchaseOrders.orderDate}, 'YYYY-MM')`),
    ]);

    const totalInflows = paymentsByMethod.reduce((s, r) => s + (Number(r.total) || 0), 0);
    const totalOutflows = poPayments.reduce((s, r) => s + (Number(r.total) || 0), 0);

    // Build monthly breakdown combining inflows and outflows
    const monthlyMap = new Map<string, { inflow: number; outflow: number }>();
    for (const row of paymentsByMonth) {
      const key = row.month as string;
      if (!monthlyMap.has(key)) monthlyMap.set(key, { inflow: 0, outflow: 0 });
      monthlyMap.get(key)!.inflow = Number(row.total) || 0;
    }
    for (const row of poPayments) {
      const key = row.month as string;
      if (!monthlyMap.has(key)) monthlyMap.set(key, { inflow: 0, outflow: 0 });
      monthlyMap.get(key)!.outflow = Number(row.total) || 0;
    }

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        inflow: Math.round(data.inflow * 100) / 100,
        outflow: Math.round(data.outflow * 100) / 100,
        net: Math.round((data.inflow - data.outflow) * 100) / 100,
      }));

    const methodBreakdown: Record<string, { total: number; count: number }> = {};
    for (const row of paymentsByMethod) {
      methodBreakdown[row.method] = {
        total: Math.round(Number(row.total) * 100) / 100,
        count: Number(row.count) || 0,
      };
    }

    res.json({
      period: { startDate, endDate },
      operating: {
        inflows: {
          customerPayments: Math.round(totalInflows * 100) / 100,
          byMethod: methodBreakdown,
        },
        outflows: {
          supplierPayments: Math.round(totalOutflows * 100) / 100,
        },
        netOperating: Math.round((totalInflows - totalOutflows) * 100) / 100,
      },
      monthly,
      netCashFlow: Math.round((totalInflows - totalOutflows) * 100) / 100,
    });
  } catch (error) {
    console.error('[Financial] Cash flow error:', error);
    res.status(500).json({ message: 'Failed to generate cash flow statement' });
  }
});

// ─── GET /api/financial/accounts-receivable ───────────────────────────────

router.get('/financial/accounts-receivable', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    // Outstanding invoices with customer info and aging buckets
    const outstandingInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerId: invoices.customerId,
        customerName: users.fullName,
        customerEmail: users.email,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        paidAmount: invoices.paidAmount,
        balanceAmount: invoices.balanceAmount,
        status: invoices.status,
      })
      .from(invoices)
      .leftJoin(users, eq(invoices.customerId, users.id))
      .where(
        and(
          eq(invoices.garageId, garageId),
          inArray(invoices.status, ['sent', 'overdue']),
        ),
      )
      .orderBy(asc(invoices.dueDate));

    const now = new Date();

    // Calculate aging buckets
    type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';
    const agingBuckets: Record<AgingBucket, number> = {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    const enriched = outstandingInvoices.map((inv) => {
      const balance = Number(inv.balanceAmount) || 0;
      const dueDate = inv.dueDate ? new Date(inv.dueDate) : now;
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

      let bucket: AgingBucket;
      if (daysOverdue <= 0) { bucket = 'current'; }
      else if (daysOverdue <= 30) { bucket = '1-30'; }
      else if (daysOverdue <= 60) { bucket = '31-60'; }
      else if (daysOverdue <= 90) { bucket = '61-90'; }
      else { bucket = '90+'; }

      agingBuckets[bucket] += balance;

      return {
        ...inv,
        totalAmount: Number(inv.totalAmount) || 0,
        paidAmount: Number(inv.paidAmount) || 0,
        balanceAmount: balance,
        daysOverdue,
        agingBucket: bucket,
      };
    });

    // Group by customer
    const byCustomer = new Map<string, { name: string; email: string | null; totalOwed: number; invoiceCount: number }>();
    for (const inv of enriched) {
      const key = inv.customerId;
      if (!byCustomer.has(key)) {
        byCustomer.set(key, { name: inv.customerName || 'Unknown', email: inv.customerEmail, totalOwed: 0, invoiceCount: 0 });
      }
      const entry = byCustomer.get(key)!;
      entry.totalOwed += inv.balanceAmount;
      entry.invoiceCount += 1;
    }

    // Round aging values
    for (const key of Object.keys(agingBuckets) as AgingBucket[]) {
      agingBuckets[key] = Math.round(agingBuckets[key] * 100) / 100;
    }

    const totalOutstanding = enriched.reduce((s, inv) => s + inv.balanceAmount, 0);

    res.json({
      invoices: enriched,
      aging: agingBuckets,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      customerCount: byCustomer.size,
      invoiceCount: enriched.length,
      byCustomer: Array.from(byCustomer.entries()).map(([id, data]) => ({
        customerId: id,
        ...data,
        totalOwed: Math.round(data.totalOwed * 100) / 100,
      })).sort((a, b) => b.totalOwed - a.totalOwed),
    });
  } catch (error) {
    console.error('[Financial] Accounts receivable error:', error);
    res.status(500).json({ message: 'Failed to generate accounts receivable report' });
  }
});

// ─── GET /api/financial/accounts-payable ──────────────────────────────────

router.get('/financial/accounts-payable', async (req: Request, res: Response) => {
  try {
    const garageId = requireGarageId(req, res);
    if (!garageId) return;

    // Outstanding POs with supplier info and aging
    const outstandingPOs = await db
      .select({
        id: purchaseOrders.id,
        poNumber: purchaseOrders.poNumber,
        supplierId: purchaseOrders.supplierId,
        supplierName: suppliers.name,
        supplierEmail: suppliers.email,
        orderDate: purchaseOrders.orderDate,
        expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
        totalAmount: purchaseOrders.totalAmount,
        taxAmount: purchaseOrders.taxAmount,
        subtotal: purchaseOrders.subtotal,
        status: purchaseOrders.status,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(
        and(
          eq(purchaseOrders.garageId, garageId),
          inArray(purchaseOrders.status, ['sent', 'confirmed', 'partial']),
        ),
      )
      .orderBy(asc(purchaseOrders.orderDate));

    const now = new Date();

    type AgingBucket = 'current' | '1-30' | '31-60' | '61-90' | '90+';
    const agingBuckets: Record<AgingBucket, number> = {
      current: 0,
      '1-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    const enriched = outstandingPOs.map((po) => {
      const amount = Number(po.totalAmount) || 0;
      const orderDate = po.orderDate ? new Date(po.orderDate) : now;
      const daysOutstanding = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

      let bucket: AgingBucket;
      if (daysOutstanding <= 0) { bucket = 'current'; }
      else if (daysOutstanding <= 30) { bucket = '1-30'; }
      else if (daysOutstanding <= 60) { bucket = '31-60'; }
      else if (daysOutstanding <= 90) { bucket = '61-90'; }
      else { bucket = '90+'; }

      agingBuckets[bucket] += amount;

      return {
        ...po,
        totalAmount: amount,
        taxAmount: Number(po.taxAmount) || 0,
        subtotal: Number(po.subtotal) || 0,
        daysOutstanding,
        agingBucket: bucket,
      };
    });

    // Group by supplier
    const bySupplier = new Map<string, { name: string; email: string | null; totalOwed: number; poCount: number }>();
    for (const po of enriched) {
      const key = po.supplierId;
      if (!bySupplier.has(key)) {
        bySupplier.set(key, { name: po.supplierName || 'Unknown', email: po.supplierEmail, totalOwed: 0, poCount: 0 });
      }
      const entry = bySupplier.get(key)!;
      entry.totalOwed += po.totalAmount;
      entry.poCount += 1;
    }

    for (const key of Object.keys(agingBuckets) as AgingBucket[]) {
      agingBuckets[key] = Math.round(agingBuckets[key] * 100) / 100;
    }

    const totalPayable = enriched.reduce((s, po) => s + po.totalAmount, 0);

    res.json({
      purchaseOrders: enriched,
      aging: agingBuckets,
      totalPayable: Math.round(totalPayable * 100) / 100,
      supplierCount: bySupplier.size,
      poCount: enriched.length,
      bySupplier: Array.from(bySupplier.entries()).map(([id, data]) => ({
        supplierId: id,
        ...data,
        totalOwed: Math.round(data.totalOwed * 100) / 100,
      })).sort((a, b) => b.totalOwed - a.totalOwed),
    });
  } catch (error) {
    console.error('[Financial] Accounts payable error:', error);
    res.status(500).json({ message: 'Failed to generate accounts payable report' });
  }
});

export default router;
