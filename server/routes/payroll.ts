// @ts-nocheck
import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';
import {
  insertPayrollEmployeeSchema,
  insertPayPeriodSchema,
  insertPayrollRunSchema,
} from '@shared/schema';
import * as phase5Service from '../phase5-operations-service';

const router = Router();

// ---------------------------------------------------------------------------
// Helper — sanitise Zod validation errors for production responses
// ---------------------------------------------------------------------------
function sanitizeZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
  };
}

// ---------------------------------------------------------------------------
// Stub routes (originally from the monolith Phase 5 section)
// ---------------------------------------------------------------------------

// GET /api/payroll/periods — stub returning demo data
router.get('/payroll/periods', isAuthenticated, async (req, res) => {
  res.json([
    { id: "1", periodStart: "2024-10-14", periodEnd: "2024-10-27", status: "draft" },
  ]);
});

// POST /api/payroll/calculate — stub returning summary totals
router.post('/payroll/calculate', isAuthenticated, async (req, res) => {
  res.json({ totalGrossPay: 18500, totalDeductions: 3200, totalNetPay: 15300 });
});

// POST /api/payroll/calculate/:periodId — calls phase5Service
router.post('/payroll/calculate/:periodId', isAuthenticated, async (req, res) => {
  try {
    const { periodId } = req.params;
    const payrollEntries = await phase5Service.calculatePayroll(periodId);
    res.json(payrollEntries);
  } catch (error) {
    console.error("Error calculating payroll:", error);
    res.status(500).json({ message: "Failed to calculate payroll" });
  }
});

// ---------------------------------------------------------------------------
// Payroll Management CRUD (storage-backed)
// ---------------------------------------------------------------------------

// GET /api/payroll/employees
router.get('/payroll/employees', isAuthenticated, async (req: any, res) => {
  try {
    const employees = await storage.getPayrollEmployees(req.user?.garageId);
    res.json({ data: employees });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payroll/employees
router.post('/payroll/employees', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertPayrollEmployeeSchema.parse(req.body);
    const employee = await storage.createPayrollEmployee(validatedData);
    res.json({ data: employee });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/payroll/employees/:id
router.patch('/payroll/employees/:id', isAuthenticated, async (req, res) => {
  try {
    const employee = await storage.updatePayrollEmployee(req.params.id, req.body);
    res.json({ data: employee });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/payroll/employees/:id
router.delete('/payroll/employees/:id', isAuthenticated, async (req, res) => {
  try {
    await storage.deletePayrollEmployee(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payroll/periods
router.post('/payroll/periods', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertPayPeriodSchema.parse(req.body);
    const period = await storage.createPayPeriod(validatedData);
    res.json({ data: period });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/payroll/runs/:periodId
router.get('/payroll/runs/:periodId', isAuthenticated, async (req, res) => {
  try {
    const runs = await storage.getPayrollRuns(req.params.periodId);
    res.json({ data: runs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payroll/runs
router.post('/payroll/runs', isAuthenticated, async (req: any, res) => {
  try {
    const validatedData = insertPayrollRunSchema.parse(req.body);
    const run = await storage.createPayrollRun(validatedData);
    res.json({ data: run });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
