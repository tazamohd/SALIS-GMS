import { describe, it, expect, vi } from 'vitest';
import { NotificationsService } from '../services/notifications.service';
import { NotFoundError } from '../../../infrastructure/errors/domain-errors';

function repo(o: Record<string, unknown> = {}) {
  return {
    getNotifications: vi.fn(async () => Array.from({ length: 60 }, (_, i) => ({ id: `n${i}`, recipientId: 'u1' }))),
    getUnreadCount: vi.fn(async () => 5),
    getNotification: vi.fn(async () => ({ id: 'n1', recipientId: 'u1' })),
    createNotification: vi.fn(async (d: Record<string, unknown>) => ({ id: 'n1', ...d })),
    updateNotification: vi.fn(async (_id: string, d: Record<string, unknown>) => ({ id: 'n1', ...d })),
    markNotificationAsRead: vi.fn(async () => ({ id: 'n1', status: 'read' })),
    deleteNotification: vi.fn(async () => undefined),
    buildEmailTemplate: vi.fn(() => ({ subject: 'S', html: 'H', text: 'T' })),
    sendEmail: vi.fn(async () => undefined),
    buildSmsTemplate: vi.fn(() => ({ message: 'M' })),
    sendSMS: vi.fn(async () => undefined),
    ...o,
  };
}

describe('NotificationsService — CRUD', () => {
  it('404s a missing notification on get', async () => {
    const r = repo({ getNotification: vi.fn(async () => undefined) });
    await expect(new NotificationsService(r as never).get('n1')).rejects.toBeInstanceOf(NotFoundError);
  });
  it('defaults create status to pending', async () => {
    const r = repo();
    await new NotificationsService(r as never).create({ title: 'X' });
    expect(r.createNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'X', status: 'pending' }));
  });
  it('honors an explicit create status', async () => {
    const r = repo();
    await new NotificationsService(r as never).create({ title: 'X', status: 'delivered' });
    expect(r.createNotification).toHaveBeenCalledWith(expect.objectContaining({ status: 'delivered' }));
  });
  it('assembles a test notification', async () => {
    const r = repo();
    await new NotificationsService(r as never).createTest('u1', 'g1');
    expect(r.createNotification).toHaveBeenCalledWith(expect.objectContaining({
      type: 'in-app', category: 'general', status: 'delivered', recipientId: 'u1', garageId: 'g1', title: 'Test Notification',
    }));
  });
});

describe('NotificationsService — triggers', () => {
  it('builds the email template from params and sends with the right envelope', async () => {
    const r = repo();
    await new NotificationsService(r as never).sendEmailTrigger('appointmentConfirmation', 'appointment', 'confirmation', {
      customerEmail: 'c@x.sa', recipientId: 'u1', garageId: 'g1', customerName: 'Ann', serviceName: 'Oil',
    });
    expect(r.buildEmailTemplate).toHaveBeenCalledWith('appointmentConfirmation', expect.objectContaining({ customerName: 'Ann', serviceName: 'Oil' }));
    expect(r.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'c@x.sa', recipientId: 'u1', garageId: 'g1', category: 'appointment',
      metadata: expect.objectContaining({ type: 'confirmation', customerName: 'Ann' }),
    }));
  });
  it('sends SMS with a blank garageId fallback', async () => {
    const r = repo();
    await new NotificationsService(r as never).sendSmsTrigger('appointmentReminder', 'appointment', 'reminder', {
      customerPhone: '+9665', recipientId: 'u1', customerName: 'Ann',
    });
    expect(r.sendSMS).toHaveBeenCalledWith(expect.objectContaining({ to: '+9665', garageId: '', category: 'appointment' }));
  });
});

describe('NotificationsService — my/notifications', () => {
  it('caps the personal feed at 50', async () => {
    const r = repo();
    const rows = await new NotificationsService(r as never).listMine('u1');
    expect(rows).toHaveLength(50);
  });
  it('404s a read on a notification the caller does not own or that is missing', async () => {
    await expect(new NotificationsService(repo({ getNotification: vi.fn(async () => ({ id: 'n1', recipientId: 'other' })) }) as never).markMineRead('n1', 'u1'))
      .rejects.toBeInstanceOf(NotFoundError);
    await expect(new NotificationsService(repo({ getNotification: vi.fn(async () => undefined) }) as never).markMineRead('n1', 'u1'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it('marks an owned notification read', async () => {
    const r = repo();
    await new NotificationsService(r as never).markMineRead('n1', 'u1');
    expect(r.updateNotification).toHaveBeenCalledWith('n1', expect.objectContaining({ status: 'read' }));
  });
});
