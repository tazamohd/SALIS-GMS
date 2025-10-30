// Excel Export Utilities using client-side generation
// Note: For full xlsx support, install 'xlsx' package: npm install xlsx

import type { Invoice, JobCard, Estimate, User, Vehicle } from "@shared/schema";

/**
 * Convert data to CSV format (universal Excel-compatible export)
 * This works without additional libraries
 */
function convertToCSV(data: any[], headers: string[]): string {
  const rows = [headers];

  data.forEach((item) => {
    const row = headers.map((header) => {
      const value = item[header];
      if (value === null || value === undefined) return "";
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    rows.push(row);
  });

  return rows.map((row) => row.join(",")).join("\n");
}

/**
 * Download CSV file
 */
function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export invoices to Excel (CSV format)
 */
export function exportInvoicesToExcel(invoices: Invoice[]) {
  const headers = [
    "invoiceNumber",
    "issueDate",
    "dueDate",
    "status",
    "subtotal",
    "taxAmount",
    "discountAmount",
    "totalAmount",
    "paidAmount",
    "balanceAmount",
  ];

  const data = invoices.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    issueDate: new Date(inv.invoiceDate).toLocaleDateString(),
    dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "",
    status: inv.status,
    subtotal: parseFloat(inv.subtotal).toFixed(2),
    taxAmount: parseFloat(inv.taxAmount).toFixed(2),
    discountAmount: parseFloat(inv.discountAmount).toFixed(2),
    totalAmount: parseFloat(inv.totalAmount).toFixed(2),
    paidAmount: parseFloat(inv.paidAmount).toFixed(2),
    balanceAmount: parseFloat(inv.balanceAmount).toFixed(2),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(
    `Invoices-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

/**
 * Export job cards to Excel (CSV format)
 */
export function exportJobCardsToExcel(jobCards: JobCard[]) {
  const headers = [
    "jobNumber",
    "status",
    "priority",
    "serviceType",
    "description",
    "estimatedHours",
    "createdAt",
  ];

  const data = jobCards.map((jc) => ({
    jobNumber: jc.jobNumber,
    status: jc.status,
    priority: jc.priority || "",
    serviceType: jc.serviceType || "",
    description: jc.description || "",
    estimatedHours: jc.estimatedHours || "",
    createdAt: new Date(jc.createdAt!).toLocaleDateString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(
    `JobCards-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

/**
 * Export customers to Excel (CSV format)
 */
export function exportCustomersToExcel(customers: User[]) {
  const headers = ["fullName", "email", "phone", "nationalId", "createdAt"];

  const data = customers.map((customer) => ({
    fullName: customer.fullName || "",
    email: customer.email,
    phone: customer.phone || "",
    nationalId: customer.nationalId || "",
    createdAt: new Date(customer.createdAt!).toLocaleDateString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(
    `Customers-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

/**
 * Export vehicles to Excel (CSV format)
 */
export function exportVehiclesToExcel(vehicles: Vehicle[]) {
  const headers = [
    "vin",
    "licensePlate",
    "make",
    "model",
    "year",
    "color",
    "mileage",
    "createdAt",
  ];

  const data = vehicles.map((vehicle) => ({
    vin: vehicle.vin || "",
    licensePlate: vehicle.licensePlate || "",
    make: vehicle.make || "",
    model: vehicle.model || "",
    year: vehicle.year || "",
    color: vehicle.color || "",
    mileage: vehicle.mileage || "",
    createdAt: new Date(vehicle.createdAt!).toLocaleDateString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(
    `Vehicles-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

/**
 * Export estimates to Excel (CSV format)
 */
export function exportEstimatesToExcel(estimates: Estimate[]) {
  const headers = [
    "estimateNumber",
    "status",
    "totalAmount",
    "validUntil",
    "notes",
    "createdAt",
  ];

  const data = estimates.map((est) => ({
    estimateNumber: est.estimateNumber,
    status: est.status,
    totalAmount: parseFloat(est.totalAmount).toFixed(2),
    validUntil: est.validUntil
      ? new Date(est.validUntil).toLocaleDateString()
      : "",
    notes: est.notes || "",
    createdAt: new Date(est.createdAt!).toLocaleDateString(),
  }));

  const csv = convertToCSV(data, headers);
  downloadCSV(
    `Estimates-${new Date().toISOString().split("T")[0]}.csv`,
    csv
  );
}

/**
 * Export analytics data to Excel
 */
export function exportAnalyticsToExcel(
  title: string,
  data: Record<string, any>[]
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Extract headers from first object
  const headers = Object.keys(data[0]);

  const csv = convertToCSV(data, headers);
  downloadCSV(`${title}-${new Date().toISOString().split("T")[0]}.csv`, csv);
}

/**
 * Export VAT report for Saudi tax compliance
 */
export function exportVATReportToExcel(
  invoices: Invoice[],
  startDate: Date,
  endDate: Date
) {
  const headers = [
    "invoiceNumber",
    "date",
    "customerName",
    "subtotal",
    "vatAmount",
    "totalAmount",
    "status",
  ];

  const data = invoices
    .filter((inv) => {
      const invDate = new Date(inv.invoiceDate);
      return invDate >= startDate && invDate <= endDate;
    })
    .map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      date: new Date(inv.invoiceDate).toLocaleDateString(),
      customerName: "Customer", // Would need to join with customer data
      subtotal: parseFloat(inv.subtotal).toFixed(2),
      vatAmount: parseFloat(inv.taxAmount).toFixed(2),
      totalAmount: parseFloat(inv.totalAmount).toFixed(2),
      status: inv.status,
    }));

  // Calculate totals
  const totalSubtotal = data.reduce(
    (sum, inv) => sum + parseFloat(inv.subtotal),
    0
  );
  const totalVAT = data.reduce(
    (sum, inv) => sum + parseFloat(inv.vatAmount),
    0
  );
  const totalAmount = data.reduce(
    (sum, inv) => sum + parseFloat(inv.totalAmount),
    0
  );

  // Add totals row
  data.push({
    invoiceNumber: "TOTAL",
    date: "",
    customerName: "",
    subtotal: totalSubtotal.toFixed(2),
    vatAmount: totalVAT.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    status: "",
  });

  const csv = convertToCSV(data, headers);
  downloadCSV(
    `VAT-Report-${startDate.toISOString().split("T")[0]}-to-${
      endDate.toISOString().split("T")[0]
    }.csv`,
    csv
  );
}
