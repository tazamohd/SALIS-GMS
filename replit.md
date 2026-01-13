# SALIS AUTO - Automotive ERP Platform

## Overview
SALIS AUTO is a world-class automotive ERP platform designed for efficient garage operations at scale. It offers enterprise-grade features including franchise management, OBD diagnostics integration, OEM software licensing, global multi-currency/multi-language support, and a B2B spare parts supply network. The platform has expanded to **156+ comprehensive modules** across 14 phases, supporting multi-tenant franchise networks, advanced hardware integrations, cutting-edge technologies (AI, blockchain, AR/VR, quantum computing, sustainable energy management), and dedicated mobile web applications. It includes comprehensive compliance and localization features for the Saudi Arabian market (VAT, ZATCA E-Invoicing, Hijri calendar, Zakat, TRN validation, Arabic language, localized exports, SMS).

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- SALIS AUTO brand design system applied across entire UI
- Official SALIS AUTO logo integrated
- Dark theme enforced - avoid white backgrounds throughout the application
- Resizable sidebar with localStorage persistence (200px-400px range, default 280px)

## System Architecture
The application uses a full-stack architecture with clear client-server separation.

**Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components. AuthProvider context wraps the entire application for centralized authentication state management.

**Backend**: Express server written in TypeScript with a hybrid routing architecture. New modular routes are loaded from `server/routes/` (e.g., `auth.ts`) with priority, then legacy routes from `server/routes.ts` are loaded as fallback. OpenAI API key compatibility is handled automatically by mapping `AI_INTEGRATIONS_OPENAI_API_KEY` to `OPENAI_API_KEY`.

**Authentication**: Custom email/password authentication with comprehensive role-based access control (RBAC). AuthProvider with React Query manages user state via `/api/user`, `/api/login`, `/api/logout`, and `/api/register` endpoints. Session-based authentication using passport.js LocalStrategy.

**Database**: PostgreSQL with Drizzle ORM, comprising **175+ comprehensive modules with 320+ tables**.

**RBAC System**: 24 professional roles, 70 staff users across departments, granular permissions for 156+ resources. Role-based sidebar navigation filtering implemented via `roleNavigationMap` in Layout.tsx. Welcome page at `/welcome` routes users to their role-specific portal (technician → /technician-portal, HR → /hr-management, etc.).

**Security Notes (Production)**: AUTH_BYPASS=true is set for development only. Disable for production. HR module queries use optional garage-based filtering - in development mode without garageId, returns all records. Production deployments must enforce garageId for tenant isolation.

**Real-Time Features**: WebSocket server (`/ws/chat`) for in-app chat support, live notifications, call center real-time updates, and service bay occupancy monitoring with session-based authentication.

**UI/UX Decisions**: The design preserves the Figma aesthetic, ensures responsiveness, and uses a consistent component-based approach with a monochrome design system based on the SALIS AUTO brand. It supports PWA, mobile-responsive navigation, and WCAG 2.1 AA accessibility features, including an offline mode. A pure grayscale design is enforced with distinct light and dark modes. Resizable sidebar with drag handle for user customization.

**Design System & Archetype Wrappers**: A comprehensive UI/UX design system overhaul has been completed across all 150+ application pages using 7 production-ready archetype wrappers: StandardPageLayout (simple pages with header/description), StandardTablePage (data tables), DashboardPage (metrics/cards), FormPage (form-centric), AnalyticsPage (reporting), MobileCardPage (mobile-optimized cards), and TabsPageLayout (multi-tab interfaces).

**Navigation System**: Sidebar navigation completely reorganized into **18 workflow-based groups** that follow natural garage operational sequence: Dashboard & Overview → Customer Intake & Appointments → Vehicle Management → Inspection & Check-In → Diagnostics & Assessment → Service Planning & Scheduling → Parts & Inventory → Service Execution & Operations → Quality & Delivery → Billing & Payments → Analytics & Business Intelligence → Customer Experience & Growth → Team & HR Management → Compliance & Safety → Enterprise & Franchise → Emerging Technologies → AI & Automation Hub → System & Settings.

**Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Features include comprehensive user settings, a print system, undo/redo, keyboard shortcuts, a robust currency system, and action history tracking for audit trails. The database is seeded with realistic sample data.

## Phase 14 Features (Latest)

### 1. Real-Time Service Bay Occupancy Dashboard
- **Location**: `/service-bay-dashboard`
- **Features**: Live bay status monitoring with WebSocket updates, technician assignments, job progress tracking
- **Database Tables**: `serviceBays`, `serviceBayAssignments`, `serviceBaySessions`
- **Security**: Transactional row locking in `startBaySession` to prevent race conditions
- **API Endpoints**: `/api/service-bays`, `/api/service-bays/:id/start-session`, `/api/service-bays/:id/end-session`

### 2. Automated Inventory Reordering with Predictive Demand Forecasting
- **Location**: `/automated-reordering`
- **Features**: AI-powered demand prediction, automatic reorder point calculations, supplier integration
- **Database Tables**: `inventoryReorderRules`, `inventoryReorderHistory`, `demandForecasts`
- **API Endpoints**: `/api/inventory/reorder-rules`, `/api/inventory/forecasts`, `/api/inventory/auto-reorder`

### 3. Customer Loyalty Program with Tiered Rewards
- **Location**: `/loyalty-program`
- **Features**: Points accumulation, tier progression (Bronze/Silver/Gold/Platinum), rewards redemption, referral bonuses
- **Database Tables**: `loyaltyPrograms`, `loyaltyTiers`, `loyaltyMembers`, `loyaltyTransactions`, `loyaltyRewards`, `loyaltyRedemptions`
- **API Endpoints**: `/api/loyalty/programs`, `/api/loyalty/members`, `/api/loyalty/transactions`, `/api/loyalty/rewards`

### 4. Interactive Workshop Calendar with Drag-and-Drop Scheduling
- **Location**: `/workshop-calendar`
- **Features**: Visual calendar with drag-and-drop job scheduling, technician availability, resource allocation
- **Database Tables**: `workshopCalendarEvents`, `workshopResources`, `workshopAvailability`
- **Libraries**: react-big-calendar, @dnd-kit/core, @dnd-kit/sortable
- **API Endpoints**: `/api/workshop/events`, `/api/workshop/resources`, `/api/workshop/availability`

### 5. Augmented Reality Overlay for Mechanics
- **Location**: `/ar-overlay`
- **Features**: AR-assisted repair guides, parts identification, step-by-step visual instructions
- **Database Tables**: `arOverlays`, `arMarkers`, `arInstructions`, `arSessions`
- **API Endpoints**: `/api/ar/overlays`, `/api/ar/sessions`, `/api/ar/instructions`

## Core Modules (60+)
SaaS & Multi-Tenant Management, User & Role Management, Customer Profiles, Vehicle Management, Job Cards, Inventory, Invoicing, Analytics, Franchise Command Center, Diagnostics & OBD Hub, OEM Software Subscriptions, Globalization Layer, Parts Supply Network, Contract Management with SLA Tracking.

## Enterprise Features
- **AI & Automation**: AI Chatbot, Predictive Maintenance, Smart Parts Recommendations, Predictive Diagnostics
- **Advanced Analytics**: Business Intelligence, Profit Margin Analysis, Customer Lifetime Value
- **Enhanced Integrations**: Accounting, Email Marketing, Stripe/PayPal Payments
- **Customer Experience**: Loyalty Program, Client Portal, Service Reminders
- **Operational Efficiency**: Automated Reordering, Smart Job Assignment, Workshop Calendar
- **Compliance & Quality**: ZATCA, VAT, Zakat, Quality Control
- **Advanced Hardware**: Barcode/QR Scanner, Digital Signage, Kiosk Check-In, LPR, AR Overlay

## Mobile Apps
Dedicated backend API and documentation for three cross-platform React Native apps: Technician, Customer, and Manager Dashboard, with PWA-ready mobile interfaces.

## Saudi Arabia Compliance Stack
VAT registration, ZATCA certification, Zakat settings, Arabic company details, TRN validation, Hijri calendar conversion, localized PDF/Excel export services, Twilio SMS integration.

## Arabic Language Support (100% Coverage)
Complete Arabic translation support across all 178 pages using react-i18next.

**Infrastructure**:
- `client/src/i18n/locales/ar.json` - Arabic translations with 2000+ translation keys
- `client/src/components/ArabicLanguageToggle.tsx` - Language switcher component
- RTL (Right-to-Left) layout support when Arabic is active

**Translated Module Categories**:

### Accounting & Finance (25+ pages)
- Chart of Accounts, General Ledger, Journal Entries, Trial Balance
- Balance Sheet, Income Statement, Cash Flow Statement
- Accounts Payable, Accounts Receivable, Bank Account Management
- Budget Management, Capital Management, Assets Management
- Liabilities Management, Equity Management, Retained Earnings
- Cost Centers, Loss Account, Partners Current Account
- Financial Settings, Payment Gateway Simulator, Payments

### HR & Team Management (15+ pages)
- Staff Directory, Staff Performance Review, Technician Portal
- Technician Leaderboards, Technician Performance, Productivity Tracker
- Timesheet Management, Time Clock Payroll, Training LMS
- Shift Scheduling, Staff Scheduling, Leave Requests
- Wearable Integration (for technicians)

### Customer & CRM (10+ pages)
- Customer Profiles, Customer Feedback, Customer Portal
- Loyalty Program, Referral Program, Appointment Reminders
- Service Reminders, Video Consultations, Video Estimates

### Vehicle Management (10+ pages)
- Vehicles, Vehicles Enhanced, VIN Decoder
- Vehicle Health Monitoring, Telematics Integration
- Tire Management, Fleet Management, Vehicle Check-In

### Inventory & Parts (10+ pages)
- Inventory, Parts Availability, Parts Auto Reorder
- Smart Parts Recommender, Smart Inventory Forecasting
- Vendor Supplier Portal, Barcode Scanner

### Service & Operations (15+ pages)
- Job Cards, Estimates, Invoices, Service Templates
- Workshop Calendar, Service Bay Dashboard, Task Management
- Quality Control, Smart Assignment, Smart Damage Assessment

### Analytics & Reporting (10+ pages)
- Dashboard, Business Intelligence Dashboard, Performance Analytics
- Business Heat Maps, Custom Report Builder
- Profit Margin Analysis, Revenue Reports

### AI & Emerging Technologies (20+ pages)
- AI Automation, AI Chatbot Assistant, AI Scheduling, AI Service Advisor
- Predictive Diagnostics, Predictive Demand Forecasting
- ML Fraud Detection, Neural Network Prediction
- AR Repair Guide, VR Showroom, Digital Twin Viewer
- Blockchain Service History, Smart Contracts
- IoT Dashboard, Edge Computing Diagnostics
- Computer Vision QC, Voice Commands, Voice Command Interface

### Compliance & Safety (8+ pages)
- Compliance Management, ZATCA Settings, VAT Settings, Zakat Settings
- ISO Quality Management, Environmental Compliance
- Safety Incidents, Equipment Calibration

### Diagnostics & Hardware (10+ pages)
- Diagnostics OBD Hub, OBD Diagnostic Viewer, OEM Software Subscriptions
- Digital Signage, Security Cameras, Kiosk Check-In
- Drone Inspection, Mobile Device Management

### Marketing & Communication (8+ pages)
- Marketing Automation, Marketing Hub
- Social Media Integration, Social Media Monitoring
- Google My Business, Email Marketing, Call Center

### Enterprise & Franchise (5+ pages)
- Franchise Command Center, Multi-Location Dashboard
- Globalization Layer, Emerging Technologies, Next Gen Technologies

### System & Settings (10+ pages)
- User Settings, System Settings, Integrations
- Data Import Export, Document OCR, Knowledge Base
- Sustainable Energy Monitoring

**Translation Pattern**:
All pages use `useTranslation` hook from react-i18next with fallback English text:
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
// Usage: t('namespace.key', 'English fallback')
```

## Test Credentials
| Email | Password | Role |
|-------|----------|------|
| owner@salisauto.com | demo123 | Business Owner |
| admin@salisauto.com | demo123 | System Administrator |
| tech@salisauto.com | demo123 | Technician |
| client@salisauto.com | demo123 | Customer |
| agent@salisauto.com | demo123 | Purchase Agent |
| ahmed.tech@salisauto.com | Password123! | Technician |
| khalid.tech@salisauto.com | Password123! | Technician |

## External Dependencies
- PostgreSQL with Drizzle ORM
- Express.js + TypeScript
- React 18 + Vite
- wouter (routing)
- @tanstack/react-query (state management)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)
- Zod (validation)
- recharts (charts)
- Twilio (SMS)
- Stripe + PayPal (payments)
- OpenAI API (AI features)
- Google Calendar + Gmail
- react-big-calendar + @dnd-kit (scheduling)
- speakeasy + qrcode (2FA)
- jspdf (PDF generation)

## Key Files
- `client/src/App.tsx` - Main application with AuthProvider wrapper
- `client/src/components/Layout.tsx` - Resizable sidebar with navigation groups
- `client/src/hooks/useAuth.tsx` - AuthProvider context and authentication hooks
- `server/routes/index.ts` - Hybrid routing system
- `server/routes/auth.ts` - Authentication endpoints
- `server/storage.ts` - Database storage interface
- `shared/schema.ts` - Drizzle ORM schema with 320+ tables
