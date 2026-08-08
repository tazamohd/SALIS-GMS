/**
 * Notifications repository (Phase E). The only data-layer / external-service
 * access for the notifications domain: the `storage` notification CRUD plus the
 * `emailService` / `smsService` template-build + send seams. Delegation only.
 */

import { storage } from '../../../storage';
import { emailService } from '../../../services/emailService';
import { smsService } from '../../../services/smsService';

type EmailTemplateFn = (params: Record<string, unknown>) => unknown;
type SendEmailArgs = Parameters<typeof emailService.sendEmail>[0];
type SendSmsArgs = Parameters<typeof smsService.sendSMS>[0];

export class NotificationsRepository {
  // Storage CRUD
  getNotifications(userId: string, garageId?: string, status?: string, type?: string) {
    return storage.getNotifications(userId, garageId, status, type);
  }
  getUnreadCount(userId: string, garageId?: string) {
    return storage.getUnreadCount(userId, garageId);
  }
  getNotification(id: string) {
    return storage.getNotification(id);
  }
  createNotification(data: Parameters<typeof storage.createNotification>[0]) {
    return storage.createNotification(data);
  }
  updateNotification(id: string, data: Parameters<typeof storage.updateNotification>[1]) {
    return storage.updateNotification(id, data);
  }
  markNotificationAsRead(id: string) {
    return storage.markNotificationAsRead(id);
  }
  deleteNotification(id: string) {
    return storage.deleteNotification(id);
  }

  // Email seam
  buildEmailTemplate(name: string, params: Record<string, unknown>): unknown {
    return (emailService as unknown as Record<string, EmailTemplateFn>)[name](params);
  }
  sendEmail(args: SendEmailArgs) {
    return emailService.sendEmail(args);
  }

  // SMS seam
  buildSmsTemplate(name: string, params: Record<string, unknown>): unknown {
    return (smsService as unknown as Record<string, EmailTemplateFn>)[name](params);
  }
  sendSMS(args: SendSmsArgs) {
    return smsService.sendSMS(args);
  }
}

export type INotificationsRepository = NotificationsRepository;
