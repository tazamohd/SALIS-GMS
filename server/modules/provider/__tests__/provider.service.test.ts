import { describe, it, expect, vi } from 'vitest';
import { ProviderService } from '../services/provider.service';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../../infrastructure/errors/domain-errors';

const GID = 'g1';

function repo(o: Record<string, unknown> = {}) {
  return {
    listBookings: vi.fn(async () => [{ id: 'b1' }]),
    updateBooking: vi.fn(async () => ({ id: 'b1', customerId: 'c1', serviceName: 'Oil', providerNotes: 'ok' })),
    listOfferings: vi.fn(async () => [{ id: 'o1' }]),
    createOffering: vi.fn(async (d: Record<string, unknown>) => ({ id: 'o1', ...d })),
    updateOffering: vi.fn(async () => ({ id: 'o1', name: 'X' })),
    deleteOffering: vi.fn(async () => undefined),
    getProvider: vi.fn(async () => ({ id: GID, name: 'Acme' })),
    updateProfile: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: GID, ...d })),
    listOrders: vi.fn(async () => [{ id: 'ord1' }]),
    updateOrder: vi.fn(async () => ({ id: 'ord1', customerId: 'c1', totalAmount: '100', currency: 'SAR', providerNotes: '' })),
    listQuotes: vi.fn(async () => [{ id: 'q1' }]),
    respondQuote: vi.fn(async () => ({ id: 'q1', customerId: 'c1', quotedPremium: '500', currency: 'SAR', quoteNotes: '' })),
    createNotification: vi.fn(async () => ({ id: 'n1' })),
    ...o,
  };
}

describe('ProviderService — authorization guard', () => {
  it('every surface 403s when the session carries no garage', async () => {
    const s = new ProviderService(repo() as never);
    await expect(async () => s.listBookings(undefined)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(s.updateBooking(undefined, 'b1', {})).rejects.toBeInstanceOf(AuthorizationError);
    await expect(async () => s.listOfferings(undefined)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(s.updateOffering(undefined, 'o1', {})).rejects.toBeInstanceOf(AuthorizationError);
    await expect(s.deleteOffering(undefined, 'o1')).rejects.toBeInstanceOf(AuthorizationError);
    await expect(s.getProfile(undefined)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(async () => s.updateProfile(undefined, { phone: '1' })).rejects.toBeInstanceOf(AuthorizationError);
    await expect(async () => s.listOrders(undefined)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(s.updateOrder(undefined, 'ord1', {})).rejects.toBeInstanceOf(AuthorizationError);
    await expect(async () => s.listQuotes(undefined)).rejects.toBeInstanceOf(AuthorizationError);
    await expect(s.respondQuote(undefined, 'q1', { status: 'quoted', quotedPremium: 1 })).rejects.toBeInstanceOf(AuthorizationError);
    expect(() => s.requireProvider(undefined)).toThrow(AuthorizationError);
  });
});

describe('ProviderService — bookings', () => {
  it('lists with the optional status filter', async () => {
    const r = repo();
    await new ProviderService(r as never).listBookings(GID, 'accepted');
    expect(r.listBookings).toHaveBeenCalledWith(GID, 'accepted');
  });

  it('rejects an invalid booking status', async () => {
    await expect(new ProviderService(repo() as never).updateBooking(GID, 'b1', { status: 'nope' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('404s a booking that does not update', async () => {
    const r = repo({ updateBooking: vi.fn(async () => undefined) });
    await expect(new ProviderService(r as never).updateBooking(GID, 'b1', { status: 'accepted' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('notifies the customer on a status change (best-effort)', async () => {
    const r = repo();
    await new ProviderService(r as never).updateBooking(GID, 'b1', { status: 'accepted' });
    expect(r.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      category: 'appointment',
      recipientId: 'c1',
      title: 'Booking accepted',
    }));
  });

  it('a failing notification never fails the booking update', async () => {
    const r = repo({ createNotification: vi.fn(async () => { throw new Error('down'); }) });
    await expect(new ProviderService(r as never).updateBooking(GID, 'b1', { status: 'completed' }))
      .resolves.toMatchObject({ id: 'b1' });
  });

  it('skips notification when no status is given', async () => {
    const r = repo();
    await new ProviderService(r as never).updateBooking(GID, 'b1', { providerNotes: 'hi' });
    expect(r.createNotification).not.toHaveBeenCalled();
  });
});

describe('ProviderService — offerings', () => {
  it('stamps the provider onto a created offering', async () => {
    const r = repo();
    await new ProviderService(r as never).createOffering(GID, { name: 'Plan', price: '9' });
    expect(r.createOffering).toHaveBeenCalledWith({ name: 'Plan', price: '9', providerId: GID });
  });

  it('404s an offering that does not update', async () => {
    const r = repo({ updateOffering: vi.fn(async () => undefined) });
    await expect(new ProviderService(r as never).updateOffering(GID, 'o1', { name: 'X' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('delete is provider-scoped and returns the legacy message', async () => {
    const r = repo();
    expect(await new ProviderService(r as never).deleteOffering(GID, 'o1')).toEqual({ message: 'Offering removed' });
    expect(r.deleteOffering).toHaveBeenCalledWith('o1', GID);
  });
});

describe('ProviderService — profile', () => {
  it('404s a missing provider on read', async () => {
    const r = repo({ getProvider: vi.fn(async () => undefined) });
    await expect(new ProviderService(r as never).getProfile(GID)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates only the allow-listed string fields', async () => {
    const r = repo();
    await new ProviderService(r as never).updateProfile(GID, {
      phone: '555', description: 'hi', role: 'ADMIN', rating: 5,
    });
    expect(r.updateProfile).toHaveBeenCalledWith(GID, { phone: '555', description: 'hi' });
  });

  it('400s when nothing updatable is supplied', async () => {
    expect(() => new ProviderService(repo() as never).updateProfile(GID, { rating: 5 })).toThrow(ValidationError);
  });
});

describe('ProviderService — orders', () => {
  it('rejects an invalid order status', async () => {
    await expect(new ProviderService(repo() as never).updateOrder(GID, 'ord1', { status: 'nope' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('404s an order that does not update', async () => {
    const r = repo({ updateOrder: vi.fn(async () => undefined) });
    await expect(new ProviderService(r as never).updateOrder(GID, 'ord1', { status: 'confirmed' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('notifies the customer on an order status change', async () => {
    const r = repo();
    await new ProviderService(r as never).updateOrder(GID, 'ord1', { status: 'fulfilled' });
    expect(r.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      category: 'general', recipientId: 'c1', title: 'Order fulfilled',
    }));
  });
});

describe('ProviderService — quotes', () => {
  it('rejects a status other than quoted/declined', async () => {
    await expect(new ProviderService(repo() as never).respondQuote(GID, 'q1', { status: 'pending' }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('requires a positive premium to quote', async () => {
    await expect(new ProviderService(repo() as never).respondQuote(GID, 'q1', { status: 'quoted', quotedPremium: 0 }))
      .rejects.toBeInstanceOf(ValidationError);
  });

  it('passes the stringified premium through only when quoting', async () => {
    const r = repo();
    await new ProviderService(r as never).respondQuote(GID, 'q1', { status: 'quoted', quotedPremium: 750 });
    expect(r.respondQuote).toHaveBeenCalledWith('q1', GID, expect.objectContaining({ status: 'quoted', quotedPremium: '750' }));
  });

  it('declining sends no premium and notifies the customer', async () => {
    const r = repo();
    await new ProviderService(r as never).respondQuote(GID, 'q1', { status: 'declined' });
    expect(r.respondQuote).toHaveBeenCalledWith('q1', GID, expect.objectContaining({ status: 'declined', quotedPremium: undefined }));
    expect(r.createNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'Quote request declined' }));
  });

  it('404s a quote that does not update', async () => {
    const r = repo({ respondQuote: vi.fn(async () => undefined) });
    await expect(new ProviderService(r as never).respondQuote(GID, 'q1', { status: 'declined' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});
