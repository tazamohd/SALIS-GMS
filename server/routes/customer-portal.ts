import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// GET /api/portal/vehicles/:customerId - Customer's vehicles
router.get('/portal/vehicles/:customerId', async (req, res) => {
  try {
    const vehicles = await db.execute(sql`
      SELECT id, make, model, year, "licensePlate", vin, color, "currentMileage"
      FROM vehicles WHERE "customerId" = ${req.params.customerId}
      ORDER BY make, model
    `);
    res.json({ vehicles: vehicles.rows || [] });
  } catch (e) { res.json({ vehicles: [] }); }
});

// GET /api/portal/jobs/:customerId - Customer's job history
router.get('/portal/jobs/:customerId', async (req, res) => {
  try {
    const jobs = await db.execute(sql`
      SELECT j.id, j."jobNumber", j.status, j.description, j."totalCost",
        j."createdAt", j."completedAt", v.make, v.model, v."licensePlate"
      FROM job_cards j
      LEFT JOIN vehicles v ON v.id = j."vehicleId"
      WHERE j."customerId" = ${req.params.customerId}
      ORDER BY j."createdAt" DESC
    `);
    res.json({ jobs: jobs.rows || [] });
  } catch (e) { res.json({ jobs: [] }); }
});

// GET /api/portal/invoices/:customerId - Customer's invoices
router.get('/portal/invoices/:customerId', async (req, res) => {
  try {
    const invoices = await db.execute(sql`
      SELECT id, "invoiceNumber", status, "totalAmount", "taxAmount",
        "invoiceDate", "dueDate"
      FROM invoices WHERE "customerId" = ${req.params.customerId}
      ORDER BY "invoiceDate" DESC
    `);
    res.json({ invoices: invoices.rows || [] });
  } catch (e) { res.json({ invoices: [] }); }
});

// POST /api/portal/appointments - Book appointment
router.post('/portal/appointments', async (req, res) => {
  const { customerId, vehicleId, serviceType, preferredDate, preferredTime, notes } = req.body;
  try {
    const result = await db.execute(sql`
      INSERT INTO appointments ("customerId", "vehicleId", "serviceType", "scheduledDate", "scheduledTime", notes, status, "createdAt")
      VALUES (${customerId}, ${vehicleId}, ${serviceType}, ${preferredDate}, ${preferredTime}, ${notes}, 'requested', NOW())
      RETURNING id, status
    `);
    res.json({ success: true, appointment: result.rows?.[0] });
  } catch (e) {
    res.json({ success: false, message: 'Failed to book appointment' });
  }
});

// GET /api/portal/appointments/:customerId - Customer's appointments
router.get('/portal/appointments/:customerId', async (req, res) => {
  try {
    const appointments = await db.execute(sql`
      SELECT a.id, a."serviceType", a."scheduledDate", a."scheduledTime", a.status, a.notes,
        v.make, v.model, v."licensePlate"
      FROM appointments a
      LEFT JOIN vehicles v ON v.id = a."vehicleId"
      WHERE a."customerId" = ${req.params.customerId}
      ORDER BY a."scheduledDate" DESC
    `);
    res.json({ appointments: appointments.rows || [] });
  } catch (e) { res.json({ appointments: [] }); }
});

// GET /api/portal/service-history/:vehicleId - Vehicle service history
router.get('/portal/service-history/:vehicleId', async (req, res) => {
  try {
    const history = await db.execute(sql`
      SELECT j.id, j."jobNumber", j.description, j.status, j."totalCost",
        j."createdAt", j."completedAt"
      FROM job_cards j
      WHERE j."vehicleId" = ${req.params.vehicleId}
      ORDER BY j."createdAt" DESC
    `);
    res.json({ history: history.rows || [] });
  } catch (e) { res.json({ history: [] }); }
});

export default router;
