import { describe, it, expect, vi } from 'vitest';
import { WarrantyService } from '../services/warranty.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createWarranty: vi.fn(async (d: Record<string, unknown>) => ({ id: 'w1', ...d })),
    getWarrantiesByGarage: vi.fn(async () => [{ id: 'w1' }]),
    getActiveWarranties: vi.fn(async () => [{ id: 'w1' }]),
    getExpiredWarranties: vi.fn(async () => [{ id: 'w2' }]),
    getExpiringWarranties: vi.fn(async () => [{ id: 'w3' }]),
    getWarrantiesByVehicle: vi.fn(async () => [{ id: 'w1' }]),
    getWarrantiesByCustomer: vi.fn(async () => [{ id: 'w1' }]),
    getWarrantyById: vi.fn(async () => ({ id: 'w1' })),
    updateWarranty: vi.fn(async () => ({ id: 'w1', status: 'voided' })),
    deleteWarranty: vi.fn(async () => true),
    createWarrantyClaim: vi.fn(async (d: Record<string, unknown>) => ({ id: 'c1', ...d })),
    getWarrantyClaimsByGarage: vi.fn(async () => [{ id: 'c1' }]),
    getWarrantyClaimsByWarranty: vi.fn(async () => [{ id: 'c1' }]),
    getWarrantyClaimById: vi.fn(async () => ({ id: 'c1' })),
    updateWarrantyClaim: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'c1', ...d })),
    deleteWarrantyClaim: vi.fn(async () => true),
    ...o,
  };
}

describe('WarrantyService — warranties', () => {
  it('forwards garageId on the status-window lookups', async () => {
    const r = repo();
    const svc = new WarrantyService(r as never);
    await svc.listActive('g1');
    await svc.listExpired('g1');
    expect(r.getActiveWarranties).toHaveBeenCalledWith('g1');
    expect(r.getExpiredWarranties).toHaveBeenCalledWith('g1');
  });

  it('defaults the expiring window to 30 days and honours an explicit threshold', async () => {
    const r = repo();
    const svc = new WarrantyService(r as never);
    await svc.listExpiring('g1');
    expect(r.getExpiringWarranties).toHaveBeenCalledWith('g1', 30);
    await svc.listExpiring('g1', 7);
    expect(r.getExpiringWarranties).toHaveBeenCalledWith('g1', 7);
  });

  it('forwards vehicle/customer scoping with garageId', async () => {
    const r = repo();
    const svc = new WarrantyService(r as never);
    await svc.listByVehicle('v1', 'g1');
    await svc.listByCustomer('cust1', 'g1');
    expect(r.getWarrantiesByVehicle).toHaveBeenCalledWith('v1', 'g1');
    expect(r.getWarrantiesByCustomer).toHaveBeenCalledWith('cust1', 'g1');
  });
});

describe('WarrantyService — claims review transition', () => {
  it('stamps reviewedBy when a claim moves to approved/rejected', async () => {
    const r = repo();
    const svc = new WarrantyService(r as never);
    await svc.updateClaim('c1', { status: 'approved' }, 'reviewer-1', 'g1');
    expect(r.updateWarrantyClaim).toHaveBeenCalledWith(
      'c1',
      { status: 'approved', reviewedBy: 'reviewer-1' },
      'g1',
    );
  });

  it('does NOT stamp reviewedBy for non-review status changes', async () => {
    const r = repo();
    const svc = new WarrantyService(r as never);
    await svc.updateClaim('c1', { status: 'under_review' }, 'reviewer-1', 'g1');
    expect(r.updateWarrantyClaim).toHaveBeenCalledWith('c1', { status: 'under_review' }, 'g1');
  });

  it('does NOT stamp reviewedBy when there is no reviewer id', async () => {
    const r = repo();
    const svc = new WarrantyService(r as never);
    await svc.updateClaim('c1', { status: 'rejected' }, undefined, 'g1');
    expect(r.updateWarrantyClaim).toHaveBeenCalledWith('c1', { status: 'rejected' }, 'g1');
  });
});
