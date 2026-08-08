import { describe, it, expect, vi } from 'vitest';
import { BackupService } from '../services/backup.service';
import { ValidationError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    latest: vi.fn(async () => ({ createdAt: 'T1', size: 1234 })),
    stats: vi.fn(async () => ({ count: 3, totalSize: 9999 })),
    create: vi.fn(async (d: Record<string, unknown>) => ({ id: 'b1', createdAt: 'T2', ...d })),
    list: vi.fn(async () => [
      { id: 'b1', createdAt: 'T2', size: 500, type: 'full', totalRecords: 10 },
      { id: 'b2', createdAt: 'T3', size: 0, type: 'full', metadata: { totalRecords: 7 } },
    ]),
    tableCounts: vi.fn(async () => ({ users: 4, vehicles: 6 })),
    exportData: vi.fn(async (t: string) => (t === 'customers' ? [{ id: 'u1' }] : null)),
    ...o,
  };
}

describe('BackupService', () => {
  it('status rolls up latest + stats into the legacy shape', async () => {
    const out = await new BackupService(repo() as never).status();
    expect(out).toEqual({
      lastBackupTime: 'T1',
      lastBackupSize: 1234,
      backupCount: 3,
      nextScheduled: null,
      storageUsed: 9999,
    });
  });

  it('status tolerates no prior backup', async () => {
    const out = await new BackupService(repo({ latest: vi.fn(async () => undefined) }) as never).status();
    expect(out.lastBackupTime).toBeNull();
    expect(out.lastBackupSize).toBe(0);
  });

  it('create sums table counts, estimates size at 500B/record, and stamps the ref', async () => {
    const r = repo();
    const out = await new BackupService(r as never).create(1720000000000);
    // 4 + 6 = 10 records → 5000 bytes
    expect(r.create).toHaveBeenCalledWith(expect.objectContaining({
      backupRef: 'backup-1720000000000',
      type: 'full',
      size: 5000,
      totalRecords: 10,
      tableCounts: { users: 4, vehicles: 6 },
    }));
    expect(out.success).toBe(true);
    expect(out.backup.id).toBe('b1');
  });

  it('list projects the summary fields, falling back to metadata.totalRecords', async () => {
    const out = await new BackupService(repo() as never).list();
    expect(out).toEqual([
      { id: 'b1', createdAt: 'T2', size: 500, type: 'full', totalRecords: 10 },
      { id: 'b2', createdAt: 'T3', size: 0, type: 'full', totalRecords: 7 },
    ]);
  });

  it('exportData returns rows for a known type', async () => {
    expect(await new BackupService(repo() as never).exportData('customers')).toEqual([{ id: 'u1' }]);
  });

  it('exportData throws ValidationError for an unknown type', async () => {
    const s = new BackupService(repo() as never);
    await expect(s.exportData('nope')).rejects.toBeInstanceOf(ValidationError);
    await expect(s.exportData('nope')).rejects.toThrow(/Unknown export type: nope/);
  });
});
