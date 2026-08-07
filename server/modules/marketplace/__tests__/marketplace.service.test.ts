import { describe, it, expect, vi } from 'vitest';
import { MarketplaceService } from '../services/marketplace.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    listProviders: vi.fn(async () => [{ id: 'p1' }]),
    getProvider: vi.fn(async () => undefined),
    search: vi.fn(async () => ({ providers: [], services: [], offerings: [] })),
    listReviews: vi.fn(async () => [{ id: 'r1' }]),
    ...o,
  };
}

describe('MarketplaceService', () => {
  it('passes provider filters straight through', async () => {
    const r = repo();
    const s = new MarketplaceService(r as never);
    await s.listProviders({ type: 'parts_store', q: 'brake', city: 'Riyadh' });
    expect(r.listProviders).toHaveBeenCalledWith({ type: 'parts_store', q: 'brake', city: 'Riyadh' });
  });

  it('404s a missing provider', async () => {
    await expect(new MarketplaceService(repo() as never).getProvider('x')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns an existing provider', async () => {
    const r = repo({ getProvider: vi.fn(async () => ({ id: 'p1', name: 'Acme Parts' })) });
    expect(await new MarketplaceService(r as never).getProvider('p1')).toEqual({ id: 'p1', name: 'Acme Parts' });
  });

  it('delegates search to the repository', async () => {
    const r = repo();
    await new MarketplaceService(r as never).search('brake pads');
    expect(r.search).toHaveBeenCalledWith('brake pads');
  });

  it('caps the review feed at 50 (the legacy page size)', async () => {
    const r = repo();
    await new MarketplaceService(r as never).listReviews('p1');
    expect(r.listReviews).toHaveBeenCalledWith('p1', 50);
  });
});
