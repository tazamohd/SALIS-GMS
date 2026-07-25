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
