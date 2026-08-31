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

// ── Generate invoice payment link (Stripe Checkout Session) ──────────

router.post("/stripe/payment-link", isAuthenticated, requireRole(["ADMIN", "MANAGER", "ACCOUNTANT"]), async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    const { invoiceId } = req.body;
    if (!invoiceId) return res.status(400).json({ message: "invoiceId is required" });

    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (invoice.status === "paid") return res.status(400).json({ message: "Invoice already paid" });

    const amount = Number(invoice.balanceAmount);
    if (amount <= 0) return res.status(400).json({ message: "Invalid payment amount" });

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "sar",
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: `Payment for invoice ${invoice.invoiceNumber}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${baseUrl}/invoices?payment=success&invoice=${invoice.invoiceNumber}`,
      cancel_url: `${baseUrl}/invoices?payment=cancelled&invoice=${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    res.json({ paymentUrl: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating payment link:", error);
    res.status(500).json({ message: error.message || "Failed to create payment link" });
  }
});

// ── Stripe configuration status ──────────────────────────────────────

router.get("/stripe/status", isAuthenticated, requireRole(["ADMIN"]), (_req: Request, res: Response) => {
  res.json({
    configured: !!stripe,
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
  });
});

// ── Stripe webhook ─────────────────────────────────────────────────────

router.post("/stripe/webhook", async (req: Request, res: Response) => {
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured" });

  try {
    let event = req.body;

    const sig = req.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (sig && webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
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
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        const { invoiceId: sessInvoiceId } = session.metadata || {};
        if (sessInvoiceId && session.payment_status === "paid") {
          const invoice = await storage.getInvoice(sessInvoiceId);
          if (invoice && invoice.status !== "paid") {
            await storage.updateInvoice(sessInvoiceId, {
              status: "paid",
              paidAmount: (Number(session.amount_total) / 100).toString(),
              balanceAmount: "0",
              paidAt: new Date(),
            });
          }
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi) {
          const intent = await stripe.paymentIntents.retrieve(pi);
          const { invoiceId: refInvoiceId } = intent.metadata;
          if (refInvoiceId) {
            const refundedAmount = Number(charge.amount_refunded) / 100;
            const invoice = await storage.getInvoice(refInvoiceId);
            if (invoice) {
              const newBalance = Number(invoice.totalAmount) - (Number(invoice.paidAmount) - refundedAmount);
              await storage.updateInvoice(refInvoiceId, {
                status: newBalance > 0 ? "partially_paid" : "refunded",
                paidAmount: (Number(invoice.paidAmount) - refundedAmount).toString(),
                balanceAmount: newBalance.toString(),
              });
            }
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
});

export const paymentRoutes = router;
