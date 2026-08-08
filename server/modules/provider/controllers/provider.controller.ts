/**
 * Provider controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the provider marketplace surface. Preserves the legacy
 * monolith contract: the "No provider account associated" 403, the per-surface
 * status 400s and not-found 404s (surfaced from the service as domain errors),
 * the `insertProviderOfferingSchema` Zod 400s at the boundary (`sanitizeZodError`),
 * the `201`s, and the exact per-handler `{ message }` 500 bodies. No business
 * rules, no data-layer access.
 */

import type { Request, Response } from 'express';
import { insertProviderOfferingSchema } from '@shared/schema';
import { sanitizeZodError } from '../../../utils/validation-errors';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';
import type { ProviderService } from '../services/provider.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

/** Map a domain error to its legacy status/body; returns true if handled. */
function mapDomain(res: Response, error: unknown): boolean {
  if (error instanceof AuthorizationError) {
    res.status(403).json({ message: error.message });
    return true;
  }
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return true;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return true;
  }
  return false;
}

export function makeProviderController(service: ProviderService) {
  return {
    // ---- Bookings --------------------------------------------------------
    async listBookings(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listBookings(garageOf(req), str(req.query.status)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error listing provider bookings:', error);
        res.status(500).json({ message: 'Failed to load bookings' });
      }
    },

    async updateBooking(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateBooking(garageOf(req), req.params.id, req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error updating provider booking:', error);
        res.status(500).json({ message: 'Failed to update booking' });
      }
    },

    // ---- Offerings -------------------------------------------------------
    async listOfferings(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listOfferings(garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error listing provider offerings:', error);
        res.status(500).json({ message: 'Failed to load offerings' });
      }
    },

    async createOffering(req: Request, res: Response): Promise<void> {
      try {
        const providerId = service.requireProvider(garageOf(req));
        const parsed = insertProviderOfferingSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.status(201).json(await service.createOffering(providerId, parsed.data));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error creating provider offering:', error);
        res.status(500).json({ message: 'Failed to create offering' });
      }
    },

    async updateOffering(req: Request, res: Response): Promise<void> {
      try {
        const providerId = service.requireProvider(garageOf(req));
        const parsed = insertProviderOfferingSchema.partial().safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json(sanitizeZodError(parsed.error));
          return;
        }
        res.json(await service.updateOffering(providerId, req.params.id, parsed.data));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error updating provider offering:', error);
        res.status(500).json({ message: 'Failed to update offering' });
      }
    },

    async deleteOffering(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.deleteOffering(garageOf(req), req.params.id));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error deleting provider offering:', error);
        res.status(500).json({ message: 'Failed to remove offering' });
      }
    },

    // ---- Profile ---------------------------------------------------------
    async getProfile(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.getProfile(garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error loading provider profile:', error);
        res.status(500).json({ message: 'Failed to load profile' });
      }
    },

    async updateProfile(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateProfile(garageOf(req), req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error updating provider profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
      }
    },

    // ---- Orders (provider side) -----------------------------------------
    async listOrders(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listOrders(garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error listing provider orders:', error);
        res.status(500).json({ message: 'Failed to load orders' });
      }
    },

    async updateOrder(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.updateOrder(garageOf(req), req.params.id, req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error updating provider order:', error);
        res.status(500).json({ message: 'Failed to update order' });
      }
    },

    // ---- Insurance quotes (provider side) -------------------------------
    async listQuotes(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.listQuotes(garageOf(req)));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error listing provider quotes:', error);
        res.status(500).json({ message: 'Failed to load quotes' });
      }
    },

    async respondQuote(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.respondQuote(garageOf(req), req.params.id, req.body ?? {}));
      } catch (error) {
        if (mapDomain(res, error)) return;
        console.error('Error responding to quote:', error);
        res.status(500).json({ message: 'Failed to respond to quote' });
      }
    },
  };
}

export type ProviderController = ReturnType<typeof makeProviderController>;
