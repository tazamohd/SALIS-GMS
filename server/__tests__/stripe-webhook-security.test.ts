/**
 * Contract tests for Stripe webhook signature verification
 *
 * The webhook was previously accepting events WITHOUT signature verification,
 * which would allow anyone to forge payment_intent.succeeded events.
 * This is a CRITICAL security fix.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
const indexPath = path.resolve(process.cwd(), 'server/index.ts');
const stripeSource = fs.readFileSync(routesPath, 'utf-8');
const stripeIndexSource = fs.readFileSync(indexPath, 'utf-8');

describe('Stripe webhook signature verification (Wave H)', () => {
  function getWebhookHandler() {
    const startIdx = stripeSource.indexOf("app.post('/api/stripe/webhook'");
    const endIdx = stripeSource.indexOf("app.", startIdx + 30);
    return stripeSource.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 3000);
  }

  const handler = getWebhookHandler();

  it('declares STRIPE_WEBHOOK_SECRET constant', () => {
    expect(stripeSource).toMatch(/const\s+STRIPE_WEBHOOK_SECRET\s*=\s*process\.env\.STRIPE_WEBHOOK_SECRET/);
  });

  it('returns 503 if STRIPE_WEBHOOK_SECRET is not configured', () => {
    expect(handler).toMatch(/STRIPE_WEBHOOK_SECRET/);
    expect(handler).toMatch(/status\(503\)/);
  });

  it('checks for stripe-signature header', () => {
    expect(handler).toMatch(/stripe-signature/);
    expect(handler).toMatch(/status\(400\)/);
  });

  it('uses raw body for signature verification', () => {
    expect(handler).toMatch(/req\.rawBody/);
    expect(handler).toMatch(/rawBody/);
  });

  it('calls stripe.webhooks.constructEvent to verify signature', () => {
    expect(handler).toMatch(/stripe\.webhooks\.constructEvent/);
  });

  it('rejects invalid signatures with 400', () => {
    expect(handler).toMatch(/Webhook signature verification failed/);
  });

  it('does NOT trust req.body directly (no parse(req.body))', () => {
    const oldPattern = /const\s+event\s*=\s*req\.body\s*;/;
    expect(handler).not.toMatch(oldPattern);
  });

  it('uses signed event object after verification', () => {
    expect(handler).toMatch(/event\.type/);
  });
});

describe('express.json raw body capture', () => {
  it('express.json uses verify hook to capture rawBody', () => {
    expect(stripeIndexSource).toMatch(/verify:\s*\(/);
    expect(stripeIndexSource).toMatch(/req\.rawBody\s*=/);
  });

  it('only captures raw body for webhook endpoints (memory optimization)', () => {
    expect(stripeIndexSource).toMatch(/req\.path\?\.includes\(['"]\/webhook['"]\)/);
  });

  it('also captures raw body for urlencoded parser (defense in depth)', () => {
    expect(stripeIndexSource).toMatch(/express\.urlencoded/);
    expect(stripeIndexSource).toMatch(/verify:\s*\(req:\s*any/);
  });
});