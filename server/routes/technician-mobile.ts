import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// GET /api/technician/my-jobs/:techId - Technician's assigned jobs
router.get('/technician/my-jobs/:techId', async (req, res) => {
  try {
    const jobs = await db.execute(sql`
      SELECT j.id, j."jobNumber", j.status, j.description, j.priority, j."estimatedHours",
        j."totalCost", j."createdAt", v.make, v.model, v."licensePlate", v.year,
        u."fullName" as "customerName", u.phone as "customerPhone"
      FROM job_cards j
      LEFT JOIN vehicles v ON v.id = j."vehicleId"
      LEFT JOIN users u ON u.id = j."customerId"
      WHERE j."assignedTechnicianId" = ${req.params.techId}
      ORDER BY
        CASE j.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        j."createdAt" DESC
    `);
    res.json({ jobs: jobs.rows || [] });
  } catch (e) { res.json({ jobs: [] }); }
});

// POST /api/technician/clock - Clock in/out
router.post('/technician/clock', async (req, res) => {
  const { technicianId, action, timestamp } = req.body;
  try {
    await db.execute(sql`
      INSERT INTO attendance ("userId", "clockIn", "clockOut", date, "garageId")
      VALUES (${technicianId},
        ${action === 'in' ? timestamp : null},
        ${action === 'out' ? timestamp : null},
        CURRENT_DATE,
        (SELECT "garageId" FROM users WHERE id = ${technicianId})
      )
    `);
    res.json({ success: true, action, timestamp });
  } catch (e) {
    res.json({ success: false, message: 'Clock action failed' });
  }
});

// POST /api/technician/job-update - Update job status/notes
router.post('/technician/job-update', async (req, res) => {
  const { jobId, status, notes, technicianId } = req.body;
  try {
    await db.execute(sql`
      UPDATE job_cards SET status = ${status}, notes = COALESCE(notes, '') || E'\n' || ${notes || ''},
        "updatedAt" = NOW()
      WHERE id = ${jobId} AND "assignedTechnicianId" = ${technicianId}
    `);
    res.json({ success: true });
  } catch (e) { res.json({ success: false }); }
});

// POST /api/technician/parts-request - Request parts for a job
router.post('/technician/parts-request', async (req, res) => {
  const { jobId, technicianId, partName, quantity, urgency, notes } = req.body;
  res.json({
    success: true,
    request: { id: Date.now().toString(), jobId, partName, quantity, urgency, status: 'pending', createdAt: new Date().toISOString() }
  });
});

// GET /api/technician/stats/:techId - Technician performance stats
router.get('/technician/stats/:techId', async (req, res) => {
  try {
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) as "totalJobs",
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as "completedJobs",
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as "activeJobs",
        COALESCE(AVG(CASE WHEN status = 'completed' AND "completedAt" IS NOT NULL
          THEN EXTRACT(EPOCH FROM ("completedAt" - "createdAt"))/3600 END), 0) as "avgHoursPerJob"
      FROM job_cards WHERE "assignedTechnicianId" = ${req.params.techId}
    `);
    res.json({ stats: stats.rows?.[0] || { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  } catch (e) {
    res.json({ stats: { totalJobs: 0, completedJobs: 0, activeJobs: 0, avgHoursPerJob: 0 } });
  }
});

export default router;
