/**
 * SALIS AUTO - Saudi Arabia Market Compliance API
 * Endpoints for ZATCA e-invoicing, VAT reporting, Hijri calendar,
 * labor law compliance (Saudization / GOSI), and dashboard aggregation.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { invoices, users, garages } from '../../shared/schema';
import { eq, and, gte, count, sum } from 'drizzle-orm';
import { generateZATCAQRCode, validateZATCACompliance } from '../../shared/zatcaUtils';
import { formatDualCalendar, getCurrentHijriDate, isRamadan } from '../../shared/hijriUtils';

const router = Router();

// ---------------------------------------------------------------------------
// GET /api/saudi/dashboard — Saudi compliance dashboard (aggregated view)
// ---------------------------------------------------------------------------
router.get('/saudi/dashboard', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const garageId = user.garageId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Hijri date info
    const hijriDate = getCurrentHijriDate();
    const ramadan = isRamadan();
    const dualDate = formatDualCalendar(now);

    // VAT summary for current month
    const [vatSummary] = await db
      .select({
        totalInvoices: count(invoices.id),
        totalRevenue: sum(invoices.totalAmount),
        totalTax: sum(invoices.taxAmount),
        totalPaid: sum(invoices.paidAmount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.garageId, garageId),
          gte(invoices.invoiceDate, startOfMonth),
        ),
      );

    // ZATCA compliance: check recent invoices for missing fields
    const recentInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        totalAmount: invoices.totalAmount,
        taxAmount: invoices.taxAmount,
        status: invoices.status,
        invoiceDate: invoices.invoiceDate,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.garageId, garageId),
          gte(invoices.invoiceDate, startOfMonth),
        ),
      )
      .limit(50);

    // Garage info for ZATCA seller details
    const [garage] = await db
      .select()
      .from(garages)
      .where(eq(garages.id, garageId))
      .limit(1);

    // Run ZATCA validation on recent invoices
    let compliantCount = 0;
    let nonCompliantCount = 0;
    const complianceIssues: Array<{ invoiceNumber: string; errors: string[] }> = [];

    for (const inv of recentInvoices) {
      const validation = validateZATCACompliance({
        sellerName: garage?.name ?? '',
        vatRegistrationNumber: garage?.licenseNumber ?? '',
        timestamp: inv.invoiceDate?.toISOString() ?? '',
        totalWithVAT: parseFloat(String(inv.totalAmount ?? '0')),
        vatAmount: parseFloat(String(inv.taxAmount ?? '0')),
      });

      if (validation.valid) {
        compliantCount++;
      } else {
        nonCompliantCount++;
        complianceIssues.push({
          invoiceNumber: inv.invoiceNumber,
          errors: validation.errors,
        });
      }
    }

    const totalChecked = compliantCount + nonCompliantCount;
    const complianceRate = totalChecked > 0
      ? Math.round((compliantCount / totalChecked) * 100)
      : 100;

    // Employee count for Saudization stub
    const [employeeCounts] = await db
      .select({ total: count(users.id) })
      .from(users)
      .where(eq(users.garageId, garageId));

    const totalEmployees = Number(employeeCounts?.total ?? 0);
    // Stub: assume 30% Saudization ratio until nationality data is available
    const saudiEmployees = Math.round(totalEmployees * 0.3);
    const saudizationRatio = totalEmployees > 0
      ? Math.round((saudiEmployees / totalEmployees) * 100)
      : 0;

    res.json({
      hijriDate: {
        day: hijriDate.day,
        month: hijriDate.month,
        year: hijriDate.year,
        monthName: hijriDate.monthName,
        monthNameArabic: hijriDate.monthNameArabic,
        formatted: dualDate,
        isRamadan: ramadan,
      },
      zatca: {
        complianceRate,
        compliantInvoices: compliantCount,
        nonCompliantInvoices: nonCompliantCount,
        totalChecked,
        recentIssues: complianceIssues.slice(0, 5),
      },
      vat: {
        period: `${now.toLocaleString('en-US', { month: 'long' })} ${now.getFullYear()}`,
        totalInvoices: Number(vatSummary?.totalInvoices ?? 0),
        totalRevenue: parseFloat(String(vatSummary?.totalRevenue ?? '0')),
        vatCollected: parseFloat(String(vatSummary?.totalTax ?? '0')),
        vatPayable: parseFloat(String(vatSummary?.totalTax ?? '0')),
        totalPaid: parseFloat(String(vatSummary?.totalPaid ?? '0')),
      },
      labor: {
        totalEmployees,
        saudiEmployees,
        nonSaudiEmployees: totalEmployees - saudiEmployees,
        saudizationRatio,
        saudizationTarget: 30, // Nitaqat target (stub)
        saudizationStatus: saudizationRatio >= 30 ? 'compliant' : 'non-compliant',
        gosiStatus: 'active', // Stub
        gosiLastPayment: new Date(now.getFullYear(), now.getMonth() - 1, 25).toISOString(),
      },
    });
  } catch (error) {
    console.error('Saudi dashboard error:', error);
    res.status(500).json({ message: 'Failed to load Saudi compliance dashboard' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/saudi/zatca/validate-invoice/:id — Validate a specific invoice
// ---------------------------------------------------------------------------
router.post('/saudi/zatca/validate-invoice/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const invoiceId = req.params.id;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, invoiceId),
          eq(invoices.garageId, user.garageId),
        ),
      )
      .limit(1);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const [garage] = await db
      .select()
      .from(garages)
      .where(eq(garages.id, user.garageId))
      .limit(1);

    const zatcaData = {
      sellerName: garage?.name ?? '',
      vatRegistrationNumber: garage?.licenseNumber ?? '',
      timestamp: invoice.invoiceDate?.toISOString() ?? new Date().toISOString(),
      totalWithVAT: parseFloat(String(invoice.totalAmount ?? '0')),
      vatAmount: parseFloat(String(invoice.taxAmount ?? '0')),
    };

    const validation = validateZATCACompliance(zatcaData);

    let qrCode: string | null = null;
    if (validation.valid) {
      qrCode = generateZATCAQRCode(zatcaData);
    }

    res.json({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      validation,
      qrCode,
      zatcaData,
    });
  } catch (error) {
    console.error('ZATCA validation error:', error);
    res.status(500).json({ message: 'Failed to validate invoice' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/saudi/zatca/qr/:invoiceId — Generate ZATCA QR code for an invoice
// ---------------------------------------------------------------------------
router.get('/saudi/zatca/qr/:invoiceId', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const invoiceId = req.params.invoiceId;

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, invoiceId),
          eq(invoices.garageId, user.garageId),
        ),
      )
      .limit(1);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const [garage] = await db
      .select()
      .from(garages)
      .where(eq(garages.id, user.garageId))
      .limit(1);

    const zatcaData = {
      sellerName: garage?.name ?? '',
      vatRegistrationNumber: garage?.licenseNumber ?? '',
      timestamp: invoice.invoiceDate?.toISOString() ?? new Date().toISOString(),
      totalWithVAT: parseFloat(String(invoice.totalAmount ?? '0')),
      vatAmount: parseFloat(String(invoice.taxAmount ?? '0')),
    };

    const qrCode = generateZATCAQRCode(zatcaData);

    res.json({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      qrCode,
      zatcaData,
    });
  } catch (error) {
    console.error('ZATCA QR generation error:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/saudi/vat/summary — VAT summary for a period
// ---------------------------------------------------------------------------
router.get('/saudi/vat/summary', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const garageId = user.garageId;
    const now = new Date();

    // Support optional query params: ?year=2026&month=3
    const year = parseInt(req.query.year as string) || now.getFullYear();
    const month = parseInt(req.query.month as string) || (now.getMonth() + 1);

    const startOfPeriod = new Date(year, month - 1, 1);
    const endOfPeriod = new Date(year, month, 0, 23, 59, 59, 999);

    const [summary] = await db
      .select({
        totalInvoices: count(invoices.id),
        totalRevenue: sum(invoices.totalAmount),
        totalSubtotal: sum(invoices.subtotal),
        vatCollected: sum(invoices.taxAmount),
        totalPaid: sum(invoices.paidAmount),
        totalBalance: sum(invoices.balanceAmount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.garageId, garageId),
          gte(invoices.invoiceDate, startOfPeriod),
        ),
      );

    // Breakdown by status
    const statusBreakdown = await db
      .select({
        status: invoices.status,
        count: count(invoices.id),
        total: sum(invoices.totalAmount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.garageId, garageId),
          gte(invoices.invoiceDate, startOfPeriod),
        ),
      )
      .groupBy(invoices.status);

    res.json({
      period: {
        year,
        month,
        label: `${new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })} ${year}`,
      },
      summary: {
        totalInvoices: Number(summary?.totalInvoices ?? 0),
        totalRevenue: parseFloat(String(summary?.totalRevenue ?? '0')),
        totalSubtotal: parseFloat(String(summary?.totalSubtotal ?? '0')),
        vatCollected: parseFloat(String(summary?.vatCollected ?? '0')),
        vatPayable: parseFloat(String(summary?.vatCollected ?? '0')),
        totalPaid: parseFloat(String(summary?.totalPaid ?? '0')),
        totalOutstanding: parseFloat(String(summary?.totalBalance ?? '0')),
      },
      statusBreakdown: statusBreakdown.map((s: any) => ({
        status: s.status,
        count: Number(s.count),
        total: parseFloat(String(s.total ?? '0')),
      })),
    });
  } catch (error) {
    console.error('VAT summary error:', error);
    res.status(500).json({ message: 'Failed to load VAT summary' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/saudi/labor/compliance — Saudization / GOSI compliance (stub)
// ---------------------------------------------------------------------------
router.get('/saudi/labor/compliance', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user?.garageId) {
      return res.status(403).json({ message: 'No garage associated with user' });
    }

    const garageId = user.garageId;

    const [employeeCounts] = await db
      .select({ total: count(users.id) })
      .from(users)
      .where(eq(users.garageId, garageId));

    const totalEmployees = Number(employeeCounts?.total ?? 0);
    // Stub ratios until nationality fields are added to users table
    const saudiEmployees = Math.round(totalEmployees * 0.3);
    const saudizationRatio = totalEmployees > 0
      ? Math.round((saudiEmployees / totalEmployees) * 100)
      : 0;

    res.json({
      saudization: {
        totalEmployees,
        saudiEmployees,
        nonSaudiEmployees: totalEmployees - saudiEmployees,
        ratio: saudizationRatio,
        target: 30,
        nitaqatBand: saudizationRatio >= 40 ? 'platinum'
          : saudizationRatio >= 30 ? 'green'
          : saudizationRatio >= 20 ? 'yellow'
          : 'red',
        status: saudizationRatio >= 30 ? 'compliant' : 'non-compliant',
      },
      gosi: {
        status: 'active',
        registeredEmployees: totalEmployees,
        lastPaymentDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() - 1,
          25,
        ).toISOString(),
        monthlyContribution: totalEmployees * 450, // Approximate SAR per employee
        employerRate: 0.12, // 12% employer contribution
        employeeRate: 0.10, // 10% employee contribution
      },
    });
  } catch (error) {
    console.error('Labor compliance error:', error);
    res.status(500).json({ message: 'Failed to load labor compliance data' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/saudi/hijri/today — Current Hijri date information
// ---------------------------------------------------------------------------
router.get('/saudi/hijri/today', async (_req: Request, res: Response) => {
  try {
    const hijriDate = getCurrentHijriDate();
    const now = new Date();

    res.json({
      hijri: {
        day: hijriDate.day,
        month: hijriDate.month,
        year: hijriDate.year,
        monthName: hijriDate.monthName,
        monthNameArabic: hijriDate.monthNameArabic,
      },
      gregorian: {
        date: now.toISOString(),
        formatted: now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
      dualFormat: formatDualCalendar(now),
      isRamadan: isRamadan(),
    });
  } catch (error) {
    console.error('Hijri date error:', error);
    res.status(500).json({ message: 'Failed to get Hijri date' });
  }
});

export default router;
