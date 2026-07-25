/**
 * Tests for Phase 6 Compliance validators
 *
 * Safety incidents, insurance claims, environmental records, ISO 9001 quality records
 */

import { describe, it, expect } from 'vitest';
import {
  createSafetyIncidentSchema,
  updateSafetyIncidentSchema,
  createInsuranceClaimSchema,
  updateInsuranceClaimSchema,
  createEnvironmentalRecordSchema,
  updateEnvironmentalRecordSchema,
  createQualityRecordSchema,
  updateQualityRecordSchema,
} from '../validators';

function validate(schema: any, body: any) {
  return schema.safeParse(body);
}

describe('createSafetyIncidentSchema', () => {
  it('accepts valid safety incident', () => {
    const result = validate(createSafetyIncidentSchema, {
      incidentNumber: 'INC-2026-001',
      incidentDate: '2026-06-27T10:00:00Z',
      incidentType: 'injury',
      severity: 'moderate',
      location: 'Service Bay 2',
      description: 'Customer slipped on oil in the service bay',
      reportedBy: 'Tech 1',
      immediateAction: 'Cleaned up spill and warned customers',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = validate(createSafetyIncidentSchema, { description: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid severity enum', () => {
    const result = validate(createSafetyIncidentSchema, {
      incidentNumber: 'INC-001',
      incidentDate: '2026-06-27',
      incidentType: 'injury',
      severity: 'extreme',
      location: 'Service Bay',
      description: 'Test description here',
      reportedBy: 'Tech 1',
      immediateAction: 'Cleaned up',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short incident numbers', () => {
    const result = validate(createSafetyIncidentSchema, {
      incidentNumber: '',
      incidentDate: '2026-06-27',
      incidentType: 'injury',
      severity: 'minor',
      location: 'Service Bay',
      description: 'Test description here',
      reportedBy: 'Tech 1',
      immediateAction: 'Cleaned up',
    });
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 5000 chars', () => {
    const result = validate(createSafetyIncidentSchema, {
      incidentNumber: 'INC-001',
      incidentDate: '2026-06-27',
      incidentType: 'injury',
      severity: 'minor',
      location: 'Service Bay',
      description: 'a'.repeat(5001),
      reportedBy: 'Tech 1',
      immediateAction: 'Cleaned up',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateSafetyIncidentSchema', () => {
  it('accepts partial update', () => {
    const result = validate(updateSafetyIncidentSchema, { status: 'investigating' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = validate(updateSafetyIncidentSchema, { status: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('createInsuranceClaimSchema', () => {
  it('accepts valid insurance claim', () => {
    const result = validate(createInsuranceClaimSchema, {
      claimNumber: 'CLM-2026-001',
      customerId: 'cust-1',
      vehicleId: 'veh-1',
      insuranceCompany: 'Acme Insurance',
      policyNumber: 'POL-12345',
      claimType: 'collision',
      incidentDate: '2026-06-27',
      claimAmount: '5000.00',
      description: 'Vehicle collision in parking lot',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing claim amount', () => {
    const result = validate(createInsuranceClaimSchema, {
      claimNumber: 'CLM-001',
      customerId: 'cust-1',
      vehicleId: 'veh-1',
      insuranceCompany: 'Acme',
      policyNumber: 'POL-123',
      claimType: 'collision',
      incidentDate: '2026-06-27',
      description: 'Test description here',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid claim type', () => {
    const result = validate(createInsuranceClaimSchema, {
      claimNumber: 'CLM-001',
      customerId: 'cust-1',
      vehicleId: 'veh-1',
      insuranceCompany: 'Acme',
      policyNumber: 'POL-123',
      claimType: 'flood',
      incidentDate: '2026-06-27',
      claimAmount: '1000.00',
      description: 'Test description here',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateInsuranceClaimSchema', () => {
  it('accepts valid status transition', () => {
    const result = validate(updateInsuranceClaimSchema, {
      status: 'approved',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = validate(updateInsuranceClaimSchema, { status: 'pending_review' });
    expect(result.success).toBe(false);
  });
});

describe('createEnvironmentalRecordSchema', () => {
  it('accepts valid environmental record', () => {
    const result = validate(createEnvironmentalRecordSchema, {
      category: 'waste',
      recordDate: '2026-06-27',
      quantity: 50.5,
      unit: 'kg',
      disposalMethod: 'Recycled',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative quantity', () => {
    const result = validate(createEnvironmentalRecordSchema, {
      category: 'emissions',
      recordDate: '2026-06-27',
      quantity: -10,
      unit: 'kg',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid category', () => {
    const result = validate(createEnvironmentalRecordSchema, {
      category: 'noise',
      recordDate: '2026-06-27',
      quantity: 10,
      unit: 'dB',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateEnvironmentalRecordSchema', () => {
  it('accepts partial update', () => {
    const result = validate(updateEnvironmentalRecordSchema, { quantity: 100 });
    expect(result.success).toBe(true);
  });
});

describe('createQualityRecordSchema', () => {
  it('accepts valid ISO 9001 record', () => {
    const result = validate(createQualityRecordSchema, {
      standard: 'ISO 9001',
      auditDate: '2026-06-27',
      findings: 'All processes compliant with quality standards',
      nonConformities: 0,
      status: 'open',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative non-conformities', () => {
    const result = validate(createQualityRecordSchema, {
      standard: 'ISO 9001',
      auditDate: '2026-06-27',
      findings: 'Test findings',
      nonConformities: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = validate(createQualityRecordSchema, {
      standard: 'ISO 9001',
      auditDate: '2026-06-27',
      findings: 'Test findings here',
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateQualityRecordSchema', () => {
  it('accepts status transition', () => {
    const result = validate(updateQualityRecordSchema, { status: 'closed' });
    expect(result.success).toBe(true);
  });
});