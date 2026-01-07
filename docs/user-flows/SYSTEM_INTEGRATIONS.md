# SALIS AUTO - System Integration Flows

## Overview

SALIS AUTO integrates with multiple external systems and services to provide comprehensive functionality. This document details all integration flows and data exchanges.

---

## 1. Payment Gateway Integration

### Providers: Stripe, PayPal

---

### Flow 1.1: Stripe Payment Processing

**Trigger**: Customer initiates payment

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Customer     │───▶│ SALIS        │───▶│ Stripe       │
│ Checkout     │    │ Backend      │    │ API          │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Enter Card        Create Intent       Process Payment
```

**Steps**:
1. Customer selects "Pay with Card"
2. Frontend loads Stripe Elements
3. Customer enters card details
4. Card data sent directly to Stripe
5. Backend creates PaymentIntent
6. Stripe tokenizes card
7. Backend confirms payment
8. Stripe processes transaction
9. Webhook confirms success
10. Invoice marked as paid
11. Receipt generated

**Data Exchanged**:
- To Stripe: Amount, currency, customer ID, metadata
- From Stripe: Payment ID, status, receipt URL

**Error Handling**:
- Card declined: Show error, suggest retry
- Insufficient funds: Notify customer
- Network error: Queue for retry

---

### Flow 1.2: PayPal Payment Processing

**Trigger**: Customer selects PayPal

**Steps**:
1. Customer clicks "Pay with PayPal"
2. Backend creates PayPal order
3. Customer redirected to PayPal
4. Customer logs in and approves
5. Redirected back to SALIS
6. Backend captures payment
7. PayPal confirms success
8. Invoice updated

**Data Exchanged**:
- To PayPal: Amount, currency, return URLs
- From PayPal: Order ID, payer info, status

---

### Flow 1.3: Refund Processing

**Trigger**: Refund initiated

**Steps**:
1. Finance approves refund
2. System identifies original payment
3. Backend calls Stripe/PayPal refund API
4. Gateway processes refund
5. Webhook confirms refund
6. Credit note generated (ZATCA-compliant)
7. Customer notified

---

## 2. SMS Integration (Twilio)

### Location: `/sms-integration`

---

### Flow 2.1: Send SMS Notification

**Trigger**: System event requiring customer notification

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ System       │───▶│ SALIS        │───▶│ Twilio       │
│ Event        │    │ Backend      │    │ API          │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Trigger SMS        Format Message      Deliver SMS
```

**SMS Types**:
1. **Appointment Reminders**:
   - 24 hours before
   - 1 hour before
   
2. **Status Updates**:
   - Vehicle checked in
   - Estimate ready
   - Work started
   - Work complete
   - Ready for pickup

3. **Payment Notifications**:
   - Invoice generated
   - Payment received
   - Payment reminder

4. **Marketing** (opt-in):
   - Promotions
   - Loyalty updates
   - Service reminders

**Steps**:
1. Event triggers SMS
2. System retrieves customer phone
3. Format message from template
4. Call Twilio API
5. Twilio queues message
6. Message delivered to carrier
7. Delivery status webhook received
8. Status logged in system

**Data Exchanged**:
- To Twilio: To number, from number, message body
- From Twilio: Message SID, status, delivery time

**Error Handling**:
- Invalid number: Mark and notify staff
- Delivery failed: Retry, then escalate
- Unsubscribed: Honor preference

---

## 3. Email Integration (SMTP/Gmail)

### Location: Google Mail Integration

---

### Flow 3.1: Transactional Email

**Trigger**: System event requiring email

**Email Types**:
- Welcome email
- Appointment confirmation
- Estimate notification
- Invoice delivery
- Receipt
- Service reminder
- Password reset

**Steps**:
1. Event triggers email
2. Load email template
3. Personalize with data
4. Attach PDF if applicable
5. Send via Gmail API
6. Track delivery status
7. Log in communication history

---

### Flow 3.2: Marketing Email

**Trigger**: Scheduled campaign

**Steps**:
1. Marketing creates campaign
2. Select recipient list
3. Design email content
4. Schedule delivery
5. System sends in batches
6. Track opens and clicks
7. Update engagement metrics

---

## 4. Google Calendar Integration

### Location: Appointment scheduling

---

### Flow 4.1: Sync Appointments

**Trigger**: Appointment created/modified

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ SALIS        │───▶│ Google       │───▶│ User         │
│ Appointment  │    │ Calendar API │    │ Calendar     │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Steps**:
1. Appointment created in SALIS
2. Check if staff has linked calendar
3. Create calendar event via API
4. Include appointment details
5. Set reminder notifications
6. Event appears in staff calendar
7. Changes sync bidirectionally

**Data Exchanged**:
- To Google: Event title, time, description, attendees
- From Google: Event ID, updated status

---

## 5. VIN Decoding Integration

### Location: Vehicle registration

---

### Flow 5.1: VIN Decode

**Trigger**: VIN entered during vehicle registration

**Steps**:
1. User enters 17-character VIN
2. System validates VIN format
3. Call VIN decode API
4. Receive vehicle specifications:
   - Make
   - Model
   - Year
   - Engine type
   - Transmission
   - Body style
   - Country of origin
5. Auto-populate vehicle form
6. User confirms details
7. Store decoded data

**Data Exchanged**:
- To API: VIN number
- From API: Complete vehicle specifications

**Error Handling**:
- Invalid VIN: Prompt for correction
- VIN not found: Allow manual entry
- API unavailable: Queue for retry

---

## 6. OBD/Telematics Integration

### Location: `/diagnostics-obd-hub`, `/telematics-integration`

---

### Flow 6.1: OBD Scanner Connection

**Trigger**: Technician connects scanner

**Protocols Supported**:
- OBD-II (all vehicles 1996+)
- CAN bus
- Manufacturer-specific protocols

**Steps**:
1. Scanner connected to vehicle OBD port
2. Bluetooth/USB connection to device
3. System queries scanner
4. Read all DTCs
5. Read live sensor data
6. Store in diagnostic hub
7. Link to job card

**Data Captured**:
- DTCs (active and pending)
- Freeze frame data
- Live PID readings
- VIN (from ECU)
- Readiness monitors

---

### Flow 6.2: Telematics Data

**Trigger**: Connected vehicle sends data

**Steps**:
1. Vehicle telematics unit transmits
2. Data received via API
3. Process and store:
   - Location
   - Speed
   - Fuel level
   - Engine status
   - Error codes
4. Update vehicle profile
5. Trigger alerts if needed

**Use Cases**:
- Fleet tracking
- Predictive maintenance
- Fuel monitoring
- Driver behavior

---

## 7. Accounting System Export

### Location: Financial modules

---

### Flow 7.1: Export to External Accounting

**Trigger**: Manual export or scheduled

**Supported Formats**:
- CSV
- Excel
- XML
- QuickBooks format
- Xero format

**Data Exported**:
- Chart of accounts
- Journal entries
- Invoices
- Payments
- Expenses

**Steps**:
1. Select date range
2. Choose export format
3. Select data types
4. Generate export file
5. Download or auto-upload
6. Log export for audit

---

## 8. IoT Integration

### Location: `/iot-dashboard`

---

### Flow 8.1: Service Bay Sensors

**Trigger**: Continuous monitoring

**Sensors**:
- Occupancy sensors
- Lift status
- Environmental (temp, humidity)
- Tool tracking

**Data Flow**:
1. Sensor captures reading
2. Transmits via MQTT
3. IoT gateway receives
4. Publishes to backend
5. Real-time dashboard update
6. Alerts if thresholds exceeded

---

### Flow 8.2: Equipment Monitoring

**Trigger**: Equipment status change

**Steps**:
1. Equipment sensor activates
2. Status transmitted
3. Backend processes
4. Update calibration records
5. Schedule maintenance if needed

---

## 9. WebSocket Real-Time Communication

### Location: `/ws/chat`

---

### Flow 9.1: Real-Time Chat

**Trigger**: User sends message

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User A       │───▶│ WebSocket    │───▶│ User B       │
│ Sends        │    │ Server       │    │ Receives     │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Steps**:
1. User opens chat
2. WebSocket connection established
3. Authentication via session
4. User sends message
5. Server broadcasts to recipients
6. Messages stored in database
7. Real-time delivery confirmed

---

### Flow 9.2: Live Updates

**Trigger**: System event

**Use Cases**:
- Job status changes
- New notifications
- Service bay updates
- Dashboard metrics

**Steps**:
1. Event occurs in system
2. WebSocket server notified
3. Relevant clients identified
4. Update pushed to clients
5. UI updates in real-time

---

## 10. Digital Signage Integration

### Location: `/digital-signage`

---

### Flow 10.1: Display Updates

**Trigger**: Content change or schedule

**Steps**:
1. Create signage content
2. Assign to displays
3. Schedule timing
4. Push to display devices
5. Content rendered
6. Track view metrics

**Content Types**:
- Queue status
- Promotions
- Service updates
- Weather/news

---

## Integration Security

### Authentication Methods:
- API Keys (rotated regularly)
- OAuth 2.0 (for user-facing)
- JWT tokens (for sessions)
- Webhook signatures

### Data Protection:
- All connections TLS encrypted
- Sensitive data masked
- PII minimized in logs
- Regular security audits

---

## Integration Status Dashboard

| Integration | Status | Last Sync | Health |
|-------------|--------|-----------|--------|
| Stripe | ✅ Active | Real-time | Healthy |
| PayPal | ✅ Active | Real-time | Healthy |
| Twilio SMS | ✅ Active | Real-time | Healthy |
| Google Calendar | ✅ Active | 5 min | Healthy |
| Google Mail | ✅ Active | Real-time | Healthy |
| VIN Decoder | ✅ Active | On-demand | Healthy |
| OBD Scanner | ✅ Active | On-connect | Healthy |
| WebSocket | ✅ Active | Persistent | Healthy |

