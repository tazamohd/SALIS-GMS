/**
 * Appointment DTO mappers (Phase E9/E10 — DTO boundary). Passthrough today to
 * preserve the exact current response contract.
 */

import type { Appointment } from '../domain/appointment.types';

export type AppointmentDTO = Appointment;

export function toAppointmentDTO(appointment: Appointment): AppointmentDTO {
  return appointment;
}

export function toAppointmentListDTO(appointments: Appointment[]): AppointmentDTO[] {
  return appointments.map(toAppointmentDTO);
}
