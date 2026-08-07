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

  describe('Insurance claims endpoint (Phase E — migrated to server/modules/insurance)', () => {
    // Insurance claims moved out of the monolith into a layered module; the
    // validatePatchBody boundary now lives in the module controller.
    const insuranceController = fs.readFileSync(
      path.resolve(process.cwd(), 'server/modules/insurance/controllers/insurance.controller.ts'),
      'utf-8',
    );

    it('retires the insurance-claims handlers from the monolith', () => {
      expect(source).not.toMatch(/app\.post\(['"]\/api\/insurance\/claims['"]/);
      expect(source).not.toMatch(/app\.patch\(['"]\/api\/insurance\/claims\/:id\/status['"]/);
    });

    it('POST /insurance/claims uses validatePatchBody with the create schema', () => {
      expect(insuranceController).toMatch(/validatePatchBody\(req, res, createInsuranceClaimSchema\)/);
      expect(insuranceController).not.toMatch(/insuranceClaimSchema\.parse/);
    });

    it('PATCH /insurance/claims/:id/status uses validatePatchBody with the update schema', () => {
      expect(insuranceController).toMatch(/validatePatchBody\(req, res, updateInsuranceClaimSchema\)/);
      expect(insuranceController).not.toMatch(/claimStatusUpdateSchema\.parse/);
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
    // The insurance schemas moved with the module; the monolith keeps the
    // safety / environmental / quality Phase 6 endpoints (and their schemas).
    const insuranceController = fs.readFileSync(
      path.resolve(process.cwd(), 'server/modules/insurance/controllers/insurance.controller.ts'),
      'utf-8',
    );

    it('imports the remaining Phase 6 create schemas in the monolith', () => {
      expect(source).toMatch(/import\s*\{[^}]*createSafetyIncidentSchema/);
      expect(source).toMatch(/createEnvironmentalRecordSchema/);
      expect(source).toMatch(/createQualityRecordSchema/);
    });

    it('imports the remaining Phase 6 update schemas in the monolith', () => {
      expect(source).toMatch(/updateSafetyIncidentSchema/);
      expect(source).toMatch(/updateEnvironmentalRecordSchema/);
      expect(source).toMatch(/updateQualityRecordSchema/);
    });

    it('wires the insurance schemas in the module controller', () => {
      expect(insuranceController).toMatch(/createInsuranceClaimSchema/);
      expect(insuranceController).toMatch(/updateInsuranceClaimSchema/);
    });
  });
});