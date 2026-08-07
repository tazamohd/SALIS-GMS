/**
 * Appointment service (Phase E5 — Domain Services).
 *
 * Owns the appointment module's business rules: tenant scoping and cross-garage
 * visibility (404, never 403). The list is tenant-pinned exactly as before
 * (session garage wins; `?garage_id` is honored only for garage-less platform
 * users). All data access flows through the injected repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IAppointmentRepository } from '../repositories/appointment.repository';
import type {
  Appointment,
  AppointmentAuthContext,
  AppointmentListParams,
  AppointmentListResult,
} from '../domain/appointment.types';

export class AppointmentService {
  constructor(private readonly repository: IAppointmentRepository) {}

  private effectiveGarageId(
    auth: AppointmentAuthContext,
    garageIdParam?: string,
  ): string | undefined {
    return auth.garageId ?? garageIdParam ?? undefined;
  }

  async list(params: AppointmentListParams): Promise<AppointmentListResult> {
    const garageId = this.effectiveGarageId(params.auth, params.garageIdParam);
    const [rows, total] = await Promise.all([
      this.repository.listPaginated(garageId, params.limit, params.offset),
      this.repository.count(garageId),
    ]);
    return { rows, total };
  }

  async getVisible(id: string, auth: AppointmentAuthContext): Promise<Appointment> {
    const appointment = await this.repository.getById(id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found', { context: { id } });
    }
    if (auth.garageId && appointment.garageId && appointment.garageId !== auth.garageId) {
      throw new NotFoundError('Appointment not found', { context: { id } });
    }
    return appointment;
  }
}
