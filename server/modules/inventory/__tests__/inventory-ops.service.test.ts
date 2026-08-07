import { describe, it, expect, vi } from 'vitest';
import { StockAlertService } from '../services/stock-alert.service';
import { InventoryAuditService } from '../services/inventory-audit.service';
import { InventoryTransferService } from '../services/inventory-transfer.service';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';

describe('StockAlertService', () => {
  it('requires a garage for listing (400-mapped)', () => {
    const repo = { list: vi.fn(), create: vi.fn(), update: vi.fn(), acknowledge: vi.fn() };
    expect(() => new StockAlertService(repo).list(undefined)).toThrow(ValidationError);
    expect(repo.list).not.toHaveBeenCalled();
  });

  it('lists for the given garage and status', async () => {
    const repo = { list: vi.fn(async () => [{ id: 'a1' }]), create: vi.fn(), update: vi.fn(), acknowledge: vi.fn() };
    await new StockAlertService(repo as never).list('g1', 'open');
    expect(repo.list).toHaveBeenCalledWith('g1', 'open');
  });

  it('404s a missing alert on update', async () => {
    const repo = { list: vi.fn(), create: vi.fn(), update: vi.fn(async () => undefined), acknowledge: vi.fn() };
    await expect(new StockAlertService(repo as never).update('x', {}, 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('InventoryAuditService', () => {
  it('requires a garage for listing (400-mapped)', () => {
    const repo = { list: vi.fn(), create: vi.fn() };
    expect(() => new InventoryAuditService(repo as never).list(undefined)).toThrow(ValidationError);
  });

  it('threads sparePartId and limit', async () => {
    const repo = { list: vi.fn(async () => []), create: vi.fn() };
    await new InventoryAuditService(repo as never).list('g1', 'sp1', 50);
    expect(repo.list).toHaveBeenCalledWith('g1', 'sp1', 50);
  });
});

describe('InventoryTransferService', () => {
  it('requires a garage for listing (400-mapped)', () => {
    const repo = {
      list: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), approve: vi.fn(), complete: vi.fn(),
    };
    expect(() => new InventoryTransferService(repo as never).list(undefined)).toThrow(ValidationError);
  });

  it('404s a missing transfer on detail read', async () => {
    const repo = {
      list: vi.fn(), getById: vi.fn(async () => undefined), create: vi.fn(), update: vi.fn(), approve: vi.fn(), complete: vi.fn(),
    };
    await expect(new InventoryTransferService(repo as never).getById('x')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('delegates approve/complete with the acting user', async () => {
    const repo = {
      list: vi.fn(), getById: vi.fn(), create: vi.fn(),
      update: vi.fn(),
      approve: vi.fn(async () => ({ id: 't1', status: 'approved' })),
      complete: vi.fn(async () => ({ id: 't1', status: 'completed' })),
    };
    const service = new InventoryTransferService(repo as never);
    await service.approve('t1', 'u1');
    await service.complete('t1', 'u1');
    expect(repo.approve).toHaveBeenCalledWith('t1', 'u1');
    expect(repo.complete).toHaveBeenCalledWith('t1', 'u1');
  });
});
