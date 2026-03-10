# SALIS AUTO - Complete Project Structure

## Root Directory
```
├── attached_assets/       # Uploaded images, logos, generated assets
├── client/                # Frontend React application
├── docs/                  # Documentation files
├── migrations/            # Database migration files
├── public/                # Static public assets
├── screenshots/           # App screenshots
├── scripts/               # Utility scripts
├── server/                # Backend Express server
├── shared/                # Shared types and utilities
├── components.json        # Shadcn UI configuration
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # NPM dependencies
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite bundler configuration
└── replit.md              # Project documentation
```

## Client (Frontend)
```
client/src/
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components (Button, Card, Dialog, etc.)
│   ├── customer/         # Customer-specific components
│   ├── layouts/          # Layout components
│   └── *.tsx             # Feature components (40+ files)
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
│   └── useAuth.ts        # Authentication hook
├── i18n/                 # Internationalization
│   └── locales/          # Language files (en, ar)
├── lib/                  # Utility libraries
├── pages/                # Page components (150+ pages)
│   ├── client/           # Client portal pages
│   ├── customer/         # Customer portal pages
│   ├── mobile/           # Mobile app pages
│   ├── purchase-agent/   # Purchase agent portal (7 pages)
│   ├── technician/       # Technician portal (6 pages)
│   └── *.tsx             # Main app pages (150+ files)
├── App.tsx               # Main app with routing
├── index.css             # Global styles
└── main.tsx              # App entry point
```

## Server (Backend)
```
server/
├── integrations/         # Third-party integrations
├── seeds/                # Database seed files
├── services/             # Business logic services
├── ai-service.ts         # AI/OpenAI integration
├── analytics-service.ts  # Analytics processing
├── auth.ts               # Authentication middleware
├── auditMiddleware.ts    # Audit logging
├── db.ts                 # Database connection
├── index.ts              # Server entry point
├── paypal.ts             # PayPal integration
├── rbac-config.ts        # Role-based access control
├── rbac-middleware.ts    # RBAC middleware
├── routes.ts             # API routes (18,000+ lines)
├── smsService.ts         # Twilio SMS integration
├── storage.ts            # Database storage layer
├── twoFactorAuth.ts      # 2FA implementation
├── vite.ts               # Vite dev server
└── websocket.ts          # WebSocket server
```

## Shared
```
shared/
├── schema.ts             # Database schema (290+ tables)
├── hijriUtils.ts         # Hijri calendar utilities
├── vatUtils.ts           # VAT calculation utilities
└── zatcaUtils.ts         # ZATCA e-invoicing utilities
```

## Key Pages (150+ Total)
### Dashboard & Overview
- Dashboard.tsx, KPIDashboard.tsx, BusinessIntelligence.tsx

### Customer Management
- Customers.tsx, CustomerPortal.tsx, CustomerLoyalty.tsx

### Vehicle Management
- Vehicles.tsx, VehiclesEnhanced.tsx, FleetManagement.tsx, FleetTracking.tsx

### Service Operations
- JobCards.tsx, Appointments.tsx, ServiceTemplates.tsx, VehicleInspections.tsx

### Parts & Inventory
- SpareParts.tsx, InventoryManagement.tsx, PartsAvailability.tsx, Suppliers.tsx

### Financial
- Invoices.tsx, Estimates.tsx, PurchaseOrders.tsx, PayrollManagement.tsx
- GeneralLedger.tsx, JournalEntries.tsx, TrialBalance.tsx, BalanceSheet.tsx
- IncomeStatement.tsx, CashFlowStatement.tsx, AccountsReceivable.tsx, AccountsPayable.tsx

### Staff & HR
- TechnicianManagement.tsx, HRManagement.tsx, StaffPerformanceReview.tsx

### AI & Automation
- AIChatbot.tsx, AIChatbotAssistant.tsx, PredictiveDiagnostics.tsx, SmartAssignment.tsx

### Portals
- TechnicianPortal (6 pages), PurchaseAgent Portal (7 pages), CustomerPortal, ClientPortal

## Technology Stack
- **Frontend**: React 18, Vite, TypeScript, TanStack Query, Wouter, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript, Passport.js
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Session-based with bcrypt, 2FA with Speakeasy
- **Payments**: Stripe, PayPal
- **SMS**: Twilio
- **AI**: OpenAI GPT
- **Calendar**: Google Calendar, Gmail integration
- **Real-time**: WebSocket

## Authentication Bypass (Current State)
Authentication is currently bypassed for development. To re-enable:
1. `client/src/hooks/useAuth.ts` - Remove bypass code
2. `client/src/App.tsx` - Uncomment auth checks
3. `server/auth.ts` - Restore isAuthenticated middleware
