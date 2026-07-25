/**
 * Tests for chatbot / AI / SMS validators
 */

import { describe, it, expect } from 'vitest';
import {
  chatbotMessageSchema,
  chatbotDiagnoseSchema,
  chatbotConversationSchema,
  chatbotBookingIntentSchema,
  sendSmsSchema,
} from '../validators';

function validate(schema: any, body: any) {
  return schema.safeParse(body);
}

describe('chatbotMessageSchema', () => {
  it('accepts valid message', () => {
    const result = validate(chatbotMessageSchema, {
      conversationId: 'conv-abc123',
      message: 'My car makes a strange noise',
    });
    expect(result.success).toBe(true);
  });

  it('accepts message with vehicleInfo', () => {
    const result = validate(chatbotMessageSchema, {
      conversationId: 'conv-1',
      message: 'Brakes squeal when stopping',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: 2018,
        mileage: 75000,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = validate(chatbotMessageSchema, {
      conversationId: 'conv-1',
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects oversized message', () => {
    const result = validate(chatbotMessageSchema, {
      conversationId: 'conv-1',
      message: 'a'.repeat(4001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing conversationId', () => {
    const result = validate(chatbotMessageSchema, {
      message: 'test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects out-of-range vehicle year', () => {
    const result = validate(chatbotMessageSchema, {
      conversationId: 'conv-1',
      message: 'test',
      vehicleInfo: { year: 1850 },
    });
    expect(result.success).toBe(false);
  });
});

describe('chatbotDiagnoseSchema', () => {
  it('accepts valid symptoms', () => {
    const result = validate(chatbotDiagnoseSchema, {
      symptoms: 'Engine is making knocking noise when starting',
    });
    expect(result.success).toBe(true);
  });

  it('accepts symptoms with vehicleId', () => {
    const result = validate(chatbotDiagnoseSchema, {
      symptoms: 'Brakes squealing',
      vehicleId: 'veh-123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short symptoms', () => {
    const result = validate(chatbotDiagnoseSchema, { symptoms: 'no' });
    expect(result.success).toBe(false);
  });

  it('rejects oversized symptoms', () => {
    const result = validate(chatbotDiagnoseSchema, {
      symptoms: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe('chatbotConversationSchema', () => {
  it('accepts empty body', () => {
    const result = validate(chatbotConversationSchema, {});
    expect(result.success).toBe(true);
  });

  it('accepts with customerId and sessionId', () => {
    const result = validate(chatbotConversationSchema, {
      customerId: 'cust-123',
      sessionId: 'sess-abc',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with context', () => {
    const result = validate(chatbotConversationSchema, {
      context: 'Customer is asking about brake service',
    });
    expect(result.success).toBe(true);
  });

  it('rejects oversized context', () => {
    const result = validate(chatbotConversationSchema, {
      context: 'a'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects oversized sessionId', () => {
    const result = validate(chatbotConversationSchema, {
      sessionId: 's'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe('chatbotBookingIntentSchema', () => {
  it('accepts a valid booking intent message', () => {
    const result = validate(chatbotBookingIntentSchema, {
      message: 'I want to book brake service tomorrow',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty booking intent message', () => {
    const result = validate(chatbotBookingIntentSchema, { message: '' });
    expect(result.success).toBe(false);
  });
});

describe('sendSmsSchema', () => {
  it('accepts E.164 phone number', () => {
    const result = validate(sendSmsSchema, {
      to: '+966501234567',
      body: 'Test SMS message',
    });
    expect(result.success).toBe(true);
  });

  it('rejects phone without +', () => {
    const result = validate(sendSmsSchema, {
      to: '966501234567',
      body: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects body over 1600 chars', () => {
    const result = validate(sendSmsSchema, {
      to: '+966501234567',
      body: 'a'.repeat(1601),
    });
    expect(result.success).toBe(false);
  });
});
