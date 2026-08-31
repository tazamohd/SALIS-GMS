import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.post("/job-cards/:id/convert-to-invoice", isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user?.garageId) return res.status(403).json({ message: "No garage associated" });

  try {
    const jobCard = await storage.getJobCard(req.params.id);
    if (!jobCard) return res.status(404).json({ message: "Job card not found" });
    if (jobCard.garageId !== user.garageId) return res.status(403).json({ message: "Access denied" });
    if (jobCard.status !== "completed") {
      return res.status(400).json({ message: "Only completed job cards can be converted to invoices" });
    }

    const totalCost = jobCard.totalCost ? String(jobCard.totalCost) : "0.00";
    const subtotal = parseFloat(totalCost);
    const taxRate = 0.15;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const hours = jobCard.actualHours ? parseFloat(String(jobCard.actualHours)) : 0;
    const hoursNote = hours > 0 ? ` (${hours}h labor)` : "";

    const invoice = await storage.createInvoiceWithItems(
      {
        invoiceNumber: `INV-${Date.now()}`,
        garageId: jobCard.garageId,
        customerId: jobCard.customerId || "",
        jobCardId: jobCard.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "draft",
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        discountAmount: "0.00",
        totalAmount: String(totalAmount),
        paidAmount: "0.00",
        balanceAmount: String(totalAmount),
        notes: `Invoice generated from Job Card ${jobCard.jobNumber}`,
        createdBy: user.id,
      },
      [
        {
          itemType: "service",
          description: `${jobCard.serviceType || "Service"} — ${jobCard.description || ""}${hoursNote}`.trim(),
          quantity: 1,
          unitPrice: totalCost,
          lineTotal: totalCost,
        },
      ]
    );

    await storage.updateJobCard(jobCard.id, { status: "invoiced" });

    res.json({ invoice, message: "Job card converted to invoice successfully" });
  } catch (err) {
    console.error("[job-card-invoice] convert error:", err);
    res.status(500).json({ message: "Failed to convert job card to invoice" });
  }
});

export const jobCardInvoiceRoutes = router;
