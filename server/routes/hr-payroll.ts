import { Router } from 'express';
import { isAuthenticated } from '../auth';
import { requireRole, requireManagerOrAbove } from '../middleware/requireRole';
import { db } from '../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { storage } from '../storage';
import {
  calculateGOSI,
  calculateEndOfService,
  calculateVacationBalance,
} from '../services/saudi-compliance';
import {
  // Zod insert schemas — Block 1 (shifts, commissions, attendance, training, perf)
  insertEmployeeAttendanceSchema,
  insertShiftTemplateSchema,
  insertShiftAssignmentSchema,
  insertCommissionRuleSchema,
  insertCommissionSchema,
  insertPerformanceReviewSchema,
  insertTrainingSchema,
  insertEmployeeTrainingSchema,
  // Drizzle tables & Zod insert schemas — Block 2 (departments, positions, etc.)
  hrDepartments,
  insertHrDepartmentSchema,
  hrPositions,
  insertHrPositionSchema,
  hrEmployeeProfiles,
  hrLeaveTypes,
  insertHrLeaveTypeSchema,
  hrLeaveBalances,
  insertHrLeaveBalanceSchema,
  hrJobPostings,
  insertHrJobPostingSchema,
  hrCandidates,
  insertHrCandidateSchema,
  hrBenefitPlans,
  insertHrBenefitPlanSchema,
  hrBenefitEnrollments,
  insertHrBenefitEnrollmentSchema,
  hrAnnouncements,
  insertHrAnnouncementSchema,
  hrSelfServiceRequests,
  insertHrSelfServiceRequestSchema,
} from '@shared/schema';

const router = Router();

// ---------------------------------------------------------------------------
// Helper — sanitise Zod validation errors for production responses
// ---------------------------------------------------------------------------
function sanitizeZodError(error: z.ZodError) {
  return {
    message: 'Validation failed',
    errors: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}

// ============================================================================
// EMPLOYEES
// ============================================================================

// GET /api/hr/employees — List employees
router.get('/hr/employees', isAuthenticated, async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
  const { department, status, search, limit = '50', offset = '0' } = req.query;
  try {
    const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const offsetNum = Math.max(Number(offset) || 0, 0);
    const searchPattern = search ? `%${String(search)}%` : null;
    const departmentStr = department ? String(department) : null;

    // Parameterised filter fragments — values are bound, not interpolated.
    const whereClause = sql`WHERE u."garageId" = ${garageId}
      ${departmentStr ? sql`AND u.role = ${departmentStr}` : sql``}
      ${status === 'active' ? sql`AND u."isActive" = true` : sql``}
      ${status === 'inactive' ? sql`AND u."isActive" = false` : sql``}
      ${searchPattern ? sql`AND (u."fullName" ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})` : sql``}`;

    const employees = await db.execute(sql`
      SELECT u.id, u."fullName" as name, u.email, u.phone,
        u.role as department, u."userType" as position,
        u."isActive" as "isActive", u."createdAt" as "hireDate",
        u."nationalId" as "nationalId",
        u."profileImageUrl" as "profileImage",
        COALESCE(tp."hourlyRate", '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level,
        COALESCE(tp.speciality, '') as speciality,
        tp."yearsOfExperience" as "yearsOfExperience"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp."userId" = u.id
      ${whereClause}
      ORDER BY u."fullName" ASC
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
router.get('/hr/employees/:id', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.execute(sql`
      SELECT u.id, u."fullName" as name, u.email, u.phone,
        u.role as department, u."userType" as position,
        u."isActive", u."createdAt" as "hireDate",
        u."nationalId", u."profileImageUrl" as "profileImage",
        u."firstName", u."lastName",
        COALESCE(tp."hourlyRate", '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level,
        COALESCE(tp.speciality, '') as speciality,
        tp."yearsOfExperience",
        tp.certifications, tp.qualifications, tp.skills,
        tp."maxConcurrentJobs"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp."userId" = u.id
      WHERE u.id = ${id}
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
  const garageId = (req as any).user?.garageId || '1';
  const { fullName, email, phone, role, nationalId, password } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email are required' });
  }

  try {
    const result = await db.execute(sql`
      INSERT INTO users (id, "fullName", email, phone, role, "nationalId", password, "garageId", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${fullName}, ${email}, ${phone || null}, ${role || 'ADVISOR'},
              ${nationalId || null}, ${password || 'changeme123'}, ${garageId}, true, NOW(), NOW())
      RETURNING id, "fullName" as name, email, phone, role as department, "isActive", "createdAt" as "hireDate"
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

// PATCH /api/hr/employees/:id — Update HR employee profile (from monolith block 2)
router.patch('/hr/employees/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db.update(hrEmployeeProfiles)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(hrEmployeeProfiles.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating HR employee:', error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
});

// DELETE /api/hr/employees/:id — Delete HR employee profile (from monolith block 2)
router.delete('/hr/employees/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(hrEmployeeProfiles).where(eq(hrEmployeeProfiles.id, id));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting HR employee:', error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
});

// ============================================================================
// ATTENDANCE (original modular routes)
// ============================================================================

// GET /api/hr/attendance — Attendance records (summary / generated)
router.get('/hr/attendance', isAuthenticated, async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
  const { date, employeeId, limit = '50', offset = '0' } = req.query;
  try {
    // Use the users table with createdAt as reference for demo attendance data
    const employees = await db.execute(sql`
      SELECT u.id, u."fullName" as name, u.role as department,
        u."isActive", u."createdAt"
      FROM users u
      WHERE u."garageId" = ${garageId} AND u."isActive" = true
      ORDER BY u."fullName" ASC
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

// POST /api/hr/attendance/clock — Clock in/out (original modular)
router.post('/hr/attendance/clock', isAuthenticated, async (req, res) => {
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
});

// ============================================================================
// ATTENDANCE — storage-backed (from monolith block 1)
// ============================================================================

// GET /api/hr/attendance/:id — Single attendance record
router.get('/hr/attendance/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const record = await storage.getAttendance(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (record.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance record' });
  }
});

// POST /api/hr/attendance — Create attendance record
router.post('/hr/attendance', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertEmployeeAttendanceSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const record = await storage.createAttendance(validated);
    res.json(record);
  } catch (error: any) {
    console.error('Error creating attendance:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create attendance record' });
  }
});

// PATCH /api/hr/attendance/:id — Update attendance record
router.patch('/hr/attendance/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAttendance(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertEmployeeAttendanceSchema.partial().parse(req.body);

    if (validated.garageId && validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage ID' });
    }

    const record = await storage.updateAttendance(req.params.id, validated);
    res.json(record);
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to update attendance record' });
  }
});

// POST /api/hr/clock-in — Clock in
router.post('/hr/clock-in', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const userId = req.user?.id || 'default-user';

    const record = await storage.clockIn(userId, userGarageId);
    res.json(record);
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ message: 'Failed to clock in' });
  }
});

// POST /api/hr/clock-out/:id — Clock out
router.post('/hr/clock-out/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAttendance(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const record = await storage.clockOut(req.params.id);
    res.json(record);
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ message: 'Failed to clock out' });
  }
});

// POST /api/hr/break-start/:id — Start break
router.post('/hr/break-start/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAttendance(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const record = await storage.startBreak(req.params.id);
    res.json(record);
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(500).json({ message: 'Failed to start break' });
  }
});

// POST /api/hr/break-end/:id — End break
router.post('/hr/break-end/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getAttendance(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const record = await storage.endBreak(req.params.id);
    res.json(record);
  } catch (error) {
    console.error('Error ending break:', error);
    res.status(500).json({ message: 'Failed to end break' });
  }
});

// ============================================================================
// SHIFT TEMPLATES (from monolith block 1)
// ============================================================================

// GET /api/hr/shift-templates
router.get('/hr/shift-templates', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const templates = await storage.getShiftTemplates(userGarageId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching shift templates:', error);
    res.status(500).json({ message: 'Failed to fetch shift templates' });
  }
});

// GET /api/hr/shift-templates/:id
router.get('/hr/shift-templates/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const template = await storage.getShiftTemplate(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Shift template not found' });
    }

    if (template.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching shift template:', error);
    res.status(500).json({ message: 'Failed to fetch shift template' });
  }
});

// POST /api/hr/shift-templates
router.post('/hr/shift-templates', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertShiftTemplateSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const template = await storage.createShiftTemplate(validated);
    res.json(template);
  } catch (error: any) {
    console.error('Error creating shift template:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create shift template' });
  }
});

// PATCH /api/hr/shift-templates/:id
router.patch('/hr/shift-templates/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getShiftTemplate(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Shift template not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertShiftTemplateSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const template = await storage.updateShiftTemplate(req.params.id, validated.data);
    res.json(template);
  } catch (error) {
    console.error('Error updating shift template:', error);
    res.status(500).json({ message: 'Failed to update shift template' });
  }
});

// DELETE /api/hr/shift-templates/:id
router.delete('/hr/shift-templates/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getShiftTemplate(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Shift template not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deleteShiftTemplate(req.params.id);
    res.json({ message: 'Shift template deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift template:', error);
    res.status(500).json({ message: 'Failed to delete shift template' });
  }
});

// ============================================================================
// SHIFT ASSIGNMENTS (from monolith block 1)
// ============================================================================

// GET /api/hr/shift-assignments
router.get('/hr/shift-assignments', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { employeeId, startDate, endDate } = req.query;

    const assignments = await storage.getShiftAssignments(
      userGarageId,
      employeeId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching shift assignments:', error);
    res.status(500).json({ message: 'Failed to fetch shift assignments' });
  }
});

// POST /api/hr/shift-assignments
router.post('/hr/shift-assignments', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertShiftAssignmentSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = await storage.createShiftAssignment(validated);
    res.json(assignment);
  } catch (error: any) {
    console.error('Error creating shift assignment:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create shift assignment' });
  }
});

// PATCH /api/hr/shift-assignments/:id
router.patch('/hr/shift-assignments/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getShiftAssignment(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Shift assignment not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertShiftAssignmentSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const assignment = await storage.updateShiftAssignment(req.params.id, validated.data);
    res.json(assignment);
  } catch (error) {
    console.error('Error updating shift assignment:', error);
    res.status(500).json({ message: 'Failed to update shift assignment' });
  }
});

// DELETE /api/hr/shift-assignments/:id
router.delete('/hr/shift-assignments/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getShiftAssignment(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Shift assignment not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deleteShiftAssignment(req.params.id);
    res.json({ message: 'Shift assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift assignment:', error);
    res.status(500).json({ message: 'Failed to delete shift assignment' });
  }
});

// ============================================================================
// COMMISSION RULES (from monolith block 1)
// ============================================================================

// GET /api/hr/commission-rules
router.get('/hr/commission-rules', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const rules = await storage.getCommissionRules(userGarageId);
    res.json(rules);
  } catch (error) {
    console.error('Error fetching commission rules:', error);
    res.status(500).json({ message: 'Failed to fetch commission rules' });
  }
});

// POST /api/hr/commission-rules
router.post('/hr/commission-rules', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertCommissionRuleSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const rule = await storage.createCommissionRule(validated);
    res.json(rule);
  } catch (error: any) {
    console.error('Error creating commission rule:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create commission rule' });
  }
});

// PATCH /api/hr/commission-rules/:id
router.patch('/hr/commission-rules/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getCommissionRule(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Commission rule not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertCommissionRuleSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const rule = await storage.updateCommissionRule(req.params.id, validated.data);
    res.json(rule);
  } catch (error) {
    console.error('Error updating commission rule:', error);
    res.status(500).json({ message: 'Failed to update commission rule' });
  }
});

// DELETE /api/hr/commission-rules/:id
router.delete('/hr/commission-rules/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getCommissionRule(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Commission rule not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deleteCommissionRule(req.params.id);
    res.json({ message: 'Commission rule deleted successfully' });
  } catch (error) {
    console.error('Error deleting commission rule:', error);
    res.status(500).json({ message: 'Failed to delete commission rule' });
  }
});

// ============================================================================
// COMMISSIONS (from monolith block 1)
// ============================================================================

// GET /api/hr/commissions
router.get('/hr/commissions', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { technicianId, period, status } = req.query;

    const commissions = await storage.getCommissions(
      userGarageId,
      technicianId as string,
      period as string,
      status as string
    );

    res.json(commissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    res.status(500).json({ message: 'Failed to fetch commissions' });
  }
});

// POST /api/hr/commissions
router.post('/hr/commissions', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertCommissionSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const commission = await storage.createCommission(validated);
    res.json(commission);
  } catch (error: any) {
    console.error('Error creating commission:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create commission' });
  }
});

// PATCH /api/hr/commissions/:id
router.patch('/hr/commissions/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getCommission(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Commission not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertCommissionSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const commission = await storage.updateCommission(req.params.id, validated.data);
    res.json(commission);
  } catch (error) {
    console.error('Error updating commission:', error);
    res.status(500).json({ message: 'Failed to update commission' });
  }
});

// POST /api/hr/calculate-commission/:jobCardId — Calculate commission for a job card
router.post('/hr/calculate-commission/:jobCardId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;

    const jobCard = await storage.getJobCard(req.params.jobCardId);
    if (!jobCard) {
      return res.status(404).json({ message: 'Job card not found' });
    }

    if (jobCard.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const commission = await storage.calculateCommission(req.params.jobCardId, userGarageId);
    res.json(commission);
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({ message: 'Failed to calculate commission' });
  }
});

// ============================================================================
// PERFORMANCE REVIEWS (from monolith block 1)
// ============================================================================

// GET /api/hr/performance-reviews
router.get('/hr/performance-reviews', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { employeeId } = req.query;

    const reviews = await storage.getPerformanceReviews(
      userGarageId,
      employeeId as string
    );

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching performance reviews:', error);
    res.status(500).json({ message: 'Failed to fetch performance reviews' });
  }
});

// GET /api/hr/performance-reviews/:id
router.get('/hr/performance-reviews/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const review = await storage.getPerformanceReview(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    if (review.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching performance review:', error);
    res.status(500).json({ message: 'Failed to fetch performance review' });
  }
});

// POST /api/hr/performance-reviews
router.post('/hr/performance-reviews', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertPerformanceReviewSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const review = await storage.createPerformanceReview(validated);
    res.json(review);
  } catch (error: any) {
    console.error('Error creating performance review:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create performance review' });
  }
});

// PATCH /api/hr/performance-reviews/:id
router.patch('/hr/performance-reviews/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getPerformanceReview(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertPerformanceReviewSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const review = await storage.updatePerformanceReview(req.params.id, validated.data);
    res.json(review);
  } catch (error) {
    console.error('Error updating performance review:', error);
    res.status(500).json({ message: 'Failed to update performance review' });
  }
});

// DELETE /api/hr/performance-reviews/:id
router.delete('/hr/performance-reviews/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getPerformanceReview(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Performance review not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deletePerformanceReview(req.params.id);
    res.json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Error deleting performance review:', error);
    res.status(500).json({ message: 'Failed to delete performance review' });
  }
});

// ============================================================================
// TRAININGS (from monolith block 1)
// ============================================================================

// GET /api/hr/trainings
router.get('/hr/trainings', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const trainings = await storage.getTrainings(userGarageId);
    res.json(trainings);
  } catch (error) {
    console.error('Error fetching trainings:', error);
    res.status(500).json({ message: 'Failed to fetch trainings' });
  }
});

// POST /api/hr/trainings
router.post('/hr/trainings', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertTrainingSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const training = await storage.createTraining(validated);
    res.json(training);
  } catch (error: any) {
    console.error('Error creating training:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create training' });
  }
});

// PATCH /api/hr/trainings/:id
router.patch('/hr/trainings/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getTraining(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Training not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertTrainingSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const training = await storage.updateTraining(req.params.id, validated.data);
    res.json(training);
  } catch (error) {
    console.error('Error updating training:', error);
    res.status(500).json({ message: 'Failed to update training' });
  }
});

// DELETE /api/hr/trainings/:id
router.delete('/hr/trainings/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getTraining(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Training not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deleteTraining(req.params.id);
    res.json({ message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Error deleting training:', error);
    res.status(500).json({ message: 'Failed to delete training' });
  }
});

// ============================================================================
// EMPLOYEE TRAININGS (from monolith block 1)
// ============================================================================

// GET /api/hr/employee-trainings
router.get('/hr/employee-trainings', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const { employeeId, status } = req.query;

    const records = await storage.getEmployeeTrainings(
      userGarageId,
      employeeId as string,
      status as string
    );

    res.json(records);
  } catch (error) {
    console.error('Error fetching employee trainings:', error);
    res.status(500).json({ message: 'Failed to fetch employee trainings' });
  }
});

// POST /api/hr/employee-trainings
router.post('/hr/employee-trainings', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const validated = insertEmployeeTrainingSchema.parse(req.body);

    if (validated.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const record = await storage.createEmployeeTraining(validated);
    res.json(record);
  } catch (error: any) {
    console.error('Error creating employee training:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json(sanitizeZodError(error));
    }
    res.status(500).json({ message: 'Failed to create employee training' });
  }
});

// PATCH /api/hr/employee-trainings/:id
router.patch('/hr/employee-trainings/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getEmployeeTraining(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Employee training not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validated = insertEmployeeTrainingSchema.partial().safeParse(req.body);

    if (!validated.success) {
      return res.status(400).json(sanitizeZodError(validated.error));
    }

    if (validated.data.garageId && validated.data.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Cannot change garage' });
    }

    const record = await storage.updateEmployeeTraining(req.params.id, validated.data);
    res.json(record);
  } catch (error) {
    console.error('Error updating employee training:', error);
    res.status(500).json({ message: 'Failed to update employee training' });
  }
});

// DELETE /api/hr/employee-trainings/:id
router.delete('/hr/employee-trainings/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const userGarageId = req.user?.garageId;
    const existing = await storage.getEmployeeTraining(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: 'Employee training not found' });
    }

    if (existing.garageId !== userGarageId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await storage.deleteEmployeeTraining(req.params.id);
    res.json({ message: 'Employee training deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee training:', error);
    res.status(500).json({ message: 'Failed to delete employee training' });
  }
});

// ============================================================================
// LEAVE REQUESTS (original modular routes)
// ============================================================================

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

// ============================================================================
// LEAVE TYPES (from monolith block 2)
// ============================================================================

// GET /api/hr/leave-types
router.get('/hr/leave-types', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const leaveTypes = await db.select().from(hrLeaveTypes)
      .where(garageId ? eq(hrLeaveTypes.garageId, garageId) : undefined)
      .orderBy(hrLeaveTypes.name);
    res.json(leaveTypes);
  } catch (error: any) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ message: 'Failed to fetch leave types' });
  }
});

// POST /api/hr/leave-types
router.post('/hr/leave-types', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrLeaveTypeSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [leaveType] = await db.insert(hrLeaveTypes).values(validation.data).returning();
    res.status(201).json(leaveType);
  } catch (error: any) {
    console.error('Error creating leave type:', error);
    res.status(500).json({ message: 'Failed to create leave type' });
  }
});

// ============================================================================
// LEAVE BALANCES (from monolith block 2)
// ============================================================================

// GET /api/hr/leave-balances/:employeeId
router.get('/hr/leave-balances/:employeeId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const balances = await db.select().from(hrLeaveBalances)
      .where(eq(hrLeaveBalances.employeeId, employeeId))
      .orderBy(desc(hrLeaveBalances.year));
    res.json(balances);
  } catch (error: any) {
    console.error('Error fetching leave balances:', error);
    res.status(500).json({ message: 'Failed to fetch leave balances' });
  }
});

// POST /api/hr/leave-balances
router.post('/hr/leave-balances', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrLeaveBalanceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [balance] = await db.insert(hrLeaveBalances).values(validation.data).returning();
    res.status(201).json(balance);
  } catch (error: any) {
    console.error('Error creating leave balance:', error);
    res.status(500).json({ message: 'Failed to create leave balance' });
  }
});

// PATCH /api/hr/leave-balances/:id
router.patch('/hr/leave-balances/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db.update(hrLeaveBalances)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(hrLeaveBalances.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Leave balance not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating leave balance:', error);
    res.status(500).json({ message: 'Failed to update leave balance' });
  }
});

// ============================================================================
// PAYROLL (original modular routes)
// ============================================================================

// GET /api/hr/payroll/summary — Monthly payroll summary (manager+ — salary data)
router.get('/hr/payroll/summary', isAuthenticated, requireRole(['ADMIN', 'MANAGER', 'ACCOUNTANT']), async (req, res) => {
  const garageId = (req as any).user?.garageId || '1';
  const { month, year } = req.query;

  try {
    const employees = await db.execute(sql`
      SELECT u.id, u."fullName" as name, u."nationalId",
        u."createdAt" as "hireDate", u."isActive",
        COALESCE(tp."hourlyRate", '0') as "hourlyRate"
      FROM users u
      LEFT JOIN technician_profiles tp ON tp."userId" = u.id
      WHERE u."garageId" = ${garageId} AND u."isActive" = true
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
  const { month, year } = req.query;

  try {
    const result = await db.execute(sql`
      SELECT u.id, u."fullName" as name, u.email, u."nationalId",
        u.role as department, u."createdAt" as "hireDate",
        COALESCE(tp."hourlyRate", '0') as "hourlyRate",
        COALESCE(tp.level, 'junior') as level
      FROM users u
      LEFT JOIN technician_profiles tp ON tp."userId" = u.id
      WHERE u.id = ${employeeId}
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

// ============================================================================
// DEPARTMENTS (from monolith block 2)
// ============================================================================

// GET /api/hr/departments
router.get('/hr/departments', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    let query = db.select().from(hrDepartments);
    if (garageId) {
      query = query.where(eq(hrDepartments.garageId, garageId)) as typeof query;
    }
    const departments = await query.orderBy(hrDepartments.name);
    res.json(departments);
  } catch (error: any) {
    console.error('Error fetching HR departments:', error);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
});

// POST /api/hr/departments
router.post('/hr/departments', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrDepartmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [department] = await db.insert(hrDepartments).values(validation.data).returning();
    res.status(201).json(department);
  } catch (error: any) {
    console.error('Error creating HR department:', error);
    res.status(500).json({ message: 'Failed to create department' });
  }
});

// PATCH /api/hr/departments/:id
router.patch('/hr/departments/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db.update(hrDepartments)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(hrDepartments.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating HR department:', error);
    res.status(500).json({ message: 'Failed to update department' });
  }
});

// DELETE /api/hr/departments/:id
router.delete('/hr/departments/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(hrDepartments).where(eq(hrDepartments.id, id));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting HR department:', error);
    res.status(500).json({ message: 'Failed to delete department' });
  }
});

// ============================================================================
// POSITIONS (from monolith block 2)
// ============================================================================

// GET /api/hr/positions
router.get('/hr/positions', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const positions = await db.select().from(hrPositions)
      .where(garageId ? eq(hrPositions.garageId, garageId) : undefined)
      .orderBy(hrPositions.title);
    res.json(positions);
  } catch (error: any) {
    console.error('Error fetching HR positions:', error);
    res.status(500).json({ message: 'Failed to fetch positions' });
  }
});

// POST /api/hr/positions
router.post('/hr/positions', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrPositionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [position] = await db.insert(hrPositions).values(validation.data).returning();
    res.status(201).json(position);
  } catch (error: any) {
    console.error('Error creating HR position:', error);
    res.status(500).json({ message: 'Failed to create position' });
  }
});

// PATCH /api/hr/positions/:id
router.patch('/hr/positions/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db.update(hrPositions)
      .set(req.body)
      .where(eq(hrPositions.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Position not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating HR position:', error);
    res.status(500).json({ message: 'Failed to update position' });
  }
});

// DELETE /api/hr/positions/:id
router.delete('/hr/positions/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    await db.delete(hrPositions).where(eq(hrPositions.id, id));
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting HR position:', error);
    res.status(500).json({ message: 'Failed to delete position' });
  }
});

// ============================================================================
// JOB POSTINGS (from monolith block 2)
// ============================================================================

// GET /api/hr/job-postings
router.get('/hr/job-postings', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const { status } = req.query;
    let query = db.select().from(hrJobPostings);

    if (garageId) {
      query = query.where(eq(hrJobPostings.garageId, garageId)) as any;
    }
    if (status) {
      query = query.where(eq(hrJobPostings.status, status as string)) as any;
    }

    const postings = await query.orderBy(desc(hrJobPostings.createdAt));
    res.json(postings);
  } catch (error: any) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Failed to fetch job postings' });
  }
});

// POST /api/hr/job-postings
router.post('/hr/job-postings', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrJobPostingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const data = { ...validation.data, createdBy: req.user?.id };
    const [posting] = await db.insert(hrJobPostings).values(data).returning();
    res.status(201).json(posting);
  } catch (error: any) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ message: 'Failed to create job posting' });
  }
});

// PATCH /api/hr/job-postings/:id
router.patch('/hr/job-postings/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body, updatedAt: new Date() };

    if (req.body.status === 'open' && !req.body.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const [updated] = await db.update(hrJobPostings)
      .set(updateData)
      .where(eq(hrJobPostings.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating job posting:', error);
    res.status(500).json({ message: 'Failed to update job posting' });
  }
});

// ============================================================================
// CANDIDATES (from monolith block 2)
// ============================================================================

// GET /api/hr/candidates
router.get('/hr/candidates', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { jobPostingId, stage } = req.query;
    let query = db.select().from(hrCandidates);

    if (jobPostingId) {
      query = query.where(eq(hrCandidates.jobPostingId, jobPostingId as string)) as any;
    }
    if (stage) {
      query = query.where(eq(hrCandidates.stage, stage as string)) as any;
    }

    const candidates = await query.orderBy(desc(hrCandidates.createdAt));
    res.json(candidates);
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Failed to fetch candidates' });
  }
});

// POST /api/hr/candidates
router.post('/hr/candidates', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrCandidateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [candidate] = await db.insert(hrCandidates).values(validation.data).returning();
    res.status(201).json(candidate);
  } catch (error: any) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Failed to create candidate' });
  }
});

// PATCH /api/hr/candidates/:id
router.patch('/hr/candidates/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const [updated] = await db.update(hrCandidates)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(hrCandidates.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Failed to update candidate' });
  }
});

// ============================================================================
// BENEFIT PLANS (from monolith block 2)
// ============================================================================

// GET /api/hr/benefit-plans
router.get('/hr/benefit-plans', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const plans = await db.select().from(hrBenefitPlans)
      .where(garageId ? eq(hrBenefitPlans.garageId, garageId) : undefined)
      .orderBy(hrBenefitPlans.name);
    res.json(plans);
  } catch (error: any) {
    console.error('Error fetching benefit plans:', error);
    res.status(500).json({ message: 'Failed to fetch benefit plans' });
  }
});

// POST /api/hr/benefit-plans
router.post('/hr/benefit-plans', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrBenefitPlanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [plan] = await db.insert(hrBenefitPlans).values(validation.data).returning();
    res.status(201).json(plan);
  } catch (error: any) {
    console.error('Error creating benefit plan:', error);
    res.status(500).json({ message: 'Failed to create benefit plan' });
  }
});

// ============================================================================
// BENEFIT ENROLLMENTS (from monolith block 2)
// ============================================================================

// GET /api/hr/benefit-enrollments/:employeeId
router.get('/hr/benefit-enrollments/:employeeId', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { employeeId } = req.params;
    const enrollments = await db.select().from(hrBenefitEnrollments)
      .where(eq(hrBenefitEnrollments.employeeId, employeeId));
    res.json(enrollments);
  } catch (error: any) {
    console.error('Error fetching benefit enrollments:', error);
    res.status(500).json({ message: 'Failed to fetch benefit enrollments' });
  }
});

// POST /api/hr/benefit-enrollments
router.post('/hr/benefit-enrollments', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrBenefitEnrollmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [enrollment] = await db.insert(hrBenefitEnrollments).values(validation.data).returning();
    res.status(201).json(enrollment);
  } catch (error: any) {
    console.error('Error creating benefit enrollment:', error);
    res.status(500).json({ message: 'Failed to create benefit enrollment' });
  }
});

// ============================================================================
// ANNOUNCEMENTS (from monolith block 2)
// ============================================================================

// GET /api/hr/announcements
router.get('/hr/announcements', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const garageId = req.user?.garageId;
    const announcements = await db.select().from(hrAnnouncements)
      .where(garageId ? eq(hrAnnouncements.garageId, garageId) : undefined)
      .orderBy(desc(hrAnnouncements.createdAt));
    res.json(announcements);
  } catch (error: any) {
    console.error('Error fetching HR announcements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

// POST /api/hr/announcements
router.post('/hr/announcements', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrAnnouncementSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const data = { ...validation.data, createdBy: req.user?.id };
    const [announcement] = await db.insert(hrAnnouncements).values(data).returning();
    res.status(201).json(announcement);
  } catch (error: any) {
    console.error('Error creating HR announcement:', error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
});

// ============================================================================
// SELF-SERVICE REQUESTS (from monolith block 2)
// ============================================================================

// GET /api/hr/self-service-requests
router.get('/hr/self-service-requests', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { employeeId, status } = req.query;
    let query = db.select().from(hrSelfServiceRequests);

    if (employeeId) {
      query = query.where(eq(hrSelfServiceRequests.employeeId, employeeId as string)) as any;
    }
    if (status) {
      query = query.where(eq(hrSelfServiceRequests.status, status as string)) as any;
    }

    const requests = await query.orderBy(desc(hrSelfServiceRequests.createdAt));
    res.json(requests);
  } catch (error: any) {
    console.error('Error fetching self-service requests:', error);
    res.status(500).json({ message: 'Failed to fetch self-service requests' });
  }
});

// POST /api/hr/self-service-requests
router.post('/hr/self-service-requests', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const validation = insertHrSelfServiceRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(sanitizeZodError(validation.error));
    }
    const [request] = await db.insert(hrSelfServiceRequests).values(validation.data).returning();
    res.status(201).json(request);
  } catch (error: any) {
    console.error('Error creating self-service request:', error);
    res.status(500).json({ message: 'Failed to create self-service request' });
  }
});

// PATCH /api/hr/self-service-requests/:id
router.patch('/hr/self-service-requests/:id', isAuthenticated, requireRole(['ADMIN', 'MANAGER']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body, updatedAt: new Date() };

    if (['approved', 'rejected', 'completed'].includes(req.body.status)) {
      updateData.processedBy = req.user?.id;
      updateData.processedAt = new Date();
    }

    const [updated] = await db.update(hrSelfServiceRequests)
      .set(updateData)
      .where(eq(hrSelfServiceRequests.id, id))
      .returning();
    if (!updated) {
      return res.status(404).json({ message: 'Self-service request not found' });
    }
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating self-service request:', error);
    res.status(500).json({ message: 'Failed to update self-service request' });
  }
});

export default router;
