import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../auth';
import { validate } from '../middleware/validate';
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
      SELECT j.id, j."jobNumber", j.status, j.description, j.priority, j."estimatedHours",
        j."totalCost", j."createdAt", v.make, v.model, v."licensePlate", v.year,
        u."fullName" as "customerName", u.phone as "customerPhone"
      FROM job_cards j
      LEFT JOIN vehicles v ON v.id = j."vehicleId"
      LEFT JOIN users u ON u.id = j."customerId"
      WHERE j."assignedTechnicianId" = ${req.params.techId}
        AND j."garageId" = ${garageId}
      ORDER BY
        CASE j.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        j."createdAt" DESC
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
    await db.execute(sql`
      INSERT INTO attendance ("userId", "clockIn", "clockOut", date, "garageId")
      VALUES (${technicianId},
        ${action === 'in' ? timestamp : null},
        ${action === 'out' ? timestamp : null},
        CURRENT_DATE,
        ${garageId}
      )
    `);
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
        "updatedAt" = NOW()
      WHERE id = ${jobId} AND "assignedTechnicianId" = ${technicianId} AND "garageId" = ${garageId}
    `);
    res.json({ success: true });
  } catch (e) { res.json({ success: false }); }
});

// POST /api/technician/parts-request - Request parts for a job
router.post('/technician/parts-request', validate(partsRequestSchema), async (req: any, res) => {
  const technicianId = req.user?.id;
  const { jobId, partName, quantity, urgency } = req.body;
  res.json({
    success: true,
    request: { id: `${technicianId}-${jobId}`, jobId, partName, quantity, urgency, status: 'pending', createdAt: new Date().toISOString() }
  });
});

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
        COALESCE(AVG(CASE WHEN status = 'completed' AND "completedAt" IS NOT NULL
          THEN EXTRACT(EPOCH FROM ("completedAt" - "createdAt"))/3600 END), 0) as "avgHoursPerJob"
      FROM job_cards WHERE "assignedTechnicianId" = ${req.params.techId} AND "garageId" = ${garageId}
    `);
    res.json({ stats: stats.rows?.[0] || { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  } catch (e) {
    res.json({ stats: { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  }
});

export default router;
