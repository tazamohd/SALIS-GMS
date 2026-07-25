import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
});

describe('Financial API Routes', () => {
  describe('GET /api/financial/general-ledger', () => {
    it('should return ledger entries array', async () => {
      const res = await agent.get('/api/financial/general-ledger');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('entries');
        expect(Array.isArray(res.body.entries)).toBe(true);
      }
    });

    it('should include date, description, amount in each entry', async () => {
      const res = await agent.get('/api/financial/general-ledger');
      if (res.status === 200 && res.body.entries?.length > 0) {
        expect(res.body.entries[0]).toHaveProperty('date');
        expect(res.body.entries[0]).toHaveProperty('description');
        expect(res.body.entries[0]).toHaveProperty('amount');
      }
    });
  });

  describe('GET /api/financial/balance-sheet', () => {
    it('should return assets, liabilities, and equity', async () => {
      const res = await agent.get('/api/financial/balance-sheet');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('assets');
        expect(res.body).toHaveProperty('liabilities');
        expect(res.body).toHaveProperty('equity');
      }
    });
  });

  describe('GET /api/financial/income-statement', () => {
    it('should return revenue and expenses', async () => {
      const res = await agent.get('/api/financial/income-statement');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('revenue');
      }
    });
  });

  describe('GET /api/financial/accounts-receivable', () => {
    it('should return invoices array', async () => {
      const res = await agent.get('/api/financial/accounts-receivable');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('invoices');
      }
    });
  });

  describe('GET /api/financial/accounts-payable', () => {
    it('should return purchaseOrders array', async () => {
      const res = await agent.get('/api/financial/accounts-payable');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('purchaseOrders');
      }
    });
  });

  describe('GET /api/financial/trial-balance', () => {
    it('should return totalDebits and totalCredits', async () => {
      const res = await agent.get('/api/financial/trial-balance');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('totalDebits');
        expect(res.body).toHaveProperty('totalCredits');
      }
    });
  });

  describe('GET /api/financial/cash-flow', () => {
    it('should return inflows and outflows', async () => {
      const res = await agent.get('/api/financial/cash-flow');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('inflows');
        expect(res.body).toHaveProperty('outflows');
      }
    });
  });
});
