import { Router } from "express";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";
import { storage } from "../storage";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import type { z } from "zod";

const router = Router();

/**
 * Local helper — mirrors sanitizeZodError from the monolith
 */
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    })),
  };
}

function sanitizeArrayValidationErrors(
  invalidItems: Array<{ success: false; error: z.ZodError }>
) {
  return {
    message: "Validation failed",
    errors: invalidItems.flatMap((v) =>
      v.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))
    ),
  };
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

// GET /invoices — list invoices (uses garage_id, not garageId)
router.get("/invoices", isAuthenticated, async (req, res) => {
  try {
    const { garage_id, status } = req.query;
    const invoices = await storage.getInvoices(
      garage_id as string,
      status as string
    );
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// GET /invoices/:id — single invoice
router.get("/invoices/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await storage.getInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ message: "Failed to fetch invoice" });
  }
});

// POST /invoices — create invoice (with schema validation + date coercion)
router.post("/invoices", isAuthenticated, async (req: any, res) => {
  try {
    const { insertInvoiceSchema } = await import("@shared/schema");
    const userId = req.user?.id || "default-user";

    // Coerce date strings from JSON to Date objects
    const body = { ...req.body };
    if (typeof body.dueDate === "string") body.dueDate = new Date(body.dueDate);
    if (typeof body.invoiceDate === "string")
      body.invoiceDate = new Date(body.invoiceDate);

    const validationResult = insertInvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const invoiceData = {
      ...validationResult.data,
      createdBy: userId,
    };

    const invoice = await storage.createInvoice(invoiceData as any);
    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
});

// POST /invoices/with-items — create invoice + line items in one call
router.post("/invoices/with-items", isAuthenticated, async (req: any, res) => {
  try {
    const { insertInvoiceSchema, insertInvoiceItemSchema } = await import(
      "@shared/schema"
    );
    const userId = req.user?.id || "default-user";
    const { invoice, items } = req.body;

    if (!invoice || !items || !Array.isArray(items)) {
      return res.status(400).json({
        message: "Invalid request: invoice and items (array) required",
      });
    }

    // Coerce date strings from JSON
    if (typeof invoice.dueDate === "string")
      invoice.dueDate = new Date(invoice.dueDate);
    if (typeof invoice.invoiceDate === "string")
      invoice.invoiceDate = new Date(invoice.invoiceDate);

    const invoiceValidation = insertInvoiceSchema.safeParse(invoice);
    if (!invoiceValidation.success) {
      return res
        .status(400)
        .json(sanitizeZodError(invoiceValidation.error));
    }

    const itemsValidation = items.map((item: any) =>
      insertInvoiceItemSchema.omit({ invoiceId: true }).safeParse(item)
    );

    const invalidItems = itemsValidation.filter((v: any) => !v.success);
    if (invalidItems.length > 0) {
      return res
        .status(400)
        .json(sanitizeArrayValidationErrors(invalidItems as any));
    }

    const invoiceData = {
      ...invoiceValidation.data,
      createdBy: userId,
    };

    const validItems = itemsValidation
      .map((v: any) => (v.success ? v.data : null))
      .filter(Boolean);

    const createdInvoice = await storage.createInvoiceWithItems(
      invoiceData as any,
      validItems as any
    );
    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error("Error creating invoice with items:", error);
    res.status(500).json({ message: "Failed to create invoice with items" });
  }
});

// PATCH /invoices/:id — update invoice (with validation + status workflow)
router.patch("/invoices/:id", isAuthenticated, async (req, res) => {
  try {
    const { insertInvoiceSchema } = await import("@shared/schema");
    const { id } = req.params;

    const validationResult = insertInvoiceSchema.partial().safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    // Validate status workflow if status is being changed
    if (validationResult.data.status) {
      const currentInvoice = await storage.getInvoice(id);
      if (!currentInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      const validTransitions: Record<string, string[]> = {
        draft: ["draft", "sent", "cancelled"],
        sent: ["sent", "paid", "overdue", "cancelled"],
        paid: ["paid", "cancelled"],
        overdue: ["overdue", "paid", "cancelled"],
        cancelled: ["cancelled"],
      };

      const allowedStatuses =
        validTransitions[currentInvoice.status] || [currentInvoice.status];
      if (!allowedStatuses.includes(validationResult.data.status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${currentInvoice.status} to ${validationResult.data.status}`,
        });
      }
    }

    const invoice = await storage.updateInvoice(id, validationResult.data);
    res.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Failed to update invoice" });
  }
});

// DELETE /invoices/:id — admin/manager only
router.delete(
  "/invoices/:id",
  isAuthenticated,
  requireRole(["ADMIN", "MANAGER"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteInvoice(id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  }
);

// GET /invoices/:id/items — invoice line items
router.get("/invoices/:id/items", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await storage.getInvoiceItems(id);
    res.json(items);
  } catch (error) {
    console.error("Error fetching invoice items:", error);
    res.status(500).json({ message: "Failed to fetch invoice items" });
  }
});

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

// GET /payments — list payments with invoice & customer info
router.get("/payments", isAuthenticated, async (req, res) => {
  try {
    const { invoice_id, status, method } = req.query;
    const { payments, invoices, users } = await import("@shared/schema");

    // Get payments with invoice and customer info
    let query = db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        paymentDate: payments.paymentDate,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        referenceNumber: payments.referenceNumber,
        notes: payments.notes,
        createdBy: payments.createdBy,
        createdAt: payments.createdAt,
        invoiceNumber: invoices.invoiceNumber,
        customerName: users.fullName,
      })
      .from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .innerJoin(users, eq(invoices.customerId, users.id))
      .orderBy(desc(payments.paymentDate));

    let results = await query;

    // Apply filters
    if (invoice_id) {
      results = results.filter((p: any) => p.invoiceId === invoice_id);
    }
    if (method && method !== "all") {
      results = results.filter((p: any) => p.paymentMethod === method);
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

// POST /payments — create payment and update invoice balance
router.post("/payments", isAuthenticated, async (req: any, res) => {
  try {
    const { insertPaymentSchema } = await import("@shared/schema");
    const userId = req.user?.id || "default-user";

    const validationResult = insertPaymentSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json(sanitizeZodError(validationResult.error));
    }

    const paymentData = {
      ...validationResult.data,
      createdBy: userId,
    };

    const payment = await storage.createPayment(paymentData as any);

    // Update invoice paid amount
    const invoice = await storage.getInvoice(payment.invoiceId);
    if (invoice) {
      const newPaidAmount =
        parseFloat(invoice.paidAmount) + parseFloat(payment.amount);
      const balanceAmount =
        parseFloat(invoice.totalAmount) - newPaidAmount;
      const newStatus = balanceAmount <= 0 ? "paid" : invoice.status;

      await storage.updateInvoice(payment.invoiceId, {
        paidAmount: newPaidAmount.toFixed(2),
        balanceAmount: balanceAmount.toFixed(2),
        status: newStatus,
        paidAt: balanceAmount <= 0 ? new Date() : invoice.paidAt,
      });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

// DELETE /payments/:id
router.delete("/payments/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deletePayment(id);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ message: "Failed to delete payment" });
  }
});

export const invoiceRoutes = router;
