/**
 * Moyasar adapter — Saudi aggregator for Mada, Visa, Mastercard, Apple Pay, STC Pay.
 *
 * Uses the Moyasar Invoices API: create an invoice, redirect the customer to the
 * hosted payment page (`url`), and confirm via webhook + status polling.
 * Docs: https://docs.moyasar.com/
 *
 * Required env:
 *   MOYASAR_SECRET_KEY        (sk_...)  — server-side, HTTP Basic username
 *   MOYASAR_WEBHOOK_SECRET    (optional) — shared secret to verify webhooks
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

const API = 'https://api.moyasar.com/v1';

function key(): string {
  return process.env.MOYASAR_SECRET_KEY || '';
}

function authHeader(): string {
  // HTTP Basic: secret key as username, empty password.
  return 'Basic ' + Buffer.from(`${key()}:`).toString('base64');
}

export const moyasarProvider: PaymentProvider = {
  id: 'moyasar',
  label: 'Moyasar (Mada · Cards · Apple Pay · STC Pay)',
  methods: ['mada', 'visa', 'mastercard', 'amex', 'apple_pay', 'stc_pay'],

  isEnabled() {
    return !!key();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const amountHalalas = Math.round(input.amount * 100);
      const res = await fetch(`${API}/invoices`, {
        method: 'POST',
        headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountHalalas,
          currency: input.currency || 'SAR',
          description: input.description || `Invoice ${input.invoiceId}`,
          success_url: input.returnUrl,
          back_url: input.returnUrl,
          callback_url: input.webhookUrl,
          metadata: { invoiceId: input.invoiceId, customerId: input.customer.id || '' },
        }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        return { kind: 'error', message: data?.message || 'Moyasar invoice creation failed' };
      }
      return { kind: 'redirect', url: data.url, gatewayReference: data.id, transactionId: data.id };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'Moyasar request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    const body: any = input.body || {};
    // Optional shared-secret check.
    const expected = process.env.MOYASAR_WEBHOOK_SECRET;
    if (expected && body.secret_token && body.secret_token !== expected) {
      return { handled: false };
    }
    const payment = body.data || body;
    const status = payment?.status === 'paid' ? 'completed'
      : payment?.status === 'failed' ? 'failed'
      : 'pending';
    return {
      handled: true,
      invoiceId: payment?.metadata?.invoiceId,
      transactionId: payment?.id,
      status,
      amount: typeof payment?.amount === 'number' ? payment.amount / 100 : undefined,
      currency: payment?.currency,
      raw: body,
    };
  },

  async getStatus(transactionId: string) {
    const res = await fetch(`${API}/payments/${transactionId}`, {
      headers: { Authorization: authHeader() },
    });
    const data: any = await res.json();
    return { status: data?.status || 'unknown', raw: data };
  },

  async refund(transactionId: string, amount?: number) {
    const res = await fetch(`${API}/payments/${transactionId}/refund`, {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(amount ? { amount: Math.round(amount * 100) } : {}),
    });
    return { ok: res.ok, raw: await res.json().catch(() => ({})) };
  },
};
