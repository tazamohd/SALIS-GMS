import { describe, it, expect, vi } from 'vitest';
import { PurchaseService } from '../services/purchase.service';
import { DeliveryService } from '../services/delivery.service';
import { ReorderSettingService } from '../services/reorder-setting.service';
import { PricingHistoryService } from '../services/pricing-history.service';
import { NotFoundError, ValidationError } from '../../../infrastructure/errors/domain-errors';

const explicit = { explicit: true, limit: 25, offset: 0 };
const noPage = { explicit: false, limit: 25, offset: 0 };

describe('PurchaseService', () => {
  function repo(o = {}) {
    return {
      listOrders: vi.fn(async () => [{ id: 'po1' }]),
      countOrders: vi.fn(async () => 4),
      getOrder: vi.fn(async () => undefined),
      getOrderItems: vi.fn(async () => [{ id: 'i1' }]),
      listTasks: vi.fn(async () => []),
      countTasks: vi.fn(async () => 0),
      getTask: vi.fn(async () => undefined),
      getTaskParts: vi.fn(async () => []),
      ...o,
    };
  }

  it('counts orders only when a page is explicitly requested', async () => {
    const r = repo();
    const s = new PurchaseService(r as never);
    await s.listOrders('g1', 'draft', noPage);
    expect(r.countOrders).not.toHaveBeenCalled();
    await s.listOrders('g1', 'draft', explicit);
    expect(r.countOrders).toHaveBeenCalledWith('g1', 'draft');
  });

  it('404s a missing order and its items', async () => {
    const s = new PurchaseService(repo() as never);
    await expect(s.getOrder('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
    await expect(s.orderItems('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns items after verifying the parent order', async () => {
    const r = repo({ getOrder: vi.fn(async () => ({ id: 'po1' })) });
    const s = new PurchaseService(r as never);
    expect(await s.orderItems('po1', 'g1')).toEqual([{ id: 'i1' }]);
  });

  it('404s a missing task', async () => {
    await expect(new PurchaseService(repo() as never).getTask('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('404s an update to a missing order and task with distinct messages', async () => {
    const s = new PurchaseService(
      repo({ updateOrder: vi.fn(async () => undefined), updateTask: vi.fn(async () => undefined) }) as never,
    );
    await expect(s.updateOrder('x', {}, 'g1')).rejects.toThrow('Purchase order not found');
    await expect(s.updateTask('x', {}, 'g1')).rejects.toThrow('Purchase task not found');
  });

  it('creates a task then persists each supplied part against the new task id', async () => {
    const createTaskPart = vi.fn(async () => ({ id: 'pt1' }));
    const r = repo({ createTask: vi.fn(async () => ({ id: 't1' })), createTaskPart });
    const s = new PurchaseService(r as never);
    const task = await s.createTask({ assignedTo: 'u1' } as never, [{ sparePartId: 'sp1' }, { sparePartId: 'sp2' }]);
    expect(task).toEqual({ id: 't1' });
    expect(createTaskPart).toHaveBeenCalledTimes(2);
    expect(createTaskPart).toHaveBeenCalledWith({ sparePartId: 'sp1', taskId: 't1' });
  });

  it('creates a task with no parts when parts is absent or not an array', async () => {
    const createTaskPart = vi.fn();
    const r = repo({ createTask: vi.fn(async () => ({ id: 't1' })), createTaskPart });
    const s = new PurchaseService(r as never);
    await s.createTask({ assignedTo: 'u1' } as never, undefined);
    await s.createTask({ assignedTo: 'u1' } as never, 'nope');
    expect(createTaskPart).not.toHaveBeenCalled();
  });
});

describe('DeliveryService', () => {
  function repo(o = {}) {
    return {
      list: vi.fn(async () => [{ id: 'd1' }]),
      getById: vi.fn(async () => undefined),
      items: vi.fn(async () => []),
      timeline: vi.fn(async () => []),
      liveStatus: vi.fn(async () => undefined),
      ...o,
    };
  }

  it('404s a missing delivery and its children', async () => {
    const s = new DeliveryService(repo() as never);
    await expect(s.getById('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
    await expect(s.items('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
    await expect(s.timeline('x', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('404s when live status is absent even if the delivery exists', async () => {
    const s = new DeliveryService(repo({ getById: vi.fn(async () => ({ id: 'd1' })) }) as never);
    await expect(s.live('d1', 'g1')).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ReorderSettingService', () => {
  function repo(o = {}) {
    return {
      list: vi.fn(async () => []),
      create: vi.fn(),
      update: vi.fn(async () => undefined),
      processAutoReorders: vi.fn(async () => [{ id: 'r1' }, { id: 'r2' }]),
      ...o,
    };
  }

  it('requires a garage for listing and processing (400-mapped)', async () => {
    const s = new ReorderSettingService(repo() as never);
    expect(() => s.list(undefined)).toThrow(ValidationError);
    await expect(s.process(undefined)).rejects.toBeInstanceOf(ValidationError);
  });

  it('404s a missing setting on update', async () => {
    await expect(new ReorderSettingService(repo() as never).update('x', {}, 'g1')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns processed reorders with a count', async () => {
    const result = await new ReorderSettingService(repo() as never).process('g1');
    expect(result).toEqual({ reorders: [{ id: 'r1' }, { id: 'r2' }], count: 2 });
  });
});

describe('PricingHistoryService', () => {
  it('reads pricing history by spare part', async () => {
    const r = { getBySparePart: vi.fn(async () => [{ id: 'ph1' }]), create: vi.fn() };
    expect(await new PricingHistoryService(r as never).getBySparePart('sp1')).toEqual([{ id: 'ph1' }]);
    expect(r.getBySparePart).toHaveBeenCalledWith('sp1');
  });
});
