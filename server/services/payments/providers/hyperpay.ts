/**
 * HyperPay adapter — MENA aggregator for Mada, Visa, Mastercard, Apple Pay, STC Pay.
 *
 * HyperPay uses COPYandPAY: the server prepares a checkout (returns a checkout
 * id), and the browser mounts a hosted widget keyed by that id. We model that
 * as a redirect to our own widget-mounting page (`/payment/hyperpay/:id`),
 * passing the checkout id; the frontend loads the HyperPay paymentWidgets.js
 * for the configured entity. Status is confirmed server-side via the
 * `GET /v1/checkouts/{id}/payment` resource.
 * Docs: https://hyperpay.docs.oppwa.com/
 *
 * Required env:
 *   HYPERPAY_ACCESS_TOKEN   (Bearer token)
 *   HYPERPAY_ENTITY_ID      (channel entity id; Mada often has a separate entity)
 *   HYPERPAY_BASE_URL       (optional; test=https://eu-test.oppwa.com, live=https://oppwa.com)
 *   PUBLIC_APP_URL          (optional; used to build the widget return page)
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

function accessToken(): string {
  return process.env.HYPERPAY_ACCESS_TOKEN || '';
}
function entityId(): string {
  return process.env.HYPERPAY_ENTITY_ID || '';
}
function baseUrl(): string {
  return process.env.HYPERPAY_BASE_URL || 'https://eu-test.oppwa.com';
}
function appUrl(): string {
  return process.env.PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:5000';
}

export const hyperpayProvider: PaymentProvider = {
  id: 'hyperpay',
  label: 'HyperPay (Mada · Cards · Apple Pay · STC Pay)',
  methods: ['mada', 'visa', 'mastercard', 'amex', 'apple_pay', 'stc_pay'],

  isEnabled() {
    return !!accessToken() && !!entityId();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const params = new URLSearchParams({
        entityId: entityId(),
        amount: input.amount.toFixed(2),
        currency: input.currency || 'SAR',
        paymentType: 'DB', // debit
        'merchantTransactionId': input.invoiceId,
        'customer.email': input.customer.email || 'customer@example.com',
      });
      const res = await fetch(`${baseUrl()}/v1/checkouts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken()}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      const data: any = await res.json();
      const checkoutId = data?.id;
      if (!checkoutId) {
        return { kind: 'error', message: data?.result?.description || 'HyperPay checkout prepare failed' };
      }
      // Redirect to our widget-mounting page; it loads paymentWidgets.js for this checkout.
      const url = `${appUrl()}/payment/hyperpay/${checkoutId}?invoiceId=${encodeURIComponent(input.invoiceId)}`;
      return { kind: 'redirect', url, gatewayReference: checkoutId, transactionId: checkoutId };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'HyperPay request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    // HyperPay webhooks are AES-encrypted; most integrations confirm via the
    // payment-status resource instead. Here we accept a decrypted/forwarded
    // body if present, otherwise mark unhandled so the status poll is used.
    const body: any = input.body || {};
    const code: string = body?.result?.code || '';
    const success = /^(000\.000\.|000\.100\.1|000\.[36])/.test(code);
    if (!code) return { handled: false };
    return {
      handled: true,
      invoiceId: body?.merchantTransactionId,
      transactionId: body?.id,
      status: success ? 'completed' : 'failed',
      amount: body?.amount ? Number(body.amount) : undefined,
      currency: body?.currency,
      raw: body,
    };
  },

  async getStatus(checkoutId: string) {
    const res = await fetch(
      `${baseUrl()}/v1/checkouts/${checkoutId}/payment?entityId=${entityId()}`,
      { headers: { Authorization: `Bearer ${accessToken()}` } },
    );
    const data: any = await res.json();
    return { status: data?.result?.code || 'unknown', raw: data };
  },
};
