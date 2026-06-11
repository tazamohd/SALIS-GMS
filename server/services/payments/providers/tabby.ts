/**
 * Tabby adapter — Buy Now Pay Later (split a repair bill into instalments).
 *
 * Uses the Checkout API: create a session, redirect to `configuration.
 * available_products.installments[0].web_url`, confirm via webhook.
 * Docs: https://docs.tabby.ai/
 *
 * Required env:
 *   TABBY_SECRET_KEY     (sk_...)
 *   TABBY_MERCHANT_CODE  (your merchant code / "merchant_code")
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

const API = 'https://api.tabby.ai/api/v2';

function key(): string {
  return process.env.TABBY_SECRET_KEY || '';
}
function merchantCode(): string {
  return process.env.TABBY_MERCHANT_CODE || '';
}

export const tabbyProvider: PaymentProvider = {
  id: 'tabby',
  label: 'Tabby (Buy Now, Pay Later)',
  methods: ['tabby'],

  isEnabled() {
    return !!key() && !!merchantCode();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const res = await fetch(`${API}/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: {
            amount: input.amount.toFixed(2),
            currency: input.currency || 'SAR',
            description: input.description || `Invoice ${input.invoiceId}`,
            buyer: {
              email: input.customer.email || 'customer@example.com',
              phone: input.customer.phone || '',
              name: input.customer.name || 'Customer',
            },
            order: { reference_id: input.invoiceId },
          },
          lang: 'en',
          merchant_code: merchantCode(),
          merchant_urls: {
            success: input.returnUrl,
            cancel: input.returnUrl,
            failure: input.returnUrl,
          },
        }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        return { kind: 'error', message: data?.error || 'Tabby checkout creation failed' };
      }
      const webUrl =
        data?.configuration?.available_products?.installments?.[0]?.web_url ||
        data?.web_url;
      if (data?.status === 'rejected' || !webUrl) {
        return { kind: 'error', message: 'Tabby is not available for this order' };
      }
      return { kind: 'redirect', url: webUrl, gatewayReference: data.payment?.id, transactionId: data.payment?.id };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'Tabby request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    const payment: any = input.body || {};
    const status = payment?.status === 'CLOSED' || payment?.status === 'AUTHORIZED' ? 'completed'
      : payment?.status === 'REJECTED' || payment?.status === 'EXPIRED' ? 'failed'
      : 'pending';
    return {
      handled: true,
      invoiceId: payment?.order?.reference_id,
      transactionId: payment?.id,
      status,
      amount: payment?.amount ? Number(payment.amount) : undefined,
      currency: payment?.currency,
      methodType: 'tabby',
      raw: payment,
    };
  },

  async getStatus(transactionId: string) {
    const res = await fetch(`${API}/payments/${transactionId}`, {
      headers: { Authorization: `Bearer ${key()}` },
    });
    const data: any = await res.json();
    return { status: data?.status || 'unknown', raw: data };
  },
};
