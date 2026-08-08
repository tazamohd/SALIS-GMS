/**
 * Provider repository (Phase E). The only data-layer access for the provider
 * marketplace surface — the caller's garage acting as a marketplace provider:
 * its bookings, offerings, public profile, product orders and insurance quotes.
 * Delegates to the legacy `storage` facade (strangler seam), including the
 * best-effort notification writes the provider side-effects fan out.
 */

import { storage } from '../../../storage';

type NotificationInput = Parameters<typeof storage.createNotification>[0];

export interface IProviderRepository {
  listBookings(providerId: string, status?: string): ReturnType<typeof storage.listProviderBookings>;
  updateBooking(
    id: string,
    providerId: string,
    data: { status?: string; providerNotes?: string },
  ): ReturnType<typeof storage.updateProviderBooking>;

  listOfferings(providerId: string): ReturnType<typeof storage.listProviderOfferings>;
  createOffering(
    data: Parameters<typeof storage.createProviderOffering>[0],
  ): ReturnType<typeof storage.createProviderOffering>;
  updateOffering(
    id: string,
    providerId: string,
    data: Parameters<typeof storage.updateProviderOffering>[2],
  ): ReturnType<typeof storage.updateProviderOffering>;
  deleteOffering(id: string, providerId: string): ReturnType<typeof storage.deleteProviderOffering>;

  getProvider(id: string): ReturnType<typeof storage.getMarketplaceProvider>;
  updateProfile(
    providerId: string,
    data: Parameters<typeof storage.updateProviderProfile>[1],
  ): ReturnType<typeof storage.updateProviderProfile>;

  listOrders(providerId: string): ReturnType<typeof storage.listProviderOrders>;
  updateOrder(
    id: string,
    providerId: string,
    data: { status?: string; providerNotes?: string },
  ): ReturnType<typeof storage.updateProviderOrder>;

  listQuotes(providerId: string): ReturnType<typeof storage.listProviderQuotes>;
  respondQuote(
    id: string,
    providerId: string,
    data: Parameters<typeof storage.respondInsuranceQuote>[2],
  ): ReturnType<typeof storage.respondInsuranceQuote>;

  createNotification(data: NotificationInput): ReturnType<typeof storage.createNotification>;
}

export class ProviderRepository implements IProviderRepository {
  listBookings(providerId: string, status?: string) {
    return storage.listProviderBookings(providerId, status);
  }
  updateBooking(id: string, providerId: string, data: { status?: string; providerNotes?: string }) {
    return storage.updateProviderBooking(id, providerId, data);
  }

  listOfferings(providerId: string) {
    return storage.listProviderOfferings(providerId);
  }
  createOffering(data: Parameters<typeof storage.createProviderOffering>[0]) {
    return storage.createProviderOffering(data);
  }
  updateOffering(id: string, providerId: string, data: Parameters<typeof storage.updateProviderOffering>[2]) {
    return storage.updateProviderOffering(id, providerId, data);
  }
  deleteOffering(id: string, providerId: string) {
    return storage.deleteProviderOffering(id, providerId);
  }

  getProvider(id: string) {
    return storage.getMarketplaceProvider(id);
  }
  updateProfile(providerId: string, data: Parameters<typeof storage.updateProviderProfile>[1]) {
    return storage.updateProviderProfile(providerId, data);
  }

  listOrders(providerId: string) {
    return storage.listProviderOrders(providerId);
  }
  updateOrder(id: string, providerId: string, data: { status?: string; providerNotes?: string }) {
    return storage.updateProviderOrder(id, providerId, data);
  }

  listQuotes(providerId: string) {
    return storage.listProviderQuotes(providerId);
  }
  respondQuote(id: string, providerId: string, data: Parameters<typeof storage.respondInsuranceQuote>[2]) {
    return storage.respondInsuranceQuote(id, providerId, data);
  }

  createNotification(data: NotificationInput) {
    return storage.createNotification(data);
  }
}
