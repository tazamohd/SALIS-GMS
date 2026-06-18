import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// ─── Service catalog (config — kept in-memory) ──────────────────────────

interface KioskService {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  estimatedDurationMinutes: number;
  priceRangeMin: number;
  priceRangeMax: number;
  currency: string;
  popular: boolean;
}

const services: KioskService[] = [
  { id: 'svc-1', name: 'Oil Change', nameAr: 'تغيير الزيت', category: 'Maintenance', estimatedDurationMinutes: 30, priceRangeMin: 80, priceRangeMax: 200, currency: 'SAR', popular: true },
  { id: 'svc-2', name: 'Brake Inspection & Repair', nameAr: 'فحص وإصلاح الفرامل', category: 'Repair', estimatedDurationMinutes: 60, priceRangeMin: 150, priceRangeMax: 600, currency: 'SAR', popular: true },
  { id: 'svc-3', name: 'Tire Rotation & Balancing', nameAr: 'تدوير وموازنة الإطارات', category: 'Maintenance', estimatedDurationMinutes: 45, priceRangeMin: 100, priceRangeMax: 250, currency: 'SAR', popular: true },
  { id: 'svc-4', name: 'AC Service', nameAr: 'خدمة المكيف', category: 'Repair', estimatedDurationMinutes: 90, priceRangeMin: 200, priceRangeMax: 500, currency: 'SAR', popular: true },
  { id: 'svc-5', name: 'Battery Check & Replacement', nameAr: 'فحص واستبدال البطارية', category: 'Maintenance', estimatedDurationMinutes: 20, priceRangeMin: 50, priceRangeMax: 350, currency: 'SAR', popular: false },
  { id: 'svc-6', name: 'Engine Diagnostics', nameAr: 'تشخيص المحرك', category: 'Diagnostics', estimatedDurationMinutes: 60, priceRangeMin: 150, priceRangeMax: 400, currency: 'SAR', popular: false },
  { id: 'svc-7', name: 'Full Vehicle Inspection', nameAr: 'فحص شامل للمركبة', category: 'Diagnostics', estimatedDurationMinutes: 120, priceRangeMin: 250, priceRangeMax: 500, currency: 'SAR', popular: false },
  { id: 'svc-8', name: 'Wheel Alignment', nameAr: 'ترصيص الإطارات', category: 'Maintenance', estimatedDurationMinutes: 45, priceRangeMin: 120, priceRangeMax: 300, currency: 'SAR', popular: false },
  { id: 'svc-9', name: 'Suspension Repair', nameAr: 'إصلاح نظام التعليق', category: 'Repair', estimatedDurationMinutes: 120, priceRangeMin: 300, priceRangeMax: 1200, currency: 'SAR', popular: false },
  { id: 'svc-10', name: 'Car Wash & Detailing', nameAr: 'غسيل وتلميع السيارة', category: 'Cosmetic', estimatedDurationMinutes: 60, priceRangeMin: 50, priceRangeMax: 300, currency: 'SAR', popular: true },
];

// ─── Appointment lookup ───────────────────────────────────────────────────

// Active appointment statuses a customer can check in against (excludes
// completed / cancelled / no_show). Mirrors the schema's status vocabulary.
const ACTIVE_APPOINTMENT_STATUSES = new Set(["scheduled", "confirmed", "in_progress"]);

const digitsOnly = (s: unknown) => String(s ?? "").replace(/\D/g, "");
const normalizePlate = (s: unknown) => String(s ?? "").replace(/\s+/g, "").toLowerCase();

// Find an active appointment by customer phone or vehicle plate. The
// appointments table denormalizes customerName/customerPhone and a vehicleInfo
// jsonb ({make, model, year, licensePlate}), so no joins are needed. Phone
// matching follows the existing /api/kiosk/lookup-customer convention
// (digit-only, bidirectional substring); plate matching is exact on the
// normalized value. Single-tenant like the rest of this kiosk module.
async function findAppointmentForCheckIn(phone?: string, plateNumber?: string) {
  const wantPhone = phone ? digitsOnly(phone) : "";
  const wantPlate = plateNumber ? normalizePlate(plateNumber) : "";

  const all = await storage.getAppointments();
  const matches = all.filter((apt: any) => {
    if (apt.status && !ACTIVE_APPOINTMENT_STATUSES.has(apt.status)) return false;
    if (wantPhone) {
      const aptPhone = digitsOnly(apt.customerPhone);
      if (aptPhone && (aptPhone.includes(wantPhone) || wantPhone.includes(aptPhone))) return true;
    }
    if (wantPlate) {
      const plate = normalizePlate(apt.vehicleInfo?.licensePlate);
      if (plate && plate === wantPlate) return true;
    }
    return false;
  });
  if (matches.length === 0) return null;

  // Prefer the soonest upcoming appointment; fall back to the most recent.
  matches.sort(
    (a: any, b: any) =>
      new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(),
  );
  const now = Date.now();
  const apt: any =
    matches.find((a: any) => new Date(a.appointmentDate).getTime() >= now) ??
    matches[matches.length - 1];

  const vi = apt.vehicleInfo ?? {};
  return {
    id: apt.id,
    customerName: apt.customerName,
    phone: apt.customerPhone,
    vehiclePlate: vi.licensePlate ?? "",
    vehicleInfo: [vi.year, vi.make, vi.model].filter(Boolean).join(" ").trim(),
    serviceType: apt.serviceType,
    scheduledTime: new Date(apt.appointmentDate).toLocaleString(),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

// Compute position + estimated wait for waiting tickets. Pure function over
// the loaded row set — no DB mutation needed.
function withQueuePositions(tickets: any[]) {
  const waiting = tickets
    .filter(t => t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const enriched = new Map<string, { position: number; estimatedWaitMinutes: number }>();
  let avgServiceTime = 30;
  waiting.forEach((t, idx) => {
    enriched.set(t.id, {
      position: idx + 1,
      estimatedWaitMinutes: (idx + 1) * avgServiceTime,
    });
    const svc = services.find(s => s.name === t.serviceType);
    if (svc) avgServiceTime = svc.estimatedDurationMinutes;
  });
  return tickets.map(t => ({
    ...t,
    position: enriched.get(t.id)?.position ?? 0,
    estimatedWaitMinutes: enriched.get(t.id)?.estimatedWaitMinutes ?? 0,
  }));
}

function viewTicket(t: any) {
  return {
    ticketId: t.id,
    ticketNumber: t.ticketNumber,
    customerName: t.customerName,
    phone: t.phone,
    vehiclePlate: t.vehiclePlate,
    vehicleInfo: t.vehicleInfo,
    serviceType: t.serviceType,
    status: t.status,
    position: t.position,
    estimatedWaitMinutes: t.estimatedWaitMinutes,
    type: t.type,
    appointmentId: t.appointmentId,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
    updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────

// POST /api/kiosk/check-in — Customer check-in by phone number or plate number
router.post('/kiosk/check-in', async (req, res) => {
  const { phone, plateNumber } = req.body;

  if (!phone && !plateNumber) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a phone number or plate number',
    });
  }

  const appointment = await findAppointmentForCheckIn(phone, plateNumber);

  if (!appointment) {
    return res.json({
      success: false,
      found: false,
      message: 'No appointment found. Would you like to register as a walk-in?',
    });
  }

  try {
    const existing = await storage.findKioskTicketByAppointment(appointment.id);
    if (existing) {
      const all = await storage.listKioskTickets({ statuses: ['waiting', 'in-progress'] });
      const enriched = withQueuePositions(all).find((t: any) => t.id === existing.id) || existing;
      return res.json({
        success: true,
        alreadyCheckedIn: true,
        ticket: viewTicket(enriched),
        message: 'You are already checked in',
      });
    }

    const ticketNumber = await storage.getNextKioskTicketNumber();
    const created = await storage.createKioskTicket({
      ticketNumber,
      customerName: appointment.customerName,
      phone: appointment.phone,
      vehiclePlate: appointment.vehiclePlate,
      vehicleInfo: appointment.vehicleInfo,
      serviceType: appointment.serviceType,
      status: 'waiting',
      type: 'appointment',
      appointmentId: appointment.id,
    });

    const all = await storage.listKioskTickets({ statuses: ['waiting', 'in-progress'] });
    const enriched = withQueuePositions(all).find((t: any) => t.id === created.id) || created;

    res.json({
      success: true,
      found: true,
      ticket: viewTicket(enriched),
      appointment: {
        id: appointment.id,
        customerName: appointment.customerName,
        vehiclePlate: appointment.vehiclePlate,
        vehicleInfo: appointment.vehicleInfo,
        serviceType: appointment.serviceType,
        scheduledTime: appointment.scheduledTime,
      },
      message: `Welcome ${appointment.customerName}! You have been checked in.`,
    });
  } catch (err) {
    console.error('Kiosk check-in error:', err);
    res.status(500).json({ success: false, message: 'Check-in failed' });
  }
});

// GET /api/kiosk/queue — Current service queue
router.get('/kiosk/queue', async (_req, res) => {
  try {
    const all = await storage.listKioskTickets();
    const active = withQueuePositions(all).filter((t: any) => t.status === 'waiting' || t.status === 'in-progress');
    const inProgress = all.filter((t: any) => t.status === 'in-progress').length;
    const waiting = all.filter((t: any) => t.status === 'waiting').length;
    const completedToday = all.filter((t: any) => t.status === 'completed').length;

    res.json({
      queue: active.map((t: any) => ({
        ticketId: t.id,
        ticketNumber: t.ticketNumber,
        customerName: t.customerName,
        serviceType: t.serviceType,
        status: t.status,
        position: t.position,
        estimatedWaitMinutes: t.estimatedWaitMinutes,
        type: t.type,
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      })),
      summary: {
        inProgress,
        waiting,
        completedToday,
        totalInQueue: inProgress + waiting,
        averageWaitMinutes: waiting > 0
          ? Math.round(active.reduce((sum: number, t: any) => sum + (t.estimatedWaitMinutes ?? 0), 0) / Math.max(waiting, 1))
          : 0,
      },
    });
  } catch (err) {
    console.error('Kiosk queue error:', err);
    res.status(500).json({ error: 'Failed to load queue' });
  }
});

// POST /api/kiosk/walk-in — Register walk-in customer
router.post('/kiosk/walk-in', async (req, res) => {
  const { name, phone, vehiclePlate, vehicleInfo, serviceType } = req.body;

  if (!name || !phone || !vehiclePlate || !serviceType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, phone, vehicle plate, and service type',
    });
  }

  try {
    const existing = await storage.findActiveKioskTicketByPhone(phone);
    if (existing) {
      const all = await storage.listKioskTickets({ statuses: ['waiting', 'in-progress'] });
      const enriched = withQueuePositions(all).find((t: any) => t.id === existing.id) || existing;
      return res.json({
        success: true,
        alreadyInQueue: true,
        ticket: viewTicket(enriched),
        message: 'You already have an active ticket in the queue',
      });
    }

    const ticketNumber = await storage.getNextKioskTicketNumber();
    const created = await storage.createKioskTicket({
      ticketNumber,
      customerName: name,
      phone,
      vehiclePlate,
      vehicleInfo: vehicleInfo || '',
      serviceType,
      status: 'waiting',
      type: 'walk-in',
    });

    const all = await storage.listKioskTickets({ statuses: ['waiting', 'in-progress'] });
    const enriched = withQueuePositions(all).find((t: any) => t.id === created.id) || created;

    res.json({
      success: true,
      ticket: viewTicket(enriched),
      message: `Thank you ${name}! Your ticket number is ${enriched.ticketNumber}. Estimated wait: ${enriched.estimatedWaitMinutes} minutes.`,
    });
  } catch (err) {
    console.error('Kiosk walk-in error:', err);
    res.status(500).json({ success: false, message: 'Walk-in registration failed' });
  }
});

// GET /api/kiosk/status/:ticketId — Job status check for customer
router.get('/kiosk/status/:ticketId', async (req, res) => {
  const { ticketId } = req.params;

  try {
    let ticket = await storage.getKioskTicket(ticketId);
    if (!ticket) {
      ticket = await storage.getKioskTicketByNumber(ticketId);
    }

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const all = await storage.listKioskTickets();
    const enriched = withQueuePositions(all).find((t: any) => t.id === ticket!.id) || ticket;

    const statusMessages: Record<string, string> = {
      'waiting': `You are #${enriched.position} in queue. Estimated wait: ${enriched.estimatedWaitMinutes} minutes.`,
      'in-progress': 'Your vehicle is currently being serviced.',
      'completed': 'Your service is complete! Please proceed to the front desk.',
      'cancelled': 'This ticket has been cancelled.',
    };

    res.json({
      success: true,
      ticket: viewTicket(enriched),
      message: statusMessages[enriched.status as string] || 'Status unknown',
    });
  } catch (err) {
    console.error('Kiosk status error:', err);
    res.status(500).json({ success: false, message: 'Failed to load ticket status' });
  }
});

// GET /api/kiosk/services — Available services with estimated duration and price range
router.get('/kiosk/services', (_req, res) => {
  res.json({
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      nameAr: s.nameAr,
      category: s.category,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      priceRange: `${s.priceRangeMin} - ${s.priceRangeMax} ${s.currency}`,
      priceRangeMin: s.priceRangeMin,
      priceRangeMax: s.priceRangeMax,
      currency: s.currency,
      popular: s.popular,
    })),
    categories: [...new Set(services.map(s => s.category))],
  });
});

export default router;
