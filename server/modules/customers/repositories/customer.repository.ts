/**
 * Customer repository (Phase E4 — Repository Pattern).
 *
 * The ONLY place in the customer module that touches the data layer. It
 * delegates to the legacy `storage` facade (strangler-fig seam): the boundary
 * is enforced now — services/controllers never import `storage` — and these
 * method bodies can later move to direct Drizzle queries without changing any
 * caller. Behavior is byte-for-byte identical to the pre-migration routes.
 */

import { storage } from '../../../storage';
import type { Customer } from '../domain/customer.types';

export interface ICustomerRepository {
  getById(id: string): Promise<Customer | undefined>;
  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Customer[]>;
  count(garageId: string | undefined): Promise<number>;
  search(garageId: string, pattern: string, limit: number): Promise<Customer[]>;
  getVehicles(customerId: string): ReturnType<typeof storage.getCustomerVehicles>;
  getJobCards(customerId: string): ReturnType<typeof storage.getCustomerJobCards>;
  getInvoices(customerId: string): ReturnType<typeof storage.getCustomerInvoices>;
  getPayments(customerId: string): ReturnType<typeof storage.getCustomerPayments>;
  getNotes(customerId: string): ReturnType<typeof storage.getCustomerNotes>;
  getServiceReminders(customerId: string): ReturnType<typeof storage.getCustomerServiceReminders>;
  getReviews(customerId: string): ReturnType<typeof storage.getCustomerServiceReviews>;
  getSignatures(customerId: string): ReturnType<typeof storage.getCustomerServiceSignatures>;
}

export class CustomerRepository implements ICustomerRepository {
  getById(id: string): Promise<Customer | undefined> {
    return storage.getCustomer(id);
  }

  listPaginated(garageId: string | undefined, limit: number, offset: number): Promise<Customer[]> {
    return storage.getCustomersPaginated(garageId, limit, offset);
  }

  count(garageId: string | undefined): Promise<number> {
    return storage.countCustomers(garageId);
  }

  search(garageId: string, pattern: string, limit: number): Promise<Customer[]> {
    return storage.searchCustomers(garageId, pattern, limit);
  }

  getVehicles(customerId: string) {
    return storage.getCustomerVehicles(customerId);
  }

  getJobCards(customerId: string) {
    return storage.getCustomerJobCards(customerId);
  }

  getInvoices(customerId: string) {
    return storage.getCustomerInvoices(customerId);
  }

  getPayments(customerId: string) {
    return storage.getCustomerPayments(customerId);
  }

  getNotes(customerId: string) {
    return storage.getCustomerNotes(customerId);
  }

  getServiceReminders(customerId: string) {
    return storage.getCustomerServiceReminders(customerId);
  }

  getReviews(customerId: string) {
    return storage.getCustomerServiceReviews(customerId);
  }

  getSignatures(customerId: string) {
    return storage.getCustomerServiceSignatures(customerId);
  }
}
