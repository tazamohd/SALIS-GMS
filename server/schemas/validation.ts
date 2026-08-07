import { z } from 'zod';

// Auth
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Job Card transitions
export const jobTransitionSchema = z.object({
  targetStatus: z.enum(['pending', 'assigned', 'in_progress', 'qc_review', 'completed', 'invoiced', 'delivered', 'closed', 'cancelled']),
  notes: z.string().optional(),
  userId: z.string().optional(),
  userRole: z.string().optional(),
});

// Appointment check-in
export const appointmentCheckInSchema = z.object({
  notes: z.string().optional(),
  mileage: z.number().positive().optional(),
});

// Appointment booking (customer portal)
export const bookAppointmentSchema = z.object({
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  serviceType: z.string().min(1),
  preferredDate: z.string().min(1),
  preferredTime: z.string().min(1),
  notes: z.string().optional(),
});

// Technician clock in/out
export const technicianClockSchema = z.object({
  technicianId: z.string().min(1),
  action: z.enum(['in', 'out']),
  timestamp: z.string().min(1),
});

// Technician job update
export const technicianJobUpdateSchema = z.object({
  jobId: z.string().min(1),
  status: z.string().min(1),
  notes: z.string().optional(),
  technicianId: z.string().min(1),
});

// Parts request
export const partsRequestSchema = z.object({
  jobId: z.string().min(1),
  technicianId: z.string().min(1),
  partName: z.string().min(1),
  quantity: z.number().int().positive(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  notes: z.string().optional(),
});

// Scheduling optimize
export const scheduleOptimizeSchema = z.object({
  technicians: z.array(z.object({
    id: z.string(),
    name: z.string(),
    skills: z.array(z.string()),
    currentLoad: z.number(),
    maxLoad: z.number(),
    availability: z.boolean(),
    efficiency: z.number().min(0).max(1),
  })).optional(),
  jobs: z.array(z.object({
    id: z.string(),
    type: z.string(),
    requiredSkills: z.array(z.string()),
    estimatedHours: z.number(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    vehicleInfo: z.string().optional(),
  })).optional(),
});

// Notification preferences
export const notificationPreferencesSchema = z.object({
  preferences: z.record(z.object({
    inApp: z.boolean(),
    sms: z.boolean(),
    email: z.boolean(),
  })),
});

// Parts recommendations
export const partsRecommendationSchema = z.object({
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  serviceType: z.string().optional(),
  description: z.string().optional(),
});

// Invoice ZATCA validation
export const zatcaValidateSchema = z.object({
  invoiceId: z.string().min(1).optional(),
});

// Inventory check
export const inventoryCheckSchema = z.object({
  garageId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Sprint 5 — data-integrity: conservative body validation for select mutations.
// Each schema requires ONLY the fields the handler treats as mandatory
// (dereferenced without a fallback / gated by an explicit `if (!field)` guard),
// marks the rest optional, and uses .passthrough() so extra/unknown fields sent
// by existing clients are preserved unchanged.
// ---------------------------------------------------------------------------

// POST /api/warranty/contracts — server/routes/warranty.ts
// Handler guard: `if (!customerName || !vehicleName || !planType || !startDate || !endDate)`
export const createWarrantyContractSchema = z.object({
  customerName: z.string().min(1),
  vehicleName: z.string().min(1),
  planType: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  licensePlate: z.string().optional(),
  coverageType: z.string().optional(),
}).passthrough();

// POST /api/fleet/accounts — server/routes/fleet.ts
// Handler guard: `if (!companyName)`. All other fields use `|| default` fallbacks.
export const createFleetAccountSchema = z.object({
  companyName: z.string().min(1),
  contactPerson: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

// POST /api/qc/inspections — server/routes/quality-control.ts
// Handler guard: `if (!jobCardRef || !vehicleInfo || !serviceType)`
export const createQcInspectionSchema = z.object({
  jobCardRef: z.string().min(1),
  vehicleInfo: z.string().min(1),
  serviceType: z.string().min(1),
  inspector: z.string().optional(),
  inspectorId: z.string().optional(),
  checklistId: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

// POST /api/hr/leave-requests — server/routes/hr-payroll.ts
// Handler guard: `if (!employeeId || !type || !startDate || !endDate)`.
// employeeId is coerced via String(employeeId), so a numeric id is also valid.
export const createLeaveRequestSchema = z.object({
  employeeId: z.union([z.string(), z.number()]),
  type: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  employeeName: z.string().optional(),
  reason: z.string().optional(),
}).passthrough();

// POST /api/crm/loyalty/points — server/routes/crm.ts
// Handler guard: `if (!customerId || !points)`. points is coerced via Number(points),
// so a numeric string is also valid; customerId is echoed back untouched.
export const awardLoyaltyPointsSchema = z.object({
  customerId: z.union([z.string(), z.number()]),
  points: z.union([z.number(), z.string()]),
  reason: z.string().optional(),
}).passthrough();
