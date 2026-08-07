import { describe, it, expect, vi } from 'vitest';
import { InsuranceService } from '../services/insurance.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createClaim: vi.fn(async (d: unknown) => ({ id: 'clm1', ...(d as object) })),
    listClaims: vi.fn(async () => [{ id: 'clm1' }]),
    updateClaimStatus: vi.fn(async () => ({ id: 'clm1', status: 'approved' })),
    claimsAnalytics: vi.fn(async () => ({ totalClaims: 0 })),
    ...o,
  };
}

const validData = {
  claimNumber: 'CLM-1',
  customerId: 'cust1',
  vehicleId: 'veh1',
  insuranceCompany: 'Tawuniya',
  policyNumber: 'POL-1',
  claimType: 'collision',
  incidentDate: '2026-01-15',
  claimAmount: '1500',
  deductible: '200',
  adjusterName: 'Sara',
  adjusterPhone: '0500000000',
  description: 'Front bumper collision damage repair',
  documents: ['https://x/doc.pdf'],
};

describe('InsuranceService', () => {
  it('maps the validated DTO to the persistence shape (renames, date, amounts)', async () => {
    const r = repo();
    await new InsuranceService(r as never).createClaim('g1', validData);
    const arg = r.createClaim.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.garageId).toBe('g1');
    expect(arg.incidentDate).toBeInstanceOf(Date);
    expect(arg.claimAmount).toBe(1500); // string → number
    expect(arg.deductible).toBe(200);
    expect(arg.adjusterContact).toBe('0500000000'); // adjusterPhone → adjuster_contact
    expect(arg.notes).toBe('Front bumper collision damage repair'); // description → notes
    expect(arg).not.toHaveProperty('adjusterPhone');
    expect(arg).not.toHaveProperty('description');
  });

  it('coerces a non-numeric claim amount to 0 and leaves an absent deductible undefined', async () => {
    const r = repo();
    await new InsuranceService(r as never).createClaim('g1', {
      ...validData,
      claimAmount: 'abc',
      deductible: undefined,
    });
    const arg = r.createClaim.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.claimAmount).toBe(0);
    expect(arg.deductible).toBeUndefined();
  });

  it('passes the status filter through to the list', async () => {
    const r = repo();
    await new InsuranceService(r as never).listClaims('g1', 'approved');
    expect(r.listClaims).toHaveBeenCalledWith('g1', 'approved');
  });

  it('forwards status and approved amount on update', async () => {
    const r = repo();
    await new InsuranceService(r as never).updateClaimStatus('clm1', 'approved', 1200);
    expect(r.updateClaimStatus).toHaveBeenCalledWith('clm1', 'approved', 1200);
  });

  it('delegates analytics with the caller-supplied range', async () => {
    const r = repo();
    const from = new Date('2025-01-01');
    const to = new Date('2026-01-01');
    await new InsuranceService(r as never).analytics('g1', from, to);
    expect(r.claimsAnalytics).toHaveBeenCalledWith('g1', from, to);
  });
});
