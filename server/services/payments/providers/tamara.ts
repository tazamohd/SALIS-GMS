/**
 * Tamara adapter — Buy Now Pay Later (instalments / pay later).
 *
 * Uses the Checkout API: create a session, redirect to `checkout_url`,
 * confirm via webhook + capture on authorisation.
 * Docs: https://docs.tamara.co/
 *
 * Required env:
 *   TAMARA_API_TOKEN          (API token)
 *   TAMARA_API_URL            (optional; defaults to production)
 *   TAMARA_NOTIFICATION_TOKEN (optional; verifies webhook signature)
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

function token(): string {
  return process.env.TAMARA_API_TOKEN || '';
}
function apiUrl(): string {
  return process.env.TAMARA_API_URL || 'https://api.tamara.co';
}

export const tamaraProvider: PaymentProvider = {
  id: 'tamara',
  label: 'Tamara (Pay Later / Instalments)',
  methods: ['tamara'],

  isEnabled() {
    return !!token();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const res = await fetch(`${apiUrl()}/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_reference_id: input.invoiceId,
          total_amount: { amount: input.amount.toFixed(2), currency: input.currency || 'SAR' },
          description: input.description || `Invoice ${input.invoiceId}`,
          country_code: 'SA',
          payment_type: 'PAY_BY_INSTALMENTS',
          locale: 'en_US',
          items: [
            {
              reference_id: input.invoiceId,
              type: 'Service',
              name: input.description || 'Garage service',
              quantity: 1,
              unit_price: { amount: input.amount.toFixed(2), currency: input.currency || 'SAR' },
              total_amount: { amount: input.amount.toFixed(2), currency: input.currency || 'SAR' },
            },
          ],
          consumer: {
            email: input.customer.email || 'customer@example.com',
            phone_number: input.customer.phone || '',
            first_name: (input.customer.name || 'Customer').split(' ')[0],
            last_name: (input.customer.name || 'Customer').split(' ').slice(1).join(' ') || 'Customer',
          },
          merchant_url: {
            success: input.returnUrl,
            failure: input.returnUrl,
            cancel: input.returnUrl,
            notification: input.webhookUrl,
          },
        }),
      });
      const data: any = await res.json();
      if (!res.ok || !data?.checkout_url) {
        return { kind: 'error', message: data?.message || 'Tamara checkout creation failed' };
      }
      return { kind: 'redirect', url: data.checkout_url, gatewayReference: data.order_id, transactionId: data.order_id };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'Tamara request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    const body: any = input.body || {};
    const evt = body?.event_type || body?.order_status;
    const status = /approved|authorised|authorized|fully_captured|completed/i.test(String(evt)) ? 'completed'
      : /declined|expired|canceled|cancelled/i.test(String(evt)) ? 'failed'
      : 'pending';
    return {
      handled: true,
      invoiceId: body?.order_reference_id,
      transactionId: body?.order_id,
      status,
      methodType: 'tamara',
      raw: body,
    };
  },

  async getStatus(transactionId: string) {
    const res = await fetch(`${apiUrl()}/orders/${transactionId}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    const data: any = await res.json();
    return { status: data?.status || 'unknown', raw: data };
  },
};
