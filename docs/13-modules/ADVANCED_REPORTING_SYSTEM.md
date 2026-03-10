# SALIS AUTO - Advanced Reporting System

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Planned

---

## Overview

The Advanced Reporting System provides comprehensive business intelligence with custom report builder, scheduled generation, and multi-format exports.

---

## Report Categories

### Financial Reports

1. **Revenue Analysis**
   - Daily/Weekly/Monthly/Yearly revenue
   - Revenue by service type
   - Revenue by technician
   - Revenue by location (franchise)
   - Payment collection rates
   - Outstanding invoices

2. **Profit & Loss**
   - Revenue vs. expenses
   - Profit margins by service
   - Cost breakdown (labor, parts, overhead)
   - Year-over-year comparison

3. **VAT Reports (Saudi Arabia)**
   - VAT collected
   - VAT remitted
   - VAT summary for ZATCA submission
   - TRN transaction log

### Operations Reports

4. **Job Card Analytics**
   - Jobs by status (pending, in_progress, completed)
   - Average completion time
   - Jobs by service type
   - Technician productivity

5. **Inventory Reports**
   - Stock levels
   - Low stock alerts
   - Parts usage frequency
   - Reorder recommendations
   - Stock value

6. **Technician Performance**
   - Jobs completed per technician
   - Average job duration
   - Revenue generated per technician
   - Customer satisfaction ratings
   - Utilization rate

### Customer Reports

7. **Customer Analytics**
   - New customers by period
   - Customer retention rate
   - Customer lifetime value (CLV)
   - Churn rate
   - Top customers by revenue

8. **Service History**
   - Services by customer
   - Services by vehicle
   - Repeat service rate
   - Service recommendations

### Compliance Reports

9. **Environmental Compliance**
   - Waste tracking
   - Recycling metrics
   - EPA reporting

10. **Quality Management**
    - ISO 9001 checklists
    - Non-conformance tracking
    - Corrective actions

11. **Safety Reports**
    - OSHA incident reporting
    - Safety metrics
    - Investigation summaries

---

## Custom Report Builder

### Database Schema

```typescript
// shared/schema.ts
export const customReports = pgTable('custom_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: uuid('created_by').references(() => users.id),
  reportType: text('report_type').notNull(), // 'financial', 'operations', 'customer'
  dataSource: text('data_source').notNull(), // Main table/view
  filters: json('filters'), // Dynamic filter configuration
  columns: json('columns').notNull(), // Selected columns
  groupBy: json('group_by'), // Grouping configuration
  orderBy: json('order_by'), // Sorting configuration
  aggregations: json('aggregations'), // SUM, AVG, COUNT, etc.
  chartType: text('chart_type'), // 'bar', 'line', 'pie', 'table'
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reportSchedules = pgTable('report_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id').references(() => customReports.id),
  schedule: text('schedule').notNull(), // Cron expression
  recipients: json('recipients').notNull(), // Email addresses
  format: text('format').default('pdf'), // 'pdf', 'excel', 'csv'
  isActive: boolean('is_active').default(true),
  lastRun: timestamp('last_run'),
  nextRun: timestamp('next_run'),
});

export const reportHistory = pgTable('report_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  reportId: uuid('report_id').references(() => customReports.id),
  generatedBy: uuid('generated_by').references(() => users.id),
  generatedAt: timestamp('generated_at').defaultNow(),
  parameters: json('parameters'),
  fileUrl: text('file_url'),
  format: text('format'),
  status: text('status'), // 'success', 'failed'
});
```

### Report Builder UI

**Components:**

1. **Data Source Selection**
   ```tsx
   <Select data-testid="select-datasource">
     <SelectItem value="customers">Customers</SelectItem>
     <SelectItem value="job_cards">Job Cards</SelectItem>
     <SelectItem value="invoices">Invoices</SelectItem>
     <SelectItem value="inventory">Inventory</SelectItem>
   </Select>
   ```

2. **Column Selector**
   ```tsx
   <MultiSelect 
     data-testid="multiselect-columns"
     options={availableColumns}
     value={selectedColumns}
     onChange={setSelectedColumns}
   />
   ```

3. **Filter Builder**
   ```tsx
   <FilterBuilder
     filters={filters}
     onChange={setFilters}
   />
   
   // Example filter:
   {
     field: 'created_at',
     operator: 'between',
     value: ['2025-01-01', '2025-12-31']
   }
   ```

4. **Aggregation Options**
   ```tsx
   <AggregationBuilder>
     <Select field="revenue">
       <SelectItem value="sum">Sum</SelectItem>
       <SelectItem value="avg">Average</SelectItem>
       <SelectItem value="count">Count</SelectItem>
     </Select>
   </AggregationBuilder>
   ```

5. **Visualization**
   ```tsx
   <Select data-testid="select-charttype">
     <SelectItem value="table">Table</SelectItem>
     <SelectItem value="bar">Bar Chart</SelectItem>
     <SelectItem value="line">Line Chart</SelectItem>
     <SelectItem value="pie">Pie Chart</SelectItem>
   </Select>
   ```

### Query Generation

```typescript
// server/reportBuilder.ts
export function buildQuery(reportConfig: CustomReport) {
  const { dataSource, columns, filters, groupBy, aggregations } = reportConfig;
  
  let query = db.select();
  
  // Add columns
  const selectedFields = columns.map(col => ({
    [col]: sql.identifier(col)
  }));
  query = query.fields(selectedFields);
  
  // Add filters
  filters.forEach(filter => {
    query = query.where(
      buildFilterCondition(filter.field, filter.operator, filter.value)
    );
  });
  
  // Add grouping
  if (groupBy?.length > 0) {
    query = query.groupBy(...groupBy.map(col => sql.identifier(col)));
  }
  
  // Add aggregations
  if (aggregations) {
    Object.entries(aggregations).forEach(([field, agg]) => {
      query = query.select({
        [field]: sql`${agg}(${sql.identifier(field)})`
      });
    });
  }
  
  return query;
}
```

---

## Scheduled Reports

### Cron Schedule Configuration

```typescript
// Report schedule examples
{
  daily: '0 8 * * *',        // Daily at 8 AM
  weekly: '0 8 * * 1',       // Monday at 8 AM
  monthly: '0 8 1 * *',      // 1st of month at 8 AM
  quarterly: '0 8 1 */3 *',  // Every 3 months
}
```

### Scheduler Implementation

```typescript
// server/reportScheduler.ts
import cron from 'node-cron';

export function initializeScheduler() {
  // Run every hour to check for due reports
  cron.schedule('0 * * * *', async () => {
    const dueReports = await db
      .select()
      .from(reportSchedules)
      .where(
        and(
          eq(reportSchedules.isActive, true),
          lte(reportSchedules.nextRun, new Date())
        )
      );
    
    for (const schedule of dueReports) {
      await generateAndEmailReport(schedule);
    }
  });
}

async function generateAndEmailReport(schedule: ReportSchedule) {
  try {
    // Generate report
    const report = await generateReport(schedule.reportId);
    
    // Export to desired format
    const file = await exportReport(report, schedule.format);
    
    // Email to recipients
    await emailReport(schedule.recipients, file);
    
    // Update schedule
    await updateNextRun(schedule);
    
    // Log success
    await logReportGeneration(schedule.reportId, 'success', file.url);
  } catch (error) {
    await logReportGeneration(schedule.reportId, 'failed', null, error);
  }
}
```

---

## Export Formats

### PDF Export (Enhanced)

```typescript
// server/exporters/pdfExporter.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function exportToPDF(report: Report) {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text(report.name, 14, 20);
  
  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Period: ${report.startDate} - ${report.endDate}`, 14, 35);
  
  // Add chart (if applicable)
  if (report.chartImage) {
    doc.addImage(report.chartImage, 'PNG', 14, 45, 180, 100);
  }
  
  // Add data table
  autoTable(doc, {
    head: [report.columns],
    body: report.data,
    startY: 150,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
}
```

### Excel Export (Enhanced)

```typescript
// server/exporters/excelExporter.ts
import ExcelJS from 'exceljs';

export async function exportToExcel(report: Report) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(report.name);
  
  // Add header row
  worksheet.addRow(report.columns);
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2980B9' }
  };
  
  // Add data rows
  report.data.forEach(row => {
    worksheet.addRow(row);
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  // Add summary row (if aggregations)
  if (report.aggregations) {
    const summaryRow = worksheet.addRow(report.aggregations);
    summaryRow.font = { bold: true };
  }
  
  return await workbook.xlsx.writeBuffer();
}
```

### CSV Export

```typescript
// server/exporters/csvExporter.ts
export function exportToCSV(report: Report) {
  const rows = [
    report.columns,
    ...report.data
  ];
  
  return rows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}
```

---

## Report Distribution

### Email Delivery

```typescript
// server/emailReports.ts
import nodemailer from 'nodemailer';

export async function emailReport(
  recipients: string[],
  reportFile: Buffer,
  reportName: string,
  format: string
) {
  const transporter = nodemailer.createTransport({
    // Email configuration
  });
  
  const mailOptions = {
    from: 'reports@salis-auto.com',
    to: recipients.join(', '),
    subject: `SALIS AUTO Report: ${reportName}`,
    html: `
      <h2>${reportName}</h2>
      <p>Please find your scheduled report attached.</p>
      <p>Generated: ${new Date().toLocaleString()}</p>
    `,
    attachments: [
      {
        filename: `${reportName}.${format}`,
        content: reportFile,
      }
    ]
  };
  
  await transporter.sendMail(mailOptions);
}
```

---

## Report Templates

### Pre-Built Templates

1. **Daily Revenue Summary**
   - Total revenue
   - Jobs completed
   - Payment collection rate
   - Top services

2. **Weekly Performance Dashboard**
   - Revenue trend
   - Technician productivity
   - Customer satisfaction
   - Inventory alerts

3. **Monthly Financial Statement**
   - Profit & loss
   - Cash flow
   - Outstanding invoices
   - VAT summary

4. **Quarterly Business Review**
   - Revenue by quarter
   - Customer growth
   - Service trends
   - Forecasting

---

## API Endpoints

```typescript
// GET /api/reports - List all reports
// POST /api/reports - Create custom report
// GET /api/reports/:id - Get report details
// POST /api/reports/:id/generate - Generate report
// POST /api/reports/:id/export - Export report (PDF/Excel/CSV)
// POST /api/reports/:id/schedule - Schedule report
// DELETE /api/reports/:id - Delete report

// GET /api/report-schedules - List scheduled reports
// PATCH /api/report-schedules/:id - Update schedule
// DELETE /api/report-schedules/:id - Delete schedule

// GET /api/report-history - View report history
```

---

## Implementation Roadmap

### Phase 1: Basic Reporting
- [ ] Pre-built report templates
- [ ] PDF/Excel export
- [ ] Manual report generation

### Phase 2: Custom Reports
- [ ] Report builder UI
- [ ] Dynamic query generation
- [ ] Save custom reports

### Phase 3: Scheduling
- [ ] Schedule configuration
- [ ] Automated generation
- [ ] Email distribution

### Phase 4: Advanced Features
- [ ] Interactive dashboards
- [ ] Drill-down capabilities
- [ ] Report sharing/permissions
- [ ] API access for reports

---

**Document Owner:** Analytics Team  
**Next Review:** Quarterly
