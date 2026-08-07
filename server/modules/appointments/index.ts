/**
 * Appointments module assembly (Phase E1/E2). Wires the layered appointment
 * read surface into an Express router via DI. Route paths and response shapes
 * are identical to the legacy `server/routes/appointments.ts` it replaces.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { APPOINTMENT_SERVICE } from '../../infrastructure/di/tokens';
import { makeAppointmentController } from './controllers/appointment.controller';
import { appointmentErrorHandler } from './controllers/appointment.error';
import type { AppointmentService } from './services/appointment.service';

export interface AppointmentsModuleDeps {
  service?: AppointmentService;
}

export function createAppointmentsModule(deps: AppointmentsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(APPOINTMENT_SERVICE);
  const controller = makeAppointmentController(service);
  const router = Router();

  router.get('/appointments', isAuthenticated, asyncHandler(controller.list));
  router.get('/appointments/:id', isAuthenticated, asyncHandler(controller.getById));

  router.use(appointmentErrorHandler);
  return router;
}

export default createAppointmentsModule();
