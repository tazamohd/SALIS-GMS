/**
 * Backup service (Phase E5 — business layer). Owns the dev-snapshot math and the
 * response shaping for the platform/administration backup surface: the status
 * roll-up, the create-snapshot record (table counts → total records → estimated
 * size), the list projection, and the export-type dispatch (unknown type →
 * `ValidationError` → 400). No HTTP, no data-layer access. Behavior is identical
 * to the retired `server/routes/backup.ts`.
 */

import { ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { IBackupRepository } from '../repositories/backup.repository';

const SUPPORTED_EXPORTS = ['customers', 'invoices', 'job-cards', 'inventory', 'appointments', 'vehicles'];
// ~500 bytes per record, matching the legacy size approximation.
const BYTES_PER_RECORD = 500;

// Backup rows are loosely typed; `Any` keeps the seam readable.
type Any = any;

export class BackupService {
  constructor(private readonly repo: IBackupRepository) {}

  async status() {
    const [latest, stats] = await Promise.all([this.repo.latest(), this.repo.stats()]);
    return {
      lastBackupTime: latest?.createdAt ?? null,
      lastBackupSize: latest?.size ?? 0,
      backupCount: stats.count,
      nextScheduled: null, // scheduled backups not implemented in dev
      storageUsed: stats.totalSize,
    };
  }

  async create(stamp: number) {
    const tableCounts = await this.repo.tableCounts();
    const totalRecords = Object.values(tableCounts).reduce((a, b) => a + b, 0);
    const estimatedSize = totalRecords * BYTES_PER_RECORD;

    const backup: Any = await this.repo.create({
      backupRef: `backup-${stamp}`,
      type: 'full',
      size: estimatedSize,
      totalRecords,
      tableCounts,
      metadata: {
        totalRecords,
        engine: 'dev-snapshot',
        note: 'Development backup — table counts and metadata only. Production would use pg_dump.',
      },
    });

    return {
      success: true,
      backup: {
        id: backup.id,
        createdAt: backup.createdAt,
        size: backup.size,
        type: backup.type,
        tableCounts: backup.tableCounts,
        metadata: backup.metadata,
      },
    };
  }

  async list() {
    const rows = await this.repo.list();
    return rows.map((b: Any) => ({
      id: b.id,
      createdAt: b.createdAt,
      size: b.size,
      type: b.type,
      totalRecords: b.totalRecords ?? b.metadata?.totalRecords ?? 0,
    }));
  }

  async exportData(type: string) {
    const data = await this.repo.exportData(type);
    if (data === null) {
      throw new ValidationError(
        `Unknown export type: ${type}. Supported: ${SUPPORTED_EXPORTS.join(', ')}`,
      );
    }
    return data;
  }
}
