/**
 * PayPal adapter — international cards / PayPal balance.
 *
 * Uses the Orders v2 REST API: obtain an OAuth token, create an order with a
 * CAPTURE intent, redirect the buyer to the approval link, then capture on
 * return (or via webhook).
 * Docs: https://developer.paypal.com/docs/api/orders/v2/
 *
 * Required env:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_MODE   (optional; "live" or "sandbox", default sandbox)
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

function clientId(): string {
  return process.env.PAYPAL_CLIENT_ID || '';
}
function clientSecret(): string {
  return process.env.PAYPAL_CLIENT_SECRET || '';
}
function apiBase(): string {
  return (process.env.PAYPAL_MODE || 'sandbox') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function accessToken(): Promise<string> {
  const auth = Buffer.from(`${clientId()}:${clientSecret()}`).toString('base64');
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data: any = await res.json();
  return data?.access_token || '';
}

export const paypalProvider: PaymentProvider = {
  id: 'paypal',
  label: 'PayPal',
  methods: ['paypal'],

  isEnabled() {
    return !!clientId() && !!clientSecret();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const token = await accessToken();
      if (!token) return { kind: 'error', message: 'PayPal auth failed' };
      const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: input.invoiceId,
              amount: { currency_code: input.currency || 'USD', value: input.amount.toFixed(2) },
              description: input.description || `Invoice ${input.invoiceId}`,
            },
          ],
          application_context: { return_url: input.returnUrl, cancel_url: input.returnUrl },
        }),
      });
      const data: any = await res.json();
      const approve = (data?.links || []).find((l: any) => l.rel === 'approve');
      if (!res.ok || !approve?.href) {
        return { kind: 'error', message: data?.message || 'PayPal order creation failed' };
      }
      return { kind: 'redirect', url: approve.href, gatewayReference: data.id, transactionId: data.id };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'PayPal request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    const body: any = input.body || {};
    const evt: string = body?.event_type || '';
    const resource = body?.resource || {};
    const status = /CAPTURE\.COMPLETED|CHECKOUT\.ORDER\.APPROVED|PAYMENT\.CAPTURE\.COMPLETED/.test(evt) ? 'completed'
      : /DENIED|DECLINED|VOIDED|FAILED/.test(evt) ? 'failed'
      : 'pending';
    const invoiceId = resource?.purchase_units?.[0]?.reference_id || resource?.invoice_id;
    return {
      handled: true,
      invoiceId,
      transactionId: resource?.id,
      status,
      methodType: 'paypal',
      raw: body,
    };
  },
};
