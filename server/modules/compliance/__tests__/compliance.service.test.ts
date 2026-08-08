import { describe, it, expect, vi } from 'vitest';
import { ComplianceService } from '../services/compliance.service';

function repo(o: Record<string, unknown> = {}) {
  return {
    createComplianceRecord: vi.fn(async (d: Record<string, unknown>) => ({ id: 'r1', ...d })),
    getComplianceRecords: vi.fn(async () => [{ id: 'r1' }]),
    getComplianceAnalytics: vi.fn(async () => ({ total: 3 })),
    getCompliancePolicies: vi.fn(async () => [{ id: 'p1' }]),
    createCompliancePolicy: vi.fn(async (d: Record<string, unknown>) => ({ id: 'p1', ...d })),
    getComplianceAudits: vi.fn(async () => [{ id: 'a1' }]),
    createComplianceAudit: vi.fn(async (d: Record<string, unknown>) => ({ id: 'a1', ...d })),
    getComplianceTasks: vi.fn(async () => [{ id: 't1' }]),
    createComplianceTask: vi.fn(async (d: Record<string, unknown>) => ({ id: 't1', ...d })),
    completeComplianceTask: vi.fn(async () => ({ id: 't1', status: 'completed' })),
    ...o,
  };
}

describe('ComplianceService — environmental', () => {
  it('maps the record fields (Date recordDate, Number coercions, injected garageId)', async () => {
    const r = repo();
    await new ComplianceService(r as never).createEnvironmentalRecord('g1', {
      complianceType: 'waste-disposal',
      recordDate: '2026-01-15',
      quantity: '12.5',
      cost: '300',
    } as never);
    const arg = r.createComplianceRecord.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.garageId).toBe('g1');
    expect(arg.recordDate).toBeInstanceOf(Date);
    expect(arg.quantity).toBe(12.5);
    expect(arg.cost).toBe(300);
  });
  it('leaves an absent quantity/cost undefined (no coercion)', async () => {
    const r = repo();
    await new ComplianceService(r as never).createEnvironmentalRecord('g1', {
      complianceType: 'emissions',
      recordDate: '2026-02-01',
    } as never);
    const arg = r.createComplianceRecord.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.quantity).toBeUndefined();
    expect(arg.cost).toBeUndefined();
  });
  it('defaults the analytics range to a trailing year when unbounded', async () => {
    const r = repo();
    await new ComplianceService(r as never).environmentalAnalytics('g1');
    const [gid, from, to] = r.getComplianceAnalytics.mock.calls[0] as [string, Date, Date];
    expect(gid).toBe('g1');
    expect(from).toBeInstanceOf(Date);
    expect(to).toBeInstanceOf(Date);
    expect((to as Date).getTime() - (from as Date).getTime()).toBeGreaterThan(0);
    // roughly a year apart (±2 days for leap/DST)
    const days = ((to as Date).getTime() - (from as Date).getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(363);
    expect(days).toBeLessThan(367);
  });
  it('honours explicit analytics bounds', async () => {
    const r = repo();
    await new ComplianceService(r as never).environmentalAnalytics('g1', '2026-01-01', '2026-03-01');
    const [, from, to] = r.getComplianceAnalytics.mock.calls[0] as [string, Date, Date];
    expect((from as Date).toISOString()).toContain('2026-01-01');
    expect((to as Date).toISOString()).toContain('2026-03-01');
  });
});

describe('ComplianceService — policies / audits / tasks', () => {
  it('passes filters through on the list endpoints', async () => {
    const r = repo();
    const svc = new ComplianceService(r as never);
    await svc.listPolicies('g1', 'active');
    expect(r.getCompliancePolicies).toHaveBeenCalledWith('g1', 'active');
    await svc.listAudits('g1', 'p1', 'open');
    expect(r.getComplianceAudits).toHaveBeenCalledWith('g1', 'p1', 'open');
    await svc.listTasks('g1', 'p1', 'pending');
    expect(r.getComplianceTasks).toHaveBeenCalledWith('g1', 'p1', 'pending');
  });
  it('delegates creates and task completion', async () => {
    const r = repo();
    const svc = new ComplianceService(r as never);
    await svc.createPolicy({ name: 'P' } as never);
    expect(r.createCompliancePolicy).toHaveBeenCalledWith({ name: 'P' });
    expect(await svc.completeTask('t1')).toEqual({ id: 't1', status: 'completed' });
    expect(r.completeComplianceTask).toHaveBeenCalledWith('t1');
  });
});
