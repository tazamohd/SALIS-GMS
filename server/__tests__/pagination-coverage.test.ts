/**
 * Tests for the new pagination methods on appointments, spare parts, suppliers,
 * vehicles, and customers
 *
 * Contract tests verifying that the route handlers use the paginated methods
 * instead of the legacy ones.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Pagination coverage expansion (Wave E)', () => {
  const routesPath = path.resolve(process.cwd(), 'server/routes.ts');
  const systemRoutesPath = path.resolve(process.cwd(), 'server/routes/system.ts');
  // Phase E: appointment reads moved into the layered module; the data-layer
  // bindings now live in the repository.
  const appointmentModuleIndexPath = path.resolve(process.cwd(), 'server/modules/appointments/index.ts');
  const appointmentRepositoryPath = path.resolve(
    process.cwd(),
    'server/modules/appointments/repositories/appointment.repository.ts',
  );
  const sparePartRoutesPath = path.resolve(process.cwd(), 'server/routes/spare-parts.ts');
  const supplierRoutesPath = path.resolve(process.cwd(), 'server/routes/suppliers.ts');
  // Phase E: vehicle reads moved into the layered module; the data-layer
  // bindings now live in the repository.
  const vehicleModuleIndexPath = path.resolve(process.cwd(), 'server/modules/vehicles/index.ts');
  const vehicleRepositoryPath = path.resolve(
    process.cwd(),
    'server/modules/vehicles/repositories/vehicle.repository.ts',
  );
  // Phase E: customer reads moved into the layered module; the data-layer
  // bindings now live in the repository.
  const customerModuleIndexPath = path.resolve(process.cwd(), 'server/modules/customers/index.ts');
  const customerRepositoryPath = path.resolve(
    process.cwd(),
    'server/modules/customers/repositories/customer.repository.ts',
  );
  const storagePath = path.resolve(process.cwd(), 'server/storage.ts');
  const routesSource = fs.readFileSync(routesPath, 'utf-8');
  const systemRoutesSource = fs.readFileSync(systemRoutesPath, 'utf-8');
  const appointmentModuleIndexSource = fs.readFileSync(appointmentModuleIndexPath, 'utf-8');
  const appointmentRepositorySource = fs.readFileSync(appointmentRepositoryPath, 'utf-8');
  const sparePartRoutesSource = fs.readFileSync(sparePartRoutesPath, 'utf-8');
  const supplierRoutesSource = fs.readFileSync(supplierRoutesPath, 'utf-8');
  const vehicleModuleIndexSource = fs.readFileSync(vehicleModuleIndexPath, 'utf-8');
  const vehicleRepositorySource = fs.readFileSync(vehicleRepositoryPath, 'utf-8');
  const customerModuleIndexSource = fs.readFileSync(customerModuleIndexPath, 'utf-8');
  const customerRepositorySource = fs.readFileSync(customerRepositoryPath, 'utf-8');
  const storageSource = fs.readFileSync(storagePath, 'utf-8');

  const handlerFor = (source: string, marker: string, nextPrefix: string) => {
    const startIdx = source.indexOf(marker);
    expect(startIdx).toBeGreaterThanOrEqual(0);
    const endIdx = source.indexOf(nextPrefix, startIdx + marker.length);
    return source.slice(startIdx, endIdx > startIdx ? endIdx : startIdx + 1500);
  };

  describe('Storage methods declared', () => {
    it('declares getAppointmentsPaginated', () => {
      expect(storageSource).toMatch(/getAppointmentsPaginated\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares countAppointments', () => {
      expect(storageSource).toMatch(/countAppointments\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares getSparePartsPaginated', () => {
      expect(storageSource).toMatch(/getSparePartsPaginated\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares countSpareParts', () => {
      expect(storageSource).toMatch(/countSpareParts\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares getSuppliersPaginated', () => {
      expect(storageSource).toMatch(/getSuppliersPaginated\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares countSuppliers', () => {
      expect(storageSource).toMatch(/countSuppliers\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares getVehiclesPaginated', () => {
      expect(storageSource).toMatch(/getVehiclesPaginated\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares countVehicles', () => {
      expect(storageSource).toMatch(/countVehicles\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares getCustomersPaginated', () => {
      expect(storageSource).toMatch(/getCustomersPaginated\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });

    it('declares countCustomers', () => {
      expect(storageSource).toMatch(/countCustomers\s*\(\s*garageId:\s*string\s*\|\s*undefined/);
    });
  });

  describe('Route handlers use paginated methods', () => {
    it('/api/appointments uses getAppointmentsPaginated (via the module repository)', () => {
      expect(appointmentModuleIndexSource).toMatch(/router\.get\(\s*['"]\/appointments['"],\s*isAuthenticated/);
      expect(appointmentRepositorySource).toMatch(/storage\.getAppointmentsPaginated\(/);
      expect(appointmentRepositorySource).toMatch(/storage\.countAppointments\(/);
    });

    it('/api/spare-parts uses getSparePartsPaginated', () => {
      const handler = handlerFor(sparePartRoutesSource, "router.get('/spare-parts'", 'router.');
      expect(handler).toMatch(/storage\.getSparePartsPaginated\(/);
      expect(handler).toMatch(/storage\.countSpareParts\(/);
    });

    it('/api/suppliers uses getSuppliersPaginated', () => {
      const handler = handlerFor(supplierRoutesSource, "router.get('/suppliers'", 'router.');
      expect(handler).toMatch(/storage\.getSuppliersPaginated\(/);
      expect(handler).toMatch(/storage\.countSuppliers\(/);
    });

    it('/api/vehicles uses getVehiclesPaginated (via the module repository)', () => {
      expect(vehicleModuleIndexSource).toMatch(/router\.get\(\s*['"]\/vehicles['"],\s*isAuthenticated/);
      expect(vehicleRepositorySource).toMatch(/storage\.getVehiclesPaginated\(/);
      expect(vehicleRepositorySource).toMatch(/storage\.countVehicles\(/);
    });

    it('/api/customers uses getCustomersPaginated (via the module repository)', () => {
      expect(customerModuleIndexSource).toMatch(/router\.get\(\s*['"]\/customers['"],\s*isAuthenticated/);
      expect(customerRepositorySource).toMatch(/storage\.getCustomersPaginated\(/);
      expect(customerRepositorySource).toMatch(/storage\.countCustomers\(/);
      expect(customerRepositorySource).toMatch(/storage\.searchCustomers\(/);
    });
  });

  describe('Health check endpoint', () => {
    it('defines /api/health route', () => {
      expect(systemRoutesSource).toMatch(/router\.get\(\s*['"]\/api\/health['"]\s*,/);
    });

    it('does not require auth (no isAuthenticated middleware)', () => {
      const handler = handlerFor(systemRoutesSource, "router.get('/api/health'", 'router.');
      expect(handler).not.toMatch(/isAuthenticated/);
    });

    it('checks DB connectivity', () => {
      const handler = handlerFor(systemRoutesSource, "router.get('/api/health'", 'router.');
      expect(handler).toMatch(/db\.execute/);
      expect(handler).toMatch(/SELECT 1/);
    });

    it('returns status: ok on success', () => {
      const handler = handlerFor(systemRoutesSource, "router.get('/api/health'", 'router.');
      expect(handler).toMatch(/status:\s*['"]ok['"]/);
    });

    it('returns 503 on DB failure', () => {
      const handler = handlerFor(systemRoutesSource, "router.get('/api/health'", 'router.');
      expect(handler).toMatch(/status\(503\)/);
    });
  });
});
