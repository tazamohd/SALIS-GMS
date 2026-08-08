/**
 * Notifications service (Phase E — Domain Services).
 *
 * Owns the notification CRUD (with the not-found 404 and the create defaults),
 * the test-notification assembly, the email/SMS trigger orchestration (build the
 * template → send via the provider seam), and the customer-facing
 * `/my/notifications` recipient-scoped list + read. All data / provider access
 * flows through the repository.
 */

import { NotFoundError } from '../../../infrastructure/errors/domain-errors';
import type { NotificationsRepository } from '../repositories/notifications.repository';

interface EmailTriggerData {
  customerEmail: string;
  recipientId: string;
  garageId?: string;
  [k: string]: unknown;
}
interface SmsTriggerData {
  customerPhone: string;
  recipientId: string;
  garageId?: string;
  [k: string]: unknown;
}

export class NotificationsService {
  constructor(private readonly repository: NotificationsRepository) {}

  list(userId: string, garageId?: string, status?: string, type?: string) {
    return this.repository.getNotifications(userId, garageId, status, type);
  }
  unreadCount(userId: string, garageId?: string) {
    return this.repository.getUnreadCount(userId, garageId);
  }
  async get(id: string) {
    const notification = await this.repository.getNotification(id);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  }
  create(body: Record<string, unknown>) {
    return this.repository.createNotification({ ...body, status: body.status || 'pending' } as never);
  }
  update(id: string, body: Record<string, unknown>) {
    return this.repository.updateNotification(id, body as never);
  }
  markRead(id: string) {
    return this.repository.markNotificationAsRead(id);
  }
  remove(id: string) {
    return this.repository.deleteNotification(id);
  }

  createTest(userId: string, garageId: string | undefined) {
    return this.repository.createNotification({
      type: 'in-app',
      category: 'general',
      status: 'delivered',
      recipientId: userId,
      garageId: garageId || undefined,
      title: 'Test Notification',
      message: `This is a test notification sent at ${new Date().toLocaleString()}`,
      metadata: { test: true, timestamp: new Date().toISOString() },
      sentAt: new Date(),
    } as never);
  }

  async sendEmailTrigger(templateName: string, category: string, metaType: string, data: EmailTriggerData) {
    const { customerEmail, recipientId, garageId, ...params } = data;
    const template = this.repository.buildEmailTemplate(templateName, params);
    await this.repository.sendEmail({
      to: customerEmail,
      recipientId,
      garageId,
      template,
      category,
      metadata: { type: metaType, ...params },
    } as never);
  }

  async sendSmsTrigger(templateName: string, category: string, metaType: string, data: SmsTriggerData) {
    const { customerPhone, recipientId, garageId, ...params } = data;
    const template = this.repository.buildSmsTemplate(templateName, params);
    await this.repository.sendSMS({
      to: customerPhone,
      recipientId,
      garageId: garageId || '',
      template,
      category,
      metadata: { type: metaType, ...params },
    } as never);
  }

  // Customer self-service — recipient-scoped (a customer has no garage).
  async listMine(userId: string) {
    const rows = await this.repository.getNotifications(userId);
    return rows.slice(0, 50);
  }
  async markMineRead(id: string, userId: string) {
    const n = await this.repository.getNotification(id);
    if (!n || n.recipientId !== userId) throw new NotFoundError('Notification not found');
    return this.repository.updateNotification(id, { status: 'read', readAt: new Date() } as never);
  }
}
