/**
 * Backup controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter preserving the legacy contract of `server/routes/backup.ts`:
 * the per-handler `{ error }` 500 bodies, the export download headers, and the
 * `{ error }` 400 for an unknown export type (surfaced from the service as a
 * `ValidationError`). Runtime values (the snapshot timestamp) are supplied here.
 * Auth/role (isAuthenticated + requireAdmin) are enforced on the routes.
 */

import type { Request, Response } from 'express';
import { ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { BackupService } from '../services/backup.service';

export function makeBackupController(service: BackupService) {
  return {
    async status(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.status());
      } catch (error) {
        console.error('Backup status error:', error);
        res.status(500).json({ error: 'Failed to get backup status' });
      }
    },

    async create(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.create(Date.now()));
      } catch (error) {
        console.error('Backup creation error:', error);
        res.status(500).json({ error: 'Failed to create backup' });
      }
    },

    async list(_req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.list());
      } catch (error) {
        console.error('Backup list error:', error);
        res.status(500).json({ error: 'Failed to list backups' });
      }
    },

    async exportData(req: Request, res: Response): Promise<void> {
      const { type } = req.params;
      try {
        const data = await service.exportData(type);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${type}-export-${new Date().toISOString().slice(0, 10)}.json"`,
        );
        res.json(data);
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ error: error.message });
          return;
        }
        console.error('Backup export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
      }
    },
  };
}

export type BackupController = ReturnType<typeof makeBackupController>;
