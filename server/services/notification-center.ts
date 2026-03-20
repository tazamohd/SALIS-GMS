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

// Auto-create table if not exists
async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_notifications (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      garage_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      channel TEXT NOT NULL DEFAULT 'in_app',
      category TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      action_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

let tableReady = false;
async function init() {
  if (!tableReady) {
    await ensureTable();
    tableReady = true;
  }
}

function rowToNotification(row: any): Notification {
  return {
    id: String(row.id),
    userId: row.user_id,
    garageId: row.garage_id,
    title: row.title,
    message: row.message,
    type: row.type as NotificationType,
    channel: row.channel as NotificationChannel,
    category: row.category,
    read: row.read,
    actionUrl: row.action_url || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function createNotification(params: {
  userId: string;
  garageId: string;
  title: string;
  message: string;
  type: NotificationType;
  channel?: NotificationChannel;
  category: string;
  actionUrl?: string;
}): Promise<Notification> {
  await init();
  const channel = params.channel || 'in_app';
  const result = await db.execute(sql`
    INSERT INTO app_notifications (user_id, garage_id, title, message, type, channel, category, action_url)
    VALUES (${params.userId}, ${params.garageId}, ${params.title}, ${params.message}, ${params.type}, ${channel}, ${params.category}, ${params.actionUrl || null})
    RETURNING *
  `);
  return rowToNotification(result.rows[0]);
}

export async function getNotifications(userId: string, options?: { unreadOnly?: boolean; category?: string; limit?: number }): Promise<Notification[]> {
  await init();
  const limit = options?.limit || 50;

  let result;
  if (options?.unreadOnly && options?.category) {
    result = await db.execute(sql`
      SELECT * FROM app_notifications
      WHERE user_id = ${userId} AND read = false AND category = ${options.category}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  } else if (options?.unreadOnly) {
    result = await db.execute(sql`
      SELECT * FROM app_notifications
      WHERE user_id = ${userId} AND read = false
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  } else if (options?.category) {
    result = await db.execute(sql`
      SELECT * FROM app_notifications
      WHERE user_id = ${userId} AND category = ${options.category}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  } else {
    result = await db.execute(sql`
      SELECT * FROM app_notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC LIMIT ${limit}
    `);
  }

  return result.rows.map(rowToNotification);
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  await init();
  const result = await db.execute(sql`
    UPDATE app_notifications SET read = true WHERE id = ${Number(notificationId)}
  `);
  return (result.rowCount ?? 0) > 0;
}

export async function markAllAsRead(userId: string): Promise<number> {
  await init();
  const result = await db.execute(sql`
    UPDATE app_notifications SET read = true WHERE user_id = ${userId} AND read = false
  `);
  return result.rowCount ?? 0;
}

export async function getUnreadCount(userId: string): Promise<number> {
  await init();
  const result = await db.execute(sql`
    SELECT COUNT(*) as count FROM app_notifications WHERE user_id = ${userId} AND read = false
  `);
  return Number(result.rows[0].count);
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  await init();
  const result = await db.execute(sql`
    DELETE FROM app_notifications WHERE id = ${Number(notificationId)}
  `);
  return (result.rowCount ?? 0) > 0;
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
