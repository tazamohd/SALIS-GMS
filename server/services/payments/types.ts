/**
 * Unified payment layer — shared types.
 *
 * The platform supports many Saudi payment methods through a single abstraction:
 * card/Mada/Apple Pay/STC Pay via an aggregator (Moyasar, HyperPay, or Tap),
 * Tabby & Tamara BNPL via direct integrations, PayPal, Stripe (international),
 * and a "manual" provider for cash / bank transfer / cheque recorded by staff.
 *
 * Each gateway is an adapter implementing `PaymentProvider`. Adapters activate
 * only when their API keys are present in the environment, so the system is
 * safe to ship with no keys configured (only the manual provider is active).
 */

export type GatewayId =
  | 'moyasar'
  | 'hyperpay'
  | 'tap'
  | 'tabby'
  | 'tamara'
  | 'paypal'
  | 'stripe'
  | 'manual';

export type PaymentMethodType =
  | 'mada'
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'apple_pay'
  | 'stc_pay'
  | 'tabby'
  | 'tamara'
  | 'paypal'
  | 'cash'
  | 'bank_transfer'
  | 'cheque';

export interface PaymentCustomer {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreatePaymentInput {
  invoiceId: string;
  /** Amount in major units (e.g. SAR 150.00 → 150). Adapters convert to minor units as needed. */
  amount: number;
  /** ISO 4217 code, e.g. "SAR". */
  currency: string;
  method: PaymentMethodType;
  customer: PaymentCustomer;
  description?: string;
  /** URL the gateway redirects the customer back to after a hosted checkout. */
  returnUrl: string;
  /** URL the gateway should POST asynchronous status updates to. */
  webhookUrl?: string;
}

/**
 * The result of starting a payment. Three shapes cover every gateway flow:
 *  - `redirect`      → send the browser to a hosted checkout URL (Moyasar/HyperPay/Tap/Tabby/Tamara/PayPal)
 *  - `client_secret` → render an inline element with this secret (Stripe)
 *  - `manual`        → no online step; staff recorded a cash/transfer/cheque payment
 */
export type CreatePaymentResult =
  | { kind: 'redirect'; url: string; gatewayReference?: string; transactionId?: string }
  | { kind: 'client_secret'; clientSecret: string; publishableKey?: string; transactionId?: string }
  | { kind: 'manual'; status: 'completed' }
  | { kind: 'error'; message: string };

export interface WebhookInput {
  headers: Record<string, any>;
  rawBody: Buffer | string;
  body: any;
}

export interface WebhookResult {
  handled: boolean;
  invoiceId?: string;
  transactionId?: string;
  status?: 'completed' | 'failed' | 'cancelled' | 'pending';
  amount?: number;
  currency?: string;
  methodType?: PaymentMethodType;
  raw?: any;
}

export interface PaymentProvider {
  id: GatewayId;
  label: string;
  /** Customer-facing methods this provider can fulfil. */
  methods: PaymentMethodType[];
  /** True only when the required API keys are configured. */
  isEnabled(): boolean;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  handleWebhook(input: WebhookInput): Promise<WebhookResult>;
  getStatus?(transactionId: string): Promise<{ status: string; raw?: any }>;
  refund?(transactionId: string, amount?: number): Promise<{ ok: boolean; raw?: any }>;
}

/** Display metadata for the customer-facing method selector. */
export interface PaymentMethodInfo {
  id: PaymentMethodType;
  label: string;
  labelAr: string;
  category: 'card' | 'wallet' | 'bnpl' | 'bank' | 'cash';
  gateway: GatewayId;
}
