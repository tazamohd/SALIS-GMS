/**
 * Stripe adapter — international cards (and Apple Pay where enabled in the
 * Stripe dashboard). Returns a PaymentIntent client secret to be confirmed
 * inline with Stripe Elements (the existing PaymentDialog component).
 *
 * Required env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PUBLISHABLE_KEY  (optional; returned to the client for Elements)
 *   STRIPE_WEBHOOK_SECRET   (optional; verifies webhook signatures)
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookInput,
  WebhookResult,
} from '../types';

function secret(): string {
  return process.env.STRIPE_SECRET_KEY || '';
}

async function stripeClient(): Promise<any | null> {
  if (!secret()) return null;
  const Stripe = (await import('stripe')).default;
  return new Stripe(secret());
}

export const stripeProvider: PaymentProvider = {
  id: 'stripe',
  label: 'Stripe (International Cards)',
  // Stripe handles generic card brands; in Saudi prefer Moyasar/HyperPay/Tap
  // for Mada. We expose visa/mastercard/amex here as an international fallback.
  methods: ['visa', 'mastercard', 'amex'],

  isEnabled() {
    return !!secret();
  },

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    try {
      const stripe = await stripeClient();
      if (!stripe) return { kind: 'error', message: 'Stripe not configured' };
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(input.amount * 100),
        currency: (input.currency || 'SAR').toLowerCase(),
        description: input.description || `Invoice ${input.invoiceId}`,
        metadata: { invoiceId: input.invoiceId, customerId: input.customer.id || '' },
        automatic_payment_methods: { enabled: true },
      });
      return {
        kind: 'client_secret',
        clientSecret: intent.client_secret as string,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || undefined,
        transactionId: intent.id,
      };
    } catch (err: any) {
      return { kind: 'error', message: err?.message || 'Stripe request error' };
    }
  },

  async handleWebhook(input: WebhookInput): Promise<WebhookResult> {
    try {
      const stripe = await stripeClient();
      if (!stripe) return { handled: false };
      let event: any = input.body;
      const sig = input.headers['stripe-signature'];
      const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (sig && whSecret) {
        event = stripe.webhooks.constructEvent(input.rawBody, sig, whSecret);
      }
      if (event?.type === 'payment_intent.succeeded') {
        const pi = event.data.object;
        return {
          handled: true,
          invoiceId: pi.metadata?.invoiceId,
          transactionId: pi.id,
          status: 'completed',
          amount: typeof pi.amount === 'number' ? pi.amount / 100 : undefined,
          currency: pi.currency?.toUpperCase(),
          raw: event,
        };
      }
      if (event?.type === 'payment_intent.payment_failed') {
        const pi = event.data.object;
        return { handled: true, invoiceId: pi.metadata?.invoiceId, transactionId: pi.id, status: 'failed', raw: event };
      }
      return { handled: false, raw: event };
    } catch (err: any) {
      return { handled: false };
    }
  },

  async refund(transactionId: string, amount?: number) {
    const stripe = await stripeClient();
    if (!stripe) return { ok: false };
    const refund = await stripe.refunds.create({
      payment_intent: transactionId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return { ok: refund.status === 'succeeded' || refund.status === 'pending', raw: refund };
  },
};
