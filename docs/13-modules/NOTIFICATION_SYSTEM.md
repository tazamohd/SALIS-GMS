# SALIS AUTO - Enhanced Notification System

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Partially Implemented

---

## Overview

The Enhanced Notification System provides multi-channel notifications (email, SMS, push, in-app) with template management, scheduling, and user preferences.

---

## Current Implementation

### SMS Notifications (Twilio)

**Implemented:** ✅
- Appointment reminders
- Job completion alerts
- Payment notifications
- Saudi phone number formatting (+966)

### Email Notifications

**Implemented:** ⏳ (Partial)
- Invoice emails
- Appointment confirmations
- Template system needed

### In-App Notifications

**Implemented:** ✅
- Toast notifications
- Real-time via WebSocket
- Activity feed

### Push Notifications

**Implemented:** ❌ (Future)
- Mobile web apps (PWA)
- Desktop notifications

---

## Database Schema

```typescript
// shared/schema.ts

// Notification templates
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  channel: text('channel').notNull(), // 'email', 'sms', 'push', 'in_app'
  event: text('event').notNull(), // 'appointment_created', 'invoice_paid', etc.
  subject: text('subject'), // For email
  body: text('body').notNull(),
  variables: json('variables'), // Available variables
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// User notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  channel: text('channel').notNull(),
  event: text('event').notNull(),
  enabled: boolean('enabled').default(true),
  frequency: text('frequency').default('immediate'), // 'immediate', 'daily_digest', 'weekly_digest'
  quietHoursStart: text('quiet_hours_start'), // '22:00'
  quietHoursEnd: text('quiet_hours_end'), // '08:00'
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notification history/queue
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  channel: text('channel').notNull(),
  event: text('event').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  data: json('data'), // Additional context
  status: text('status').default('pending'), // 'pending', 'sent', 'failed', 'read'
  sentAt: timestamp('sent_at'),
  readAt: timestamp('read_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Push notification tokens (already exists from Phase 11)
export const pushNotificationTokens = pgTable('push_notification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  deviceToken: text('device_token').notNull(),
  platform: text('platform').notNull(), // 'web', 'ios', 'android'
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## Notification Channels

### 1. Email Notifications

**Implementation:**
```typescript
// server/notifications/emailNotifier.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@salis-auto.com',
    to,
    subject,
    html,
  });
}
```

**Email Templates:**
```typescript
// Appointment confirmation
export const appointmentConfirmationTemplate = `
  <h2>Appointment Confirmation</h2>
  <p>Dear {{customerName}},</p>
  <p>Your appointment has been confirmed for:</p>
  <ul>
    <li><strong>Date:</strong> {{appointmentDate}}</li>
    <li><strong>Time:</strong> {{appointmentTime}}</li>
    <li><strong>Service:</strong> {{serviceType}}</li>
    <li><strong>Vehicle:</strong> {{vehicleMake}} {{vehicleModel}}</li>
  </ul>
  <p>Thank you for choosing SALIS AUTO!</p>
`;

// Invoice email
export const invoiceEmailTemplate = `
  <h2>Invoice #{{invoiceNumber}}</h2>
  <p>Dear {{customerName}},</p>
  <p>Please find your invoice attached.</p>
  <table>
    <tr><td>Subtotal:</td><td>{{subtotal}}</td></tr>
    <tr><td>VAT (15%):</td><td>{{vat}}</td></tr>
    <tr><td><strong>Total:</strong></td><td><strong>{{total}}</strong></td></tr>
  </table>
  <p>Due Date: {{dueDate}}</p>
`;
```

### 2. SMS Notifications (Current)

**Implementation:**
```typescript
// server/smsService.ts (existing)
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string) {
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body: message,
  });
}
```

**SMS Templates:**
```typescript
// Appointment reminder
export const appointmentReminderSMS = 
  "Hi {{customerName}}, reminder: Your appointment is tomorrow at {{time}} for {{service}}. SALIS AUTO";

// Job completion
export const jobCompleteSMS = 
  "Hi {{customerName}}, your {{vehicleMake}} is ready! Total: {{total}} SAR. Pick up anytime. SALIS AUTO";

// Payment reminder
export const paymentReminderSMS = 
  "Invoice #{{invoiceNumber}} ({{amount}} SAR) is due on {{dueDate}}. Pay at: {{paymentLink}}";
```

### 3. Push Notifications (Future)

**Implementation with Firebase:**
```typescript
// server/notifications/pushNotifier.ts
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  const response = await admin.messaging().sendMulticast(message);
  return response;
}
```

**Service Worker (PWA):**
```javascript
// public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: data.data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### 4. In-App Notifications (Current)

**Implementation:**
```typescript
// WebSocket notifications (existing)
// Real-time via ws connection

// Toast notifications (existing)
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: 'Appointment Confirmed',
  description: 'Your appointment has been scheduled.',
});
```

---

## Notification Events

### Customer Events
- `appointment.created` - Appointment scheduled
- `appointment.reminder` - 24h before appointment
- `appointment.cancelled` - Appointment cancelled
- `job.started` - Service started
- `job.completed` - Service completed
- `invoice.created` - Invoice generated
- `invoice.reminder` - Payment reminder
- `payment.received` - Payment confirmed
- `estimate.created` - Estimate sent
- `estimate.approved` - Customer approved estimate

### Technician Events
- `job.assigned` - Job assigned to technician
- `job.urgent` - Urgent job notification
- `shift.reminder` - Shift starting soon
- `parts.low_stock` - Inventory alert

### Admin Events
- `payment.failed` - Payment processing failed
- `inventory.low` - Low stock alert
- `report.ready` - Scheduled report generated
- `system.alert` - System issues

---

## Template Management

### Template Editor UI

```tsx
// client/src/pages/NotificationTemplates.tsx
export function NotificationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="space-y-6">
      <h1>Notification Templates</h1>

      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="push">Push</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectItem value="appointment_confirmation">
                  Appointment Confirmation
                </SelectItem>
                <SelectItem value="invoice_sent">
                  Invoice Sent
                </SelectItem>
              </Select>

              <div className="mt-4">
                <Label>Subject</Label>
                <Input 
                  value={selectedTemplate?.subject} 
                  placeholder="Appointment Confirmation - {{customerName}}"
                />
              </div>

              <div className="mt-4">
                <Label>Body</Label>
                <Textarea 
                  rows={10}
                  value={selectedTemplate?.body}
                  placeholder="Dear {{customerName}}, ..."
                />
              </div>

              <div className="mt-4">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {['customerName', 'appointmentDate', 'vehicleMake'].map(v => (
                    <Badge key={v}>{'{{' + v + '}}'}</Badge>
                  ))}
                </div>
              </div>

              <Button className="mt-4">Save Template</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## User Preferences

### Preference Management UI

```tsx
// client/src/pages/NotificationSettings.tsx
export function NotificationSettings() {
  const [preferences, setPreferences] = useState({});

  return (
    <div className="space-y-6">
      <h1>Notification Preferences</h1>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { event: 'appointment.created', label: 'Appointment Confirmations' },
            { event: 'invoice.created', label: 'Invoice Notifications' },
            { event: 'payment.received', label: 'Payment Confirmations' },
          ].map(({ event, label }) => (
            <div key={event} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch
                checked={preferences[`email.${event}`]}
                onCheckedChange={(checked) => 
                  updatePreference('email', event, checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { event: 'appointment.reminder', label: 'Appointment Reminders' },
            { event: 'job.completed', label: 'Service Completion' },
            { event: 'payment.reminder', label: 'Payment Reminders' },
          ].map(({ event, label }) => (
            <div key={event} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch
                checked={preferences[`sms.${event}`]}
                onCheckedChange={(checked) => 
                  updatePreference('sms', event, checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value="22:00" />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value="08:00" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            No notifications will be sent during quiet hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Notification Queue & Scheduling

### Queue System

```typescript
// server/notifications/queue.ts
import { notifications } from '@shared/schema';

export async function queueNotification(
  userId: string,
  channel: string,
  event: string,
  data: Record<string, any>
) {
  // Check user preferences
  const prefs = await getUserPreferences(userId, channel, event);
  if (!prefs.enabled) return;

  // Check quiet hours
  if (isQuietHours(prefs)) {
    // Schedule for later
    const sendAt = getNextAvailableTime(prefs);
    await scheduleNotification(userId, channel, event, data, sendAt);
    return;
  }

  // Render template
  const template = await getTemplate(channel, event);
  const rendered = renderTemplate(template, data);

  // Queue notification
  await db.insert(notifications).values({
    userId,
    channel,
    event,
    subject: rendered.subject,
    body: rendered.body,
    data,
    status: 'pending',
  });
}
```

### Notification Worker

```typescript
// server/notifications/worker.ts
import cron from 'node-cron';

// Process queue every minute
cron.schedule('* * * * *', async () => {
  const pending = await db
    .select()
    .from(notifications)
    .where(eq(notifications.status, 'pending'))
    .limit(100);

  for (const notification of pending) {
    try {
      await sendNotification(notification);
      
      await db
        .update(notifications)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(notifications.id, notification.id));
    } catch (error) {
      await db
        .update(notifications)
        .set({ 
          status: 'failed',
          errorMessage: error.message,
        })
        .where(eq(notifications.id, notification.id));
    }
  }
});
```

---

## API Endpoints

```typescript
// Notification Templates
// GET /api/notification-templates
// POST /api/notification-templates
// PATCH /api/notification-templates/:id
// DELETE /api/notification-templates/:id

// User Preferences
// GET /api/notification-preferences
// POST /api/notification-preferences
// PATCH /api/notification-preferences/:id

// Notifications
// GET /api/notifications - Get user's notifications
// PATCH /api/notifications/:id/read - Mark as read
// POST /api/notifications/test - Send test notification

// Push Tokens
// POST /api/push-tokens - Register device token
// DELETE /api/push-tokens/:token - Unregister token
```

---

## Implementation Roadmap

### Phase 1: Template System
- [ ] Create notification template database schema
- [ ] Build template editor UI
- [ ] Implement variable substitution
- [ ] Test all email/SMS templates

### Phase 2: Preferences
- [ ] User preference database schema
- [ ] Preference management UI
- [ ] Quiet hours implementation
- [ ] Digest scheduling (daily/weekly)

### Phase 3: Push Notifications
- [ ] Firebase integration
- [ ] Service worker setup
- [ ] Push subscription UI
- [ ] Test across devices

### Phase 4: Advanced Features
- [ ] Notification history/archive
- [ ] Delivery analytics
- [ ] A/B testing templates
- [ ] Multi-language templates

---

**Document Owner:** Notification Team  
**Next Review:** Monthly
