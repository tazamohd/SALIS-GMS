/**
 * Tests for External Integration validators
 *
 * Stripe, Twilio, OpenAI, PayPal
 */

import { describe, it, expect } from 'vitest';
import {
  createPaymentIntentSchema,
  createRefundSchema,
  sendSmsSchema,
  openAiChatSchema,
  openAiCompletionSchema,
  paypalOrderSchema,
} from '../validators';

function validate(schema: any, body: any) {
  return schema.safeParse(body);
}

describe('createPaymentIntentSchema', () => {
  it('accepts valid payment intent', () => {
    const result = validate(createPaymentIntentSchema, {
      amount: 5000,
      currency: 'sar',
      invoiceId: 'INV-001',
    });
    expect(result.success).toBe(true);
  });

  it('accepts intent with metadata', () => {
    const result = validate(createPaymentIntentSchema, {
      amount: 1500,
      currency: 'usd',
      invoiceId: 'INV-002',
      metadata: { customerId: 'cust-1', orderId: 'ord-1' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects amounts below Stripe minimum ($0.50)', () => {
    const result = validate(createPaymentIntentSchema, {
      amount: 10,
      invoiceId: 'INV-001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amounts', () => {
    const result = validate(createPaymentIntentSchema, {
      amount: -100,
      invoiceId: 'INV-001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-cents amounts', () => {
    const result = validate(createPaymentIntentSchema, {
      amount: 99.5,
      invoiceId: 'INV-001',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid currency', () => {
    const result = validate(createPaymentIntentSchema, {
      amount: 1000,
      currency: 'btc',
      invoiceId: 'INV-001',
    });
    expect(result.success).toBe(false);
  });
});

describe('createRefundSchema', () => {
  it('accepts full refund', () => {
    const result = validate(createRefundSchema, {
      paymentIntentId: 'pi_abc123',
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial refund', () => {
    const result = validate(createRefundSchema, {
      paymentIntentId: 'pi_abc123',
      amount: 2000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts refund with reason', () => {
    const result = validate(createRefundSchema, {
      paymentIntentId: 'pi_abc123',
      reason: 'duplicate',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid reason', () => {
    const result = validate(createRefundSchema, {
      paymentIntentId: 'pi_abc123',
      reason: 'changed_mind',
    });
    expect(result.success).toBe(false);
  });
});

describe('sendSmsSchema', () => {
  it('accepts valid E.164 phone number', () => {
    const result = validate(sendSmsSchema, {
      to: '+966501234567',
      body: 'Hello from SalisAuto',
    });
    expect(result.success).toBe(true);
  });

  it('rejects phone without +', () => {
    const result = validate(sendSmsSchema, {
      to: '966501234567',
      body: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects phone with letters', () => {
    const result = validate(sendSmsSchema, {
      to: '+96650abc4567',
      body: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects body over 1600 chars (Twilio SMS limit)', () => {
    const result = validate(sendSmsSchema, {
      to: '+966501234567',
      body: 'a'.repeat(1601),
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty body', () => {
    const result = validate(sendSmsSchema, {
      to: '+966501234567',
      body: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('openAiChatSchema', () => {
  it('accepts valid chat request', () => {
    const result = validate(openAiChatSchema, {
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts multi-message conversation', () => {
    const result = validate(openAiChatSchema, {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts temperature in valid range', () => {
    const result = validate(openAiChatSchema, {
      messages: [{ role: 'user', content: 'Hi' }],
      temperature: 0.7,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty messages', () => {
    const result = validate(openAiChatSchema, { messages: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role', () => {
    const result = validate(openAiChatSchema, {
      messages: [{ role: 'admin', content: 'Hi' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects temperature > 2', () => {
    const result = validate(openAiChatSchema, {
      messages: [{ role: 'user', content: 'Hi' }],
      temperature: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects maxTokens > 32000', () => {
    const result = validate(openAiChatSchema, {
      messages: [{ role: 'user', content: 'Hi' }],
      maxTokens: 100000,
    });
    expect(result.success).toBe(false);
  });
});

describe('openAiCompletionSchema', () => {
  it('accepts valid completion', () => {
    const result = validate(openAiCompletionSchema, {
      prompt: 'Write a haiku about coding',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty prompt', () => {
    const result = validate(openAiCompletionSchema, { prompt: '' });
    expect(result.success).toBe(false);
  });
});

describe('paypalOrderSchema', () => {
  it('accepts valid PayPal order', () => {
    const result = validate(paypalOrderSchema, {
      intent: 'CAPTURE',
      purchaseUnits: [{
        amount: { currencyCode: 'USD', value: '100.00' },
      }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts order with application context', () => {
    const result = validate(paypalOrderSchema, {
      intent: 'AUTHORIZE',
      purchaseUnits: [{
        amount: { currencyCode: 'EUR', value: '50.50' },
      }],
      applicationContext: {
        returnUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid intent', () => {
    const result = validate(paypalOrderSchema, {
      intent: 'INVALID',
      purchaseUnits: [{ amount: { currencyCode: 'USD', value: '100.00' } }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty purchase units', () => {
    const result = validate(paypalOrderSchema, {
      intent: 'CAPTURE',
      purchaseUnits: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid currency code (not 3 chars)', () => {
    const result = validate(paypalOrderSchema, {
      intent: 'CAPTURE',
      purchaseUnits: [{ amount: { currencyCode: 'US', value: '100.00' } }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid amount format (no decimals)', () => {
    const result = validate(paypalOrderSchema, {
      intent: 'CAPTURE',
      purchaseUnits: [{ amount: { currencyCode: 'USD', value: '100' } }],
    });
    expect(result.success).toBe(false);
  });
});