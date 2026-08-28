import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// ── Invoice payment (customer-facing) ──────────────────────────────────

router.post("/customer/create-payment-intent", isAuthenticated, async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    const { invoiceId } = req.body;
    const userId = (req as any).user?.id || "default-user";

    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (invoice.customerId !== userId) return res.status(403).json({ message: "Unauthorized" });
    if (invoice.status === "paid") return res.status(400).json({ message: "Invoice already paid" });

    const amount = Number(invoice.balanceAmount);
    if (amount <= 0) return res.status(400).json({ message: "Invalid payment amount" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "sar",
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: userId,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment intent: " + error.message });
  }
});

// ── General payment intent (staff-facing) ──────────────────────────────

router.post("/stripe/create-payment-intent", isAuthenticated, async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    const { amount, currency, invoiceId } = req.body;
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "sar",
      metadata: invoiceId ? { invoiceId } : {},
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: error.message || "Failed to create payment intent" });
  }
});

// ── Payment status ─────────────────────────────────────────────────────

router.get("/stripe/payment-status/:id", isAuthenticated, async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    const intent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({
      id: intent.id,
      status: intent.status,
      amount: intent.amount / 100,
      currency: intent.currency,
    });
  } catch (error: any) {
    console.error("Error retrieving payment status:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve payment status" });
  }
});

// ── Stripe refund ──────────────────────────────────────────────────────

router.post("/stripe/refund", isAuthenticated, requireRole(["ADMIN", "MANAGER", "ACCOUNTANT"]), async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    const { paymentIntentId, amount } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: "paymentIntentId is required" });

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount ? { amount: Math.round(amount * 100) } : {}),
    });

    res.json({
      id: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    });
  } catch (error: any) {
    console.error("Error processing refund:", error);
    res.status(500).json({ message: error.message || "Failed to process refund" });
  }
});

// ── Stripe webhook ─────────────────────────────────────────────────────

router.post("/stripe/webhook", async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    const event = req.body;

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { invoiceId } = paymentIntent.metadata;

      if (invoiceId) {
        const paidAmount = Number(paymentIntent.amount) / 100;
        await storage.updateInvoice(invoiceId, {
          status: "paid",
          paidAmount: paidAmount.toString(),
          balanceAmount: "0",
          paidAt: new Date(),
        });
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
});

export const paymentRoutes = router;
