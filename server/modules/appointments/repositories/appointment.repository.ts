/**
 * Appointment repository (Phase E4 — Repository Pattern).
 *
 * The only place in the appointment module that touches the data layer;
 * delegates to the legacy `storage` facade (strangler-fig seam).
 */

import { storage } from '../../../storage';
import type { Appointment } from '../domain/appointment.types';

export interface IAppointmentRepository {
  getById(id: string): Promise<Appointment | undefined>;
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Appointment[]>;
  count(garageId: string | undefined): Promise<number>;
}

export class AppointmentRepository implements IAppointmentRepository {
  getById(id: string): Promise<Appointment | undefined> {
    return storage.getAppointment(id);
  }

  listPaginated(
    garageId: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Appointment[]> {
    return storage.getAppointmentsPaginated(garageId, limit, offset);
  }

  count(garageId: string | undefined): Promise<number> {
    return storage.countAppointments(garageId);
  }
}
