import { describe, it, expect, vi } from 'vitest';
import { DynamicPricingService } from '../services/dynamic-pricing.service';
import { ValidationError, NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getMarketPricingData: vi.fn(async () => [{ id: 'm1' }]),
    createMarketPricingData: vi.fn(async (d: Record<string, unknown>) => ({ id: 'm1', ...d })),
    updateMarketPricingData: vi.fn(async () => ({ id: 'm1', updated: true })),
    deleteMarketPricingData: vi.fn(async () => undefined),
    getVehiclePricingFactors: vi.fn(async () => [{ id: 'f1' }]),
    createVehiclePricingFactor: vi.fn(async (d: Record<string, unknown>) => ({ id: 'f1', ...d })),
    updateVehiclePricingFactor: vi.fn(async () => ({ id: 'f1', updated: true })),
    deleteVehiclePricingFactor: vi.fn(async () => undefined),
    getDynamicPricingSuggestions: vi.fn(async () => [{ id: 's1' }]),
    getDynamicPricingSuggestion: vi.fn(async () => ({ id: 's1', status: 'pending' })),
    createDynamicPricingSuggestion: vi.fn(async (d: Record<string, unknown>) => ({ id: 's1', ...d })),
    updateDynamicPricingSuggestion: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 's1', ...d })),
    deleteDynamicPricingSuggestion: vi.fn(async () => undefined),
    calculateDynamicPrice: vi.fn(async () => ({ price: 250 })),
    ...o,
  };
}

describe('DynamicPricingService — suggestions', () => {
  it('400s a suggestions list without a garage id', async () => {
    await expect(new DynamicPricingService(repo() as never).listSuggestions(undefined, {}))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it('delegates a suggestions list with a garage id', async () => {
    const r = repo();
    await new DynamicPricingService(r as never).listSuggestions('g1', { status: 'pending' });
    expect(r.getDynamicPricingSuggestions).toHaveBeenCalledWith('g1', { status: 'pending' });
  });
  it('404s a missing single suggestion', async () => {
    await expect(new DynamicPricingService(repo({ getDynamicPricingSuggestion: vi.fn(async () => undefined) }) as never).getSuggestion('s1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it('injects the resolved garage id on create', async () => {
    const r = repo();
    await new DynamicPricingService(r as never).createSuggestion('g1', { vehicleId: 'v1', garageId: 'ignored' });
    expect(r.createDynamicPricingSuggestion).toHaveBeenCalledWith({ vehicleId: 'v1', garageId: 'g1' });
  });
  it('stamps acceptedBy/acceptedAt only when the status is accepted', async () => {
    const r = repo();
    const svc = new DynamicPricingService(r as never);
    await svc.updateSuggestion('s1', 'u1', { status: 'accepted' });
    const accepted = r.updateDynamicPricingSuggestion.mock.calls[0][1] as Record<string, unknown>;
    expect(accepted.acceptedBy).toBe('u1');
    expect(accepted.acceptedAt).toBeInstanceOf(Date);
    await svc.updateSuggestion('s1', 'u1', { status: 'rejected' });
    const rejected = r.updateDynamicPricingSuggestion.mock.calls[1][1] as Record<string, unknown>;
    expect(rejected.acceptedBy).toBeUndefined();
    expect(rejected.acceptedAt).toBeUndefined();
  });
});

describe('DynamicPricingService — calculate + deletes + catalogues', () => {
  it('400s calculate without a service type, else delegates', async () => {
    await expect(new DynamicPricingService(repo() as never).calculate({}))
      .rejects.toBeInstanceOf(ValidationError);
    const r = repo();
    expect(await new DynamicPricingService(r as never).calculate({ serviceType: 'oil_change', region: 'RUH' }))
      .toEqual({ price: 250 });
    expect(r.calculateDynamicPrice).toHaveBeenCalledWith(expect.objectContaining({ serviceType: 'oil_change', region: 'RUH' }));
  });
  it('returns { success: true } from every delete', async () => {
    const svc = new DynamicPricingService(repo() as never);
    expect(await svc.deleteMarketData('m1')).toEqual({ success: true });
    expect(await svc.deleteVehicleFactor('f1')).toEqual({ success: true });
    expect(await svc.deleteSuggestion('s1')).toEqual({ success: true });
  });
  it('exposes the static service-type + vehicle-class catalogues', () => {
    const svc = new DynamicPricingService(repo() as never);
    expect(svc.serviceTypes().map((s) => s.value)).toContain('oil_change');
    expect(svc.vehicleClasses().map((c) => c.value)).toContain('economy');
  });
});
