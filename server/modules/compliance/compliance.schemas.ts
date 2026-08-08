/**
 * Compliance module Zod schemas (Phase E). The environmental-compliance record
 * schema, relocated verbatim from the monolith (`server/routes.ts`). The
 * policy / audit / task insert schemas come from `@shared/schema` and are used
 * directly at the controller boundary.
 */

import { z } from 'zod';

export const complianceRecordSchema = z.object({
  complianceType: z.enum(['waste-disposal', 'emissions', 'safety-inspection', 'environmental-permit']),
  recordDate: z.string(),
  wasteType: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  disposalMethod: z.string().optional(),
  disposalCompany: z.string().optional(),
  certificationNumber: z.string().optional(),
  cost: z.string().optional(),
  regulatoryStandard: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type ComplianceRecordInput = z.infer<typeof complianceRecordSchema>;
