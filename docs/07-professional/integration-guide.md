# SALIS AUTO — Integration Guide

**Document Type:** Professional — Integration Guide  
**Version:** 14.0.0  
**Date:** March 2026  

---

## Overview

SALIS AUTO integrates with a comprehensive ecosystem of third-party services to provide a complete business solution. This guide covers all current integrations, their configuration, and how they work.

---

## 1. AI Integration — OpenAI

### Service
OpenAI GPT-4o via Replit AI Integrations

### Integration Method
Replit's built-in AI integration provides the API key automatically:
```
Environment Variable: AI_INTEGRATIONS_OPENAI_API_KEY
Mapped to: OPENAI_API_KEY (in server initialization)
```

### Features Powered
| Feature | Model | Endpoint |
|---------|-------|---------|
| AI Chatbot | GPT-4o | POST /api/ai/chat |
| Job Cost Estimation | GPT-4o | POST /api/ai/estimate-job |
| Predictive Maintenance | GPT-4o | POST /api/ai/predict-maintenance |
| Parts Recommendations | GPT-4o | POST /api/ai/recommend-parts |
| Sentiment Analysis | GPT-4o-mini | POST /api/customer-feedback/:id/sentiment |
| AI Service Advisor | GPT-4o | POST /api/ai/service-advisor |
| Voice Processing | Whisper | POST /api/ai/transcribe |

### Configuration
- Configured automatically via Replit AI Integration
- No manual API key entry required
- Token usage tracked via OpenAI dashboard

---

## 2. SMS Integration — Twilio

### Service
Twilio Programmable SMS and WhatsApp

### Environment Variables
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### Features
| Feature | SMS/WhatsApp |
|---------|-------------|
| Appointment confirmation | SMS |
| Appointment reminders | SMS |
| Vehicle ready notification | SMS |
| Invoice sent notification | SMS |
| Status update notifications | SMS |
| Marketing campaigns | SMS |
| Arabic messages | Full support |

### Message Templates

**Appointment Confirmation (Arabic):**
```
مرحباً [اسم العميل]، تم تأكيد موعدك في صالس أوتو يوم [التاريخ] الساعة [الوقت]. رقم الموعد: [الرقم]
```

**Appointment Confirmation (English):**
```
Hello [Customer Name], your appointment at SALIS AUTO is confirmed for [Date] at [Time]. Ref: [Number]
```

### Rate Limits
- Saudi Arabia (KSA) SMS: Standard Twilio rates apply
- Ensure phone numbers are in international format (+966XXXXXXXXX for Saudi)

---

## 3. Email Integration — Google Gmail API

### Service
Google Gmail API via Replit Google Mail Integration

### Features
| Feature | Description |
|---------|-------------|
| Invoice delivery | Automated invoice emails with PDF attachment |
| Appointment confirmations | Booking confirmation emails |
| Password reset | Account security emails |
| Marketing campaigns | Newsletter and promotion emails |
| Service reminders | Maintenance due notifications |
| ZATCA communications | E-invoice delivery |

### Configuration
Configured via Replit's Google Mail integration — OAuth2 authentication.

### Email Templates
- Responsive HTML templates
- Arabic/English dual-language support
- SALIS AUTO branding (logo, colors)
- Unsubscribe link (compliance)

---

## 4. Calendar Integration — Google Calendar

### Service
Google Calendar API via Replit Google Calendar Integration

### Features
- Sync appointments to Google Calendar
- Block out holidays on workshop calendar
- Technician schedule sync
- Customer appointment invites

### Sync Direction
- SALIS AUTO → Google Calendar (push appointments)
- Google Calendar → SALIS AUTO (pull external events)

---

## 5. Payment Integration — Stripe

### Service
Stripe Payments Platform

### Environment Variables
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Features
| Feature | Implementation |
|---------|--------------|
| Online invoice payment | Stripe Payment Links |
| In-person card payment | Stripe Terminal |
| Recurring billing | Stripe Subscriptions |
| Refunds | Stripe Refunds API |
| Webhooks | Payment status updates |

### Supported Payment Methods (Saudi Arabia)
- Visa, Mastercard
- MADA (Saudi domestic debit)
- Apple Pay
- Google Pay

### Security
- PCI DSS compliant (Stripe handles card data)
- SALIS AUTO never touches raw card numbers
- Webhook signature verification implemented

---

## 6. Payment Integration — PayPal

### Service
PayPal Commerce Platform

### Environment Variables
```
PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Features
- PayPal account payments
- Pay Later options
- Venmo (where available)
- International currency support

---

## 7. ZATCA E-Invoicing API

### Service
ZATCA (Zakat, Tax and Customs Authority) API

### Integration Points
- **Phase 2 Invoice Submission:** Real-time API call on each invoice finalization
- **Clearance Status:** Poll for ZATCA acceptance/rejection
- **Cryptographic Stamp:** Store and display ZATCA stamp on invoice

### Environment Variables
```
ZATCA_CERT=<Phase 2 certificate>
ZATCA_UNIT_ID=<Compliance unit identifier>
ZATCA_OTP=<One-time password from ZATCA portal>
```

---

## 8. Vehicle Data — VIN Decoder

### Service
NHTSA (National Highway Traffic Safety Administration) API

### Features
- Decode any VIN to get make, model, year, body type
- Free API, no key required
- Covers all vehicles sold in major markets

### API Endpoint
```
GET https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}
```

---

## 9. WebSocket — Real-Time Features

### Implementation
Node.js `ws` library, attached to Express server

### WebSocket Server Path
```
ws://[server]/ws/chat
```

### Events Supported
| Event | Direction | Purpose |
|-------|-----------|---------|
| `chat_message` | Bi-directional | Internal messaging |
| `bay_update` | Server → Client | Bay status change |
| `notification` | Server → Client | Push notifications |
| `job_status` | Server → Client | Job card status change |
| `call_center` | Bi-directional | Live call updates |

### Authentication
WebSocket connections are authenticated via session cookie — same session as HTTP requests.

---

## 10. B2B Parts Network — Internal

### Implementation
SALIS AUTO-native network, no external API required.

### Architecture
- Network members registered in `network_members` table
- Parts requests broadcast via internal message queue
- Quotations stored in `network_quotations` table
- Real-time notifications via WebSocket + SMS

---

## Integration Health Monitoring

Check integration status at `/integrations` (requires admin access):
- Connection status for each integration
- Last successful API call
- Error count in last 24 hours
- Webhook status

---

## Adding Custom Integrations

SALIS AUTO exposes:
- **REST API** at `/api/*` — Full platform data access
- **OpenAPI Spec** at `/openapi.json` — Machine-readable API spec
- **AI Plugin Manifest** at `/.well-known/ai-plugin.json` — ChatGPT plugin ready

For custom integrations, contact the SALIS AUTO engineering team for API credentials and webhook configuration.

---

*SALIS AUTO Integration Guide — Version 14.0.0*
