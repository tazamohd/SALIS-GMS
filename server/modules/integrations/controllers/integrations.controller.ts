/**
 * Integrations controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the integrations domain. Preserves the legacy monolith
 * contract: the connection reads/writes with `res.json` (no 201), the
 * garage-scoped not-found 404 surfaced from the service, the provider sync
 * results returned verbatim, and the exact per-handler 500 bodies — including
 * the `{ message, error }` shape on the create/sync handlers. No data access.
 */

import type { Request, Response } from 'express';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { IntegrationsService } from '../services/integrations.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function emsg(error: unknown): string | undefined {
  return (error as { message?: string })?.message;
}

export function makeIntegrationsController(service: IntegrationsService) {
  return {
    // ---- Connections ---------------------------------------------------
    async listConnections(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listConnections(garageOf(req)));
      } catch (error) {
        console.error('Error fetching integration connections:', error);
        res.status(500).json({ message: 'Failed to fetch integration connections' });
      }
    },
    async createConnection(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.createConnection(garageOf(req), req.body ?? {}));
      } catch (error) {
        console.error('Error creating integration connection:', error);
        res.status(500).json({ message: 'Failed to create integration connection', error: emsg(error) });
      }
    },
    async updateConnection(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateConnection(req.params.id, garageOf(req), req.body ?? {}));
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        console.error('Error updating integration connection:', error);
        res.status(500).json({ message: 'Failed to update integration connection' });
      }
    },
    async deleteConnection(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteConnection(req.params.id, garageOf(req)));
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ message: error.message });
          return;
        }
        console.error('Error deleting integration connection:', error);
        res.status(500).json({ message: 'Failed to delete integration connection' });
      }
    },
    async listSyncLogs(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listSyncLogs(garageOf(req), str(req.query.connectionId)));
      } catch (error) {
        console.error('Error fetching integration sync logs:', error);
        res.status(500).json({ message: 'Failed to fetch integration sync logs' });
      }
    },

    // ---- Google Calendar ----------------------------------------------
    async gcSyncAppointment(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.syncGoogleAppointment(garageOf(req), req.body));
      } catch (error) {
        console.error('Error syncing to Google Calendar:', error);
        res.status(500).json({ message: 'Failed to sync to Google Calendar', error: emsg(error) });
      }
    },
    async gcUpdateEvent(req: Request, res: Response): Promise<void> {
      try {
        const { eventId, appointment } = req.body ?? {};
        res.json(await service.updateGoogleEvent(garageOf(req), eventId, appointment));
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        res.status(500).json({ message: 'Failed to update Google Calendar event', error: emsg(error) });
      }
    },
    async gcDeleteEvent(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteGoogleEvent(garageOf(req), req.params.eventId));
      } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
        res.status(500).json({ message: 'Failed to delete Google Calendar event', error: emsg(error) });
      }
    },

    // ---- Gmail ---------------------------------------------------------
    async gmailSend(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.gmailSend(garageOf(req), req.body));
      } catch (error) {
        console.error('Error sending email via Gmail:', error);
        res.status(500).json({ message: 'Failed to send email', error: emsg(error) });
      }
    },
    async gmailAppointmentConfirmation(req: Request, res: Response): Promise<void> {
      try {
        const { appointment, customer } = req.body ?? {};
        res.json(await service.gmailAppointmentConfirmation(garageOf(req), appointment, customer));
      } catch (error) {
        console.error('Error sending appointment confirmation:', error);
        res.status(500).json({ message: 'Failed to send appointment confirmation', error: emsg(error) });
      }
    },
    async gmailInvoice(req: Request, res: Response): Promise<void> {
      try {
        const { invoice, customer } = req.body ?? {};
        res.json(await service.gmailInvoice(garageOf(req), invoice, customer));
      } catch (error) {
        console.error('Error sending invoice email:', error);
        res.status(500).json({ message: 'Failed to send invoice email', error: emsg(error) });
      }
    },
    async gmailServiceReminder(req: Request, res: Response): Promise<void> {
      try {
        const { reminder, customer, vehicle } = req.body ?? {};
        res.json(await service.gmailServiceReminder(garageOf(req), reminder, customer, vehicle));
      } catch (error) {
        console.error('Error sending service reminder:', error);
        res.status(500).json({ message: 'Failed to send service reminder', error: emsg(error) });
      }
    },

    // ---- Accounting + OBD ---------------------------------------------
    async accountingTransactions(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getAccountingTransactions(garageOf(req), str(req.query.syncStatus)));
      } catch (error) {
        console.error('Error fetching accounting transactions:', error);
        res.status(500).json({ message: 'Failed to fetch accounting transactions' });
      }
    },
    async accountingSync(_req: Request, res: Response): Promise<void> {
      try {
        res.json(service.accountingSyncStub());
      } catch (error) {
        console.error('Error syncing accounting data:', error);
        res.status(500).json({ message: 'Failed to sync accounting data', error: emsg(error) });
      }
    },
    async obdDiagnostics(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getOBDDiagnostics(garageOf(req), str(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching OBD diagnostics:', error);
        res.status(500).json({ message: 'Failed to fetch OBD diagnostics' });
      }
    },
    async obdScan(_req: Request, res: Response): Promise<void> {
      try {
        res.json(service.obdScanStub());
      } catch (error) {
        console.error('Error scanning OBD data:', error);
        res.status(500).json({ message: 'Failed to scan OBD data', error: emsg(error) });
      }
    },
  };
}

export type IntegrationsController = ReturnType<typeof makeIntegrationsController>;
