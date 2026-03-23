import { Router } from 'express';

const router = Router();

// ─── In-Memory Storage ───────────────────────────────────────────────────────

interface KioskTicket {
  ticketId: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  vehiclePlate: string;
  vehicleInfo: string;
  serviceType: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  position: number;
  estimatedWaitMinutes: number;
  type: 'appointment' | 'walk-in';
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

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

// Demo appointment data (simulates existing bookings)
const demoAppointments = [
  { id: 'appt-101', customerName: 'Ahmed Al-Rashid', phone: '0501234567', vehiclePlate: 'ABC 1234', vehicleInfo: '2022 Toyota Camry', serviceType: 'Oil Change', scheduledTime: '10:00 AM' },
  { id: 'appt-102', customerName: 'Fatima Hassan', phone: '0559876543', vehiclePlate: 'XYZ 5678', vehicleInfo: '2021 Hyundai Sonata', serviceType: 'Brake Inspection & Repair', scheduledTime: '10:30 AM' },
  { id: 'appt-103', customerName: 'Omar Khalid', phone: '0541112233', vehiclePlate: 'KSA 9012', vehicleInfo: '2023 Nissan Patrol', serviceType: 'AC Service', scheduledTime: '11:00 AM' },
  { id: 'appt-104', customerName: 'Sara Al-Qahtani', phone: '0567778899', vehiclePlate: 'RYD 3456', vehicleInfo: '2020 Honda Accord', serviceType: 'Tire Rotation & Balancing', scheduledTime: '11:30 AM' },
];

let ticketCounter = 1000;
const queue: KioskTicket[] = [
  {
    ticketId: 'tkt-0001',
    ticketNumber: 'Q-0997',
    customerName: 'Khalid Bin Saleh',
    phone: '0509998877',
    vehiclePlate: 'JED 7890',
    vehicleInfo: '2021 Kia Sportage',
    serviceType: 'Engine Diagnostics',
    status: 'in-progress',
    position: 0,
    estimatedWaitMinutes: 0,
    type: 'appointment',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    ticketId: 'tkt-0002',
    ticketNumber: 'Q-0998',
    customerName: 'Nora Al-Shammari',
    phone: '0531234000',
    vehiclePlate: 'DMM 2345',
    vehicleInfo: '2022 Chevrolet Tahoe',
    serviceType: 'Oil Change',
    status: 'waiting',
    position: 1,
    estimatedWaitMinutes: 15,
    type: 'walk-in',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    ticketId: 'tkt-0003',
    ticketNumber: 'Q-0999',
    customerName: 'Yousef Al-Harbi',
    phone: '0545556677',
    vehiclePlate: 'MKH 6789',
    vehicleInfo: '2023 Ford Explorer',
    serviceType: 'Tire Rotation & Balancing',
    status: 'waiting',
    position: 2,
    estimatedWaitMinutes: 40,
    type: 'appointment',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
];

function generateTicketNumber(): string {
  ticketCounter++;
  return `Q-${String(ticketCounter).padStart(4, '0')}`;
}

function generateId(): string {
  return `tkt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

function recalculatePositions(): void {
  const waitingTickets = queue.filter(t => t.status === 'waiting');
  waitingTickets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  let avgServiceTime = 30; // minutes per vehicle
  waitingTickets.forEach((ticket, idx) => {
    ticket.position = idx + 1;
    ticket.estimatedWaitMinutes = (idx + 1) * avgServiceTime;
    const svc = services.find(s => s.name === ticket.serviceType);
    if (svc) {
      avgServiceTime = svc.estimatedDurationMinutes;
    }
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/kiosk/check-in — Customer check-in by phone number or plate number
router.post('/kiosk/check-in', (req, res) => {
  const { phone, plateNumber } = req.body;

  if (!phone && !plateNumber) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a phone number or plate number',
    });
  }

  // Look up in demo appointments
  const appointment = demoAppointments.find(a => {
    if (phone) return a.phone === phone.replace(/\s+/g, '');
    if (plateNumber) return a.vehiclePlate.replace(/\s+/g, '').toLowerCase() === plateNumber.replace(/\s+/g, '').toLowerCase();
    return false;
  });

  if (!appointment) {
    return res.json({
      success: false,
      found: false,
      message: 'No appointment found. Would you like to register as a walk-in?',
    });
  }

  // Check if already checked in
  const existing = queue.find(t => t.appointmentId === appointment.id);
  if (existing) {
    return res.json({
      success: true,
      alreadyCheckedIn: true,
      ticket: existing,
      message: 'You are already checked in',
    });
  }

  // Create queue ticket
  const ticket: KioskTicket = {
    ticketId: generateId(),
    ticketNumber: generateTicketNumber(),
    customerName: appointment.customerName,
    phone: appointment.phone,
    vehiclePlate: appointment.vehiclePlate,
    vehicleInfo: appointment.vehicleInfo,
    serviceType: appointment.serviceType,
    status: 'waiting',
    position: 0,
    estimatedWaitMinutes: 0,
    type: 'appointment',
    appointmentId: appointment.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  queue.push(ticket);
  recalculatePositions();

  res.json({
    success: true,
    found: true,
    ticket,
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
});

// GET /api/kiosk/queue — Current service queue
router.get('/kiosk/queue', (_req, res) => {
  recalculatePositions();
  const activeQueue = queue.filter(t => t.status === 'waiting' || t.status === 'in-progress');
  const inProgress = queue.filter(t => t.status === 'in-progress').length;
  const waiting = queue.filter(t => t.status === 'waiting').length;
  const completedToday = queue.filter(t => t.status === 'completed').length;

  res.json({
    queue: activeQueue.map(t => ({
      ticketId: t.ticketId,
      ticketNumber: t.ticketNumber,
      customerName: t.customerName,
      serviceType: t.serviceType,
      status: t.status,
      position: t.position,
      estimatedWaitMinutes: t.estimatedWaitMinutes,
      type: t.type,
      createdAt: t.createdAt,
    })),
    summary: {
      inProgress,
      waiting,
      completedToday,
      totalInQueue: inProgress + waiting,
      averageWaitMinutes: waiting > 0 ? Math.round(activeQueue.reduce((sum, t) => sum + t.estimatedWaitMinutes, 0) / Math.max(waiting, 1)) : 0,
    },
  });
});

// POST /api/kiosk/walk-in — Register walk-in customer
router.post('/kiosk/walk-in', (req, res) => {
  const { name, phone, vehiclePlate, vehicleInfo, serviceType } = req.body;

  if (!name || !phone || !vehiclePlate || !serviceType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, phone, vehicle plate, and service type',
    });
  }

  // Check if already in queue with same phone
  const existing = queue.find(t => t.phone === phone && (t.status === 'waiting' || t.status === 'in-progress'));
  if (existing) {
    return res.json({
      success: true,
      alreadyInQueue: true,
      ticket: existing,
      message: 'You already have an active ticket in the queue',
    });
  }

  const ticket: KioskTicket = {
    ticketId: generateId(),
    ticketNumber: generateTicketNumber(),
    customerName: name,
    phone,
    vehiclePlate,
    vehicleInfo: vehicleInfo || '',
    serviceType,
    status: 'waiting',
    position: 0,
    estimatedWaitMinutes: 0,
    type: 'walk-in',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  queue.push(ticket);
  recalculatePositions();

  res.json({
    success: true,
    ticket,
    message: `Thank you ${name}! Your ticket number is ${ticket.ticketNumber}. Estimated wait: ${ticket.estimatedWaitMinutes} minutes.`,
  });
});

// GET /api/kiosk/status/:ticketId — Job status check for customer
router.get('/kiosk/status/:ticketId', (req, res) => {
  const { ticketId } = req.params;

  const ticket = queue.find(t => t.ticketId === ticketId || t.ticketNumber === ticketId);

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: 'Ticket not found',
    });
  }

  recalculatePositions();

  const statusMessages: Record<string, string> = {
    'waiting': `You are #${ticket.position} in queue. Estimated wait: ${ticket.estimatedWaitMinutes} minutes.`,
    'in-progress': 'Your vehicle is currently being serviced.',
    'completed': 'Your service is complete! Please proceed to the front desk.',
    'cancelled': 'This ticket has been cancelled.',
  };

  res.json({
    success: true,
    ticket: {
      ticketId: ticket.ticketId,
      ticketNumber: ticket.ticketNumber,
      customerName: ticket.customerName,
      vehiclePlate: ticket.vehiclePlate,
      vehicleInfo: ticket.vehicleInfo,
      serviceType: ticket.serviceType,
      status: ticket.status,
      position: ticket.position,
      estimatedWaitMinutes: ticket.estimatedWaitMinutes,
      type: ticket.type,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    },
    message: statusMessages[ticket.status] || 'Status unknown',
  });
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
