# SALIS AUTO - Complete API Reference

This document provides a comprehensive list of all APIs used in the SALIS AUTO platform, including external third-party APIs, internal REST endpoints, and WebSocket connections.

---

## Table of Contents

1. [External Third-Party APIs](#external-third-party-apis)
2. [Internal REST API Endpoints](#internal-rest-api-endpoints)
3. [WebSocket APIs](#websocket-apis)
4. [Environment Variables](#environment-variables)
5. [API Authentication](#api-authentication)

---

## External Third-Party APIs

### 1. Payment Processing

#### Stripe API
- **Purpose**: Payment processing, invoicing, subscriptions
- **Package**: `stripe`
- **Environment Variables**:
  - `STRIPE_SECRET_KEY` - Stripe API secret key
  - `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (frontend)
- **Endpoints Used**:
  - Payment Intents
  - Customers
  - Invoices
  - Subscriptions
  - Refunds
- **Documentation**: https://stripe.com/docs/api

#### PayPal API
- **Purpose**: Alternative payment processing
- **Package**: `@paypal/paypal-server-sdk`
- **Environment Variables**:
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
- **Endpoints Used**:
  - Orders
  - Payments
  - Refunds
- **Documentation**: https://developer.paypal.com/docs/api/

---

### 2. Communication APIs

#### Twilio API
- **Purpose**: SMS notifications, appointment reminders, voice calls
- **Package**: `twilio`
- **Environment Variables**:
  - `TWILIO_ACCOUNT_SID` - Twilio account SID
  - `TWILIO_AUTH_TOKEN` - Twilio auth token
  - `TWILIO_PHONE_NUMBER` - Sending phone number
- **Features**:
  - SMS sending for appointment reminders
  - OTP verification
  - Marketing campaigns
  - Call center integration
- **Documentation**: https://www.twilio.com/docs/sms

#### GetResponse API (Email Marketing)
- **Purpose**: Email marketing campaigns
- **Environment Variables**:
  - `GETRESPONSE_API_KEY`
- **Features**:
  - Email campaigns
  - Marketing automation
  - Customer newsletters
- **Documentation**: https://apidocs.getresponse.com/

---

### 3. AI & Machine Learning APIs

#### OpenAI API
- **Purpose**: AI-powered features (chatbot, predictions, recommendations)
- **Package**: `openai`
- **Environment Variables**:
  - `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (via Replit)
  - `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL
  - `OPENAI_API_KEY` - Direct OpenAI key (fallback)
- **Features Used**:
  - **AI Chatbot**: Customer service automation
  - **Predictive Diagnostics**: Vehicle fault prediction
  - **Smart Parts Recommender**: AI-powered parts suggestions
  - **Smart Assignment**: Intelligent technician matching
  - **AI Service Advisor**: Automated service recommendations
- **Models Used**: GPT-4, GPT-3.5-turbo
- **Documentation**: https://platform.openai.com/docs/api-reference

---

### 4. Google APIs

#### Google Calendar API
- **Purpose**: Calendar sync, appointment scheduling
- **Package**: `googleapis`
- **Environment Variables**: Managed via Replit connector
- **Features**:
  - Sync appointments to Google Calendar
  - Import customer calendars
  - Availability checking
- **Scopes**:
  - `calendar.readonly`
  - `calendar.events`
- **Documentation**: https://developers.google.com/calendar/api

#### Gmail API
- **Purpose**: Email sending, notifications
- **Package**: `googleapis`
- **Environment Variables**: Managed via Replit connector
- **Features**:
  - Invoice email delivery
  - Appointment confirmations
  - Marketing emails
- **Scopes**:
  - `gmail.send`
  - `gmail.readonly`
- **Documentation**: https://developers.google.com/gmail/api

---

### 5. Automotive Industry APIs

#### TecDoc API (Optional)
- **Purpose**: Parts catalog, vehicle compatibility
- **Environment Variables**:
  - `TECDOC_API_URL`
  - `TECDOC_API_KEY`
- **Features**:
  - Parts lookup by vehicle
  - OEM part numbers
  - Cross-referencing
- **Documentation**: https://www.tecalliance.net/

#### VIN Decoder API (Recommended)
- **Purpose**: Decode Vehicle Identification Numbers
- **Suggested Providers**:
  - NHTSA vPIC API (Free)
  - CarMD API
  - AutoCheck API
- **Features**:
  - Vehicle specifications
  - Manufacturing details
  - Recall information

#### OBD-II Diagnostic APIs
- **Purpose**: Vehicle diagnostics integration
- **Suggested Providers**:
  - ELM327 compatible devices
  - BlueDriver API
  - Torque Pro API
- **Features**:
  - Fault code reading (DTCs)
  - Live sensor data
  - Vehicle health monitoring

---

### 6. Mapping & Location APIs

#### Google Maps API (Recommended)
- **Purpose**: Fleet tracking, route optimization
- **Features**:
  - Geocoding
  - Directions
  - Distance matrix
  - Places
- **Documentation**: https://developers.google.com/maps

#### HERE Maps API (Alternative)
- **Purpose**: Fleet management, routing
- **Features**:
  - Route calculation
  - Traffic data
  - Fleet telematics
- **Documentation**: https://developer.here.com/

---

### 7. Document & Media APIs

#### Cloudinary API (Recommended)
- **Purpose**: Image/video storage and processing
- **Features**:
  - Vehicle photo storage
  - Document scanning
  - Image optimization
- **Documentation**: https://cloudinary.com/documentation

#### AWS S3 / Replit Object Storage
- **Purpose**: File storage
- **Features**:
  - Document storage
  - Backup files
  - Media attachments

---

### 8. Accounting Integration APIs

#### QuickBooks API
- **Purpose**: Accounting synchronization
- **Features**:
  - Invoice sync
  - Payment sync
  - Customer/vendor sync
- **Documentation**: https://developer.intuit.com/

#### Xero API
- **Purpose**: Alternative accounting integration
- **Features**:
  - Financial data sync
  - Bank reconciliation
- **Documentation**: https://developer.xero.com/

---

### 9. CRM & Marketing APIs

#### HubSpot API (Recommended)
- **Purpose**: CRM integration, marketing automation
- **Features**:
  - Contact management
  - Deal tracking
  - Email automation
- **Documentation**: https://developers.hubspot.com/

#### Mailchimp API
- **Purpose**: Email marketing
- **Features**:
  - Newsletter campaigns
  - Audience management
- **Documentation**: https://mailchimp.com/developer/

---

### 10. Social Media APIs

#### Facebook/Meta API
- **Purpose**: Social media integration
- **Features**:
  - Post publishing
  - Reviews management
  - Messenger integration
- **Documentation**: https://developers.facebook.com/

#### Google My Business API
- **Purpose**: Business listing management
- **Features**:
  - Reviews management
  - Business information sync
  - Insights
- **Documentation**: https://developers.google.com/my-business

---

### 11. IoT & Telematics APIs

#### Geotab API (Recommended for Fleet)
- **Purpose**: Fleet telematics
- **Features**:
  - GPS tracking
  - Driver behavior
  - Vehicle diagnostics
- **Documentation**: https://geotab.github.io/sdk/

#### CalAmp API
- **Purpose**: Asset tracking
- **Features**:
  - Real-time location
  - Geofencing
- **Documentation**: https://www.calamp.com/

---

### 12. Blockchain APIs (Future)

#### Ethereum / Polygon API
- **Purpose**: Blockchain service history
- **Features**:
  - Immutable service records
  - Smart contracts for warranties
- **Suggested Providers**:
  - Infura
  - Alchemy
  - QuickNode

---

### 13. Insurance APIs

#### Insurance Claim APIs
- **Purpose**: Insurance claim processing
- **Suggested Providers**:
  - Mitchell International
  - CCC Intelligent Solutions
  - Guidewire
- **Features**:
  - Claim submission
  - Estimate integration
  - Photo documentation

---

### 14. Saudi Arabia Compliance APIs

#### ZATCA E-Invoicing API
- **Purpose**: Electronic invoicing compliance
- **Environment Variables**:
  - `ZATCA_API_KEY`
  - `ZATCA_API_SECRET`
- **Features**:
  - Invoice validation
  - QR code generation
  - Compliance reporting
- **Documentation**: https://zatca.gov.sa/en/E-Invoicing

#### Absher API (Future Integration)
- **Purpose**: Government services integration
- **Features**:
  - Vehicle registration verification
  - Customer identity verification

---

## Internal REST API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| GET | `/api/user` | Get current user |
| GET | `/api/auth/user` | Get authenticated user details |

### User Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/garages` | List all garages |
| GET | `/api/garages/:id/branches` | Get garage branches |
| GET | `/api/roles` | List all roles |
| GET | `/api/user/:id/roles` | Get user roles |
| GET | `/api/settings` | Get user settings |
| PATCH | `/api/settings` | Update user settings |

### Customer APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Vehicle APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |
| GET | `/api/vehicles/:id/history` | Get vehicle service history |

### Appointment APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| GET | `/api/appointments/:id` | Get appointment by ID |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Delete appointment |
| POST | `/api/appointments/check-availability` | Check availability |

### Job Card APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/job-cards` | List all job cards |
| GET | `/api/job-cards/:id` | Get job card by ID |
| POST | `/api/job-cards` | Create job card |
| PUT | `/api/job-cards/:id` | Update job card |
| PATCH | `/api/job-cards/:id` | Partial update job card |
| GET | `/api/job-cards/:id/tasks` | Get job card tasks |
| POST | `/api/job-cards/:id/tasks` | Add task to job card |
| POST | `/api/job-cards/:id/tracking/generate` | Generate tracking link |
| GET | `/api/job-cards/:id/tracking/events` | Get tracking events |

### Technician APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technicians` | List technicians |
| POST | `/api/technicians` | Create technician |
| DELETE | `/api/technicians/:id` | Delete technician |
| GET | `/api/technician-profiles/:userId` | Get technician profile |
| POST | `/api/technician-profiles` | Create technician profile |
| PATCH | `/api/technician-profiles/:userId` | Update profile |
| GET | `/api/technicians/:id/job-cards` | Get technician's job cards |
| GET | `/api/technicians/:id/time-clock` | Get time clock entries |
| POST | `/api/technicians/:id/time-clock` | Clock in/out |

### Inventory APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/spare-parts` | List spare parts |
| GET | `/api/spare-parts/:id` | Get spare part by ID |
| POST | `/api/spare-parts` | Create spare part |
| PUT | `/api/spare-parts/:id` | Update spare part |
| DELETE | `/api/spare-parts/:id` | Delete spare part |
| GET | `/api/tools` | List tools |
| POST | `/api/tools` | Create tool |
| GET | `/api/tool-availability` | Get tool availability |
| POST | `/api/tool-usage` | Log tool usage |

### Service Template APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-templates` | List service templates |
| GET | `/api/service-templates/:id` | Get template by ID |
| POST | `/api/service-templates` | Create template |
| PUT | `/api/service-templates/:id` | Update template |
| DELETE | `/api/service-templates/:id` | Delete template |

### Invoice & Billing APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/:id` | Get invoice by ID |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| POST | `/api/invoices/:id/send` | Send invoice by email |
| GET | `/api/invoices/:id/pdf` | Generate PDF |
| POST | `/api/refunds` | Create refund |
| GET | `/api/refunds` | List refunds |
| POST | `/api/refunds/:id/process` | Process refund |

### Payment APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create payment intent |
| POST | `/api/payments/confirm` | Confirm payment |
| GET | `/api/payments/:invoiceId` | Get payments for invoice |
| POST | `/api/stripe/webhook` | Stripe webhook handler |

### Supplier & Purchase APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List suppliers |
| POST | `/api/suppliers` | Create supplier |
| GET | `/api/purchase-orders` | List purchase orders |
| POST | `/api/purchase-orders` | Create purchase order |
| PUT | `/api/purchase-orders/:id` | Update purchase order |
| POST | `/api/purchase-orders/:id/receive` | Receive goods |

### HR Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hr/employees` | List employees |
| POST | `/api/hr/employees` | Create employee |
| GET | `/api/hr/attendance` | Get attendance records |
| POST | `/api/hr/clock-in` | Clock in |
| POST | `/api/hr/clock-out/:id` | Clock out |
| GET | `/api/hr/leave-requests` | List leave requests |
| POST | `/api/hr/leave-requests` | Create leave request |
| GET | `/api/hr/payroll` | Get payroll data |
| GET | `/api/hr/shift-templates` | List shift templates |

### Analytics & BI APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports |
| GET | `/api/reports/:id` | Get report by ID |
| GET | `/api/bi/profitable-services` | Get profitable services |
| GET | `/api/bi/peak-hours` | Get peak hours |
| GET | `/api/bi/technician-utilization` | Get technician utilization |
| GET | `/api/bi/customer-acquisition-cost` | Get CAC |
| GET | `/api/bi/customer-lifetime-value` | Get CLV |

### AI Features APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | AI chatbot conversation |
| POST | `/api/ai/predict-maintenance` | Predict maintenance |
| POST | `/api/ai/recommend-parts` | AI parts recommendation |
| POST | `/api/ai/smart-assignment` | Smart job assignment |
| POST | `/api/ai/diagnostics` | AI diagnostics |

### Service Bay APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-bays` | List service bays |
| GET | `/api/service-bays/:id` | Get bay status |
| POST | `/api/service-bays/:id/start-session` | Start bay session |
| POST | `/api/service-bays/:id/end-session` | End bay session |

### Loyalty Program APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loyalty/programs` | List loyalty programs |
| GET | `/api/loyalty/members` | List loyalty members |
| POST | `/api/loyalty/transactions` | Add points transaction |
| GET | `/api/loyalty/rewards` | List available rewards |
| POST | `/api/loyalty/redemptions` | Redeem reward |

### Workshop Calendar APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workshop/events` | Get calendar events |
| POST | `/api/workshop/events` | Create event |
| PUT | `/api/workshop/events/:id` | Update event |
| DELETE | `/api/workshop/events/:id` | Delete event |
| GET | `/api/workshop/resources` | Get resources |
| GET | `/api/workshop/availability` | Get availability |

### Fleet Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fleet/groups` | List fleet groups |
| POST | `/api/fleet/groups` | Create fleet group |
| GET | `/api/fleet/vehicles` | List fleet vehicles |
| GET | `/api/fleet/contracts` | List fleet contracts |
| GET | `/api/fleet/pricing-tiers` | Get pricing tiers |

### Compliance APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tax-configurations` | Get tax configs |
| POST | `/api/tax-configurations` | Create tax config |
| POST | `/api/calculate-tax` | Calculate tax |
| POST | `/api/zatca/validate` | Validate ZATCA invoice |
| GET | `/api/compliance/reports` | Get compliance reports |

### QR Code & Kiosk APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/qr-codes/generate` | Generate QR code |
| POST | `/api/qr-codes/scan` | Scan QR code |
| POST | `/api/qr-codes/check-in` | Kiosk check-in |
| GET | `/api/qr-codes/customer/:id` | Get customer QR codes |

### Export & Import APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/export` | Export data |
| GET | `/api/export-jobs` | List export jobs |
| GET | `/api/export-jobs/:id` | Get export job status |
| POST | `/api/import` | Import data |
| POST | `/api/bulk-delete` | Bulk delete records |
| POST | `/api/bulk-update` | Bulk update records |

---

## WebSocket APIs

### Chat WebSocket
- **Endpoint**: `/ws/chat`
- **Purpose**: Real-time in-app chat
- **Events**:
  - `message` - New chat message
  - `typing` - User typing indicator
  - `online` - User online status

### Service Bay WebSocket
- **Endpoint**: `/ws/service-bays`
- **Purpose**: Real-time bay occupancy updates
- **Events**:
  - `bay-update` - Bay status changed
  - `session-start` - Session started
  - `session-end` - Session ended

### Notifications WebSocket
- **Endpoint**: `/ws/notifications`
- **Purpose**: Real-time notifications
- **Events**:
  - `notification` - New notification
  - `alert` - Urgent alert

---

## Environment Variables

### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session encryption key |

### Optional Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | Stripe | Payment processing |
| `STRIPE_PUBLISHABLE_KEY` | Stripe | Frontend payments |
| `TWILIO_ACCOUNT_SID` | Twilio | SMS account |
| `TWILIO_AUTH_TOKEN` | Twilio | SMS authentication |
| `TWILIO_PHONE_NUMBER` | Twilio | SMS sender number |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI | AI features |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI | AI base URL |
| `GETRESPONSE_API_KEY` | GetResponse | Email marketing |
| `TECDOC_API_URL` | TecDoc | Parts catalog |
| `TECDOC_API_KEY` | TecDoc | Parts authentication |
| `ZATCA_API_KEY` | ZATCA | E-invoicing |
| `ZATCA_API_SECRET` | ZATCA | E-invoicing auth |

### Replit-Managed Variables

| Variable | Description |
|----------|-------------|
| `REPLIT_CONNECTORS_HOSTNAME` | Connector hostname |
| `REPL_IDENTITY` | Repl identity token |
| `WEB_REPL_RENEWAL` | Deployment token |

---

## API Authentication

### Session-Based Authentication
- Uses Express sessions with passport.js
- Session stored in PostgreSQL via connect-pg-simple
- Cookie-based authentication for web clients

### API Key Authentication (for external integrations)
- Bearer token authentication for API clients
- Generated via `/api/auth/generate-token`

### OAuth 2.0 (for Google services)
- Managed via Replit connectors
- Automatic token refresh

---

## Rate Limiting

| Endpoint Category | Limit |
|-------------------|-------|
| Authentication | 5 requests/minute |
| General API | 100 requests/minute |
| AI endpoints | 20 requests/minute |
| Export endpoints | 10 requests/hour |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## API Versioning

Current API Version: **v1** (implicit in routes)

Future versions will use path prefix: `/api/v2/...`

---

*Last Updated: December 2024*
*Total Internal Endpoints: 350+*
*Total External APIs: 25+*
