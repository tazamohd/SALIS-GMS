import { describe, it, expect, vi } from 'vitest';
import { MarketingService } from '../services/marketing.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createMarketingCampaign: vi.fn(async (d: Record<string, unknown>) => ({ id: 'c1', ...d })),
    getMarketingCampaigns: vi.fn(async () => [{ id: 'c1' }]),
    getMarketingCampaignById: vi.fn(async () => ({ id: 'c1' })),
    updateMarketingCampaign: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'c1', ...d })),
    deleteMarketingCampaign: vi.fn(async () => undefined),
    getCampaignRecipients: vi.fn(async () => [{ id: 'r1' }]),
    createCampaignRecipient: vi.fn(async (d: Record<string, unknown>) => ({ id: 'r1', ...d })),
    updateCampaignRecipient: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'r1', ...d })),
    getCampaignAnalytics: vi.fn(async () => ({ sent: 10, opened: 4 })),
    ...o,
  };
}

describe('MarketingService — campaigns', () => {
  it('forwards the garageId + status/campaignType filters on list', async () => {
    const r = repo();
    await new MarketingService(r as never).listCampaigns('g1', { status: 'active', campaignType: 'email' });
    expect(r.getMarketingCampaigns).toHaveBeenCalledWith('g1', { status: 'active', campaignType: 'email' });
  });

  it('passes create/update/delete straight through to the repository', async () => {
    const r = repo();
    const svc = new MarketingService(r as never);
    await svc.createCampaign({ garageId: 'g1', name: 'Spring' } as never);
    await svc.updateCampaign('c1', { name: 'Summer' } as never);
    await svc.deleteCampaign('c1');
    expect(r.createMarketingCampaign).toHaveBeenCalledWith({ garageId: 'g1', name: 'Spring' });
    expect(r.updateMarketingCampaign).toHaveBeenCalledWith('c1', { name: 'Summer' });
    expect(r.deleteMarketingCampaign).toHaveBeenCalledWith('c1');
  });

  it('returns the campaign row from getCampaign (controller owns the 404)', async () => {
    expect(await new MarketingService(repo() as never).getCampaign('c1')).toEqual({ id: 'c1' });
    expect(await new MarketingService(repo({ getMarketingCampaignById: vi.fn(async () => undefined) }) as never).getCampaign('x')).toBeUndefined();
  });
});

describe('MarketingService — recipients + analytics', () => {
  it('scopes recipients by campaign and forwards recipient writes', async () => {
    const r = repo();
    const svc = new MarketingService(r as never);
    await svc.listRecipients('c1');
    await svc.createRecipient({ campaignId: 'c1', email: 'a@b.com' } as never);
    await svc.updateRecipient('r1', { status: 'sent' } as never);
    expect(r.getCampaignRecipients).toHaveBeenCalledWith('c1');
    expect(r.createCampaignRecipient).toHaveBeenCalledWith({ campaignId: 'c1', email: 'a@b.com' });
    expect(r.updateCampaignRecipient).toHaveBeenCalledWith('r1', { status: 'sent' });
  });

  it('returns the analytics rollup for a campaign', async () => {
    const r = repo();
    const out = await new MarketingService(r as never).getAnalytics('c1');
    expect(r.getCampaignAnalytics).toHaveBeenCalledWith('c1');
    expect(out).toEqual({ sent: 10, opened: 4 });
  });
});
