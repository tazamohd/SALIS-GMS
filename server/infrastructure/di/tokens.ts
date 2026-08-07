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
import type { IAppointmentRepository } from '../../modules/appointments/repositories/appointment.repository';
import type { AppointmentService } from '../../modules/appointments/services/appointment.service';
import type { IGarageRepository } from '../../modules/garage/repositories/garage.repository';
import type { GarageService } from '../../modules/garage/services/garage.service';
import type { IJobCardRepository } from '../../modules/jobcards/repositories/jobcard.repository';
import type { JobCardService } from '../../modules/jobcards/services/jobcard.service';
import type { IEstimateRepository } from '../../modules/estimates/repositories/estimate.repository';
import type { EstimateService } from '../../modules/estimates/services/estimate.service';

export const EVENT_BUS = token<EventBus>('EventBus');
export const CUSTOMER_REPOSITORY = token<ICustomerRepository>('CustomerRepository');
export const CUSTOMER_SERVICE = token<CustomerService>('CustomerService');
export const VEHICLE_REPOSITORY = token<IVehicleRepository>('VehicleRepository');
export const VEHICLE_SERVICE = token<VehicleService>('VehicleService');
export const APPOINTMENT_REPOSITORY = token<IAppointmentRepository>('AppointmentRepository');
export const APPOINTMENT_SERVICE = token<AppointmentService>('AppointmentService');
export const GARAGE_REPOSITORY = token<IGarageRepository>('GarageRepository');
export const GARAGE_SERVICE = token<GarageService>('GarageService');
export const JOBCARD_REPOSITORY = token<IJobCardRepository>('JobCardRepository');
export const JOBCARD_SERVICE = token<JobCardService>('JobCardService');
export const ESTIMATE_REPOSITORY = token<IEstimateRepository>('EstimateRepository');
export const ESTIMATE_SERVICE = token<EstimateService>('EstimateService');
