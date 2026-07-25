/**
 * Contract tests for Phase 6 Compliance endpoint wiring
 *
 * Verifies that the validators from Wave F are actually wired into
 * the real endpoints, not just declared.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 6 endpoint wiring (Wave G)', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const source = fs.readFileSync(routesPath, 'utf-8');

  describe('Safety incidents endpoint', () => {
    function getSafetyPostHandler() {
      const startIdx = source.indexOf("app.post('/api/safety/incidents'");
      const endIdx = source.indexOf("app.", startIdx + 30);
      return source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 2000);
    }

    it('POST /api/safety/incidents uses validatePatchBody', () => {
      const handler = getSafetyPostHandler();
      expect(handler).toMatch(/validatePatchBody/);
      expect(handler).toMatch(/createSafetyIncidentSchema/);
    });

    it('POST /api/safety/incidents no longer uses raw safetyIncidentSchema.parse', () => {
      const handler = getSafetyPostHandler();
      // Old code used: safetyIncidentSchema.parse(req.body)
      // New code uses: validatePatchBody(req, res, createSafetyIncidentSchema)
      expect(handler).not.toMatch(/safetyIncidentSchema\.parse/);
      expect(handler).toMatch(/validatePatchBody\(req,\s*res,\s*createSafetyIncidentSchema\)/);
    });
  });

  describe('Insurance claims endpoint', () => {
    function getInsurancePostHandler() {
      const startIdx = source.indexOf("app.post('/api/insurance/claims'");
      const endIdx = source.indexOf("app.", startIdx + 30);
      return source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 2000);
    }

    it('POST /api/insurance/claims uses validatePatchBody', () => {
      const handler = getInsurancePostHandler();
      expect(handler).toMatch(/validatePatchBody/);
      expect(handler).toMatch(/createInsuranceClaimSchema/);
    });

    it('POST /api/insurance/claims no longer uses raw insuranceClaimSchema.parse', () => {
      const handler = getInsurancePostHandler();
      expect(handler).not.toMatch(/insuranceClaimSchema\.parse/);
      expect(handler).toMatch(/validatePatchBody\(req,\s*res,\s*createInsuranceClaimSchema\)/);
    });

    function getInsuranceStatusHandler() {
      const startIdx = source.indexOf("app.patch('/api/insurance/claims/:id/status'");
      const endIdx = source.indexOf("app.", startIdx + 30);
      return source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 2000);
    }

    it('PATCH /api/insurance/claims/:id/status uses updateInsuranceClaimSchema', () => {
      const handler = getInsuranceStatusHandler();
      expect(handler).toMatch(/validatePatchBody/);
      expect(handler).toMatch(/updateInsuranceClaimSchema/);
    });

    it('PATCH /api/insurance/claims/:id/status no longer uses raw claimStatusUpdateSchema.parse', () => {
      const handler = getInsuranceStatusHandler();
      expect(handler).not.toMatch(/claimStatusUpdateSchema\.parse/);
    });
  });

  describe('Environmental compliance endpoint', () => {
    function getEnvPostHandler() {
      const startIdx = source.indexOf('app.post("/api/environmental-compliance/records"');
      const endIdx = source.indexOf("app.", startIdx + 30);
      return source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 2000);
    }

    it('POST /api/environmental-compliance/records uses validatePatchBody', () => {
      const handler = getEnvPostHandler();
      expect(handler).toMatch(/validatePatchBody/);
      expect(handler).toMatch(/createEnvironmentalRecordSchema/);
    });

    it('POST /api/environmental-compliance/records no longer echoes raw req.body', () => {
      const handler = getEnvPostHandler();
      // Old code: res.status(201).json({ id: "new", ...req.body });
      // New code: validated.data with id assignment
      expect(handler).not.toMatch(/\{\s*id:\s*['"]new['"],\s*\.\.\.\s*req\.body\s*\}/);
    });
  });

  describe('Validator imports', () => {
    it('imports all 4 Phase 6 create schemas', () => {
      expect(source).toMatch(/import\s*\{[^}]*createSafetyIncidentSchema/);
      expect(source).toMatch(/createInsuranceClaimSchema/);
      expect(source).toMatch(/createEnvironmentalRecordSchema/);
      expect(source).toMatch(/createQualityRecordSchema/);
    });

    it('imports all 4 Phase 6 update schemas', () => {
      expect(source).toMatch(/updateSafetyIncidentSchema/);
      expect(source).toMatch(/updateInsuranceClaimSchema/);
      expect(source).toMatch(/updateEnvironmentalRecordSchema/);
      expect(source).toMatch(/updateQualityRecordSchema/);
    });
  });
});