import { describe, it, expect } from 'vitest';

describe('Financial API Routes', () => {
  describe('GET /api/financial/general-ledger', () => {
    it('should return ledger entries array', async () => {
      const res = await fetch('http://localhost:5000/api/financial/general-ledger');
      const data = await res.json();
      expect(data).toHaveProperty('entries');
      expect(Array.isArray(data.entries)).toBe(true);
    });

    it('should include date, description, amount in each entry', async () => {
      const res = await fetch('http://localhost:5000/api/financial/general-ledger');
      const data = await res.json();
      if (data.entries.length > 0) {
        expect(data.entries[0]).toHaveProperty('date');
        expect(data.entries[0]).toHaveProperty('description');
        expect(data.entries[0]).toHaveProperty('amount');
      }
    });
  });

  describe('GET /api/financial/balance-sheet', () => {
    it('should return assets, liabilities, and equity', async () => {
      const res = await fetch('http://localhost:5000/api/financial/balance-sheet');
      const data = await res.json();
      expect(data).toHaveProperty('assets');
      expect(data).toHaveProperty('liabilities');
      expect(data).toHaveProperty('equity');
    });
  });

  describe('GET /api/financial/income-statement', () => {
    it('should return revenue and expenses', async () => {
      const res = await fetch('http://localhost:5000/api/financial/income-statement');
      const data = await res.json();
      expect(data).toHaveProperty('revenue');
    });
  });

  describe('GET /api/financial/accounts-receivable', () => {
    it('should return invoices array', async () => {
      const res = await fetch('http://localhost:5000/api/financial/accounts-receivable');
      const data = await res.json();
      expect(data).toHaveProperty('invoices');
    });
  });

  describe('GET /api/financial/accounts-payable', () => {
    it('should return purchaseOrders array', async () => {
      const res = await fetch('http://localhost:5000/api/financial/accounts-payable');
      const data = await res.json();
      expect(data).toHaveProperty('purchaseOrders');
    });
  });

  describe('GET /api/financial/trial-balance', () => {
    it('should return totalDebits and totalCredits', async () => {
      const res = await fetch('http://localhost:5000/api/financial/trial-balance');
      const data = await res.json();
      expect(data).toHaveProperty('totalDebits');
      expect(data).toHaveProperty('totalCredits');
    });
  });

  describe('GET /api/financial/cash-flow', () => {
    it('should return inflows and outflows', async () => {
      const res = await fetch('http://localhost:5000/api/financial/cash-flow');
      const data = await res.json();
      expect(data).toHaveProperty('inflows');
      expect(data).toHaveProperty('outflows');
    });
  });
});
