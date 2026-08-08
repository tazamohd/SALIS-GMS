/**
 * Call-center controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the call-center domain. Preserves the legacy monolith
 * contract: the garage-required 400, the Zod 400s (`sanitizeZodError`), the
 * request-body strips on updates, the not-found 404s surfaced from the service,
 * the `201`/`204`, and the exact per-handler `{ message }` 500 bodies. Ownership
 * guards + the rate limiter live on the routes.
 */

import type { Request, Response } from 'express';
import {
  insertCallQueueSchema,
  insertCallQueueMemberSchema,
  insertCallSessionSchema,
  insertCallNoteSchema,
  insertCallRecordingSchema,
  insertCallDispositionCodeSchema,
  insertAgentPerformanceSnapshotSchema,
} from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { CallCenterService } from '../services/call-center.service';

function garage(req: Request, res: Response): string | undefined {
  const g = (req.user as { garageId?: string } | undefined)?.garageId;
  if (!g) {
    res.status(400).json({ message: 'User garage ID is required' });
    return undefined;
  }
  return g;
}
function uid(req: Request): string {
  return (req.user as { id?: string } | undefined)?.id || 'default-user';
}
function activeFlag(v: unknown): boolean | undefined {
  return v === 'true' ? true : v === 'false' ? false : undefined;
}
function notFound(res: Response, error: unknown): boolean {
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  return false;
}

export function makeCallCenterController(service: CallCenterService) {
  return {
    // ---- Queues --------------------------------------------------------
    async listQueues(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.listQueues(garageId, activeFlag(req.query.active)));
      } catch (error) {
        console.error('Error fetching call queues:', error);
        res.status(500).json({ message: 'Failed to fetch call queues' });
      }
    },
    async createQueue(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const parsed = insertCallQueueSchema.safeParse({ ...req.body, garageId });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createQueue(garageId, parsed.data));
      } catch (error) {
        console.error('Error creating call queue:', error);
        res.status(500).json({ message: 'Failed to create call queue' });
      }
    },
    async getQueue(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.getQueue(req.params.id, garageId));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error fetching call queue:', error);
        res.status(500).json({ message: 'Failed to fetch call queue' });
      }
    },
    async updateQueue(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const { garageId: _drop, ...safeBody } = req.body ?? {};
        res.json(await service.updateQueue(req.params.id, garageId, safeBody));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error updating call queue:', error);
        res.status(500).json({ message: 'Failed to update call queue' });
      }
    },
    async deleteQueue(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        await service.deleteQueue(req.params.id, garageId);
        res.status(204).send();
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error deleting call queue:', error);
        res.status(500).json({ message: 'Failed to delete call queue' });
      }
    },
    async getQueueWithMembers(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.getQueueWithMembers(req.params.id, garageId));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error fetching queue with members:', error);
        res.status(500).json({ message: 'Failed to fetch queue with members' });
      }
    },

    // ---- Queue members -------------------------------------------------
    async addQueueMember(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const parsed = insertCallQueueMemberSchema.safeParse({ ...req.body, queueId: req.params.queueId, garageId });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.addQueueMember(parsed.data));
      } catch (error) {
        console.error('Error adding queue member:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to add queue member' });
      }
    },
    async listQueueMembers(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.listQueueMembers(req.params.queueId, garageId, activeFlag(req.query.active)));
      } catch (error) {
        console.error('Error fetching queue members:', error);
        res.status(500).json({ message: 'Failed to fetch queue members' });
      }
    },
    async updateQueueMember(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const { garageId: _g, queueId: _q, ...safeBody } = req.body ?? {};
        res.json(await service.updateQueueMember(req.params.id, garageId, safeBody));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error updating queue member:', error);
        res.status(500).json({ message: 'Failed to update queue member' });
      }
    },
    async removeQueueMember(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        await service.removeQueueMember(req.params.id, garageId);
        res.status(204).send();
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error removing queue member:', error);
        res.status(500).json({ message: 'Failed to remove queue member' });
      }
    },

    // ---- Sessions ------------------------------------------------------
    async listSessions(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.listSessions(garageId, {
          status: req.query.status as string | undefined,
          agentId: req.query.agent_id as string | undefined,
          queueId: req.query.queue_id as string | undefined,
        }));
      } catch (error) {
        console.error('Error fetching call sessions:', error);
        res.status(500).json({ message: 'Failed to fetch call sessions' });
      }
    },
    async createSession(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const parsed = insertCallSessionSchema.safeParse({ ...req.body, garageId });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createSession(garageId, parsed.data));
      } catch (error) {
        console.error('Error creating call session:', error);
        res.status(500).json({ message: 'Failed to create call session' });
      }
    },
    async getSession(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.getSession(req.params.id, garageId));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error fetching call session:', error);
        res.status(500).json({ message: 'Failed to fetch call session' });
      }
    },
    async updateSession(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const { garageId: _g, queueId: _q, customerId: _c, vehicleId: _v, assignedAgentId: _a, ...safeBody } = req.body ?? {};
        res.json(await service.updateSession(req.params.id, garageId, safeBody));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error updating call session:', error);
        res.status(500).json({ message: 'Failed to update call session' });
      }
    },
    async assignCall(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const { agentId } = req.body ?? {};
        if (!agentId) {
          res.status(400).json({ message: 'agentId is required' });
          return;
        }
        res.json(await service.assignCall(garageId, { garageId, sessionId: req.params.id, agentId, assignedBy: uid(req) }));
      } catch (error) {
        console.error('Error assigning call to agent:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to assign call to agent' });
      }
    },

    // ---- Notes ---------------------------------------------------------
    async createNote(req: Request, res: Response): Promise<void> {
      try {
        const parsed = insertCallNoteSchema.safeParse({ ...req.body, sessionId: req.params.sessionId, authorUserId: uid(req) });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createNote(parsed.data));
      } catch (error) {
        console.error('Error creating call note:', error);
        res.status(500).json({ message: 'Failed to create call note' });
      }
    },
    async listNotes(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listNotes(req.params.sessionId));
      } catch (error) {
        console.error('Error fetching call notes:', error);
        res.status(500).json({ message: 'Failed to fetch call notes' });
      }
    },

    // ---- Recordings ----------------------------------------------------
    async createRecording(req: Request, res: Response): Promise<void> {
      try {
        const parsed = insertCallRecordingSchema.safeParse({ ...req.body, sessionId: req.params.sessionId });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createRecording(parsed.data));
      } catch (error) {
        console.error('Error creating call recording:', error);
        res.status(500).json({ message: 'Failed to create call recording' });
      }
    },
    async listRecordings(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listRecordings(req.params.sessionId));
      } catch (error) {
        console.error('Error fetching call recordings:', error);
        res.status(500).json({ message: 'Failed to fetch call recordings' });
      }
    },

    // ---- Disposition codes ---------------------------------------------
    async listDispositionCodes(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        res.json(await service.listDispositionCodes(garageId, activeFlag(req.query.active)));
      } catch (error) {
        console.error('Error fetching disposition codes:', error);
        res.status(500).json({ message: 'Failed to fetch disposition codes' });
      }
    },
    async createDispositionCode(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const parsed = insertCallDispositionCodeSchema.safeParse({ ...req.body, garageId });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createDispositionCode(parsed.data));
      } catch (error) {
        console.error('Error creating disposition code:', error);
        res.status(500).json({ message: 'Failed to create disposition code' });
      }
    },
    async updateDispositionCode(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const { garageId: _g, ...safeBody } = req.body ?? {};
        res.json(await service.updateDispositionCode(req.params.id, garageId, safeBody));
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error updating disposition code:', error);
        res.status(500).json({ message: 'Failed to update disposition code' });
      }
    },
    async deleteDispositionCode(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        await service.deleteDispositionCode(req.params.id, garageId);
        res.status(204).send();
      } catch (error) {
        if (notFound(res, error)) return;
        console.error('Error deleting disposition code:', error);
        res.status(500).json({ message: 'Failed to delete disposition code' });
      }
    },

    // ---- Agent performance ---------------------------------------------
    async createPerformance(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const parsed = insertAgentPerformanceSnapshotSchema.safeParse({ ...req.body, garageId });
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createPerformanceSnapshot(parsed.data));
      } catch (error) {
        console.error('Error creating performance snapshot:', error);
        res.status(500).json({ message: 'Failed to create performance snapshot' });
      }
    },
    async listPerformance(req: Request, res: Response): Promise<void> {
      const garageId = garage(req, res);
      if (!garageId) return;
      try {
        const { agent_id, start_date, end_date } = req.query;
        const dateRange =
          start_date && end_date
            ? { start: new Date(start_date as string), end: new Date(end_date as string) }
            : undefined;
        res.json(await service.listAgentPerformance(garageId, agent_id as string | undefined, dateRange));
      } catch (error) {
        console.error('Error fetching agent performance:', error);
        res.status(500).json({ message: 'Failed to fetch agent performance' });
      }
    },
  };
}

export type CallCenterController = ReturnType<typeof makeCallCenterController>;
