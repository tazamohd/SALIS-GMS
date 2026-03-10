# SALIS AUTO — System Architecture

**Document Type:** Technical Architecture  
**Version:** 14.0.0  
**Date:** March 2026  

---

## Architecture Overview

SALIS AUTO follows a **monolithic full-stack architecture** with clear client-server separation, served on a single port via Vite's proxy in development and Express static serving in production.

```
┌─────────────────────────────────────────────────────────────────┐
│                        SALIS AUTO Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐          ┌──────────────────────────────┐ │
│  │   React Frontend  │  HTTP   │      Express Backend          │ │
│  │   (Vite + React) │◄───────►│   (Node.js + TypeScript)     │ │
│  │   Port 5000      │         │   Port 5000                   │ │
│  └──────────────────┘          └──────────────┬───────────────┘ │
│                                               │                   │
│  ┌──────────────────┐                        │                   │
│  │   WebSocket      │◄──────────────────────┤                   │
│  │   /ws/chat       │                        │                   │
│  └──────────────────┘                        │                   │
│                                               │                   │
│                                  ┌────────────▼──────────────┐  │
│                                  │      PostgreSQL            │  │
│                                  │   (Drizzle ORM)           │  │
│                                  │   320+ Tables              │  │
│                                  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
```
React 18
├── Vite 5 (build + dev server)
├── TypeScript (strict mode)
├── Wouter (client-side routing)
├── TanStack Query v5 (server state)
├── react-hook-form + Zod (forms)
├── shadcn/ui + Radix UI (components)
├── Tailwind CSS (styling)
├── Recharts (data visualization)
├── react-big-calendar (scheduling)
├── @dnd-kit (drag-and-drop)
└── react-i18next (Arabic/English)
```

### Directory Structure
```
client/src/
├── App.tsx                    # Root with AuthProvider + Router
├── main.tsx                   # React entry point
├── index.css                  # Global styles + CSS variables
├── components/
│   ├── Layout.tsx             # Main sidebar navigation
│   ├── ui/                    # shadcn/ui components
│   ├── layouts/               # 7 archetype page wrappers
│   │   ├── StandardPageLayout.tsx
│   │   ├── StandardTablePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── FormPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── MobileCardPage.tsx
│   │   └── TabsPageLayout.tsx
│   └── [feature components]
├── hooks/
│   ├── useAuth.tsx            # AuthProvider context
│   └── use-toast.ts           # Toast notifications
├── lib/
│   ├── queryClient.ts         # TanStack Query setup
│   └── utils.ts               # Utility functions
├── pages/                     # 235+ page components
└── i18n/
    ├── index.ts               # i18n configuration
    └── locales/
        ├── en.json            # English translations
        └── ar.json            # Arabic translations (2000+ keys)
```

### Authentication Flow
```
App.tsx
└── AuthProvider (useAuth.tsx)
    └── React Query: GET /api/user
        ├── Authenticated → Router → Protected Pages
        └── Unauthenticated → /login
```

### Routing Architecture
```
App.tsx Router
├── Public Routes
│   ├── /login
│   ├── /register
│   └── /track/:token  (public vehicle tracking)
├── Main Layout Routes (sidebar navigation)
│   ├── / (Dashboard)
│   ├── /customers
│   ├── /vehicles
│   ├── /job-cards
│   └── ... (200+ routes)
├── Technician Portal Layout
│   ├── /technician-portal
│   └── /technician-portal/*
├── Purchase Agent Layout
│   ├── /purchase-agent
│   └── /purchase-agent/*
├── Client Portal Layout
│   ├── /client
│   └── /client/*
├── Customer Mobile Layout
│   ├── /customer-app
│   └── /customer-app/*
└── Technician Mobile Layout
    ├── /technician-app
    └── /technician-app/*
```

### State Management Pattern
```typescript
// Data Fetching (TanStack Query)
const { data, isLoading } = useQuery({
  queryKey: ['/api/customers'],
});

// Data Mutation
const mutation = useMutation({
  mutationFn: (data) => apiRequest('POST', '/api/customers', data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/customers'] }),
});
```

---

## Backend Architecture

### Technology Stack
```
Express.js (TypeScript)
├── Passport.js (authentication)
├── express-session (session management)
├── Drizzle ORM (database)
├── Zod (validation)
├── ws (WebSocket server)
├── multer (file uploads)
├── jsPDF (PDF generation)
├── speakeasy + qrcode (2FA)
└── OpenAI SDK (AI features)
```

### Directory Structure
```
server/
├── index.ts               # Server entry point
├── routes.ts              # Main routes file (1,000+ endpoints)
├── routes/
│   ├── index.ts           # Hybrid routing loader
│   └── auth.ts            # Auth endpoints (priority)
├── storage.ts             # IStorage interface + DatabaseStorage
├── vite.ts                # Vite dev middleware (DO NOT EDIT)
└── db.ts                  # Database connection
```

### Hybrid Routing Architecture
```
Request → Express
├── Modular Routes (server/routes/*.ts) — loaded FIRST
│   └── Auth routes (/api/login, /api/logout, /api/register)
└── Legacy Routes (server/routes.ts) — loaded as FALLBACK
    └── All other 1,000+ API endpoints
```

### Middleware Stack
```
Request
  ↓
morgan (logging)
  ↓
express.json()
  ↓
express.urlencoded()
  ↓
express-session
  ↓
passport.initialize()
  ↓
passport.session()
  ↓
Route Handlers
  ↓
Response
```

### Storage Interface Pattern
```typescript
interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>
  getUserByEmail(email: string): Promise<User | undefined>
  createUser(user: InsertUser): Promise<User>
  
  // Customers
  getCustomers(garageId?: string): Promise<Customer[]>
  createCustomer(customer: InsertCustomer): Promise<Customer>
  
  // ... 100+ methods
}
```

---

## Database Architecture

### Connection Setup
```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

### Schema Organization (shared/schema.ts — 10,681 lines)
```
shared/schema.ts
├── Core System (garages, branches, users, sessions)
├── RBAC (roles, permissions, role_permissions, user_role_branch)
├── Operations (job_cards, appointments, service_templates)
├── Customer & Vehicle (customers, vehicles, service_history)
├── Inventory (spare_parts, inventories, tools, suppliers)
├── Financial (invoices, payments, estimates, accounts)
├── HR (employee_profiles, leave_requests, payroll)
├── Marketing (campaigns, loyalty, referrals, reviews)
├── Compliance (zatca, vat, safety, environmental)
├── AI/ML (estimations, predictions, chat, fraud)
├── IoT & Emerging (sensors, blockchain, ar_guides, digital_twin)
└── B2B Network (members, requests, quotations, orders)
```

### Key Relationships
```
Garage
├── Branches (1:many)
│   ├── Users via user_role_branch
│   ├── Job Cards
│   │   ├── Task Assignments → Technicians
│   │   ├── Invoice
│   │   └── Parts Used
│   ├── Vehicles
│   │   └── Customers
│   └── Spare Part Inventories
└── HR, Finance, Marketing (garage-level)
```

---

## Real-Time Architecture

### WebSocket Server
```
WebSocket Server (/ws/chat)
├── Client Connection
│   └── Session validation
├── Message Types
│   ├── chat_message → Broadcast to chat room
│   ├── bay_update → Service bay status change
│   ├── notification → User notification push
│   └── call_center → Live call updates
└── Session Management
    └── Map<sessionId, WebSocket>
```

---

## Security Architecture

### Authentication
- **Strategy:** Passport.js Local Strategy
- **Sessions:** express-session with PostgreSQL store
- **Password:** bcrypt hashing (10 rounds)
- **2FA:** TOTP via speakeasy (optional)

### Authorization
- **System:** RBAC (Role-Based Access Control)
- **Roles:** 20 predefined roles
- **Bypass:** `AUTH_BYPASS=true` for development ONLY

### Data Security
- All API endpoints validate session before responding
- Tenant isolation via `garageId` parameter
- SQL injection prevention via Drizzle ORM parameterized queries
- XSS protection via React's JSX escaping

---

## Integration Architecture

```
SALIS AUTO
├── OpenAI API (AI features)
│   └── Mapped from AI_INTEGRATIONS_OPENAI_API_KEY → OPENAI_API_KEY
├── Twilio (SMS)
│   └── TWILIO_ACCOUNT_SID + AUTH_TOKEN + PHONE_NUMBER
├── Stripe (Payments)
│   └── STRIPE_SECRET_KEY + VITE_STRIPE_PUBLIC_KEY
├── PayPal (Payments)
│   └── PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET
├── Google Calendar (Scheduling)
│   └── OAuth2 via Replit Integration
├── Google Gmail (Email)
│   └── OAuth2 via Replit Integration
└── ZATCA (E-Invoicing)
    └── Saudi Arabia tax authority API
```

---

## Performance Considerations

| Aspect | Approach |
|--------|----------|
| Data fetching | TanStack Query with caching |
| Pagination | Offset-based for tables |
| Images | Lazy loading |
| Code splitting | Vite automatic chunking |
| DB queries | Drizzle ORM optimized |
| Real-time | WebSocket (no polling) |

---

*SALIS AUTO System Architecture — Version 14.0.0*
