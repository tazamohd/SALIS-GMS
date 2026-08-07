/**
 * HR controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy `server/routes/hr-payroll.ts`
 * contract: field-validation 400s, the graceful-degradation defaults on the
 * directory/attendance/payroll-summary reads, the 404/409 mappings (employee
 * detail, duplicate email, missing leave/pay-slip), and the exact `{ error }`
 * 500 bodies. Runtime date/month defaults are resolved here so the service stays
 * deterministic. No business rules, no data-layer access. (Role guards are
 * applied on the routes in index.ts.)
 */

import type { Request, Response } from 'express';
import { ConflictError, NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { HrService } from '../services/hr.service';
import { EMPTY_PAYROLL } from '../services/hr.service';

function garageOf(req: Request): string {
  return (req.user as { garageId?: string }).garageId as string;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeHrController(service: HrService) {
  return {
    async listEmployees(req: Request, res: Response): Promise<void> {
      try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        res.json(await service.listEmployees(garageOf(req), {
          department: str(req.query.department),
          status: str(req.query.status),
          search: str(req.query.search),
          limit,
          offset,
        }));
      } catch (err) {
        console.error('HR employees error:', err);
        res.json({ employees: [], total: 0 });
      }
    },

    async employeeDetail(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.employeeDetail(req.params.id, garageOf(req)));
      } catch (err) {
        if (err instanceof NotFoundError) {
          res.status(404).json({ error: 'Employee not found' });
          return;
        }
        console.error('HR employee detail error:', err);
        res.status(500).json({ error: 'Failed to fetch employee' });
      }
    },

    async createEmployee(req: Request, res: Response): Promise<void> {
      const { fullName, email, phone, role, nationalId, password } = req.body ?? {};
      if (!fullName || !email) {
        res.status(400).json({ error: 'fullName and email are required' });
        return;
      }
      try {
        const created = await service.createEmployee(garageOf(req), {
          fullName, email, phone, role, nationalId, password,
        });
        res.status(201).json(created);
      } catch (err) {
        if (err instanceof ConflictError) {
          res.status(409).json({ error: 'Email already exists' });
          return;
        }
        console.error('HR add employee error:', err);
        res.status(500).json({ error: 'Failed to create employee' });
      }
    },

    async attendance(req: Request, res: Response): Promise<void> {
      const targetDate = req.query.date ? new Date(req.query.date as string) : new Date();
      try {
        const limit = Number(req.query.limit ?? 50);
        const offset = Number(req.query.offset ?? 0);
        res.json(await service.attendance(garageOf(req), targetDate, limit, offset));
      } catch (err) {
        console.error('HR attendance error:', err);
        res.json({
          attendance: [], date: new Date().toISOString().slice(0, 10),
          total: 0, present: 0, absent: 0, dayOff: 0,
        });
      }
    },

    async clock(req: Request, res: Response): Promise<void> {
      const { employeeId, action } = req.body ?? {};
      if (!employeeId || !action) {
        res.status(400).json({ error: 'employeeId and action (in/out) are required' });
        return;
      }
      res.json(service.clock(employeeId, action, new Date()));
    },

    async listLeave(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listLeave({
          status: str(req.query.status),
          employeeId: str(req.query.employeeId),
        }));
      } catch (err) {
        console.error('HR leave requests list error:', err);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
      }
    },

    async createLeave(req: Request, res: Response): Promise<void> {
      const { employeeId, employeeName, type, startDate, endDate, reason } = req.body ?? {};
      if (!employeeId || !type || !startDate || !endDate) {
        res.status(400).json({ error: 'employeeId, type, startDate, and endDate are required' });
        return;
      }
      try {
        res.status(201).json(await service.createLeave({ employeeId, employeeName, type, startDate, endDate, reason }));
      } catch (err) {
        console.error('HR leave request create error:', err);
        res.status(500).json({ error: 'Failed to create leave request' });
      }
    },

    async updateLeave(req: Request, res: Response): Promise<void> {
      const { status } = req.body ?? {};
      if (!status || !['approved', 'rejected'].includes(status)) {
        res.status(400).json({ error: 'status must be "approved" or "rejected"' });
        return;
      }
      try {
        const approvedBy = (req.user as { fullName?: string } | undefined)?.fullName || 'Manager';
        res.json(await service.updateLeave(req.params.id, status, approvedBy));
      } catch (err) {
        if (err instanceof NotFoundError) {
          res.status(404).json({ error: 'Leave request not found' });
          return;
        }
        console.error('HR leave request update error:', err);
        res.status(500).json({ error: 'Failed to update leave request' });
      }
    },

    async payrollSummary(req: Request, res: Response): Promise<void> {
      const month = req.query.month || new Date().getMonth() + 1;
      const year = req.query.year || new Date().getFullYear();
      try {
        res.json({ month, year, ...(await service.payrollSummary(garageOf(req))) });
      } catch (err) {
        console.error('HR payroll summary error:', err);
        res.json({ month, year, ...EMPTY_PAYROLL });
      }
    },

    async payslip(req: Request, res: Response): Promise<void> {
      const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      try {
        res.json(await service.payslip(req.params.employeeId, garageOf(req), month, year));
      } catch (err) {
        if (err instanceof NotFoundError) {
          res.status(404).json({ error: 'Employee not found' });
          return;
        }
        console.error('HR payslip error:', err);
        res.status(500).json({ error: 'Failed to generate pay slip' });
      }
    },
  };
}

export type HrController = ReturnType<typeof makeHrController>;
