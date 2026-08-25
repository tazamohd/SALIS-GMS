/**
 * Loyalty controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the customer-loyalty domain. Preserves the legacy
 * monolith conventions verbatim: `201` on creates, raw bodies on reads/updates,
 * `{ error }` envelopes for `400`/`404`/`500` (with the `"Failed to …"`
 * fallbacks), the resource-specific not-found 404s, and the same `console.error`
 * labels. The monolith did no Zod validation here, so request bodies are
 * forwarded as-is; only the `garageId` injections on program/account create and
 * the query-filter parsing happen at this boundary. Ownership guards stay on the
 * routes.
 */

import type { Request, Response } from 'express';
import type { LoyaltyService } from '../services/loyalty.service';

interface AuthedUser {
  id?: string;
  garageId?: string;
}
function user(req: Request): AuthedUser {
  return (req.user as AuthedUser | undefined) ?? {};
}
function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function boolFilter(v: unknown): boolean | undefined {
  return v === 'true' ? true : v === 'false' ? false : undefined;
}

export function makeLoyaltyController(service: LoyaltyService) {
  return {
    // ---- Programs ---------------------------------------------------------
    async createProgram(req: Request, res: Response): Promise<void> {
      try {
        const data = { ...req.body, garageId: user(req).garageId };
        res.status(201).json(await service.createProgram(data));
      } catch (error) {
        console.error('Error creating loyalty program:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create loyalty program' });
      }
    },
    async listPrograms(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listPrograms(user(req).garageId as string));
      } catch (error) {
        console.error('Error fetching loyalty programs:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty programs' });
      }
    },
    async getProgram(req: Request, res: Response): Promise<void> {
      try {
        const program = await service.getProgram(req.params.id);
        if (!program) {
          res.status(404).json({ error: 'Loyalty program not found' });
          return;
        }
        res.json(program);
      } catch (error) {
        console.error('Error fetching loyalty program:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty program' });
      }
    },
    async updateProgram(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateProgram(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating loyalty program:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update loyalty program' });
      }
    },
    async deleteProgram(req: Request, res: Response): Promise<void> {
      try {
        await service.deleteProgram(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting loyalty program:', error);
        res.status(500).json({ error: 'Failed to delete loyalty program' });
      }
    },

    // ---- Accounts ---------------------------------------------------------
    async createAccount(req: Request, res: Response): Promise<void> {
      try {
        const data = { ...req.body, garageId: user(req).garageId || req.body.garageId };
        res.status(201).json(await service.createAccount(data));
      } catch (error) {
        console.error('Error creating loyalty account:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create loyalty account' });
      }
    },
    async listAccounts(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listAccounts(q(req.query.programId), q(req.query.customerId)));
      } catch (error) {
        console.error('Error fetching loyalty accounts:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty accounts' });
      }
    },
    async getAccount(req: Request, res: Response): Promise<void> {
      try {
        const account = await service.getAccount(req.params.id);
        if (!account) {
          res.status(404).json({ error: 'Loyalty account not found' });
          return;
        }
        res.json(account);
      } catch (error) {
        console.error('Error fetching loyalty account:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty account' });
      }
    },
    async getAccountByCustomer(req: Request, res: Response): Promise<void> {
      try {
        res.json((await service.getAccountByCustomer(req.params.customerId)) || null);
      } catch (error) {
        console.error('Error fetching loyalty account by customer:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty account' });
      }
    },
    async updateAccount(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateAccount(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating loyalty account:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update loyalty account' });
      }
    },

    // ---- Transactions -----------------------------------------------------
    async createTransaction(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createTransaction(req.body));
      } catch (error) {
        console.error('Error creating loyalty transaction:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create loyalty transaction' });
      }
    },
    async listTransactions(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listTransactions(req.params.accountId));
      } catch (error) {
        console.error('Error fetching loyalty transactions:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty transactions' });
      }
    },
    async getTransaction(req: Request, res: Response): Promise<void> {
      try {
        const transaction = await service.getTransaction(req.params.id);
        if (!transaction) {
          res.status(404).json({ error: 'Loyalty transaction not found' });
          return;
        }
        res.json(transaction);
      } catch (error) {
        console.error('Error fetching loyalty transaction:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty transaction' });
      }
    },

    // ---- Rewards ----------------------------------------------------------
    async createReward(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createReward(req.body));
      } catch (error) {
        console.error('Error creating loyalty reward:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create loyalty reward' });
      }
    },
    async listRewards(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listRewards(req.params.programId, { isActive: boolFilter(req.query.isActive) }));
      } catch (error) {
        console.error('Error fetching loyalty rewards:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty rewards' });
      }
    },
    async getReward(req: Request, res: Response): Promise<void> {
      try {
        const reward = await service.getReward(req.params.id);
        if (!reward) {
          res.status(404).json({ error: 'Loyalty reward not found' });
          return;
        }
        res.json(reward);
      } catch (error) {
        console.error('Error fetching loyalty reward:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty reward' });
      }
    },
    async updateReward(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateReward(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating loyalty reward:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update loyalty reward' });
      }
    },
    async deleteReward(req: Request, res: Response): Promise<void> {
      try {
        await service.deleteReward(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error('Error deleting loyalty reward:', error);
        res.status(500).json({ error: 'Failed to delete loyalty reward' });
      }
    },

    // ---- Redemptions ------------------------------------------------------
    async createRedemption(req: Request, res: Response): Promise<void> {
      try {
        res.status(201).json(await service.createRedemption(req.body));
      } catch (error) {
        console.error('Error creating loyalty redemption:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to create loyalty redemption' });
      }
    },
    async listRedemptions(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listRedemptions(q(req.query.accountId), { status: q(req.query.status) }));
      } catch (error) {
        console.error('Error fetching loyalty redemptions:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty redemptions' });
      }
    },
    async getRedemption(req: Request, res: Response): Promise<void> {
      try {
        const redemption = await service.getRedemption(req.params.id);
        if (!redemption) {
          res.status(404).json({ error: 'Loyalty redemption not found' });
          return;
        }
        res.json(redemption);
      } catch (error) {
        console.error('Error fetching loyalty redemption:', error);
        res.status(500).json({ error: 'Failed to fetch loyalty redemption' });
      }
    },
    async updateRedemption(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateRedemption(req.params.id, req.body));
      } catch (error) {
        console.error('Error updating loyalty redemption:', error);
        res.status(400).json({ error: (error as Error).message || 'Failed to update loyalty redemption' });
      }
    },
  };
}
