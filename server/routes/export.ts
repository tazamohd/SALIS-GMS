// @ts-nocheck
import { Router } from 'express';
import { db } from '../db';
import { users, vehicles, jobCards, invoices, appointments, spareParts, sparePartInventories } from '../../shared/schema';
import { sql, count } from 'drizzle-orm';

const router = Router();

// ─── Helper: convert an array of objects to CSV string ───
function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          // Escape quotes and wrap in quotes if value contains comma, quote, or newline
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    ),
  ];
  return lines.join('\n');
}

// GET /api/export/csv/:type — Export table data as CSV download
router.get('/export/csv/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let rows: Record<string, any>[];

    switch (type) {
      case 'customers': {
        rows = await db
          .select({
            id: users.id,
            full_name: users.fullName,
            email: users.email,
            phone: users.phone,
            user_type: users.userType,
            role: users.role,
            is_active: users.isActive,
            created_at: users.createdAt,
          })
          .from(users)
          .limit(10000);
        break;
      }
      case 'invoices': {
        rows = await db
          .select({
            id: invoices.id,
            invoice_number: invoices.invoiceNumber,
            customer_id: invoices.customerId,
            invoice_date: invoices.invoiceDate,
            due_date: invoices.dueDate,
            status: invoices.status,
            subtotal: invoices.subtotal,
            tax_amount: invoices.taxAmount,
            discount_amount: invoices.discountAmount,
            total_amount: invoices.totalAmount,
            paid_amount: invoices.paidAmount,
          })
          .from(invoices)
          .limit(10000);
        break;
      }
      case 'job-cards': {
        rows = await db
          .select({
            id: jobCards.id,
            job_number: jobCards.jobNumber,
            customer_id: jobCards.customerId,
            service_type: jobCards.serviceType,
            description: jobCards.description,
            status: jobCards.status,
            priority: jobCards.priority,
            total_cost: jobCards.totalCost,
            created_at: jobCards.createdAt,
            completed_at: jobCards.completedAt,
          })
          .from(jobCards)
          .limit(10000);
        break;
      }
      case 'vehicles': {
        rows = await db
          .select({
            id: vehicles.id,
            customer_id: vehicles.customerId,
            make: vehicles.make,
            model: vehicles.model,
            year: vehicles.year,
            license_plate: vehicles.licensePlate,
            vin: vehicles.vin,
            color: vehicles.color,
            mileage: vehicles.mileage,
            engine_type: vehicles.engineType,
          })
          .from(vehicles)
          .limit(10000);
        break;
      }
      case 'appointments': {
        rows = await db
          .select({
            id: appointments.id,
            appointment_number: appointments.appointmentNumber,
            customer_name: appointments.customerName,
            customer_phone: appointments.customerPhone,
            service_type: appointments.serviceType,
            appointment_date: appointments.appointmentDate,
            duration: appointments.duration,
            status: appointments.status,
          })
          .from(appointments)
          .limit(10000);
        break;
      }
      case 'inventory': {
        rows = await db
          .select({
            id: spareParts.id,
            name: spareParts.name,
            category: spareParts.category,
            sku: spareParts.sku,
            brand: spareParts.brand,
            part_type: spareParts.partType,
            is_active: spareParts.isActive,
            created_at: spareParts.createdAt,
          })
          .from(spareParts)
          .limit(10000);
        break;
      }
      default:
        return res.status(400).json({
          error: `Unknown type: ${type}. Supported: customers, invoices, job-cards, vehicles, appointments, inventory`,
        });
    }

    const csv = toCsv(rows);
    const filename = `${type}-export-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: any) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// GET /api/export/report/:type — Generate printer-friendly HTML report
router.get('/export/report/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let title = '';
    let tableHtml = '';

    const printCss = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 24px; max-width: 1100px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; color: #0a5ed7; }
        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
        th { background: #f1f5f9; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: 600; }
        td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #fafbfc; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
        .summary-card .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-card .value { font-size: 24px; font-weight: 700; color: #0b1f3b; margin-top: 4px; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    `;

    switch (type) {
      case 'financial-summary': {
        title = 'Financial Summary Report';

        const [invoiceStats] = await db
          .select({
            total: count(),
            totalAmount: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
            paidAmount: sql<string>`coalesce(sum(${invoices.paidAmount}), 0)`,
            taxAmount: sql<string>`coalesce(sum(${invoices.taxAmount}), 0)`,
          })
          .from(invoices);

        const statusBreakdown = await db
          .select({
            status: invoices.status,
            count: count(),
            total: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
          })
          .from(invoices)
          .groupBy(invoices.status);

        const totalAmt = parseFloat(invoiceStats?.totalAmount ?? '0');
        const paidAmt = parseFloat(invoiceStats?.paidAmount ?? '0');
        const outstanding = totalAmt - paidAmt;

        tableHtml = `
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">Total Invoices</div>
              <div class="value">${invoiceStats?.total ?? 0}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Revenue</div>
              <div class="value">SAR ${totalAmt.toLocaleString('en', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <div class="label">Amount Collected</div>
              <div class="value">SAR ${paidAmt.toLocaleString('en', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <div class="label">Outstanding</div>
              <div class="value">SAR ${outstanding.toLocaleString('en', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <h2 style="font-size:16px; margin-bottom:8px;">Breakdown by Status</h2>
          <table>
            <thead><tr><th>Status</th><th>Count</th><th>Total (SAR)</th></tr></thead>
            <tbody>
              ${statusBreakdown.map((s) => `<tr><td>${s.status}</td><td>${s.count}</td><td>${parseFloat(s.total).toLocaleString('en', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
        break;
      }

      case 'inventory-report': {
        title = 'Inventory Report';

        const parts = await db
          .select({
            name: spareParts.name,
            sku: spareParts.sku,
            category: spareParts.category,
            brand: spareParts.brand,
            partType: spareParts.partType,
          })
          .from(spareParts)
          .limit(500);

        const [partStats] = await db
          .select({
            total: count(),
          })
          .from(spareParts);

        const [invStats] = await db
          .select({
            totalStock: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity}), 0)`,
            totalValue: sql<string>`coalesce(sum(${sparePartInventories.stockQuantity} * ${sparePartInventories.costPrice}), 0)`,
          })
          .from(sparePartInventories);

        tableHtml = `
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">Total Parts</div>
              <div class="value">${partStats?.total ?? 0}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Stock Units</div>
              <div class="value">${parseInt(invStats?.totalStock ?? '0').toLocaleString()}</div>
            </div>
            <div class="summary-card">
              <div class="label">Inventory Value</div>
              <div class="value">SAR ${parseFloat(invStats?.totalValue ?? '0').toLocaleString('en', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Brand</th><th>Type</th></tr></thead>
            <tbody>
              ${parts.map((p) => `<tr><td>${p.name}</td><td>${p.sku}</td><td>${p.category}</td><td>${p.brand ?? '-'}</td><td>${p.partType}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
        break;
      }

      case 'customer-list': {
        title = 'Customer List';

        const customerRows = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            phone: users.phone,
            role: users.role,
            isActive: users.isActive,
            createdAt: users.createdAt,
          })
          .from(users)
          .limit(1000);

        const [customerStats] = await db
          .select({ total: count() })
          .from(users);

        tableHtml = `
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">Total Users</div>
              <div class="value">${customerStats?.total ?? 0}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Active</th><th>Created</th></tr></thead>
            <tbody>
              ${customerRows.map((c) => `<tr><td>${c.fullName ?? '-'}</td><td>${c.email}</td><td>${c.phone ?? '-'}</td><td>${c.role ?? '-'}</td><td>${c.isActive ? 'Yes' : 'No'}</td><td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td></tr>`).join('')}
            </tbody>
          </table>
        `;
        break;
      }

      default:
        return res.status(400).json({
          error: `Unknown report type: ${type}. Supported: financial-summary, inventory-report, customer-list`,
        });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - SLIS GMS</title>
  ${printCss}
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Generated on ${new Date().toLocaleString('en-SA', { dateStyle: 'full', timeStyle: 'short' })} — SLIS Garage Management System</p>
  ${tableHtml}
  <div class="footer">
    SLIS Garage Management System &mdash; Confidential Report
  </div>
  <div class="no-print" style="margin-top:16px; text-align:center;">
    <button onclick="window.print()" style="padding:8px 24px; background:#0a5ed7; color:white; border:none; border-radius:6px; cursor:pointer; font-size:14px;">Print Report</button>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
