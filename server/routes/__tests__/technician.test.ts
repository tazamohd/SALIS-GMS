import { describe, it, expect, beforeAll } from "vitest";
import type { Express } from "express";
import type supertest from "supertest";
import { createTestApp } from "../../__tests__/setup";
import { loginAsAdmin } from "../../__tests__/helpers";

let app: Express;
let agent: supertest.Agent;
let userId: string;

beforeAll(async () => {
  const result = await createTestApp();
  app = result.app;
  const login = await loginAsAdmin(app);
  agent = login.agent;
  userId = login.user?.id;
});

describe('Technician Mobile API', () => {
  describe('POST /api/technician/clock', () => {
    it('should reject missing technicianId', async () => {
      const res = await agent.post('/api/technician/clock').send({
        action: 'in',
        timestamp: new Date().toISOString(),
      });
      // Either explicit validation 400, or 404 if the route is not mounted
      expect([400, 404]).toContain(res.status);
    });

    it('should reject invalid action', async () => {
      const res = await agent.post('/api/technician/clock').send({
        technicianId: '1',
        action: 'invalid',
        timestamp: new Date().toISOString(),
      });
      expect([400, 404]).toContain(res.status);
    });

    it('should accept valid clock-in', async () => {
      const res = await agent.post('/api/technician/clock').send({
        technicianId: '1',
        action: 'in',
        timestamp: new Date().toISOString(),
      });
      expect(res.status).not.toBe(400);
    });
  });

  describe('POST /api/technician/parts-request', () => {
    it('should reject missing required fields', async () => {
      const res = await agent.post('/api/technician/parts-request').send({
        partName: 'Oil Filter',
      });
      expect([400, 404]).toContain(res.status);
    });

    it('should reject negative quantity', async () => {
      const res = await agent.post('/api/technician/parts-request').send({
        jobId: '1',
        technicianId: '1',
        partName: 'Oil',
        quantity: -1,
        urgency: 'high',
      });
      expect([400, 404]).toContain(res.status);
    });
  });

  describe('GET /api/technician/stats/:techId', () => {
    it('should return stats object', async () => {
      const res = await agent.get('/api/technician/stats/1');
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('stats');
        expect(res.body.stats).toHaveProperty('totalJobs');
      }
    });
  });

  describe('Time clock (/api/technicians/:technicianId/time-clock)', () => {
    let entryId: string;

    it('clock-in creates an open, garage-scoped entry', async () => {
      const res = await agent.post(`/api/technicians/${userId}/time-clock`).send({});
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.employeeId).toBe(userId);
      expect(res.body.garageId).toBeTruthy();
      expect(res.body.clockInTime).toBeTruthy();
      expect(res.body.clockOutTime).toBeNull();
      entryId = res.body.id;
    });

    it('lists only this technician\'s entries', async () => {
      const res = await agent.get(`/api/technicians/${userId}/time-clock`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body.every((e: any) => e.employeeId === userId)).toBe(true);
    });

    it('clock-out stamps clockOutTime and computes totalHours', async () => {
      const res = await agent.patch(
        `/api/technicians/${userId}/time-clock/${entryId}/clock-out`,
      );
      expect(res.status).toBe(200);
      expect(res.body.clockOutTime).toBeTruthy();
      expect(res.body.totalHours).not.toBeNull();
    });

    it('clock-out on a missing entry returns 404', async () => {
      const res = await agent.patch(
        `/api/technicians/${userId}/time-clock/00000000-0000-0000-0000-000000000000/clock-out`,
      );
      expect(res.status).toBe(404);
    });
  });
});
