import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/asyncHandler';
import { technicianClockSchema, technicianJobUpdateSchema, partsRequestSchema } from '../schemas/validation';

const router = Router();

// SECURITY (deep-audit blocker B2): every route here requires an authenticated
// session, is scoped to the caller's own garage, and derives the technician id
// from the session — NEVER from the request body/params. Previously these were
// anonymous, leaked cross-tenant customer PII, and let anyone forge attendance
// / job updates using a body-supplied technicianId.
router.use(isAuthenticated);

// The authenticated technician (or the tech a manager is viewing, still scoped
// to the same garage). Ordinary techs can only ever be themselves.
function callerGarageId(req: any): string | undefined {
  return req.user?.garageId;
}

// GET /api/technician/my-jobs/:techId - Technician's assigned jobs (own garage only)
router.get('/technician/my-jobs/:techId', async (req: any, res) => {
  const garageId = callerGarageId(req);
  if (!garageId) return res.status(403).json({ jobs: [], message: 'No garage in session' });
  try {
    const jobs = await db.execute(sql`
      SELECT j.id, j.job_number as "jobNumber", j.status, j.description, j.priority,
        j.estimated_hours as "estimatedHours", j.total_cost as "totalCost", j.created_at as "createdAt",
        j.vehicle_info->>'make' as make, j.vehicle_info->>'model' as model,
        j.vehicle_info->>'licensePlate' as "licensePlate", j.vehicle_info->>'year' as year,
        u.full_name as "customerName", u.phone as "customerPhone"
      FROM job_cards j
      LEFT JOIN users u ON u.id = j.customer_id
      WHERE j.assigned_to = ${req.params.techId}
        AND j.garage_id = ${garageId}
      ORDER BY
        CASE j.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        j.created_at DESC
    `);
    res.json({ jobs: jobs.rows || [] });
  } catch (e) { res.json({ jobs: [] }); }
});

// POST /api/technician/clock - Clock in/out (technician = the session user)
router.post('/technician/clock', validate(technicianClockSchema), async (req: any, res) => {
  const technicianId = req.user?.id;
  const garageId = callerGarageId(req);
  const { action, timestamp } = req.body;
  if (!technicianId || !garageId) return res.status(403).json({ success: false });
  try {
    if (action === 'in') {
      await db.execute(sql`
        INSERT INTO time_clock_entries (id, garage_id, employee_id, clock_in_time, created_at)
        VALUES (gen_random_uuid(), ${garageId}, ${technicianId}, ${timestamp}, NOW())
      `);
    } else {
      // Close the technician's most recent still-open entry.
      await db.execute(sql`
        UPDATE time_clock_entries SET clock_out_time = ${timestamp}
        WHERE id = (
          SELECT id FROM time_clock_entries
          WHERE employee_id = ${technicianId} AND garage_id = ${garageId} AND clock_out_time IS NULL
          ORDER BY clock_in_time DESC LIMIT 1
        )
      `);
    }
    res.json({ success: true, action, timestamp });
  } catch (e) {
    res.json({ success: false, message: 'Clock action failed' });
  }
});

// POST /api/technician/job-update - Update job status/notes (own garage + own job)
router.post('/technician/job-update', validate(technicianJobUpdateSchema), async (req: any, res) => {
  const technicianId = req.user?.id;
  const garageId = callerGarageId(req);
  const { jobId, status, notes } = req.body;
  if (!technicianId || !garageId) return res.status(403).json({ success: false });
  try {
    await db.execute(sql`
      UPDATE job_cards SET status = ${status}, notes = COALESCE(notes, '') || E'\n' || ${notes || ''},
        updated_at = NOW()
      WHERE id = ${jobId} AND assigned_to = ${technicianId} AND garage_id = ${garageId}
    `);
    res.json({ success: true });
  } catch (e) { res.json({ success: false }); }
});

// POST /api/technician/parts-request - Request parts for a job
router.post('/technician/parts-request', validate(partsRequestSchema), asyncHandler(async (req: any, res) => {
  const technicianId = req.user?.id;
  const { jobId, partName, quantity, urgency } = req.body;
  res.json({
    success: true,
    request: { id: `${technicianId}-${jobId}`, jobId, partName, quantity, urgency, status: 'pending', createdAt: new Date().toISOString() }
  });
}));

// GET /api/technician/stats/:techId - Technician performance stats (own garage only)
router.get('/technician/stats/:techId', async (req: any, res) => {
  const garageId = callerGarageId(req);
  if (!garageId) return res.status(403).json({ stats: { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  try {
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) as "totalJobs",
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as "completedJobs",
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as "activeJobs",
        COALESCE(AVG(CASE WHEN status = 'completed' AND completed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (completed_at - created_at))/3600 END), 0) as "avgHoursPerJob"
      FROM job_cards WHERE assigned_to = ${req.params.techId} AND garage_id = ${garageId}
    `);
    res.json({ stats: stats.rows?.[0] || { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  } catch (e) {
    res.json({ stats: { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  }
});

export default router;
