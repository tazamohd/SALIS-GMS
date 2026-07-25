import { Router } from 'express';

const router = Router();

// --- In-memory data store ---

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'appointment_reminder' | 'job_update' | 'invoice' | 'review_request';
  language: string;
  previewText: string;
  variables: string[];
  sendCount: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

interface WhatsAppConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  direction: 'inbound' | 'outbound';
  unreadCount: number;
  messages: WhatsAppMessage[];
}

interface WhatsAppMessage {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  templateId?: string;
  timestamp: string;
}

interface WhatsAppStats {
  sentToday: number;
  deliveredToday: number;
  readToday: number;
  respondedToday: number;
  deliveryRate: number;
  responseRate: number;
  optOutCount: number;
  dailyVolume: { date: string; sent: number; delivered: number; read: number; responded: number }[];
}

const templates: WhatsAppTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Appointment Reminder',
    category: 'appointment_reminder',
    language: 'en',
    previewText: 'Hi {{customerName}}, this is a reminder for your appointment on {{date}} at {{time}} for {{serviceName}}. Reply YES to confirm or call us to reschedule.',
    variables: ['customerName', 'date', 'time', 'serviceName'],
    sendCount: 1247,
    status: 'approved',
    createdAt: '2025-11-01T10:00:00Z',
  },
  {
    id: 'tpl-2',
    name: 'Job Status Update',
    category: 'job_update',
    language: 'en',
    previewText: 'Hello {{customerName}}, your vehicle {{vehicleMake}} {{vehicleModel}} is now {{jobStatus}}. {{additionalNote}} Thank you for choosing SLIS Garage.',
    variables: ['customerName', 'vehicleMake', 'vehicleModel', 'jobStatus', 'additionalNote'],
    sendCount: 892,
    status: 'approved',
    createdAt: '2025-11-05T14:30:00Z',
  },
  {
    id: 'tpl-3',
    name: 'Invoice Notification',
    category: 'invoice',
    language: 'en',
    previewText: 'Dear {{customerName}}, your invoice #{{invoiceNumber}} for SAR {{amount}} is ready. View and pay online: {{paymentLink}}. Thank you!',
    variables: ['customerName', 'invoiceNumber', 'amount', 'paymentLink'],
    sendCount: 534,
    status: 'approved',
    createdAt: '2025-11-10T09:00:00Z',
  },
  {
    id: 'tpl-4',
    name: 'Review Request',
    category: 'review_request',
    language: 'en',
    previewText: 'Hi {{customerName}}, thank you for visiting SLIS Garage! We would love your feedback. Please rate your experience: {{reviewLink}}. Your opinion matters to us!',
    variables: ['customerName', 'reviewLink'],
    sendCount: 318,
    status: 'approved',
    createdAt: '2025-11-15T11:00:00Z',
  },
  {
    id: 'tpl-5',
    name: 'Appointment Reminder (Arabic)',
    category: 'appointment_reminder',
    language: 'ar',
    previewText: 'مرحبا {{customerName}}، تذكير بموعدك يوم {{date}} الساعة {{time}} لخدمة {{serviceName}}. رد بنعم للتأكيد.',
    variables: ['customerName', 'date', 'time', 'serviceName'],
    sendCount: 456,
    status: 'approved',
    createdAt: '2025-11-20T08:00:00Z',
  },
  {
    id: 'tpl-6',
    name: 'Service Complete Pickup',
    category: 'job_update',
    language: 'en',
    previewText: 'Great news {{customerName}}! Your {{vehicleMake}} {{vehicleModel}} is ready for pickup. Our working hours are {{workingHours}}. See you soon!',
    variables: ['customerName', 'vehicleMake', 'vehicleModel', 'workingHours'],
    sendCount: 671,
    status: 'approved',
    createdAt: '2025-12-01T10:00:00Z',
  },
];

const conversations: WhatsAppConversation[] = [
  {
    id: 'conv-1',
    customerName: 'Ahmed Al-Rashid',
    customerPhone: '+966501234567',
    lastMessage: 'Yes, confirmed. See you tomorrow!',
    lastMessageTime: '2026-03-20T09:45:00Z',
    direction: 'inbound',
    unreadCount: 1,
    messages: [
      { id: 'msg-1a', conversationId: 'conv-1', content: 'Hi Ahmed, this is a reminder for your appointment on March 21 at 10:00 AM for Oil Change. Reply YES to confirm or call us to reschedule.', direction: 'outbound', status: 'read', templateId: 'tpl-1', timestamp: '2026-03-20T09:30:00Z' },
      { id: 'msg-1b', conversationId: 'conv-1', content: 'Yes, confirmed. See you tomorrow!', direction: 'inbound', status: 'delivered', timestamp: '2026-03-20T09:45:00Z' },
    ],
  },
  {
    id: 'conv-2',
    customerName: 'Fatima Al-Zahrani',
    customerPhone: '+966509876543',
    lastMessage: 'Your vehicle Toyota Camry is now In Progress. Our technician has started working on the brake replacement.',
    lastMessageTime: '2026-03-20T08:15:00Z',
    direction: 'outbound',
    unreadCount: 0,
    messages: [
      { id: 'msg-2a', conversationId: 'conv-2', content: 'Hello Fatima, your vehicle Toyota Camry is now In Progress. Our technician has started working on the brake replacement. Thank you for choosing SLIS Garage.', direction: 'outbound', status: 'delivered', templateId: 'tpl-2', timestamp: '2026-03-20T08:15:00Z' },
    ],
  },
  {
    id: 'conv-3',
    customerName: 'Mohammed Al-Otaibi',
    customerPhone: '+966551112233',
    lastMessage: 'Thank you! I left a 5-star review.',
    lastMessageTime: '2026-03-19T16:30:00Z',
    direction: 'inbound',
    unreadCount: 0,
    messages: [
      { id: 'msg-3a', conversationId: 'conv-3', content: 'Dear Mohammed, your invoice #INV-2024-156 for SAR 1,250 is ready. View and pay online: https://pay.slis.sa/inv-156. Thank you!', direction: 'outbound', status: 'read', templateId: 'tpl-3', timestamp: '2026-03-19T14:00:00Z' },
      { id: 'msg-3b', conversationId: 'conv-3', content: 'Got it, I will pay now.', direction: 'inbound', status: 'delivered', timestamp: '2026-03-19T14:20:00Z' },
      { id: 'msg-3c', conversationId: 'conv-3', content: 'Hi Mohammed, thank you for visiting SLIS Garage! We would love your feedback. Please rate your experience: https://review.slis.sa/m-otaibi. Your opinion matters to us!', direction: 'outbound', status: 'read', templateId: 'tpl-4', timestamp: '2026-03-19T15:00:00Z' },
      { id: 'msg-3d', conversationId: 'conv-3', content: 'Thank you! I left a 5-star review.', direction: 'inbound', status: 'delivered', timestamp: '2026-03-19T16:30:00Z' },
    ],
  },
  {
    id: 'conv-4',
    customerName: 'Sara Al-Harbi',
    customerPhone: '+966554443322',
    lastMessage: 'Great news Sara! Your Honda Civic is ready for pickup. Our working hours are 8 AM - 8 PM. See you soon!',
    lastMessageTime: '2026-03-20T11:00:00Z',
    direction: 'outbound',
    unreadCount: 0,
    messages: [
      { id: 'msg-4a', conversationId: 'conv-4', content: 'Great news Sara! Your Honda Civic is ready for pickup. Our working hours are 8 AM - 8 PM. See you soon!', direction: 'outbound', status: 'delivered', templateId: 'tpl-6', timestamp: '2026-03-20T11:00:00Z' },
    ],
  },
  {
    id: 'conv-5',
    customerName: 'Khalid Al-Dosari',
    customerPhone: '+966557778899',
    lastMessage: 'Can I reschedule to next week?',
    lastMessageTime: '2026-03-20T10:20:00Z',
    direction: 'inbound',
    unreadCount: 2,
    messages: [
      { id: 'msg-5a', conversationId: 'conv-5', content: 'Hi Khalid, this is a reminder for your appointment on March 22 at 2:00 PM for AC Service. Reply YES to confirm or call us to reschedule.', direction: 'outbound', status: 'read', templateId: 'tpl-1', timestamp: '2026-03-20T09:00:00Z' },
      { id: 'msg-5b', conversationId: 'conv-5', content: 'Hi, I am not sure I can make it on the 22nd.', direction: 'inbound', status: 'delivered', timestamp: '2026-03-20T10:10:00Z' },
      { id: 'msg-5c', conversationId: 'conv-5', content: 'Can I reschedule to next week?', direction: 'inbound', status: 'delivered', timestamp: '2026-03-20T10:20:00Z' },
    ],
  },
  {
    id: 'conv-6',
    customerName: 'Noura Al-Qahtani',
    customerPhone: '+966556667788',
    lastMessage: 'Hello Noura, your vehicle Hyundai Sonata is now Completed. All services have been performed successfully. Thank you for choosing SLIS Garage.',
    lastMessageTime: '2026-03-19T17:00:00Z',
    direction: 'outbound',
    unreadCount: 0,
    messages: [
      { id: 'msg-6a', conversationId: 'conv-6', content: 'Hello Noura, your vehicle Hyundai Sonata is now Completed. All services have been performed successfully. Thank you for choosing SLIS Garage.', direction: 'outbound', status: 'read', templateId: 'tpl-2', timestamp: '2026-03-19T17:00:00Z' },
    ],
  },
];

const stats: WhatsAppStats = {
  sentToday: 47,
  deliveredToday: 44,
  readToday: 38,
  respondedToday: 21,
  deliveryRate: 93.6,
  responseRate: 44.7,
  optOutCount: 3,
  dailyVolume: [
    { date: '2026-03-14', sent: 32, delivered: 30, read: 25, responded: 12 },
    { date: '2026-03-15', sent: 28, delivered: 27, read: 22, responded: 10 },
    { date: '2026-03-16', sent: 41, delivered: 39, read: 33, responded: 18 },
    { date: '2026-03-17', sent: 38, delivered: 36, read: 31, responded: 15 },
    { date: '2026-03-18', sent: 45, delivered: 42, read: 36, responded: 19 },
    { date: '2026-03-19', sent: 52, delivered: 49, read: 42, responded: 24 },
    { date: '2026-03-20', sent: 47, delivered: 44, read: 38, responded: 21 },
  ],
};

// --- Routes ---

// Send a WhatsApp message using a template
router.post('/whatsapp/send', (req, res) => {
  const { templateId, customerPhone, customerName, variables } = req.body;

  if (!templateId || !customerPhone || !customerName) {
    return res.status(400).json({ error: 'templateId, customerPhone, and customerName are required' });
  }

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  // Build message content from template
  let content = template.previewText;
  const vars = variables || {};
  vars.customerName = vars.customerName || customerName;
  for (const [key, value] of Object.entries(vars)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value as string);
  }

  // Find or create conversation
  let conversation = conversations.find(c => c.customerPhone === customerPhone);
  const msgId = `msg-${Date.now()}`;
  const now = new Date().toISOString();

  const message: WhatsAppMessage = {
    id: msgId,
    conversationId: conversation?.id || `conv-${Date.now()}`,
    content,
    direction: 'outbound',
    status: 'sent',
    templateId,
    timestamp: now,
  };

  if (conversation) {
    conversation.lastMessage = content;
    conversation.lastMessageTime = now;
    conversation.direction = 'outbound';
    conversation.messages.push(message);
  } else {
    const newConv: WhatsAppConversation = {
      id: `conv-${Date.now()}`,
      customerName,
      customerPhone,
      lastMessage: content,
      lastMessageTime: now,
      direction: 'outbound',
      unreadCount: 0,
      messages: [message],
    };
    message.conversationId = newConv.id;
    conversations.unshift(newConv);
  }

  // Update template send count
  template.sendCount += 1;
  stats.sentToday += 1;

  res.json({ success: true, messageId: msgId, content, status: 'sent' });
});

// List message templates
router.get('/whatsapp/templates', (_req, res) => {
  res.json({ templates });
});

// Get recent conversations
router.get('/whatsapp/conversations', (_req, res) => {
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
  res.json({ conversations: sorted });
});

// Webhook receiver for incoming messages (stub)
router.post('/whatsapp/webhook', (req, res) => {
  const { entry } = req.body || {};
  // In production, this would process incoming WhatsApp Business API webhook events
  // For now, log and acknowledge
  console.log('[WhatsApp Webhook] Received payload:', JSON.stringify(entry || req.body).slice(0, 200));
  res.status(200).json({ success: true, message: 'Webhook received' });
});

// Stats: messages sent today, delivery rate, response rate, opt-out count
router.get('/whatsapp/stats', (_req, res) => {
  res.json({ stats });
});

export default router;
