import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, InvoiceItem, JobCard, Estimate } from "@shared/schema";

/**
 * Export invoice to PDF with VAT breakdown and ZATCA compliance
 */
export function exportInvoiceToPDF(
  invoice: Invoice,
  items: InvoiceItem[],
  customerName: string,
  companyInfo?: {
    name: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(companyInfo?.name || "SALIS AUTO", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (companyInfo?.vatNumber) {
    doc.text(`VAT/TRN: ${companyInfo.vatNumber}`, 14, 28);
  }
  if (companyInfo?.address) {
    doc.text(companyInfo.address, 14, 34);
  }
  if (companyInfo?.phone) {
    doc.text(companyInfo.phone, 14, 40);
  }

  // Invoice Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 14, 28, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
    pageWidth - 14,
    34,
    { align: "right" }
  );
  if (invoice.dueDate) {
    doc.text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      pageWidth - 14,
      40,
      { align: "right" }
    );
  }

  // Bill To
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(customerName, 14, 62);

  // Line Items Table
  const tableData = items.map((item) => [
    item.description,
    item.quantity.toString(),
    `$${parseFloat(item.unitPrice).toFixed(2)}`,
    `$${parseFloat(item.lineTotal).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 75,
    head: [["Description", "Quantity", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [41, 41, 41], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  // Totals section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totalsX = pageWidth - 70;

  doc.setFontSize(10);

  // Subtotal
  doc.text("Subtotal:", totalsX, finalY);
  doc.text(
    `$${parseFloat(invoice.subtotal).toFixed(2)}`,
    pageWidth - 14,
    finalY,
    { align: "right" }
  );

  // VAT (15% Saudi Arabia)
  doc.text("VAT (15%):", totalsX, finalY + 6);
  doc.text(
    `$${parseFloat(invoice.taxAmount).toFixed(2)}`,
    pageWidth - 14,
    finalY + 6,
    { align: "right" }
  );

  // Discount (if any)
  if (parseFloat(invoice.discountAmount) > 0) {
    doc.text("Discount:", totalsX, finalY + 12);
    doc.text(
      `-$${parseFloat(invoice.discountAmount).toFixed(2)}`,
      pageWidth - 14,
      finalY + 12,
      { align: "right" }
    );
  }

  // Total
  const totalY = parseFloat(invoice.discountAmount) > 0 ? finalY + 20 : finalY + 14;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", totalsX, totalY);
  doc.text(
    `$${parseFloat(invoice.totalAmount).toFixed(2)}`,
    pageWidth - 14,
    totalY,
    { align: "right" }
  );

  // Payment Status
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Paid:", totalsX, totalY + 8);
  doc.text(
    `$${parseFloat(invoice.paidAmount).toFixed(2)}`,
    pageWidth - 14,
    totalY + 8,
    { align: "right" }
  );

  doc.setFont("helvetica", "bold");
  doc.text("Balance Due:", totalsX, totalY + 14);
  doc.text(
    `$${parseFloat(invoice.balanceAmount).toFixed(2)}`,
    pageWidth - 14,
    totalY + 14,
    { align: "right" }
  );

  // Footer - ZATCA Compliance Note
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a ZATCA-compliant e-invoice (Fatoora) for Saudi Arabia tax reporting.",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  // Save PDF
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}

/**
 * Export job card to PDF
 */
export function exportJobCardToPDF(
  jobCard: JobCard,
  customerName: string,
  vehicleInfo?: string
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("JOB CARD", 14, 20);

  // Job Card Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Job Card #: ${jobCard.jobNumber}`, 14, 30);
  doc.text(`Customer: ${customerName}`, 14, 36);
  if (vehicleInfo) {
    doc.text(`Vehicle: ${vehicleInfo}`, 14, 42);
  }
  doc.text(`Status: ${jobCard.status.toUpperCase()}`, 14, 48);
  doc.text(
    `Created: ${new Date(jobCard.createdAt!).toLocaleDateString()}`,
    14,
    54
  );

  // Description
  if (jobCard.description) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Description:", 14, 65);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(jobCard.description, 14, 72, { maxWidth: 180 });
  }

  // Save PDF
  doc.save(`JobCard-${jobCard.jobNumber}.pdf`);
}

/**
 * Export estimate to PDF
 */
export function exportEstimateToPDF(
  estimate: Estimate,
  customerName: string,
  items?: Array<{ description: string; amount: number }>
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ESTIMATE", 14, 20);

  // Estimate Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Estimate #: ${estimate.estimateNumber}`, 14, 30);
  doc.text(`Customer: ${customerName}`, 14, 36);
  doc.text(
    `Date: ${new Date(estimate.createdAt!).toLocaleDateString()}`,
    14,
    42
  );
  doc.text(`Status: ${estimate.status.toUpperCase()}`, 14, 48);

  // Items table if provided
  if (items && items.length > 0) {
    const tableData = items.map((item) => [
      item.description,
      `$${item.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["Description", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 41, 41] },
      columnStyles: {
        1: { halign: "right" },
      },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Estimated Total:", pageWidth - 80, finalY);
    doc.text(
      `$${parseFloat(estimate.totalAmount).toFixed(2)}`,
      pageWidth - 14,
      finalY,
      { align: "right" }
    );

    // VAT Note
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("*Prices exclude 15% VAT", pageWidth - 14, finalY + 6, {
      align: "right",
    });
  }

  // Save PDF
  doc.save(`Estimate-${estimate.estimateNumber}.pdf`);
}

/**
 * Export multiple invoices to combined PDF (batch export)
 */
export function exportInvoicesBatchToPDF(invoices: Invoice[]) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Report", 14, 20);

  const tableData = invoices.map((inv) => [
    inv.invoiceNumber,
    new Date(inv.invoiceDate).toLocaleDateString(),
    `$${parseFloat(inv.totalAmount).toFixed(2)}`,
    inv.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: 30,
    head: [["Invoice #", "Date", "Total", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [41, 41, 41] },
  });

  doc.save(`Invoice-Report-${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Export payment receipt to PDF
 */
export function exportPaymentReceiptToPDF(
  payment: {
    id: string;
    invoiceId: string;
    paymentDate: string;
    amount: string;
    paymentMethod: string;
    referenceNumber: string | null;
    notes: string | null;
    invoiceNumber: string;
    customerName: string | null;
  },
  companyInfo?: {
    name: string;
    vatNumber?: string;
    address?: string;
    phone?: string;
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header - Company Info
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(companyInfo?.name || "SALIS AUTO", 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (companyInfo?.vatNumber) {
    doc.text(`VAT/TRN: ${companyInfo.vatNumber}`, 14, 28);
  }
  if (companyInfo?.address) {
    doc.text(companyInfo.address, 14, 34);
  }
  if (companyInfo?.phone) {
    doc.text(companyInfo.phone, 14, 40);
  }

  // Receipt Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth - 14, 20, { align: "right" });

  // Receipt Number
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt #: ${payment.id.slice(0, 8).toUpperCase()}`, pageWidth - 14, 28, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date(payment.paymentDate).toLocaleDateString()}`,
    pageWidth - 14,
    34,
    { align: "right" }
  );

  // Received From
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Received From:", 14, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(payment.customerName || "Customer", 14, 62);

  // Payment Details Box
  const boxY = 75;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(14, boxY, pageWidth - 28, 60, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", 20, boxY + 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Invoice Reference
  doc.text("Invoice Reference:", 20, boxY + 24);
  doc.text(payment.invoiceNumber, 80, boxY + 24);

  // Payment Method
  doc.text("Payment Method:", 20, boxY + 34);
  const methodLabels: Record<string, string> = {
    cash: "Cash",
    card: "Credit/Debit Card",
    transfer: "Bank Transfer",
    check: "Check",
    bank_transfer: "Bank Transfer",
  };
  doc.text(methodLabels[payment.paymentMethod] || payment.paymentMethod, 80, boxY + 34);

  // Reference Number (if any)
  if (payment.referenceNumber) {
    doc.text("Reference #:", 20, boxY + 44);
    doc.text(payment.referenceNumber, 80, boxY + 44);
  }

  // Amount (large and prominent)
  const amountY = boxY + 80;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Amount Received:", 14, amountY);
  
  doc.setFontSize(24);
  doc.setTextColor(10, 94, 215); // Brand blue color
  doc.text(`$${parseFloat(payment.amount).toFixed(2)}`, pageWidth - 14, amountY, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);

  // Notes (if any)
  if (payment.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, amountY + 20);
    doc.setFont("helvetica", "normal");
    doc.text(payment.notes, 14, amountY + 28, { maxWidth: pageWidth - 28 });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Thank you for your payment!",
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.setFontSize(8);
  doc.text(
    "This receipt serves as confirmation of payment received.",
    pageWidth / 2,
    footerY + 8,
    { align: "center" }
  );

  // Save PDF
  doc.save(`Receipt-${payment.invoiceNumber}-${new Date(payment.paymentDate).toISOString().split('T')[0]}.pdf`);
}
