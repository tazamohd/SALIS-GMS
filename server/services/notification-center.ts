import { db } from '../db';
import { sql } from 'drizzle-orm';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationChannel = 'in_app' | 'sms' | 'email' | 'push';

interface Notification {
  id: string;
  userId: string;
  garageId: string;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  category: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// In-memory notification store (would be DB table in production)
const notifications: Notification[] = [];
let nextId = 1;

export function createNotification(params: {
  userId: string;
  garageId: string;
  title: string;
  message: string;
  type: NotificationType;
  channel?: NotificationChannel;
  category: string;
  actionUrl?: string;
}): Notification {
  const notification: Notification = {
    id: String(nextId++),
    userId: params.userId,
    garageId: params.garageId,
    title: params.title,
    message: params.message,
    type: params.type,
    channel: params.channel || 'in_app',
    category: params.category,
    read: false,
    actionUrl: params.actionUrl,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notification);
  // Keep last 500 notifications
  if (notifications.length > 500) notifications.length = 500;
  return notification;
}

export function getNotifications(userId: string, options?: { unreadOnly?: boolean; category?: string; limit?: number }): Notification[] {
  let filtered = notifications.filter(n => n.userId === userId);
  if (options?.unreadOnly) filtered = filtered.filter(n => !n.read);
  if (options?.category) filtered = filtered.filter(n => n.category === options.category);
  return filtered.slice(0, options?.limit || 50);
}

export function markAsRead(notificationId: string): boolean {
  const n = notifications.find(n => n.id === notificationId);
  if (n) { n.read = true; return true; }
  return false;
}

export function markAllAsRead(userId: string): number {
  let count = 0;
  notifications.forEach(n => { if (n.userId === userId && !n.read) { n.read = true; count++; } });
  return count;
}

export function getUnreadCount(userId: string): number {
  return notifications.filter(n => n.userId === userId && !n.read).length;
}

export function deleteNotification(notificationId: string): boolean {
  const idx = notifications.findIndex(n => n.id === notificationId);
  if (idx >= 0) { notifications.splice(idx, 1); return true; }
  return false;
}

// Notification preferences (in-memory)
const preferences = new Map<string, Record<string, { inApp: boolean; sms: boolean; email: boolean }>>();

export function getPreferences(userId: string) {
  return preferences.get(userId) || {
    'Job Updates': { inApp: true, sms: true, email: true },
    'Inventory Alerts': { inApp: true, sms: false, email: true },
    'Payment Received': { inApp: true, sms: true, email: true },
    'Appointment Reminders': { inApp: true, sms: true, email: true },
    'System Alerts': { inApp: true, sms: false, email: false },
    'Marketing': { inApp: false, sms: false, email: true },
  };
}

export function updatePreferences(userId: string, prefs: Record<string, { inApp: boolean; sms: boolean; email: boolean }>) {
  preferences.set(userId, prefs);
}
