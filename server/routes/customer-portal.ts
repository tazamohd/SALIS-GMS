import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { validate } from '../middleware/validate';
import { bookAppointmentSchema } from '../schemas/validation';
import { isAuthenticated } from '../auth';

const router = Router();

/**
 * Customer self-service portal.
 *
 * Two hard rules applied to every route:
 *  - A customer-role caller only ever sees their own records — the
 *    :customerId path segment is overridden by the session id (IDOR guard).
 *    Staff can look up any customer, but only within their own garage.
 *  - Every query is written against the real snake_case columns. The
 *    original file used camelCase identifiers that do not exist, so each
 *    handler threw and its catch silently served an empty list.
 */
function resolvePortalScope(req: any): { customerId: string; garageId: string | null } | null {
  const user = req.user;
  if (!user) return null;
  const isCustomer = user.userType === 'customer' || String(user.role).toUpperCase() === 'CUSTOMER';
  return {
    customerId: isCustomer ? user.id : req.params.customerId,
    garageId: user.garageId ?? null,
  };
}

// GET /api/portal/vehicles/:customerId - Customer's vehicles
router.get('/portal/vehicles/:customerId', isAuthenticated, async (req, res) => {
  try {
    const scope = resolvePortalScope(req);
    if (!scope) return res.status(401).json({ vehicles: [] });
    const vehicles = await db.execute(sql`
      SELECT id, make, model, year,
        license_plate AS "licensePlate", vin, color, mileage
      FROM vehicles
      WHERE customer_id = ${scope.customerId}
        AND (${scope.garageId}::uuid IS NULL OR garage_id = ${scope.garageId}::uuid)
      ORDER BY make, model
    `);
    res.json({ vehicles: vehicles.rows || [] });
  } catch (e) {
    console.error('portal vehicles error:', e);
    res.status(500).json({ vehicles: [] });
  }
});

// GET /api/portal/jobs/:customerId - Customer's job history
router.get('/portal/jobs/:customerId', isAuthenticated, async (req, res) => {
  try {
    const scope = resolvePortalScope(req);
    if (!scope) return res.status(401).json({ jobs: [] });
    // job_cards keeps the vehicle as a jsonb snapshot, not a FK.
    const jobs = await db.execute(sql`
      SELECT j.id, j.job_number AS "jobNumber", j.status, j.description,
        j.total_cost AS "totalCost", j.created_at AS "createdAt",
        j.completed_at AS "completedAt",
        j.vehicle_info->>'make' AS make,
        j.vehicle_info->>'model' AS model,
        j.vehicle_info->>'licensePlate' AS "licensePlate"
      FROM job_cards j
      WHERE j.customer_id = ${scope.customerId}
        AND (${scope.garageId}::uuid IS NULL OR j.garage_id = ${scope.garageId}::uuid)
      ORDER BY j.created_at DESC
    `);
    res.json({ jobs: jobs.rows || [] });
  } catch (e) {
    console.error('portal jobs error:', e);
    res.status(500).json({ jobs: [] });
  }
});

// GET /api/portal/invoices/:customerId - Customer's invoices
router.get('/portal/invoices/:customerId', isAuthenticated, async (req, res) => {
  try {
    const scope = resolvePortalScope(req);
    if (!scope) return res.status(401).json({ invoices: [] });
    const invoices = await db.execute(sql`
      SELECT id, invoice_number AS "invoiceNumber", status,
        total_amount AS "totalAmount", tax_amount AS "taxAmount",
        invoice_date AS "invoiceDate", due_date AS "dueDate"
      FROM invoices
      WHERE customer_id = ${scope.customerId}
        AND (${scope.garageId}::uuid IS NULL OR garage_id = ${scope.garageId}::uuid)
      ORDER BY invoice_date DESC
    `);
    res.json({ invoices: invoices.rows || [] });
  } catch (e) {
    console.error('portal invoices error:', e);
    res.status(500).json({ invoices: [] });
  }
});

// POST /api/portal/appointments - Book appointment
router.post('/portal/appointments', isAuthenticated, validate(bookAppointmentSchema), async (req, res) => {
  const { vehicleId, serviceType, preferredDate, preferredTime, notes } = req.body;
  try {
    const user = (req as any).user;
    const isCustomer = user.userType === 'customer' || String(user.role).toUpperCase() === 'CUSTOMER';
    // The booking always belongs to the session customer, never a body id.
    const customerId = isCustomer ? user.id : req.body.customerId;
    const garageId = user.garageId;
    if (!garageId) {
      return res.status(403).json({ success: false, message: 'No garage associated' });
    }

    // appointments requires garage_id, an appointment_number, customer_name,
    // vehicle_info (jsonb snapshot), a timestamp appointment_date and
    // created_by — none of which the old insert supplied.
    const result = await db.execute(sql`
      INSERT INTO appointments (
        appointment_number, garage_id, customer_id, customer_name,
        vehicle_info, service_type, description, appointment_date,
        status, notes, created_by
      )
      SELECT
        'APT-' || to_char(NOW(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 8),
        ${garageId}::uuid,
        ${customerId},
        COALESCE(u.full_name, 'Portal customer'),
        COALESCE((
          SELECT jsonb_build_object(
            'make', v.make, 'model', v.model, 'year', v.year,
            'licensePlate', v.license_plate, 'vin', v.vin)
          FROM vehicles v WHERE v.id = ${vehicleId ?? null}::uuid
        ), '{}'::jsonb),
        ${serviceType},
        COALESCE(${notes ?? null}, ${serviceType}),
        (${preferredDate} || ' ' || COALESCE(${preferredTime ?? null}, '09:00'))::timestamp,
        'requested',
        ${notes ?? null},
        ${customerId}
      FROM users u WHERE u.id = ${customerId}
      RETURNING id, status
    `);
    res.status(201).json({ success: true, appointment: result.rows?.[0] });
  } catch (e) {
    console.error('portal booking error:', e);
    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
});

// GET /api/portal/appointments/:customerId - Customer's appointments
router.get('/portal/appointments/:customerId', isAuthenticated, async (req, res) => {
  try {
    const scope = resolvePortalScope(req);
    if (!scope) return res.status(401).json({ appointments: [] });
    const appointments = await db.execute(sql`
      SELECT a.id, a.service_type AS "serviceType",
        a.appointment_date AS "scheduledDate", a.status, a.notes,
        a.vehicle_info->>'make' AS make,
        a.vehicle_info->>'model' AS model,
        a.vehicle_info->>'licensePlate' AS "licensePlate"
      FROM appointments a
      WHERE a.customer_id = ${scope.customerId}
        AND (${scope.garageId}::uuid IS NULL OR a.garage_id = ${scope.garageId}::uuid)
      ORDER BY a.appointment_date DESC
    `);
    res.json({ appointments: appointments.rows || [] });
  } catch (e) {
    console.error('portal appointments error:', e);
    res.status(500).json({ appointments: [] });
  }
});

// GET /api/portal/service-history/:vehicleId - Vehicle service history
router.get('/portal/service-history/:vehicleId', isAuthenticated, async (req, res) => {
  try {
    const user = (req as any).user;
    const isCustomer = user?.userType === 'customer' || String(user?.role).toUpperCase() === 'CUSTOMER';
    // The vehicle is matched into job_cards by VIN (the snapshot has no FK);
    // a customer-role caller must also own the vehicle.
    const history = await db.execute(sql`
      SELECT j.id, j.job_number AS "jobNumber", j.description, j.status,
        j.total_cost AS "totalCost", j.created_at AS "createdAt",
        j.completed_at AS "completedAt"
      FROM job_cards j
      JOIN vehicles v ON v.id = ${req.params.vehicleId}::uuid
        AND j.vehicle_info->>'vin' = v.vin
      WHERE (${user?.garageId ?? null}::uuid IS NULL OR j.garage_id = ${user?.garageId ?? null}::uuid)
        AND (${isCustomer ? user.id : null}::varchar IS NULL OR v.customer_id = ${isCustomer ? user.id : null}::varchar)
      ORDER BY j.created_at DESC
    `);
    res.json({ history: history.rows || [] });
  } catch (e) {
    console.error('portal service history error:', e);
    res.status(500).json({ history: [] });
  }
});

export default router;
