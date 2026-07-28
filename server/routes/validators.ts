/**
 * Request validation helpers
 *
 * Provides safe body validation for PATCH/PUT endpoints to prevent
 * mass assignment of protected fields like `id`, `createdAt`, `garageId`.
 */

import { z, ZodSchema } from 'zod';

const PROTECTED_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'created_at',
  'updated_at',
  'garageId',
  'garage_id',
  'ownerId',
  'owner_id',
  'userId', // userId is usually from URL params, not body
];

/**
 * Validate a PATCH/PUT body against a Zod schema.
 * - Strips protected fields automatically
 * - Returns sanitized data or sends 400 response
 *
 * Usage:
 *   const result = validatePatchBody(req, res, schema);
 *   if (!result.ok) return; // response already sent
 *   // use result.data
 */
export function validatePatchBody<T extends ZodSchema>(
  req: any,
  res: any,
  schema: T
): { ok: true; data: z.infer<T> } | { ok: false } {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ message: 'Request body must be a JSON object' });
    return { ok: false };
  }

  // Strip protected fields before validation
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (!PROTECTED_FIELDS.includes(key)) {
      sanitized[key] = value;
    }
  }

  const result = schema.safeParse(sanitized);
  if (!result.success) {
    res.status(400).json({
      message: 'Invalid request body',
      errors: result.error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return { ok: false };
  }

  return { ok: true, data: result.data };
}

/**
 * Common schemas for PATCH endpoints
 */
export const updateTechnicianProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  specializations: z.array(z.string()).max(20).optional(),
  certifications: z.array(z.string()).max(20).optional(),
  hourlyRate: z.number().positive().max(1000).optional(),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  available: z.boolean().optional(),
  profileImageUrl: z.string().url().max(500).optional(),
}).strict();

export const updateJobCardSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  // Enum aligned with the values create/seed actually produce (`pending`,
  // `medium`) so the PUT path accepts real job cards, and the status-change
  // timestamps the client sends are allowed instead of rejected by .strict().
  status: z.enum(['pending', 'open', 'in_progress', 'awaiting_parts', 'completed', 'cancelled', 'on_hold']).optional(),
  priority: z.enum(['low', 'normal', 'medium', 'high', 'urgent']).optional(),
  estimatedHours: z.number().positive().max(500).optional(),
  actualHours: z.number().nonnegative().max(500).optional(),
  notes: z.string().max(5000).optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
}).strict();

export const updateCustomerSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const updateVehicleSchema = z.object({
  make: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  color: z.string().max(50).optional(),
  licensePlate: z.string().max(20).optional(),
  mileage: z.number().int().nonnegative().optional(),
  vin: z.string().length(17).optional(),
}).strict();

export const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactPerson: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  paymentTerms: z.string().max(200).optional(),
  website: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const updateEstimateSchema = z.object({
  status: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'expired']).optional(),
  totalAmount: z.number().nonnegative().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded']).optional(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
}).strict();

// Phase 6: Safety Incidents
// Matches server/phase6-compliance-service.ts createSafetyIncident signature
export const createSafetyIncidentSchema = z.object({
  incidentNumber: z.string().min(1).max(100),
  incidentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  incidentType: z.enum(['injury', 'near-miss', 'property-damage', 'equipment-failure', 'spill']),
  severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
  location: z.string().min(1).max(500),
  description: z.string().min(10).max(5000),
  injuredPerson: z.string().max(200).optional(),
  witnessNames: z.array(z.string().max(200)).max(50).optional(),
  reportedBy: z.string().min(1).max(200),
  immediateAction: z.string().min(1).max(5000),
  photos: z.array(z.string().url().max(1000)).max(50).optional(),
  oshaRecordable: z.boolean().optional(),
  medicalTreatment: z.boolean().optional(),
  lostWorkDays: z.number().int().min(0).max(365).optional(),
}).strict();

export const updateSafetyIncidentSchema = z.object({
  status: z.enum(['reported', 'investigating', 'resolved', 'closed']).optional(),
  rootCause: z.string().max(5000).optional(),
  correctiveAction: z.string().max(5000).optional(),
  preventiveMeasures: z.string().max(5000).optional(),
  resolvedAt: z.string().datetime().optional(),
  oshaRecordable: z.boolean().optional(),
  medicalTreatment: z.boolean().optional(),
  lostWorkDays: z.number().int().min(0).max(365).optional(),
}).strict();

// Phase 6: Insurance Claims
// Matches server/phase6-compliance-service.ts createInsuranceClaim signature
export const createInsuranceClaimSchema = z.object({
  claimNumber: z.string().min(1).max(100),
  jobCardId: z.string().optional(),
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  insuranceCompany: z.string().min(1).max(200),
  policyNumber: z.string().min(1).max(100),
  claimType: z.enum(['collision', 'comprehensive', 'liability', 'warranty']),
  incidentDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  claimAmount: z.string().min(1).max(50),
  deductible: z.string().max(50).optional(),
  adjusterName: z.string().max(200).optional(),
  adjusterPhone: z.string().max(50).optional(),
  description: z.string().min(10).max(5000),
  documents: z.array(z.string().url().max(1000)).max(50).optional(),
}).strict();

export const updateInsuranceClaimSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'approved', 'denied', 'paid', 'closed']).optional(),
  approvedAmount: z.string().max(50).optional(),
  denialReason: z.string().max(2000).optional(),
  adjusterName: z.string().max(200).optional(),
  adjusterPhone: z.string().max(50).optional(),
  notes: z.string().max(5000).optional(),
}).strict();

// Phase 6: Environmental Compliance Records
export const createEnvironmentalRecordSchema = z.object({
  category: z.enum(['waste', 'emissions', 'water', 'hazardous', 'recycling']),
  recordDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1).max(50),
  disposalMethod: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const updateEnvironmentalRecordSchema = z.object({
  category: z.enum(['waste', 'emissions', 'water', 'hazardous', 'recycling']).optional(),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().min(1).max(50).optional(),
  disposalMethod: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

// ISO 9001 Quality Records
export const createQualityRecordSchema = z.object({
  standard: z.string().min(1).max(50), // ISO 9001, IATF 16949, AS9100
  auditDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  auditor: z.string().max(200).optional(),
  findings: z.string().min(10).max(5000),
  nonConformities: z.number().int().min(0).default(0),
  status: z.enum(['open', 'in_progress', 'closed']).default('open'),
  correctiveActions: z.string().max(5000).optional(),
}).strict();

export const updateQualityRecordSchema = z.object({
  findings: z.string().min(10).max(5000).optional(),
  nonConformities: z.number().int().min(0).optional(),
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  correctiveActions: z.string().max(5000).optional(),
}).strict();

// External Integrations: Stripe Payments
export const createPaymentIntentSchema = z.object({
  amount: z.number().int().min(50).max(99999999), // Stripe minimum: $0.50 USD
  currency: z.enum(['usd', 'eur', 'sar', 'aed', 'egp']).default('sar'),
  invoiceId: z.string().min(1).max(100),
  customerId: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string().max(100), z.string().max(500)).optional(),
}).strict();

export const createRefundSchema = z.object({
  paymentIntentId: z.string().min(1).max(200),
  amount: z.number().int().min(50).optional(), // If omitted, full refund
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).default('requested_by_customer'),
}).strict();

// External Integrations: Twilio SMS
export const sendSmsSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be E.164 format (e.g., +966XXXXXXXXX)'),
  body: z.string().min(1).max(1600), // Twilio SMS limit
  from: z.string().regex(/^\+[1-9]\d{6,14}$/).optional(),
}).strict();

// External Integrations: OpenAI
export const openAiChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1).max(32000),
  })).min(1).max(100),
  model: z.string().max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(32000).optional(),
  stream: z.boolean().optional(),
}).strict();

export const openAiCompletionSchema = z.object({
  prompt: z.string().min(1).max(32000),
  model: z.string().max(100).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(32000).optional(),
}).strict();

// External Integrations: PayPal
export const paypalOrderSchema = z.object({
  intent: z.enum(['CAPTURE', 'AUTHORIZE']).default('CAPTURE'),
  purchaseUnits: z.array(z.object({
    referenceId: z.string().max(256).optional(),
    amount: z.object({
      currencyCode: z.string().length(3),
      value: z.string().regex(/^\d+\.\d{2}$/, 'Must be a decimal string with 2 places'),
    }),
    description: z.string().max(127).optional(),
  })).min(1).max(10),
  applicationContext: z.object({
    returnUrl: z.string().url(),
    cancelUrl: z.string().url(),
    brandName: z.string().max(127).optional(),
  }).optional(),
}).strict();

// Chatbot / AI endpoints
const chatbotVehicleInfoSchema = z.object({
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1886).max(new Date().getFullYear() + 1).optional(),
  mileage: z.number().int().min(0).max(2_000_000).optional(),
  vin: z.string().min(5).max(32).optional(),
}).strict();

export const chatbotMessageSchema = z.object({
  conversationId: z.string().min(1).max(100),
  message: z.string().min(1).max(4000),
  vehicleInfo: chatbotVehicleInfoSchema.optional(),
}).strict();

export const chatbotDiagnoseSchema = z.object({
  symptoms: z.string().min(3).max(2000),
  vehicleId: z.string().optional(),
}).strict();

export const chatbotBookingIntentSchema = z.object({
  message: z.string().min(1).max(4000),
}).strict();

export const chatbotConversationSchema = z.object({
  customerId: z.string().min(1).max(100).optional(),
  sessionId: z.string().min(1).max(100).optional(),
  context: z.string().max(1000).optional(),
}).strict();

// Saudi Tax (ZATCA Phase 2 / Fatoora e-invoicing)
// A Saudi VAT registration number is exactly 15 digits and always begins with 3.
const zatcaVatNumber = z
  .string()
  .regex(/^3\d{14}$/, 'VAT registration number must be 15 digits starting with 3');

export const zatcaInvoiceSchema = z.object({
  sellerName: z.string().min(1).max(300),
  vatRegistrationNumber: zatcaVatNumber,
  timestamp: z.string().datetime(),
  // Zero is valid — a free service still clears through FATOORA.
  totalWithVAT: z.number().nonnegative(),
  vatAmount: z.number().nonnegative(),
}).strict();

export const zatcaComplianceCheckSchema = z.object({
  sellerName: z.string().min(1).max(300),
  vatRegistrationNumber: zatcaVatNumber,
  timestamp: z.string().datetime(),
  invoiceTotal: z.number().nonnegative(),
  vatAmount: z.number().nonnegative(),
}).strict();
