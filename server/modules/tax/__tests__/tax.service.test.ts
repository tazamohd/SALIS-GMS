import { describe, it, expect, vi } from 'vitest';
import { TaxService } from '../services/tax.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createTaxRegion: vi.fn(async (d: Record<string, unknown>) => ({ id: 't1', ...d })),
    getTaxRegions: vi.fn(async () => [{ id: 't1' }]),
    getTaxRegionById: vi.fn(async () => ({ id: 't1' })),
    updateTaxRegion: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 't1', ...d })),
    deleteTaxRegion: vi.fn(async () => undefined),
    ...o,
  };
}

describe('TaxService', () => {
  it('forwards the optional countryCode filter on list (and omits it when absent)', async () => {
    const r = repo();
    const svc = new TaxService(r as never);
    await svc.listRegions('SA');
    expect(r.getTaxRegions).toHaveBeenCalledWith('SA');
    await svc.listRegions();
    expect(r.getTaxRegions).toHaveBeenCalledWith(undefined);
  });

  it('passes create/update/delete straight through to the repository', async () => {
    const r = repo();
    const svc = new TaxService(r as never);
    await svc.createRegion({ countryCode: 'SA', regionName: 'Riyadh', taxRate: '15.00' } as never);
    await svc.updateRegion('t1', { taxRate: '5.00' } as never);
    await svc.deleteRegion('t1');
    expect(r.createTaxRegion).toHaveBeenCalledWith({ countryCode: 'SA', regionName: 'Riyadh', taxRate: '15.00' });
    expect(r.updateTaxRegion).toHaveBeenCalledWith('t1', { taxRate: '5.00' });
    expect(r.deleteTaxRegion).toHaveBeenCalledWith('t1');
  });

  it('returns the region row from getRegion (controller owns the 404)', async () => {
    expect(await new TaxService(repo() as never).getRegion('t1')).toEqual({ id: 't1' });
    expect(await new TaxService(repo({ getTaxRegionById: vi.fn(async () => undefined) }) as never).getRegion('x')).toBeUndefined();
  });
});
