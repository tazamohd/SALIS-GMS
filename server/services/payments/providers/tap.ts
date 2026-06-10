/**
 * Tap Payments adapter — MENA aggregator for Mada, Visa, Mastercard, Amex,
 * Apple Pay, Google Pay, KNET, Benefit.
 *
 * Uses the Charges API: create a charge with a redirect `transaction.url`,
 * confirm via webhook + status polling.
 * Docs: https://developers.tap.company/
 *
 * Required env:
 *   TAP_SECRET_KEY   (sk_live_... / sk_test_...)
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

const API = 'https://api.tap.company/v2';

function key(): string {
  return process.env.TAP_SECRET_KEY || '';
}

// Map our method types to Tap source ids where a specific source is required.
function sourceId(method: string): string {
  if (method === 'mada') return 'src_sa.mada';
  if (method === 'apple_pay') return 'src_apple_pay';
  if (method === 'stc_pay') return 'src_sa.stcpay';
  return 'src_all';
}

export const tapProvider: PaymentProvider = {
  id: 'tap',
  label: 'Tap (Mada · Cards · Apple Pay · STC Pay)',
  methods: ['mada', 'visa', 'mastercard', 'amex', 'apple_pay', 'stc_pay'],

  isEnabled() {
    return !!key();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const res = await fetch(`${API}/charges`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: input.amount,
          currency: input.currency || 'SAR',
          description: input.description || `Invoice ${input.invoiceId}`,
          source: { id: sourceId(input.method) },
          redirect: { url: input.returnUrl },
          post: input.webhookUrl ? { url: input.webhookUrl } : undefined,
          customer: {
            first_name: input.customer.name || 'Customer',
            email: input.customer.email || undefined,
            phone: input.customer.phone ? { number: input.customer.phone } : undefined,
          },
          metadata: { invoiceId: input.invoiceId },
        }),
      });
      const data: any = await res.json();
      if (!res.ok || !data?.transaction?.url) {
        return { kind: 'error', message: data?.errors?.[0]?.description || 'Tap charge creation failed' };
      }
      return { kind: 'redirect', url: data.transaction.url, gatewayReference: data.id, transactionId: data.id };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'Tap request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    const charge: any = input.body || {};
    const status = charge?.status === 'CAPTURED' ? 'completed'
      : charge?.status === 'FAILED' || charge?.status === 'DECLINED' ? 'failed'
      : charge?.status === 'CANCELLED' ? 'cancelled'
      : 'pending';
    return {
      handled: true,
      invoiceId: charge?.metadata?.invoiceId,
      transactionId: charge?.id,
      status,
      amount: typeof charge?.amount === 'number' ? charge.amount : undefined,
      currency: charge?.currency,
      raw: charge,
    };
  },

  async getStatus(transactionId: string) {
    const res = await fetch(`${API}/charges/${transactionId}`, {
      headers: { Authorization: `Bearer ${key()}` },
    });
    const data: any = await res.json();
    return { status: data?.status || 'unknown', raw: data };
  },

  async refund(transactionId: string, amount?: number) {
    const res = await fetch(`${API}/refunds`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ charge_id: transactionId, amount, reason: 'requested_by_customer' }),
    });
    return { ok: res.ok, raw: await res.json().catch(() => ({})) };
  },
};
