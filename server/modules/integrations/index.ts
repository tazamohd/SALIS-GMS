/**
 * Integrations module assembly (Phase E1/E2). Wires the external-integrations
 * domain — integration connections + sync logs, Google-Calendar sync,
 * Gmail send, and the accounting/OBD reads + not-configured stubs — into an
 * Express router via DI. The `:id` connection mutations keep their tenant-scoped
 * `requireResourceOwnership` guards; all routes are `isAuthenticated`.
 */

import { Router } from 'express';
import { isAuthenticated } from '../../auth';
import { requireResourceOwnership } from '../../middleware/resourceOwnership';
import { asyncHandler } from '../../middleware/asyncHandler';
import { getAppContainer } from '../../infrastructure/di/composition-root';
import { INTEGRATIONS_SERVICE } from '../../infrastructure/di/tokens';
import { makeIntegrationsController } from './controllers/integrations.controller';
import type { IntegrationsService } from './services/integrations.service';

export interface IntegrationsModuleDeps {
  service?: IntegrationsService;
}

export function createIntegrationsModule(deps: IntegrationsModuleDeps = {}): Router {
  const service = deps.service ?? getAppContainer().resolve(INTEGRATIONS_SERVICE);
  const c = makeIntegrationsController(service);
  const router = Router();
  const ownConn = requireResourceOwnership({ table: 'integration_connections' });

  // Connections + sync logs
  router.get('/integrations/connections', isAuthenticated, asyncHandler(c.listConnections));
  router.post('/integrations/connections', isAuthenticated, asyncHandler(c.createConnection));
  router.patch('/integrations/connections/:id', isAuthenticated, ownConn, asyncHandler(c.updateConnection));
  router.delete('/integrations/connections/:id', isAuthenticated, ownConn, asyncHandler(c.deleteConnection));
  router.get('/integrations/sync-logs', isAuthenticated, asyncHandler(c.listSyncLogs));

  // Google Calendar
  router.post('/integrations/google-calendar/sync-appointment', isAuthenticated, asyncHandler(c.gcSyncAppointment));
  router.post('/integrations/google-calendar/update-event', isAuthenticated, asyncHandler(c.gcUpdateEvent));
  router.delete('/integrations/google-calendar/delete-event/:eventId', isAuthenticated, asyncHandler(c.gcDeleteEvent));

  // Gmail
  router.post('/integrations/gmail/send-email', isAuthenticated, asyncHandler(c.gmailSend));
  router.post('/integrations/gmail/send-appointment-confirmation', isAuthenticated, asyncHandler(c.gmailAppointmentConfirmation));
  router.post('/integrations/gmail/send-invoice', isAuthenticated, asyncHandler(c.gmailInvoice));
  router.post('/integrations/gmail/send-service-reminder', isAuthenticated, asyncHandler(c.gmailServiceReminder));

  // Accounting + OBD (reads + not-configured stubs)
  router.get('/integrations/accounting/transactions', isAuthenticated, asyncHandler(c.accountingTransactions));
  router.post('/integrations/accounting/sync', isAuthenticated, asyncHandler(c.accountingSync));
  router.get('/integrations/obd/diagnostics', isAuthenticated, asyncHandler(c.obdDiagnostics));
  router.post('/integrations/obd/scan', isAuthenticated, asyncHandler(c.obdScan));

  return router;
}

export default createIntegrationsModule();
