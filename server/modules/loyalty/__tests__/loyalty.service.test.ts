import { describe, it, expect, vi } from 'vitest';
import { LoyaltyService } from '../services/loyalty.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createProgram: vi.fn(async (d: Record<string, unknown>) => ({ id: 'p1', ...d })),
    getPrograms: vi.fn(async () => [{ id: 'p1' }]),
    getProgramById: vi.fn(async () => ({ id: 'p1' })),
    updateProgram: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'p1', ...d })),
    deleteProgram: vi.fn(async () => undefined),
    createAccount: vi.fn(async (d: Record<string, unknown>) => ({ id: 'a1', ...d })),
    getAccounts: vi.fn(async () => [{ id: 'a1' }]),
    getAccountById: vi.fn(async () => ({ id: 'a1' })),
    getAccountByCustomer: vi.fn(async () => ({ id: 'a1' })),
    updateAccount: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'a1', ...d })),
    createTransaction: vi.fn(async (d: Record<string, unknown>) => ({ id: 't1', ...d })),
    getTransactions: vi.fn(async () => [{ id: 't1' }]),
    getTransactionById: vi.fn(async () => ({ id: 't1' })),
    createReward: vi.fn(async (d: Record<string, unknown>) => ({ id: 'r1', ...d })),
    getRewards: vi.fn(async () => [{ id: 'r1' }]),
    getRewardById: vi.fn(async () => ({ id: 'r1' })),
    updateReward: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'r1', ...d })),
    deleteReward: vi.fn(async () => undefined),
    createRedemption: vi.fn(async (d: Record<string, unknown>) => ({ id: 'x1', ...d })),
    getRedemptions: vi.fn(async () => [{ id: 'x1' }]),
    getRedemptionById: vi.fn(async () => ({ id: 'x1' })),
    updateRedemption: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'x1', ...d })),
    ...o,
  };
}

describe('LoyaltyService — programs + accounts', () => {
  it('forwards garageId on program list and the account filters', async () => {
    const r = repo();
    const svc = new LoyaltyService(r as never);
    await svc.listPrograms('g1');
    await svc.listAccounts('p1', 'c1');
    expect(r.getPrograms).toHaveBeenCalledWith('g1');
    expect(r.getAccounts).toHaveBeenCalledWith('p1', 'c1');
  });

  it('returns account-by-customer through the repository', async () => {
    const r = repo();
    expect(await new LoyaltyService(r as never).getAccountByCustomer('c1')).toEqual({ id: 'a1' });
    expect(r.getAccountByCustomer).toHaveBeenCalledWith('c1');
  });
});

describe('LoyaltyService — transactions, rewards, redemptions', () => {
  it('scopes transactions by account and forwards the reward isActive filter', async () => {
    const r = repo();
    const svc = new LoyaltyService(r as never);
    await svc.listTransactions('a1');
    await svc.listRewards('p1', { isActive: true });
    expect(r.getTransactions).toHaveBeenCalledWith('a1');
    expect(r.getRewards).toHaveBeenCalledWith('p1', { isActive: true });
  });

  it('forwards the redemption account/status filters', async () => {
    const r = repo();
    await new LoyaltyService(r as never).listRedemptions('a1', { status: 'approved' });
    expect(r.getRedemptions).toHaveBeenCalledWith('a1', { status: 'approved' });
  });

  it('passes redemption create/update straight through', async () => {
    const r = repo();
    const svc = new LoyaltyService(r as never);
    await svc.createRedemption({ accountId: 'a1', rewardId: 'r1' } as never);
    await svc.updateRedemption('x1', { status: 'fulfilled' } as never);
    expect(r.createRedemption).toHaveBeenCalledWith({ accountId: 'a1', rewardId: 'r1' });
    expect(r.updateRedemption).toHaveBeenCalledWith('x1', { status: 'fulfilled' });
  });

  it('returns undefined from getters when the row is absent (controller owns the 404)', async () => {
    const svc = new LoyaltyService(repo({ getRewardById: vi.fn(async () => undefined) }) as never);
    expect(await svc.getReward('missing')).toBeUndefined();
  });
});
