/**
 * Manual provider — cash, bank transfer, and cheque payments recorded by staff.
 * Always enabled (no API keys). There is no online step and no webhook; the
 * payment is considered completed the moment it is recorded.
 */
import type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  WebhookResult,
} from '../types';

export const manualProvider: PaymentProvider = {
  id: 'manual',
  label: 'Cash / Bank Transfer / Cheque',
  methods: ['cash', 'bank_transfer', 'cheque'],

  isEnabled() {
    return true;
  },

  async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return { kind: 'manual', status: 'completed' };
  },

  async handleWebhook(): Promise<WebhookResult> {
    return { handled: false };
  },
};
