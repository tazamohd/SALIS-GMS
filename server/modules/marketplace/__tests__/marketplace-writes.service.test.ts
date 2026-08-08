import { describe, it, expect, vi } from 'vitest';
import { MarketplaceWritesService } from '../services/marketplace-writes.service';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    searchParts: vi.fn(async () => [{ id: 'ebay-BP-1' }]),
    placeOrder: vi.fn(async (d: Record<string, unknown>) => ({ id: 'o1', ...d })),
    trackOrder: vi.fn(async () => ({ id: 'o1', tracking: { carrier: 'UPS' } })),
    getProvider: vi.fn(async () => ({ id: 'p1' })),
    hasTransactedWith: vi.fn(async () => true),
    upsertReview: vi.fn(async () => ({ id: 'rev1' })),
    ...o,
  };
}

describe('MarketplaceWritesService', () => {
  it('forwards the parts search to the repository', async () => {
    const r = repo();
    await new MarketplaceWritesService(r as never).searchParts('BP-1', 'ebay');
    expect(r.searchParts).toHaveBeenCalledWith('BP-1', 'ebay');
  });

  it('stamps the garage onto the order payload', async () => {
    const r = repo();
    await new MarketplaceWritesService(r as never).placeOrder('g1', { partNumber: 'BP-1', quantity: 2 });
    expect(r.placeOrder).toHaveBeenCalledWith({ partNumber: 'BP-1', quantity: 2, garageId: 'g1' });
  });

  it('forwards order tracking to the repository', async () => {
    const r = repo();
    await new MarketplaceWritesService(r as never).trackOrder('o1');
    expect(r.trackOrder).toHaveBeenCalledWith('o1');
  });

  it('lists orders as the legacy empty stub (no query yet)', async () => {
    const r = repo();
    expect(new MarketplaceWritesService(r as never).listOrders('g1')).toEqual([]);
  });

  it('submitReview rejects a non-integer / out-of-range rating with ValidationError', async () => {
    const s = new MarketplaceWritesService(repo() as never);
    await expect(s.submitReview('u1', { providerId: 'p1', rating: 6 })).rejects.toBeInstanceOf(ValidationError);
    await expect(s.submitReview('u1', { providerId: 'p1', rating: 2.5 })).rejects.toBeInstanceOf(ValidationError);
    await expect(s.submitReview('u1', { providerId: '', rating: 4 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('submitReview 404s an unknown provider', async () => {
    const r = repo({ getProvider: vi.fn(async () => undefined) });
    await expect(
      new MarketplaceWritesService(r as never).submitReview('u1', { providerId: 'p1', rating: 5 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('submitReview 403s a customer who has not transacted with the provider', async () => {
    const r = repo({ hasTransactedWith: vi.fn(async () => false) });
    await expect(
      new MarketplaceWritesService(r as never).submitReview('u1', { providerId: 'p1', rating: 5 }),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('submitReview upserts a trimmed, capped comment for an eligible customer', async () => {
    const r = repo();
    await new MarketplaceWritesService(r as never).submitReview('u1', {
      providerId: 'p1',
      rating: 4,
      comment: '  great service  ',
    });
    expect(r.upsertReview).toHaveBeenCalledWith('p1', 'u1', 4, 'great service');
  });

  it('submitReview drops a blank comment to undefined', async () => {
    const r = repo();
    await new MarketplaceWritesService(r as never).submitReview('u1', {
      providerId: 'p1',
      rating: 3,
      comment: '   ',
    });
    expect(r.upsertReview).toHaveBeenCalledWith('p1', 'u1', 3, undefined);
  });

  it('submitReview caps a very long comment at 2000 characters', async () => {
    const r = repo();
    await new MarketplaceWritesService(r as never).submitReview('u1', {
      providerId: 'p1',
      rating: 5,
      comment: 'x'.repeat(2500),
    });
    const [, , , comment] = r.upsertReview.mock.calls[0];
    expect((comment as string).length).toBe(2000);
  });
});
