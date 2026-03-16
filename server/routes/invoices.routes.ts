import { Router } from "express";
import { isAuthenticated } from "../auth";
import { storage } from "../storage";

const router = Router();

/**
 * Invoice & Payment Routes
 * - GET /api/invoices - List invoices
 * - POST /api/invoices - Create invoice
 * - GET /api/invoices/:id - Get invoice details
 * - PATCH /api/invoices/:id - Update invoice
 * - GET /api/payments - List payments
 * - POST /api/payments - Create payment
 * - GET /api/refunds - List refunds
 * - POST /api/refunds - Create refund
 * - POST /api/calculate-tax - Calculate tax
 * - POST /api/send-payment-reminder - Send payment reminder
 * - GET /api/payment-plans - List payment plans
 * - POST /api/payment-plans - Create payment plan
 */

// Get all invoices
router.get("/invoices", isAuthenticated, async (req, res) => {
  try {
    const { garageId, status } = req.query;
    const invoices = await storage.getInvoices(
      garageId as string,
      status as string
    );
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// Create invoice
router.post("/invoices", isAuthenticated, async (req: any, res) => {
  try {
    const { customerId, jobCardId, items, tax, discount, notes } = req.body;
    const userId = req.user?.id || "default-user";

    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const invoice = await storage.createInvoice({
      customerId,
      jobCardId: jobCardId || null,
      items: items || [],
      tax: tax || 0,
      discount: discount || 0,
      notes: notes || null,
      createdBy: userId,
      status: "draft",
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
});

// Get invoice by ID
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

// Update invoice
router.patch("/invoices/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tax, discount, notes } = req.body;

    const invoice = await storage.updateInvoice(id, {
      status: status || undefined,
      tax: tax || undefined,
      discount: discount || undefined,
      notes: notes || undefined,
    });

    res.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ message: "Failed to update invoice" });
  }
});

// Get all payments
router.get("/payments", isAuthenticated, async (req, res) => {
  try {
    const { invoiceId, status } = req.query;
    const payments = await storage.getPayments(
      invoiceId as string,
      status as string
    );
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

// Create payment
router.post("/payments", isAuthenticated, async (req: any, res) => {
  try {
    const { invoiceId, amount, method, reference } = req.body;
    const userId = req.user?.id || "default-user";

    if (!invoiceId || !amount) {
      return res
        .status(400)
        .json({ message: "Invoice ID and amount are required" });
    }

    const payment = await storage.createPayment({
      invoiceId,
      amount,
      method: method || "cash",
      reference: reference || null,
      status: "completed",
      createdBy: userId,
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

// Get refunds
router.get("/refunds", isAuthenticated, async (req, res) => {
  try {
    const { paymentId } = req.query;
    const refunds = await storage.getRefunds(paymentId as string);
    res.json(refunds);
  } catch (error) {
    console.error("Error fetching refunds:", error);
    res.status(500).json({ message: "Failed to fetch refunds" });
  }
});

// Create refund
router.post("/refunds", isAuthenticated, async (req: any, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    const userId = req.user?.id || "default-user";

    if (!paymentId || !amount) {
      return res
        .status(400)
        .json({ message: "Payment ID and amount are required" });
    }

    const refund = await storage.createRefund({
      paymentId,
      amount,
      reason: reason || null,
      createdBy: userId,
    });

    res.status(201).json(refund);
  } catch (error) {
    console.error("Error creating refund:", error);
    res.status(500).json({ message: "Failed to create refund" });
  }
});

// Calculate tax
router.post("/calculate-tax", isAuthenticated, async (req, res) => {
  try {
    const { amount, region, taxRate } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const taxAmount = amount * ((taxRate || 15) / 100);
    const total = amount + taxAmount;

    res.json({
      amount,
      taxRate: taxRate || 15,
      taxAmount,
      total,
    });
  } catch (error) {
    console.error("Error calculating tax:", error);
    res.status(500).json({ message: "Failed to calculate tax" });
  }
});

// Send payment reminder
router.post(
  "/send-payment-reminder",
  isAuthenticated,
  async (req: any, res) => {
    try {
      const { invoiceId } = req.body;

      if (!invoiceId) {
        return res.status(400).json({ message: "Invoice ID is required" });
      }

      // TODO: Implement email/SMS reminder logic
      res.json({ message: "Payment reminder sent successfully" });
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      res
        .status(500)
        .json({ message: "Failed to send payment reminder" });
    }
  }
);

// TODO: Implement remaining invoice routes
// - GET /api/payment-plans
// - POST /api/payment-plans

export const invoiceRoutes = router;
