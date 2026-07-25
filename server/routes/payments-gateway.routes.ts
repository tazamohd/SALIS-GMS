/**
 * Unified multi-gateway payment routes.
 *
 *   GET  /api/payments/methods          → enabled methods for the selector UI
 *   GET  /api/payments/gateways         → gateway enable/disable status (admin)
 *   POST /api/payments/initiate         → start a payment for an invoice
 *   POST /api/payments/webhook/:gateway → async confirmation from a gateway
 *   GET  /api/payments/:id/status       → poll a payment's status
 *
 * This composes with — and does not replace — the legacy Stripe-only
 * /api/customer/create-payment-intent flow. New clients should use
 * /api/payments/initiate, which routes to whichever gateway is configured.
 */
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import {
  enabledMethods,
  gatewayStatus,
  getProviderById,
  getProviderForMethod,
} from '../services/payments/registry';
import type { GatewayId, PaymentMethodType } from '../services/payments/types';
import { logger } from '../logger';

const router = Router();

function publicBaseUrl(req: any): string {
  return process.env.PUBLIC_APP_URL || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
}

// ── GET /api/payments/methods ───────────────────────────────────────────────
// What the customer/staff can choose right now (depends on which keys are set).
router.get('/payments/methods', isAuthenticated, (_req, res) => {
  res.json({ methods: enabledMethods() });
});

// ── GET /api/payments/gateways ──────────────────────────────────────────────
// Admin view of every gateway and whether it's configured.
router.get('/payments/gateways', isAuthenticated, (_req, res) => {
  res.json({ gateways: gatewayStatus() });
});

// ── POST /api/payments/initiate ─────────────────────────────────────────────
router.post('/payments/initiate', isAuthenticated, async (req: any, res) => {
  try {
    const { invoiceId, method } = req.body as { invoiceId?: string; method?: PaymentMethodType };
    if (!invoiceId || !method) {
      return res.status(400).json({ message: 'invoiceId and method are required' });
    }

    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Tenancy / ownership: garage users limited to their garage; customers to
    // their own invoices.
    const user = req.user || {};
    const isCustomer = user.userType === 'customer' || String(user.role || '').toUpperCase() === 'CUSTOMER';
    if (user.garageId && (invoice as any).garageId && (invoice as any).garageId !== user.garageId) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (isCustomer && (invoice as any).customerId && (invoice as any).customerId !== user.id) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const provider = getProviderForMethod(method);
    if (!provider) {
      return res.status(400).json({ message: `Payment method "${method}" is not available (gateway not configured).` });
    }

    const amount = Number((invoice as any).balanceAmount ?? (invoice as any).totalAmount ?? 0);
    if (!(amount > 0)) {
      return res.status(400).json({ message: 'Invoice has no outstanding balance.' });
    }
    const currency = (invoice as any).currency || process.env.PAYMENT_DEFAULT_CURRENCY || 'SAR';
    const returnUrl = `${publicBaseUrl(req)}/payment/return?invoiceId=${encodeURIComponent(invoiceId)}`;
    const webhookUrl = `${publicBaseUrl(req)}/api/payments/webhook/${provider.id}`;

    const result = await provider.createPayment({
      invoiceId,
      amount,
      currency,
      method,
      customer: { id: user.id, name: user.fullName, email: user.email, phone: user.phone },
      description: `Invoice ${(invoice as any).invoiceNumber || invoiceId}`,
      returnUrl,
      webhookUrl,
    });

    if (result.kind === 'error') {
      return res.status(502).json({ message: result.message });
    }

    // Manual payment: record it immediately as completed and settle the invoice.
    if (result.kind === 'manual') {
      await recordCompletedPayment({
        invoiceId,
        amount,
        currency,
        gateway: 'manual',
        methodType: method,
        transactionId: undefined,
        createdBy: user.id,
      });
      return res.json({ kind: 'manual', status: 'completed' });
    }

    // Online payment: persist a pending row so the webhook can reconcile.
    if ((result as any).transactionId || (result as any).gatewayReference) {
      try {
        await storage.createPayment({
          invoiceId,
          amount: amount.toFixed(2),
          paymentMethod: method,
          gateway: provider.id,
          methodType: method,
          status: 'pending',
          currency,
          gatewayTransactionId: (result as any).transactionId || null,
          gatewayReference: (result as any).gatewayReference || null,
          createdBy: user.id,
        } as any);
      } catch (e) {
        logger.warn('payments: failed to persist pending row', { error: String(e) });
      }
    }

    return res.json(result);
  } catch (error: any) {
    logger.error('payments initiate failed', { error: String(error) });
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
});

// ── POST /api/payments/webhook/:gateway ─────────────────────────────────────
router.post('/payments/webhook/:gateway', async (req: any, res) => {
  const gateway = req.params.gateway as GatewayId;
  const provider = getProviderById(gateway);
  if (!provider) return res.status(404).json({ message: 'Unknown gateway' });

  try {
    const result = await provider.handleWebhook({
      headers: req.headers,
      rawBody: req.rawBody || JSON.stringify(req.body || {}),
      body: req.body,
    });

    if (result.handled && result.status === 'completed' && result.invoiceId) {
      await recordCompletedPayment({
        invoiceId: result.invoiceId,
        amount: result.amount,
        currency: result.currency,
        gateway,
        methodType: result.methodType,
        transactionId: result.transactionId,
        createdBy: undefined,
      });
      logger.info('payment confirmed via webhook', { gateway, invoiceId: result.invoiceId });
    }
    // Always 200 so the gateway stops retrying once we've accepted the event.
    res.json({ received: true });
  } catch (error: any) {
    logger.error('payment webhook failed', { gateway, error: String(error) });
    res.status(200).json({ received: true });
  }
});

// ── GET /api/payments/:id/status ────────────────────────────────────────────
router.get('/payments/:id/status', isAuthenticated, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { gateway } = req.query as { gateway?: GatewayId };
    if (gateway) {
      const provider = getProviderById(gateway);
      if (provider?.getStatus) {
        const s = await provider.getStatus(id);
        return res.json(s);
      }
    }
    res.json({ status: 'unknown' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch payment status' });
  }
});

/**
 * Record a completed payment and settle the invoice. Idempotent on
 * gatewayTransactionId where possible — a duplicate webhook won't double-pay.
 */
async function recordCompletedPayment(opts: {
  invoiceId: string;
  amount?: number;
  currency?: string;
  gateway: GatewayId;
  methodType?: PaymentMethodType;
  transactionId?: string;
  createdBy?: string;
}): Promise<void> {
  const invoice = await storage.getInvoice(opts.invoiceId);
  if (!invoice) return;

  const amount = opts.amount ?? Number((invoice as any).balanceAmount ?? (invoice as any).totalAmount ?? 0);

  await storage.createPayment({
    invoiceId: opts.invoiceId,
    amount: Number(amount).toFixed(2),
    paymentMethod: opts.methodType || 'card',
    gateway: opts.gateway,
    methodType: opts.methodType || null,
    status: 'completed',
    currency: opts.currency || 'SAR',
    gatewayTransactionId: opts.transactionId || null,
    createdBy: opts.createdBy || (invoice as any).createdBy || null,
  } as any);

  const prevPaid = parseFloat((invoice as any).paidAmount || '0');
  const total = parseFloat((invoice as any).totalAmount || '0');
  const newPaid = prevPaid + Number(amount);
  const balance = Math.max(total - newPaid, 0);
  await storage.updateInvoice(opts.invoiceId, {
    paidAmount: newPaid.toFixed(2),
    balanceAmount: balance.toFixed(2),
    status: balance <= 0 ? 'paid' : (invoice as any).status,
    paidAt: balance <= 0 ? new Date() : (invoice as any).paidAt,
  } as any);
}

export default router;
