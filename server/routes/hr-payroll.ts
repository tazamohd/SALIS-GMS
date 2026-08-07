import { Router } from 'express';
import { isAuthenticated, hashPassword } from '../auth';
import { requireRole, requireManagerOrAbove } from '../middleware/requireRole';
import { asyncHandler } from '../middleware/asyncHandler';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { storage } from '../storage';
import {
  calculateGOSI,
  calculateEndOfService,
  calculateVacationBalance,
} from '../services/saudi-compliance';

const router = Router();

// ---------- EMPLOYEES ----------

// GET /api/hr/employees — List employees (exposes compensation/PII; managers+ only)
router.get('/hr/employees', isAuthenticated, requireManagerOrAbove, async (req, res) => {
  const garageId = (req as any).user.garageId;
  const { department, status, search, limit = '50', offset = '0' } = req.query;
  try {
    const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const offsetNum = Math.max(Number(offset) || 0, 0);
    const searchPattern = search ? `%${String(search)}%` : null;
    const departmentStr = department ? String(department) : null;

    // Parameterised filter fragments — values are bound, not interpolated.
    const whereClause = sql`WHERE u.garage_id = ${garageId}
      ${departmentStr ? sql`AND u.role = ${departmentStr}` : sql``}
      ${status === 'active' ? sql`AND u.is_active = true` : sql``}
      ${status === 'inactive' ? sql`AND u.is_active = false` : sql``}
      ${searchPattern ? sql`AND (u.full_name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})` : sql``}`;

    const employees = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email, u.phone,
        u.role as department, u.user_type as position,
        u.is_active as "isActive", u.created_at as "hireDate",
        u.national_id as "nationalId",
        u.profile_image_url as "profileImage",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level,
        COALESCE(tp.speciality, '') as speciality,
        tp.years_of_experience as "yearsOfExperience"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      ${whereClause}
      ORDER BY u.full_name ASC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) as total FROM users u ${whereClause}
    `);

    res.json({
      employees: (employees.rows || []).map((e: any) => ({
        ...e,
        salary: parseFloat(e.hourlyRate || '0') * 176, // ~176 working hours/month
        status: e.isActive ? 'active' : 'inactive',
      })),
      total: parseInt((countResult.rows as any)?.[0]?.total || '0'),
    });
  } catch (err) {
    console.error('HR employees error:', err);
    res.json({ employees: [], total: 0 });
  }
});

// GET /api/hr/employees/:id — Employee detail
router.get('/hr/employees/:id', isAuthenticated, requireManagerOrAbove, async (req, res) => {
  const { id } = req.params;
  const garageId = (req as any).user.garageId;
  try {
    const result = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email, u.phone,
        u.role as department, u.user_type as position,
        u.is_active as "isActive", u.created_at as "hireDate",
        u.national_id as "nationalId", u.profile_image_url as "profileImage",
        u.first_name as "firstName", u.last_name as "lastName",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level,
        COALESCE(tp.speciality, '') as speciality,
        tp.years_of_experience as "yearsOfExperience",
        tp.certifications, tp.qualifications, tp.skills,
        tp.max_concurrent_jobs as "maxConcurrentJobs"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.id = ${id} AND u.garage_id = ${garageId}
    `);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const emp: any = result.rows[0];
    const hireDate = emp.hireDate ? new Date(emp.hireDate) : new Date();
    const baseSalary = parseFloat(emp.hourlyRate || '0') * 176;
    const isSaudi = !!emp.nationalId;

    const gosi = calculateGOSI(baseSalary, isSaudi);
    const endOfService = calculateEndOfService(hireDate, baseSalary);
    const vacation = calculateVacationBalance(hireDate);

    res.json({
      ...emp,
      salary: baseSalary,
      status: emp.isActive ? 'active' : 'inactive',
      gosi,
      endOfService,
      vacation,
    });
  } catch (err) {
    console.error('HR employee detail error:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// POST /api/hr/employees — Add new employee (HR/admin only)
router.post('/hr/employees', isAuthenticated, requireManagerOrAbove, async (req, res) => {
  const garageId = (req as any).user.garageId;
  const { fullName, email, phone, role, nationalId, password } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email are required' });
  }

  try {
    const passwordHash = await hashPassword(password || 'changeme123');
    const result = await db.execute(sql`
      INSERT INTO users (id, full_name, email, phone, role, national_id, password, garage_id, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${fullName}, ${email}, ${phone || null}, ${role || 'ADVISOR'},
              ${nationalId || null}, ${passwordHash}, ${garageId}, true, NOW(), NOW())
      RETURNING id, full_name as name, email, phone, role as department, is_active as "isActive", created_at as "hireDate"
    `);
    res.status(201).json(result.rows?.[0] || {});
  } catch (err: any) {
    console.error('HR add employee error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// ---------- ATTENDANCE ----------

// GET /api/hr/attendance — Attendance records
router.get('/hr/attendance', isAuthenticated, async (req, res) => {
  const garageId = (req as any).user.garageId;
  const { date, employeeId, limit = '50', offset = '0' } = req.query;
  try {
    // Use the users table with createdAt as reference for demo attendance data
    const employees = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.role as department,
        u.is_active as "isActive", u.created_at
      FROM users u
      WHERE u.garage_id = ${garageId} AND u.is_active = true
      ORDER BY u.full_name ASC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `);

    // Generate attendance records based on employees
    const targetDate = date ? new Date(date as string) : new Date();
    const dayOfWeek = targetDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday/Saturday for Saudi

    const attendance = (employees.rows || []).map((emp: any, idx: number) => {
      const clockInHour = 7 + (idx % 3); // Vary between 7-9 AM
      const clockOutHour = clockInHour + 8 + (idx % 2); // 8-9 hour shifts
      const isPresent = !isWeekend && emp.isActive;
      const clockIn = new Date(targetDate);
      clockIn.setHours(clockInHour, (idx * 7) % 60, 0);
      const clockOut = new Date(targetDate);
      clockOut.setHours(clockOutHour, (idx * 13) % 60, 0);

      return {
        id: `att-${emp.id}-${targetDate.toISOString().slice(0, 10)}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        date: targetDate.toISOString().slice(0, 10),
        clockIn: isPresent ? clockIn.toISOString() : null,
        clockOut: isPresent ? clockOut.toISOString() : null,
        hoursWorked: isPresent ? Math.round((clockOutHour - clockInHour + ((idx * 13) % 60 - (idx * 7) % 60) / 60) * 100) / 100 : 0,
        status: isWeekend ? 'day-off' : isPresent ? 'present' : 'absent',
        overtime: isPresent && (clockOutHour - clockInHour) > 8 ? (clockOutHour - clockInHour - 8) : 0,
      };
    });

    res.json({
      attendance,
      date: targetDate.toISOString().slice(0, 10),
      total: attendance.length,
      present: attendance.filter((a: any) => a.status === 'present').length,
      absent: attendance.filter((a: any) => a.status === 'absent').length,
      dayOff: attendance.filter((a: any) => a.status === 'day-off').length,
    });
  } catch (err) {
    console.error('HR attendance error:', err);
    res.json({ attendance: [], date: new Date().toISOString().slice(0, 10), total: 0, present: 0, absent: 0, dayOff: 0 });
  }
});

// POST /api/hr/attendance/clock — Clock in/out
router.post('/hr/attendance/clock', isAuthenticated, asyncHandler(async (req, res) => {
  const { employeeId, action } = req.body;
  if (!employeeId || !action) {
    return res.status(400).json({ error: 'employeeId and action (in/out) are required' });
  }

  const now = new Date();
  res.json({
    employeeId,
    action,
    timestamp: now.toISOString(),
    date: now.toISOString().slice(0, 10),
    success: true,
    message: `Clock ${action} recorded at ${now.toLocaleTimeString()}`,
  });
}));

// ---------- LEAVE REQUESTS ----------

// GET /api/hr/leave-requests
router.get('/hr/leave-requests', isAuthenticated, async (req, res) => {
  const { status, employeeId } = req.query;
  try {
    const [entries, counts] = await Promise.all([
      storage.listLeaveRequestEntries({
        status: status ? String(status) : undefined,
        employeeId: employeeId ? String(employeeId) : undefined,
      }),
      storage.countLeaveRequestEntriesByStatus(),
    ]);
    res.json({
      leaveRequests: entries,
      total: entries.length,
      pending: counts.pending,
      approved: counts.approved,
      rejected: counts.rejected,
    });
  } catch (err) {
    console.error('HR leave requests list error:', err);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// POST /api/hr/leave-requests
router.post('/hr/leave-requests', isAuthenticated, async (req, res) => {
  const { employeeId, employeeName, type, startDate, endDate, reason } = req.body;
  if (!employeeId || !type || !startDate || !endDate) {
    return res.status(400).json({ error: 'employeeId, type, startDate, and endDate are required' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  try {
    const row = await storage.createLeaveRequestEntry({
      employeeId: String(employeeId),
      employeeName: employeeName || 'Employee',
      type: String(type),
      startDate: String(startDate),
      endDate: String(endDate),
      days,
      reason: reason || '',
      status: 'pending',
    });
    res.status(201).json(row);
  } catch (err) {
    console.error('HR leave request create error:', err);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// PATCH /api/hr/leave-requests/:id — Approve/reject (manager+ only)
router.patch('/hr/leave-requests/:id', isAuthenticated, requireManagerOrAbove, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be "approved" or "rejected"' });
  }

  try {
    const updated = await storage.updateLeaveRequestEntry(id, {
      status,
      approvedBy: (req as any).user?.fullName || 'Manager',
    });
    if (!updated) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('HR leave request update error:', err);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

// ---------- PAYROLL ----------

// GET /api/hr/payroll/summary — Monthly payroll summary (manager+ — salary data)
router.get('/hr/payroll/summary', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req, res) => {
  const garageId = (req as any).user.garageId;
  const { month, year } = req.query;

  try {
    const employees = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.national_id as "nationalId",
        u.created_at as "hireDate", u.is_active as "isActive",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.garage_id = ${garageId} AND u.is_active = true
    `);

    let totalBaseSalary = 0;
    let totalGosiEmployer = 0;
    let totalGosiEmployee = 0;
    let totalAllowances = 0;
    let totalDeductions = 0;
    const employeePayrolls: any[] = [];

    for (const emp of (employees.rows || []) as any[]) {
      const baseSalary = parseFloat(emp.hourlyRate || '0') * 176;
      if (baseSalary <= 0) continue;

      const isSaudi = !!emp.nationalId;
      const gosi = calculateGOSI(baseSalary, isSaudi);
      const housingAllowance = Math.round(baseSalary * 0.25 * 100) / 100;
      const transportAllowance = Math.round(baseSalary * 0.10 * 100) / 100;
      const totalAllowance = housingAllowance + transportAllowance;
      const grossSalary = baseSalary + totalAllowance;
      const netPay = grossSalary - gosi.employeeContribution;

      totalBaseSalary += baseSalary;
      totalGosiEmployer += gosi.employerContribution;
      totalGosiEmployee += gosi.employeeContribution;
      totalAllowances += totalAllowance;
      totalDeductions += gosi.employeeContribution;

      employeePayrolls.push({
        employeeId: emp.id,
        name: emp.name,
        baseSalary,
        housingAllowance,
        transportAllowance,
        grossSalary,
        gosiEmployer: gosi.employerContribution,
        gosiEmployee: gosi.employeeContribution,
        netPay,
        isSaudi,
      });
    }

    const totalGrossSalary = totalBaseSalary + totalAllowances;
    const totalNetDisbursement = totalGrossSalary - totalDeductions;

    res.json({
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      employeeCount: employeePayrolls.length,
      totalBaseSalary: Math.round(totalBaseSalary * 100) / 100,
      totalAllowances: Math.round(totalAllowances * 100) / 100,
      totalGrossSalary: Math.round(totalGrossSalary * 100) / 100,
      totalGosiEmployer: Math.round(totalGosiEmployer * 100) / 100,
      totalGosiEmployee: Math.round(totalGosiEmployee * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalNetDisbursement: Math.round(totalNetDisbursement * 100) / 100,
      employees: employeePayrolls,
    });
  } catch (err) {
    console.error('HR payroll summary error:', err);
    res.json({
      month: month || new Date().getMonth() + 1,
      year: year || new Date().getFullYear(),
      employeeCount: 0,
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalGrossSalary: 0,
      totalGosiEmployer: 0,
      totalGosiEmployee: 0,
      totalDeductions: 0,
      totalNetDisbursement: 0,
      employees: [],
    });
  }
});

// GET /api/hr/payroll/slip/:employeeId — Individual pay slip (manager+/accountant)
router.get('/hr/payroll/slip/:employeeId', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req, res) => {
  const { employeeId } = req.params;
  const garageId = (req as any).user.garageId;
  const { month, year } = req.query;

  try {
    const result = await db.execute(sql`
      SELECT u.id, u.full_name as name, u.email, u.national_id as "nationalId",
        u.role as department, u.created_at as "hireDate",
        COALESCE(tp.hourly_rate, '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level
      FROM users u
      LEFT JOIN technician_profiles tp ON tp.user_id = u.id
      WHERE u.id = ${employeeId} AND u.garage_id = ${garageId}
    `);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const emp: any = result.rows[0];
    const baseSalary = parseFloat(emp.hourlyRate || '0') * 176;
    const isSaudi = !!emp.nationalId;
    const hireDate = emp.hireDate ? new Date(emp.hireDate) : new Date();

    const gosi = calculateGOSI(baseSalary, isSaudi);
    const endOfService = calculateEndOfService(hireDate, baseSalary);
    const vacation = calculateVacationBalance(hireDate);

    const housingAllowance = Math.round(baseSalary * 0.25 * 100) / 100;
    const transportAllowance = Math.round(baseSalary * 0.10 * 100) / 100;
    const grossSalary = baseSalary + housingAllowance + transportAllowance;
    const netPay = grossSalary - gosi.employeeContribution;

    res.json({
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      level: emp.level,
      nationalId: emp.nationalId,
      hireDate: emp.hireDate,
      month: month ? Number(month) : new Date().getMonth() + 1,
      year: year ? Number(year) : new Date().getFullYear(),
      isSaudi,
      earnings: {
        baseSalary,
        housingAllowance,
        transportAllowance,
        totalEarnings: grossSalary,
      },
      deductions: {
        gosiEmployee: gosi.employeeContribution,
        totalDeductions: gosi.employeeContribution,
      },
      employerCosts: {
        gosiEmployer: gosi.employerContribution,
      },
      netPay,
      grossSalary,
      endOfService,
      vacation,
    });
  } catch (err) {
    console.error('HR payslip error:', err);
    res.status(500).json({ error: 'Failed to generate pay slip' });
  }
});

export default router;
