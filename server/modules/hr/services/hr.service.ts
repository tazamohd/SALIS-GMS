/**
 * HR service (Phase E5 — Domain Services).
 *
 * Owns the HR/payroll business rules: employee-directory enrichment (salary =
 * hourly × 176, active/inactive status), the Saudi-compliance roll-ups (GOSI,
 * end-of-service, vacation), the deterministic attendance synthesis, the payroll
 * summary/pay-slip math, and the leave-request workflow. Missing records surface
 * as NotFoundError and a duplicate employee email as ConflictError; the
 * controller maps both to the legacy wire shapes. All data access flows through
 * the injected repository. Time-dependent defaults (target date, month/year) are
 * resolved by the controller and passed in, keeping this layer deterministic.
 */

import { hashPassword } from '../../../auth';
import {
  calculateGOSI,
  calculateEndOfService,
  calculateVacationBalance,
} from '../../../services/saudi-compliance';
import { ConflictError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { EmployeeFilters, IHrRepository } from '../repositories/hr.repository';

const WORKING_HOURS_PER_MONTH = 176;

type Row = Record<string, unknown>;
const num = (v: unknown) => parseFloat((v as string) || '0');

export const EMPTY_PAYROLL = {
  employeeCount: 0,
  totalBaseSalary: 0,
  totalAllowances: 0,
  totalGrossSalary: 0,
  totalGosiEmployer: 0,
  totalGosiEmployee: 0,
  totalDeductions: 0,
  totalNetDisbursement: 0,
  employees: [] as unknown[],
};

export class HrService {
  constructor(private readonly repository: IHrRepository) {}

  async listEmployees(garageId: string, filters: EmployeeFilters) {
    const { employees, total } = await this.repository.employeesWithCount(garageId, filters);
    return {
      employees: employees.map((e: Row) => ({
        ...e,
        salary: num(e.hourlyRate) * WORKING_HOURS_PER_MONTH,
        status: e.isActive ? 'active' : 'inactive',
      })),
      total,
    };
  }

  async employeeDetail(id: string, garageId: string) {
    const emp = await this.repository.employeeById(id, garageId);
    if (!emp) throw new NotFoundError('Employee not found', { context: { id } });
    const hireDate = emp.hireDate ? new Date(emp.hireDate as string) : new Date();
    const baseSalary = num(emp.hourlyRate) * WORKING_HOURS_PER_MONTH;
    const isSaudi = !!emp.nationalId;
    return {
      ...emp,
      salary: baseSalary,
      status: emp.isActive ? 'active' : 'inactive',
      gosi: calculateGOSI(baseSalary, isSaudi),
      endOfService: calculateEndOfService(hireDate, baseSalary),
      vacation: calculateVacationBalance(hireDate),
    };
  }

  async createEmployee(
    garageId: string,
    input: { fullName: string; email: string; phone?: string; role?: string; nationalId?: string; password?: string },
  ) {
    const passwordHash = await hashPassword(input.password || 'changeme123');
    try {
      const row = await this.repository.insertEmployee({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone || null,
        role: input.role || 'ADVISOR',
        nationalId: input.nationalId || null,
        passwordHash,
        garageId,
      });
      return row || {};
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictError('Email already exists');
      }
      throw err;
    }
  }

  async attendance(garageId: string, targetDate: Date, limit: number, offset: number) {
    const employees = await this.repository.attendanceEmployees(garageId, limit, offset);
    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday/Saturday for Saudi
    const dateStr = targetDate.toISOString().slice(0, 10);

    const attendance = (employees as Row[]).map((emp, idx) => {
      const clockInHour = 7 + (idx % 3);
      const clockOutHour = clockInHour + 8 + (idx % 2);
      const isPresent = !isWeekend && !!emp.isActive;
      const clockIn = new Date(targetDate);
      clockIn.setHours(clockInHour, (idx * 7) % 60, 0);
      const clockOut = new Date(targetDate);
      clockOut.setHours(clockOutHour, (idx * 13) % 60, 0);
      return {
        id: `att-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: dateStr,
        clockIn: isPresent ? clockIn.toISOString() : null,
        clockOut: isPresent ? clockOut.toISOString() : null,
        hoursWorked: isPresent
          ? Math.round((clockOutHour - clockInHour + (((idx * 13) % 60) - ((idx * 7) % 60)) / 60) * 100) / 100
          : 0,
        status: isWeekend ? 'day-off' : isPresent ? 'present' : 'absent',
        overtime: isPresent && clockOutHour - clockInHour > 8 ? clockOutHour - clockInHour - 8 : 0,
      };
    });

    return {
      attendance,
      date: dateStr,
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      dayOff: attendance.filter((a) => a.status === 'day-off').length,
    };
  }

  clock(employeeId: string, action: string, now: Date) {
    return {
      employeeId,
      action,
      timestamp: now.toISOString(),
      date: now.toISOString().slice(0, 10),
      success: true,
      message: `Clock ${action} recorded at ${now.toLocaleTimeString()}`,
    };
  }

  async listLeave(filter: { status?: string; employeeId?: string }) {
    const [entries, counts] = await Promise.all([
      this.repository.listLeave(filter),
      this.repository.countLeaveByStatus(),
    ]);
    return {
      leaveRequests: entries,
      total: entries.length,
      pending: counts.pending,
      approved: counts.approved,
      rejected: counts.rejected,
    };
  }

  createLeave(input: {
    employeeId: string; employeeName?: string; type: string; startDate: string; endDate: string; reason?: string;
  }) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return this.repository.createLeave({
      employeeId: String(input.employeeId),
      employeeName: input.employeeName || 'Employee',
      type: String(input.type),
      startDate: String(input.startDate),
      endDate: String(input.endDate),
      days,
      reason: input.reason || '',
      status: 'pending',
    } as Parameters<IHrRepository['createLeave']>[0]);
  }

  async updateLeave(id: string, status: string, approvedBy: string) {
    const updated = await this.repository.updateLeave(id, { status, approvedBy } as Parameters<IHrRepository['updateLeave']>[1]);
    if (!updated) throw new NotFoundError('Leave request not found', { context: { id } });
    return updated;
  }

  async payrollSummary(garageId: string) {
    const employees = await this.repository.payrollActiveEmployees(garageId);
    let totalBaseSalary = 0, totalGosiEmployer = 0, totalGosiEmployee = 0, totalAllowances = 0, totalDeductions = 0;
    const employeePayrolls: Row[] = [];

    for (const emp of employees as Row[]) {
      const baseSalary = num(emp.hourlyRate) * WORKING_HOURS_PER_MONTH;
      if (baseSalary <= 0) continue;
      const isSaudi = !!emp.nationalId;
      const gosi = calculateGOSI(baseSalary, isSaudi);
      const housingAllowance = Math.round(baseSalary * 0.25 * 100) / 100;
      const transportAllowance = Math.round(baseSalary * 0.1 * 100) / 100;
      const totalAllowance = housingAllowance + transportAllowance;
      const grossSalary = baseSalary + totalAllowance;
      const netPay = grossSalary - gosi.employeeContribution;

      totalBaseSalary += baseSalary;
      totalGosiEmployer += gosi.employerContribution;
      totalGosiEmployee += gosi.employeeContribution;
      totalAllowances += totalAllowance;
      totalDeductions += gosi.employeeContribution;

      employeePayrolls.push({
        employeeId: emp.id, name: emp.name, baseSalary, housingAllowance, transportAllowance,
        grossSalary, gosiEmployer: gosi.employerContribution, gosiEmployee: gosi.employeeContribution, netPay, isSaudi,
      });
    }

    const totalGrossSalary = totalBaseSalary + totalAllowances;
    const totalNetDisbursement = totalGrossSalary - totalDeductions;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    return {
      employeeCount: employeePayrolls.length,
      totalBaseSalary: r2(totalBaseSalary),
      totalAllowances: r2(totalAllowances),
      totalGrossSalary: r2(totalGrossSalary),
      totalGosiEmployer: r2(totalGosiEmployer),
      totalGosiEmployee: r2(totalGosiEmployee),
      totalDeductions: r2(totalDeductions),
      totalNetDisbursement: r2(totalNetDisbursement),
      employees: employeePayrolls,
    };
  }

  async payslip(employeeId: string, garageId: string, month: number, year: number) {
    const emp = await this.repository.payslipEmployee(employeeId, garageId);
    if (!emp) throw new NotFoundError('Employee not found', { context: { employeeId } });
    const baseSalary = num(emp.hourlyRate) * WORKING_HOURS_PER_MONTH;
    const isSaudi = !!emp.nationalId;
    const hireDate = emp.hireDate ? new Date(emp.hireDate as string) : new Date();
    const gosi = calculateGOSI(baseSalary, isSaudi);
    const housingAllowance = Math.round(baseSalary * 0.25 * 100) / 100;
    const transportAllowance = Math.round(baseSalary * 0.1 * 100) / 100;
    const grossSalary = baseSalary + housingAllowance + transportAllowance;
    const netPay = grossSalary - gosi.employeeContribution;
    return {
      employeeId: emp.id, name: emp.name, email: emp.email, department: emp.department, level: emp.level,
      nationalId: emp.nationalId, hireDate: emp.hireDate, month, year, isSaudi,
      earnings: { baseSalary, housingAllowance, transportAllowance, totalEarnings: grossSalary },
      deductions: { gosiEmployee: gosi.employeeContribution, totalDeductions: gosi.employeeContribution },
      employerCosts: { gosiEmployer: gosi.employerContribution },
      netPay, grossSalary,
      endOfService: calculateEndOfService(hireDate, baseSalary),
      vacation: calculateVacationBalance(hireDate),
    };
  }
}
