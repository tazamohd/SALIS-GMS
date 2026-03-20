import { Router } from 'express';

const router = Router();

// --- Interfaces ---

interface SMSTemplate {
  id: string;
  name: string;
  category: 'service_reminder' | 'promo' | 'feedback_request' | 'appointment_confirm';
  body: string;
  variables: string[];
  charCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SMSCampaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  audienceFilter: 'all' | 'recent' | 'inactive' | 'vip';
  audienceSize: number;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  failedCount: number;
  optOutCount: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  costPerMessage: number;
  totalCost: number;
}

// --- In-memory data ---

const templates: SMSTemplate[] = [
  {
    id: 'sms-tpl-1',
    name: 'Service Reminder',
    category: 'service_reminder',
    body: 'Hi {{customerName}}, your {{vehicleMake}} {{vehicleModel}} is due for {{serviceType}}. Book now at SLIS Garage and get 10% off! Call {{phone}} or visit {{link}}',
    variables: ['customerName', 'vehicleMake', 'vehicleModel', 'serviceType', 'phone', 'link'],
    charCount: 155,
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'sms-tpl-2',
    name: 'Oil Change Reminder',
    category: 'service_reminder',
    body: 'Dear {{customerName}}, your last oil change was {{daysSince}} days ago. Keep your engine healthy! Schedule your oil change at SLIS Garage: {{link}}',
    variables: ['customerName', 'daysSince', 'link'],
    charCount: 148,
    createdAt: '2025-10-05T09:00:00Z',
    updatedAt: '2025-11-20T14:00:00Z',
  },
  {
    id: 'sms-tpl-3',
    name: 'Summer Promo',
    category: 'promo',
    body: 'SLIS Garage Summer Sale! Get {{discount}}% off on AC service & coolant flush for your {{vehicleMake}}. Valid until {{expiryDate}}. Book: {{link}}',
    variables: ['discount', 'vehicleMake', 'expiryDate', 'link'],
    charCount: 142,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
  },
  {
    id: 'sms-tpl-4',
    name: 'Loyalty Reward',
    category: 'promo',
    body: 'Hi {{customerName}}! You have earned {{points}} loyalty points at SLIS Garage. Redeem SAR {{value}} on your next visit. T&C apply. {{link}}',
    variables: ['customerName', 'points', 'value', 'link'],
    charCount: 139,
    createdAt: '2025-11-10T12:00:00Z',
    updatedAt: '2025-12-01T08:00:00Z',
  },
  {
    id: 'sms-tpl-5',
    name: 'Post-Service Feedback',
    category: 'feedback_request',
    body: 'Thank you for visiting SLIS Garage, {{customerName}}! How was your experience? Rate us: {{link}}. Your feedback helps us improve!',
    variables: ['customerName', 'link'],
    charCount: 127,
    createdAt: '2025-11-15T14:00:00Z',
    updatedAt: '2025-11-15T14:00:00Z',
  },
  {
    id: 'sms-tpl-6',
    name: 'NPS Survey',
    category: 'feedback_request',
    body: 'Hi {{customerName}}, on a scale of 0-10, how likely are you to recommend SLIS Garage? Reply with your score or take our survey: {{link}}',
    variables: ['customerName', 'link'],
    charCount: 138,
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'sms-tpl-7',
    name: 'Appointment Confirmation',
    category: 'appointment_confirm',
    body: 'Your appointment at SLIS Garage is confirmed for {{date}} at {{time}}. Service: {{serviceType}}. Reply YES to confirm or CANCEL to reschedule.',
    variables: ['date', 'time', 'serviceType'],
    charCount: 147,
    createdAt: '2025-10-20T11:00:00Z',
    updatedAt: '2026-01-05T16:00:00Z',
  },
  {
    id: 'sms-tpl-8',
    name: 'Appointment Reminder 24h',
    category: 'appointment_confirm',
    body: 'Reminder: {{customerName}}, you have an appointment tomorrow at {{time}} for {{serviceType}} at SLIS Garage. Address: {{address}}. See you!',
    variables: ['customerName', 'time', 'serviceType', 'address'],
    charCount: 143,
    createdAt: '2025-12-10T07:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
];

const campaigns: SMSCampaign[] = [
  {
    id: 'sms-camp-1',
    name: 'January Service Reminder Blast',
    templateId: 'sms-tpl-1',
    templateName: 'Service Reminder',
    audienceFilter: 'all',
    audienceSize: 2450,
    sentCount: 2450,
    deliveredCount: 2318,
    clickedCount: 487,
    failedCount: 132,
    optOutCount: 14,
    status: 'sent',
    scheduledAt: '2026-01-15T09:00:00Z',
    sentAt: '2026-01-15T09:02:00Z',
    createdAt: '2026-01-10T14:00:00Z',
    costPerMessage: 0.12,
    totalCost: 294.00,
  },
  {
    id: 'sms-camp-2',
    name: 'VIP Loyalty Rewards Q1',
    templateId: 'sms-tpl-4',
    templateName: 'Loyalty Reward',
    audienceFilter: 'vip',
    audienceSize: 380,
    sentCount: 380,
    deliveredCount: 372,
    clickedCount: 198,
    failedCount: 8,
    optOutCount: 2,
    status: 'sent',
    scheduledAt: '2026-02-01T10:00:00Z',
    sentAt: '2026-02-01T10:01:00Z',
    createdAt: '2026-01-28T11:00:00Z',
    costPerMessage: 0.12,
    totalCost: 45.60,
  },
  {
    id: 'sms-camp-3',
    name: 'Post-Service Feedback Feb',
    templateId: 'sms-tpl-5',
    templateName: 'Post-Service Feedback',
    audienceFilter: 'recent',
    audienceSize: 620,
    sentCount: 620,
    deliveredCount: 601,
    clickedCount: 156,
    failedCount: 19,
    optOutCount: 5,
    status: 'sent',
    scheduledAt: '2026-02-15T08:00:00Z',
    sentAt: '2026-02-15T08:03:00Z',
    createdAt: '2026-02-12T15:00:00Z',
    costPerMessage: 0.12,
    totalCost: 74.40,
  },
  {
    id: 'sms-camp-4',
    name: 'Spring AC Service Promo',
    templateId: 'sms-tpl-3',
    templateName: 'Summer Promo',
    audienceFilter: 'inactive',
    audienceSize: 1100,
    sentCount: 0,
    deliveredCount: 0,
    clickedCount: 0,
    failedCount: 0,
    optOutCount: 0,
    status: 'scheduled',
    scheduledAt: '2026-03-25T09:00:00Z',
    sentAt: null,
    createdAt: '2026-03-15T10:00:00Z',
    costPerMessage: 0.12,
    totalCost: 0,
  },
  {
    id: 'sms-camp-5',
    name: 'Oil Change Reminder - Draft',
    templateId: 'sms-tpl-2',
    templateName: 'Oil Change Reminder',
    audienceFilter: 'all',
    audienceSize: 3200,
    sentCount: 0,
    deliveredCount: 0,
    clickedCount: 0,
    failedCount: 0,
    optOutCount: 0,
    status: 'draft',
    scheduledAt: null,
    sentAt: null,
    createdAt: '2026-03-18T16:00:00Z',
    costPerMessage: 0.12,
    totalCost: 0,
  },
];

// --- Helper ---

function getAudienceSize(filter: string): number {
  switch (filter) {
    case 'all': return 3200;
    case 'recent': return 620;
    case 'inactive': return 1100;
    case 'vip': return 380;
    default: return 0;
  }
}

let nextCampaignId = 6;

// --- Routes ---

// GET /api/sms/campaigns - List all campaigns
router.get('/sms/campaigns', (_req, res) => {
  const list = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    templateName: c.templateName,
    audienceFilter: c.audienceFilter,
    audienceSize: c.audienceSize,
    sentCount: c.sentCount,
    deliveredCount: c.deliveredCount,
    clickedCount: c.clickedCount,
    failedCount: c.failedCount,
    status: c.status,
    deliveryRate: c.sentCount > 0 ? Math.round((c.deliveredCount / c.sentCount) * 1000) / 10 : 0,
    scheduledAt: c.scheduledAt,
    sentAt: c.sentAt,
    createdAt: c.createdAt,
    totalCost: c.totalCost,
  }));
  res.json({ campaigns: list });
});

// POST /api/sms/campaigns - Create a new campaign
router.post('/sms/campaigns', (req, res) => {
  const { name, templateId, audienceFilter, scheduledAt } = req.body;

  if (!name || !templateId || !audienceFilter) {
    return res.status(400).json({ error: 'name, templateId, and audienceFilter are required' });
  }

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const audienceSize = getAudienceSize(audienceFilter);

  const campaign: SMSCampaign = {
    id: `sms-camp-${nextCampaignId++}`,
    name,
    templateId,
    templateName: template.name,
    audienceFilter,
    audienceSize,
    sentCount: 0,
    deliveredCount: 0,
    clickedCount: 0,
    failedCount: 0,
    optOutCount: 0,
    status: scheduledAt ? 'scheduled' : 'draft',
    scheduledAt: scheduledAt || null,
    sentAt: null,
    createdAt: new Date().toISOString(),
    costPerMessage: 0.12,
    totalCost: 0,
  };

  campaigns.push(campaign);
  res.status(201).json({ campaign });
});

// GET /api/sms/campaigns/:id - Campaign detail with delivery stats
router.get('/sms/campaigns/:id', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const deliveryRate = campaign.sentCount > 0
    ? Math.round((campaign.deliveredCount / campaign.sentCount) * 1000) / 10
    : 0;
  const clickRate = campaign.deliveredCount > 0
    ? Math.round((campaign.clickedCount / campaign.deliveredCount) * 1000) / 10
    : 0;
  const failureRate = campaign.sentCount > 0
    ? Math.round((campaign.failedCount / campaign.sentCount) * 1000) / 10
    : 0;

  const template = templates.find(t => t.id === campaign.templateId);

  res.json({
    campaign: {
      ...campaign,
      deliveryRate,
      clickRate,
      failureRate,
      template: template || null,
    },
  });
});

// POST /api/sms/campaigns/:id/send - Execute/send a campaign
router.post('/sms/campaigns/:id/send', (req, res) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  if (campaign.status === 'sent' || campaign.status === 'sending') {
    return res.status(400).json({ error: `Campaign is already ${campaign.status}` });
  }

  // Simulate sending
  campaign.status = 'sent';
  campaign.sentAt = new Date().toISOString();
  campaign.sentCount = campaign.audienceSize;
  campaign.deliveredCount = Math.round(campaign.audienceSize * (0.92 + Math.random() * 0.06));
  campaign.clickedCount = Math.round(campaign.deliveredCount * (0.15 + Math.random() * 0.2));
  campaign.failedCount = campaign.sentCount - campaign.deliveredCount;
  campaign.optOutCount = Math.round(campaign.sentCount * (0.003 + Math.random() * 0.007));
  campaign.totalCost = Math.round(campaign.sentCount * campaign.costPerMessage * 100) / 100;

  res.json({
    message: 'Campaign sent successfully',
    campaign: {
      ...campaign,
      deliveryRate: Math.round((campaign.deliveredCount / campaign.sentCount) * 1000) / 10,
    },
  });
});

// GET /api/sms/templates - List all SMS templates
router.get('/sms/templates', (_req, res) => {
  res.json({ templates });
});

// GET /api/sms/stats - Overall SMS stats
router.get('/sms/stats', (_req, res) => {
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = sentCampaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + c.clickedCount, 0);
  const totalFailed = sentCampaigns.reduce((sum, c) => sum + c.failedCount, 0);
  const totalOptOuts = sentCampaigns.reduce((sum, c) => sum + c.optOutCount, 0);
  const totalCost = sentCampaigns.reduce((sum, c) => sum + c.totalCost, 0);

  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 1000) / 10 : 0;
  const clickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 1000) / 10 : 0;
  const optOutRate = totalSent > 0 ? Math.round((totalOptOuts / totalSent) * 10000) / 100 : 0;
  const costPerMessage = totalSent > 0 ? Math.round((totalCost / totalSent) * 100) / 100 : 0;

  // Delivery rate trend (last 6 months)
  const deliveryTrend = [
    { month: 'Oct 2025', sent: 1800, delivered: 1674, rate: 93.0 },
    { month: 'Nov 2025', sent: 2100, delivered: 1974, rate: 94.0 },
    { month: 'Dec 2025', sent: 1950, delivered: 1853, rate: 95.0 },
    { month: 'Jan 2026', sent: 2450, delivered: 2318, rate: 94.6 },
    { month: 'Feb 2026', sent: 1000, delivered: 973, rate: 97.3 },
    { month: 'Mar 2026', sent: 850, delivered: 816, rate: 96.0 },
  ];

  // Best performing campaigns
  const bestCampaigns = sentCampaigns
    .map(c => ({
      id: c.id,
      name: c.name,
      deliveryRate: c.sentCount > 0 ? Math.round((c.deliveredCount / c.sentCount) * 1000) / 10 : 0,
      clickRate: c.deliveredCount > 0 ? Math.round((c.clickedCount / c.deliveredCount) * 1000) / 10 : 0,
      sentCount: c.sentCount,
    }))
    .sort((a, b) => b.clickRate - a.clickRate)
    .slice(0, 5);

  // Audience segmentation
  const audienceSegmentation = [
    { segment: 'All Customers', size: 3200, campaigns: sentCampaigns.filter(c => c.audienceFilter === 'all').length },
    { segment: 'Recent', size: 620, campaigns: sentCampaigns.filter(c => c.audienceFilter === 'recent').length },
    { segment: 'Inactive', size: 1100, campaigns: sentCampaigns.filter(c => c.audienceFilter === 'inactive').length },
    { segment: 'VIP', size: 380, campaigns: sentCampaigns.filter(c => c.audienceFilter === 'vip').length },
  ];

  res.json({
    stats: {
      totalSent,
      totalDelivered,
      totalClicked,
      totalFailed,
      totalOptOuts,
      totalCost: Math.round(totalCost * 100) / 100,
      deliveryRate,
      clickRate,
      optOutRate,
      costPerMessage,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'scheduled' || c.status === 'sending').length,
      deliveryTrend,
      bestCampaigns,
      audienceSegmentation,
    },
  });
});

export default router;
