/**
 * DI tokens (Phase E3). Typed identifiers for injectable dependencies, kept in
 * one place so providers and consumers agree on identity and type.
 */

import { token } from './container';
import type { EventBus } from '../events/event-bus';
import type { ICustomerRepository } from '../../modules/customers/repositories/customer.repository';
import type { CustomerService } from '../../modules/customers/services/customer.service';
import type { IVehicleRepository } from '../../modules/vehicles/repositories/vehicle.repository';
import type { VehicleService } from '../../modules/vehicles/services/vehicle.service';

export const EVENT_BUS = token<EventBus>('EventBus');
export const CUSTOMER_REPOSITORY = token<ICustomerRepository>('CustomerRepository');
export const CUSTOMER_SERVICE = token<CustomerService>('CustomerService');
export const VEHICLE_REPOSITORY = token<IVehicleRepository>('VehicleRepository');
export const VEHICLE_SERVICE = token<VehicleService>('VehicleService');
