/**
 * Audit test: ensures only Stripe has webhook endpoints (other webhooks were verified
 * to not exist in routes.ts). If this test fails, scan for new webhook endpoints and
 * add signature verification.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Webhook endpoint audit (Wave I)', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const indexPath = path.resolve(process.cwd(), 'server/index.ts');
  const source = fs.readFileSync(routesPath, 'utf-8');
  const indexSource = fs.readFileSync(indexPath, 'utf-8');

  it('has raw body capture enabled for webhooks', () => {
    expect(indexSource).toMatch(/req\.rawBody\s*=/);
    expect(indexSource).toMatch(/webhook/);
  });

  it('Stripe webhook uses signature verification', () => {
    const startIdx = source.indexOf("app.post('/api/stripe/webhook'");
    const endIdx = source.indexOf("app.", startIdx + 30);
    const handler = source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 3000);
    expect(handler).toMatch(/stripe\.webhooks\.constructEvent/);
  });

  it('no other unprotected webhooks exist', () => {
    // Find all webhook-like endpoints
    const webhookRegex = /app\.(post|put|patch)\(['"]([^'"]*webhook[^'"]*)['"]/g;
    const matches = [...source.matchAll(webhookRegex)];
    // Only /api/stripe/webhook should be present
    const paths = matches.map(m => m[2]);
    for (const path of paths) {
      if (path !== '/api/stripe/webhook') {
        throw new Error(`Found unprotected webhook endpoint: ${path}. Add signature verification before deployment.`);
      }
    }
    expect(paths.length).toBeGreaterThanOrEqual(1); // Stripe exists
  });

  it('no PayPal IPN or Twilio status callbacks exist unprotected', () => {
    // Search for IPN, status-callback, etc.
    const suspectPatterns = ['/api/paypal/ipn', '/api/twilio/status', '/api/twilio/callback'];
    for (const pattern of suspectPatterns) {
      if (source.includes(pattern)) {
        throw new Error(`Found potentially unprotected webhook: ${pattern}. Verify signature.`);
      }
    }
  });
});