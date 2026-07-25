/**
 * Tests for request body validation helpers
 *
 * Verifies that the validation helper:
 * - Strips protected fields (id, createdAt, etc.)
 * - Returns 400 for invalid bodies
 * - Allows valid data through
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validatePatchBody, updateTechnicianProfileSchema, updateJobCardSchema } from '../validators';

function mockReqRes(body: any) {
  const req = { body };
  let statusCode = 200;
  let jsonData: any = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      jsonData = data;
      return this;
    },
  };
  return { req, res, getStatus: () => statusCode, getJson: () => jsonData };
}

describe('validatePatchBody', () => {
  it('returns ok:true with sanitized data for valid body', () => {
    const { req, res, getStatus } = mockReqRes({ bio: 'New bio', hourlyRate: 50 });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.bio).toBe('New bio');
      expect(result.data.hourlyRate).toBe(50);
    }
  });

  it('strips protected field id', () => {
    const { req, res } = mockReqRes({ id: 'attacker-id', bio: 'New bio' });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.data as any).id).toBeUndefined();
    }
  });

  it('strips protected field createdAt', () => {
    const { req, res } = mockReqRes({ createdAt: '2020-01-01', bio: 'New bio' });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.data as any).createdAt).toBeUndefined();
    }
  });

  it('strips protected field garageId', () => {
    const { req, res } = mockReqRes({ garageId: 'attacker-garage', bio: 'New bio' });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.data as any).garageId).toBeUndefined();
    }
  });

  it('strips protected field garage_id (snake_case)', () => {
    const { req, res } = mockReqRes({ garage_id: 'attacker-garage', bio: 'New bio' });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect((result.data as any).garage_id).toBeUndefined();
    }
  });

  it('returns 400 for invalid body type', () => {
    const { req, res, getStatus } = mockReqRes('not-an-object');
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });

  it('returns 400 for schema validation failure', () => {
    const { req, res, getStatus } = mockReqRes({ hourlyRate: -100 });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });

  it('returns 400 for empty body', () => {
    const { req, res, getStatus } = mockReqRes(undefined);
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });

  it('rejects unknown fields (strict mode)', () => {
    const { req, res, getStatus } = mockReqRes({ bio: 'OK', evilField: 'attacker' });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });
});

describe('updateTechnicianProfileSchema', () => {
  it('validates hourlyRate range', () => {
    const { req, res, getStatus } = mockReqRes({ hourlyRate: 99999 });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });

  it('validates yearsExperience range', () => {
    const { req, res, getStatus } = mockReqRes({ yearsExperience: 999 });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });

  it('validates URL format for profileImageUrl', () => {
    const { req, res, getStatus } = mockReqRes({ profileImageUrl: 'not-a-url' });
    const result = validatePatchBody(req, res, updateTechnicianProfileSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });
});

describe('updateJobCardSchema', () => {
  it('validates status enum', () => {
    const { req, res, getStatus } = mockReqRes({ status: 'invalid_status' });
    const result = validatePatchBody(req, res, updateJobCardSchema);
    expect(result.ok).toBe(false);
    expect(getStatus()).toBe(400);
  });

  it('accepts valid status', () => {
    const { req, res } = mockReqRes({ status: 'in_progress' });
    const result = validatePatchBody(req, res, updateJobCardSchema);
    expect(result.ok).toBe(true);
  });

  it('accepts valid priority', () => {
    const { req, res } = mockReqRes({ priority: 'urgent' });
    const result = validatePatchBody(req, res, updateJobCardSchema);
    expect(result.ok).toBe(true);
  });
});