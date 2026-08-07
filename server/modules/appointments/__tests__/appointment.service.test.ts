import { describe, it, expect, vi } from 'vitest';
import { AppointmentService } from '../services/appointment.service';
import type { IAppointmentRepository } from '../repositories/appointment.repository';
import type { Appointment } from '../domain/appointment.types';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function appt(id: string, garageId: string | null): Appointment {
  return { id, garageId } as unknown as Appointment;
}

function makeRepo(overrides: Partial<IAppointmentRepository> = {}): IAppointmentRepository {
  return {
    getById: vi.fn(async () => undefined),
    listPaginated: vi.fn(async () => []),
    count: vi.fn(async () => 0),
    ...overrides,
  };
}

describe('AppointmentService.list', () => {
  it('pins to the session garage and ignores ?garage_id for a tenant user', async () => {
    const repo = makeRepo({ listPaginated: vi.fn(async () => [appt('a1', 'g1')]), count: vi.fn(async () => 4) });
    const service = new AppointmentService(repo);
    const result = await service.list({ auth: { garageId: 'g1' }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g1', 25, 0);
    expect(result.total).toBe(4);
  });

  it('honors ?garage_id for a platform (garage-less) user', async () => {
    const repo = makeRepo();
    const service = new AppointmentService(repo);
    await service.list({ auth: { garageId: null }, garageIdParam: 'g2', limit: 25, offset: 0 });
    expect(repo.listPaginated).toHaveBeenCalledWith('g2', 25, 0);
  });
});

describe('AppointmentService.getVisible', () => {
  it('returns a same-garage appointment', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => appt('a1', 'g1')) });
    const service = new AppointmentService(repo);
    await expect(service.getVisible('a1', { garageId: 'g1' })).resolves.toMatchObject({ id: 'a1' });
  });

  it('throws NotFound when missing', async () => {
    const service = new AppointmentService(makeRepo());
    await expect(service.getVisible('x', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws NotFound (not 403) on cross-garage access', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => appt('a1', 'g2')) });
    const service = new AppointmentService(repo);
    await expect(service.getVisible('a1', { garageId: 'g1' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('allows a platform user to read across garages', async () => {
    const repo = makeRepo({ getById: vi.fn(async () => appt('a1', 'g2')) });
    const service = new AppointmentService(repo);
    await expect(service.getVisible('a1', { garageId: null })).resolves.toMatchObject({ id: 'a1' });
  });
});
