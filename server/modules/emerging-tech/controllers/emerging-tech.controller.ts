/**
 * Emerging-tech controller (Phase E2 — controller layer).
 *
 * Thin HTTP adapter for the emerging-technologies domain. Preserves the legacy
 * monolith contract: the raw `res.json` reads (with the biometric empty-object
 * fallback in the service), the exact per-handler `{ message }` 500 strings
 * (with the `console.error` labels), and the seeder's vehicle-required 400 +
 * the `{ message, results }` success / `{ message, error }` 500 shapes.
 */

import type { Request, Response } from 'express';
import { ValidationError } from '../../../infrastructure/errors/domain-errors';
import type { EmergingTechService } from '../services/emerging-tech.service';

function garageOf(req: Request): string | undefined {
  return (req.user as { garageId?: string } | undefined)?.garageId;
}
function uid(req: Request): string | undefined {
  return (req.user as { id?: string } | undefined)?.id;
}
function q(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function makeEmergingTechController(service: EmergingTechService) {
  return {
    async blockchain(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.blockchain(q(req.query.vehicleId), garageOf(req)));
      } catch (error) {
        console.error('Error fetching blockchain records:', error);
        res.status(500).json({ message: 'Failed to fetch blockchain records' });
      }
    },
    async arGuides(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.arGuides(garageOf(req)));
      } catch (error) {
        console.error('Error fetching AR guides:', error);
        res.status(500).json({ message: 'Failed to fetch AR guides' });
      }
    },
    async iotSensors(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.iotSensors(q(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching IoT sensors:', error);
        res.status(500).json({ message: 'Failed to fetch IoT sensors' });
      }
    },
    async iotReadings(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.iotReadings(q(req.query.sensorId), q(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching IoT readings:', error);
        res.status(500).json({ message: 'Failed to fetch IoT readings' });
      }
    },
    async models3D(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.models3D(garageOf(req)));
      } catch (error) {
        console.error('Error fetching 3D models:', error);
        res.status(500).json({ message: 'Failed to fetch 3D models' });
      }
    },
    async droneInspections(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.droneInspections(garageOf(req), q(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching drone inspections:', error);
        res.status(500).json({ message: 'Failed to fetch drone inspections' });
      }
    },
    async aiVideo(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.aiVideo(q(req.query.customerId), q(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching AI video analyses:', error);
        res.status(500).json({ message: 'Failed to fetch AI video analyses' });
      }
    },
    async digitalTwins(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.digitalTwins(q(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching digital twins:', error);
        res.status(500).json({ message: 'Failed to fetch digital twins' });
      }
    },
    async fraudCases(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.fraudCases(garageOf(req), q(req.query.riskLevel)));
      } catch (error) {
        console.error('Error fetching fraud cases:', error);
        res.status(500).json({ message: 'Failed to fetch fraud cases' });
      }
    },
    async biometricProfile(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.biometricProfile(uid(req) || 'default-user'));
      } catch (error) {
        console.error('Error fetching biometric profile:', error);
        res.status(500).json({ message: 'Failed to fetch biometric profile' });
      }
    },
    async collaborationSessions(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.collaborationSessions(garageOf(req), q(req.query.status)));
      } catch (error) {
        console.error('Error fetching collaboration sessions:', error);
        res.status(500).json({ message: 'Failed to fetch collaboration sessions' });
      }
    },
    async edgeDevices(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.edgeDevices(garageOf(req)));
      } catch (error) {
        console.error('Error fetching edge devices:', error);
        res.status(500).json({ message: 'Failed to fetch edge devices' });
      }
    },
    async edgeDiagnostics(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.edgeDiagnostics(q(req.query.deviceId), q(req.query.vehicleId)));
      } catch (error) {
        console.error('Error fetching edge diagnostics:', error);
        res.status(500).json({ message: 'Failed to fetch edge diagnostics' });
      }
    },
    async pricingOptimization(req: Request, res: Response): Promise<void> {
      try {
        res.json(await service.pricingOptimizations(garageOf(req), q(req.query.serviceType)));
      } catch (error) {
        console.error('Error fetching pricing optimizations:', error);
        res.status(500).json({ message: 'Failed to fetch pricing optimizations' });
      }
    },
    async seed(req: Request, res: Response): Promise<void> {
      try {
        const results = await service.seed(garageOf(req), uid(req) || 'default-user');
        res.json({ message: 'Sample data seeded successfully!', results });
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({ message: error.message });
          return;
        }
        console.error('Error seeding emerging tech data:', error);
        res.status(500).json({ message: 'Failed to seed data', error: String(error) });
      }
    },
  };
}
