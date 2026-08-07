import { describe, it, expect, vi } from 'vitest';
import { HrService } from '../services/hr.service';
import { ConflictError, NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    employeesWithCount: vi.fn(async () => ({ employees: [{ id: 'u1', isActive: true, hourlyRate: '10' }], total: 1 })),
    employeeById: vi.fn(async () => undefined),
    insertEmployee: vi.fn(async () => ({ id: 'u9', name: 'New' })),
    attendanceEmployees: vi.fn(async () => [{ id: 'u1', name: 'Ali', department: 'ADVISOR', isActive: true }]),
    payrollActiveEmployees: vi.fn(async () => []),
    payslipEmployee: vi.fn(async () => undefined),
    listLeave: vi.fn(async () => [{ id: 'l1' }]),
    countLeaveByStatus: vi.fn(async () => ({ pending: 1, approved: 2, rejected: 0 })),
    createLeave: vi.fn(async (d) => ({ id: 'l9', ...(d as object) })),
    updateLeave: vi.fn(async () => undefined),
    ...o,
  };
}

describe('HrService', () => {
  it('enriches the employee list with monthly salary and status', async () => {
    const out = await new HrService(repo() as never).listEmployees('g1', { limit: 50, offset: 0 });
    expect(out.total).toBe(1);
    expect(out.employees[0]).toMatchObject({ salary: 10 * 176, status: 'active' });
  });

  it('404s a missing employee detail and attaches compliance blocks when present', async () => {
    await expect(new HrService(repo() as never).employeeDetail('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
    const r = repo({ employeeById: vi.fn(async () => ({ id: 'u1', isActive: true, hourlyRate: '20', nationalId: '123', hireDate: '2020-01-01' })) });
    const detail = await new HrService(r as never).employeeDetail('u1', 'g1');
    expect(detail.salary).toBe(20 * 176);
    expect(detail).toHaveProperty('gosi');
    expect(detail).toHaveProperty('endOfService');
    expect(detail).toHaveProperty('vacation');
  });

  it('translates a duplicate-email pg error into a ConflictError', async () => {
    const r = repo({ insertEmployee: vi.fn(async () => { throw { code: '23505' }; }) });
    await expect(new HrService(r as never).createEmployee('g1', { fullName: 'A', email: 'a@x.com' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('synthesises attendance and flags a weekend as day-off', async () => {
    const s = new HrService(repo() as never);
    const friday = new Date('2026-01-02T00:00:00Z'); // Friday
    const out = await s.attendance('g1', friday, 50, 0);
    expect(out.total).toBe(1);
    expect(out.attendance[0].status).toBe('day-off');
    expect(out.dayOff).toBe(1);
  });

  it('computes leave-request day span (inclusive) on create', async () => {
    const r = repo();
    await new HrService(r as never).createLeave({ employeeId: 'u1', type: 'annual', startDate: '2026-01-01', endDate: '2026-01-03' });
    expect(r.createLeave.mock.calls[0][0]).toMatchObject({ days: 3, status: 'pending', employeeName: 'Employee' });
  });

  it('404s an update to a missing leave request', async () => {
    await expect(new HrService(repo() as never).updateLeave('x', 'approved', 'Mgr')).rejects.toThrow('Leave request not found');
  });

  it('payroll summary skips zero-salary employees and rounds totals', async () => {
    const r = repo({
      payrollActiveEmployees: vi.fn(async () => [
        { id: 'u1', name: 'Ali', hourlyRate: '10', nationalId: '1' },
        { id: 'u2', name: 'Zero', hourlyRate: '0' },
      ]),
    });
    const out = await new HrService(r as never).payrollSummary('g1');
    expect(out.employeeCount).toBe(1);
    expect(out.employees[0].name).toBe('Ali');
    expect(out.totalBaseSalary).toBe(1760);
  });

  it('404s a pay slip for a missing employee and echoes month/year when present', async () => {
    await expect(new HrService(repo() as never).payslip('x', 'g1', 3, 2026)).rejects.toBeInstanceOf(NotFoundError);
    const r = repo({ payslipEmployee: vi.fn(async () => ({ id: 'u1', name: 'Ali', hourlyRate: '10', hireDate: '2021-01-01' })) });
    const slip = await new HrService(r as never).payslip('u1', 'g1', 3, 2026);
    expect(slip).toMatchObject({ month: 3, year: 2026, netPay: expect.any(Number) });
    expect(slip.earnings.baseSalary).toBe(1760);
  });
});
