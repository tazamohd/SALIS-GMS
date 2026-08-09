/**
 * Loyalty module assembly (Phase E1/E2). Wires the customer-loyalty domain
 * (Module 44) — programs, accounts, transactions, rewards, and redemptions —
 * into an Express router via DI.
 *
 * By-id ownership guards mirror the monolith's multi-hop chains: programs scope
 * on their own `garage_id`; accounts through `users` (customer_id); transactions
 * and redemptions two hops up through their account to `users`; rewards through
 * their parent program. All routes are `isAuthenticated`. Route order matches
 * the monolith (segment counts keep the `:id` and nested routes unambiguous).
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { LOYALTY_SERVICE } from '../../infrastructure/di/tokens';
import { makeLoyaltyController } from './controllers/loyalty.controller';
import type { LoyaltyService } from './services/loyalty.service';

export interface LoyaltyModuleDeps {
  service?: LoyaltyService;
}

export function createLoyaltyModule(deps: LoyaltyModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(LOYALTY_SERVICE);
  const c = makeLoyaltyController(service);
  const router = Router();

  const ownProgram = requireResourceOwnership({ table: 'loyalty_program' });
  const ownProgramByParam = requireResourceOwnership({ table: 'loyalty_program', idParam: 'programId' });
  const ownAccount = requireResourceOwnership({
    table: 'customer_loyalty_accounts',
    parent: { table: 'users', fk: 'customer_id' },
  });
  const ownCustomer = requireResourceOwnership({ table: 'users', idParam: 'customerId' });
  const ownTransaction = requireResourceOwnership({
    table: 'loyalty_transactions',
    parent: { table: 'customer_loyalty_accounts', fk: 'account_id', parent: { table: 'users', fk: 'customer_id' } },
  });
  const ownReward = requireResourceOwnership({
    table: 'loyalty_rewards',
    parent: { table: 'loyalty_program', fk: 'program_id' },
  });
  const ownRedemption = requireResourceOwnership({
    table: 'loyalty_redemptions',
    parent: { table: 'customer_loyalty_accounts', fk: 'account_id', parent: { table: 'users', fk: 'customer_id' } },
  });

  // Loyalty Programs
  router.post('/loyalty-programs', isAuthenticated, asyncHandler(c.createProgram));
  router.get('/loyalty-programs', isAuthenticated, asyncHandler(c.listPrograms));
  router.get('/loyalty-programs/:id', isAuthenticated, ownProgram, asyncHandler(c.getProgram));
  router.patch('/loyalty-programs/:id', isAuthenticated, ownProgram, asyncHandler(c.updateProgram));
  router.delete('/loyalty-programs/:id', isAuthenticated, ownProgram, asyncHandler(c.deleteProgram));

  // Loyalty Accounts
  router.post('/loyalty-accounts', isAuthenticated, asyncHandler(c.createAccount));
  router.get('/loyalty-accounts', isAuthenticated, asyncHandler(c.listAccounts));
  router.get('/loyalty-accounts/:id', isAuthenticated, ownAccount, asyncHandler(c.getAccount));
  router.get('/loyalty-accounts/customer/:customerId', isAuthenticated, ownCustomer, asyncHandler(c.getAccountByCustomer));
  router.patch('/loyalty-accounts/:id', isAuthenticated, ownAccount, asyncHandler(c.updateAccount));

  // Loyalty Transactions
  router.post('/loyalty-transactions', isAuthenticated, asyncHandler(c.createTransaction));
  router.get('/loyalty-accounts/:accountId/transactions', isAuthenticated, asyncHandler(c.listTransactions));
  router.get('/loyalty-transactions/:id', isAuthenticated, ownTransaction, asyncHandler(c.getTransaction));

  // Loyalty Rewards
  router.post('/loyalty-rewards', isAuthenticated, asyncHandler(c.createReward));
  router.get('/loyalty-programs/:programId/rewards', isAuthenticated, ownProgramByParam, asyncHandler(c.listRewards));
  router.get('/loyalty-rewards/:id', isAuthenticated, ownReward, asyncHandler(c.getReward));
  router.patch('/loyalty-rewards/:id', isAuthenticated, ownReward, asyncHandler(c.updateReward));
  router.delete('/loyalty-rewards/:id', isAuthenticated, ownReward, asyncHandler(c.deleteReward));

  // Loyalty Redemptions
  router.post('/loyalty-redemptions', isAuthenticated, asyncHandler(c.createRedemption));
  router.get('/loyalty-redemptions', isAuthenticated, asyncHandler(c.listRedemptions));
  router.get('/loyalty-redemptions/:id', isAuthenticated, ownRedemption, asyncHandler(c.getRedemption));
  router.patch('/loyalty-redemptions/:id', isAuthenticated, ownRedemption, asyncHandler(c.updateRedemption));

  return router;
}

export default createLoyaltyModule();
