# SALIS AUTO ERP - Technical Guidelines Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Module Reference](#module-reference)
5. [Database Architecture](#database-architecture)
6. [Authentication & Authorization](#authentication--authorization)
7. [RBAC System](#rbac-system)
8. [API Reference](#api-reference)
9. [Frontend Development](#frontend-development)
10. [Component Library](#component-library)
11. [Styling & Theming](#styling--theming)
12. [Internationalization (i18n)](#internationalization-i18n)
13. [Real-Time Features](#real-time-features)
14. [Saudi Arabia Compliance](#saudi-arabia-compliance)
15. [AI & Automation](#ai--automation)
16. [Mobile Applications](#mobile-applications)
17. [Data Seeding](#data-seeding)
18. [Testing Guidelines](#testing-guidelines)
19. [Error Handling](#error-handling)
20. [Performance Best Practices](#performance-best-practices)
21. [Security Guidelines](#security-guidelines)
22. [Deployment](#deployment)
23. [Troubleshooting](#troubleshooting)
24. [Related Documentation](#related-documentation)

---

## Project Overview

SALIS AUTO is a world-class automotive ERP platform designed for efficient garage operations at scale. The platform features:

- **141+ Comprehensive Modules** across 13 phases
- **290+ Database Tables** for complete data management
- **24 Professional Roles** with granular RBAC permissions
- **70 Staff Users** across all departments
- **174 UI Pages** with consistent design system
- **7 Language Support** including RTL for Arabic

### Key Features
- Franchise management & multi-tenant architecture
- OBD diagnostics integration
- OEM software licensing
- Global multi-currency/multi-language support
- B2B spare parts supply network
- AI-powered predictive diagnostics
- Blockchain service history
- Smart contracts & digital signatures

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.6.3 | Type Safety |
| Vite | 5.4.15 | Build Tool & Dev Server |
| Wouter | 3.3.5 | Client-side Routing |
| TanStack Query | 5.60.5 | Server State Management |
| Tailwind CSS | 3.4.17 | Utility-first Styling |
| shadcn/ui (Radix UI) | Various | Component Library |
| Framer Motion | 11.13.1 | Animations |
| i18next | 25.6.0 | Internationalization |
| @dnd-kit | 6.3.1 | Drag and Drop |
| Recharts | 2.15.2 | Data Visualization |
| react-big-calendar | 1.19.4 | Calendar Views |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.21.2 | HTTP Server |
| TypeScript | Latest | Type Safety |
| Drizzle ORM | 0.39.1 | Database ORM |
| Zod | 3.24.2 | Schema Validation |
| Passport.js | 0.7.0 | Authentication |
| WebSocket (ws) | 8.18.0 | Real-time Communication |
| express-session | 1.18.1 | Session Management |
| connect-pg-simple | 10.0.0 | PostgreSQL Session Store |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL | Primary Database |
| Neon (@neondatabase/serverless) | Serverless PostgreSQL Provider |
| Drizzle Kit | Schema Push & Migrations |

### External Services
| Service | Package | Purpose |
|---------|---------|---------|
| OpenAI | openai 6.3.0 | AI Chatbot & Diagnostics |
| Twilio | twilio 5.10.3 | SMS Notifications |
| Stripe | stripe 19.1.0 | Payment Processing |
| PayPal | @paypal/paypal-server-sdk 1.1.0 | Alternative Payments |
| Google APIs | googleapis 163.0.0 | Calendar & Gmail |

---

## Project Structure

```
salis-auto/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui components (40+ components)
│   │   │   ├── layouts/      # Layout wrappers & archetypes
│   │   │   └── customer/     # Customer-specific components
│   │   ├── pages/            # Page components (174+ pages)
│   │   ├── hooks/            # Custom React hooks (use-toast, etc.)
│   │   ├── lib/              # Utility functions (queryClient, utils)
│   │   ├── i18n/             # Internationalization
│   │   │   ├── config.ts     # i18n configuration
│   │   │   └── locales/      # Translation files (7 languages)
│   │   ├── App.tsx           # Main application with routes
│   │   └── main.tsx          # Application entry point
│   └── index.html            # HTML template
├── server/                    # Backend application
│   ├── routes.ts             # API route definitions (18,900+ lines)
│   ├── storage.ts            # DatabaseStorage with Drizzle ORM
│   ├── vite.ts               # Vite dev server integration
│   └── index.ts              # Server entry point & WebSocket
├── shared/                    # Shared code between client/server
│   └── schema.ts             # Database schema (290+ tables) & Zod types
├── docs/                      # Additional documentation
├── scripts/                   # Utility scripts & seeders
├── migrations/                # Database migration files
├── attached_assets/          # Static assets (logos, stock images)
├── public/                    # Public static files
├── screenshots/               # Application screenshots
│
├── drizzle.config.ts         # Drizzle ORM configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── vite.config.ts            # Vite build configuration
├── tsconfig.json             # TypeScript configuration
│
└── [Documentation Files]      # 25+ markdown documentation files
    ├── README.md
    ├── replit.md             # Project memory & preferences
    ├── QUICK-START-GUIDE.md
    ├── USER-MANUAL.md
    ├── RBAC-DOCUMENTATION.md
    ├── DATA-SEEDING-GUIDE.md
    └── ...
```

---

## Module Reference

### 141+ Modules Organized by Phase

#### Phase 1: Core Foundation
| Module | Description | Route |
|--------|-------------|-------|
| Dashboard | Main analytics dashboard | `/dashboard` |
| Customer Management | Customer profiles & history | `/customers` |
| Vehicle Management | Vehicle records & service history | `/vehicles` |
| Job Cards | Service job tracking | `/job-cards` |
| Inventory | Parts & stock management | `/inventory` |
| Invoicing | Billing & payment processing | `/invoicing` |
| User Management | Staff accounts & access | `/users` |
| Garage Settings | Garage configuration | `/settings` |

#### Phase 2: Operations Enhancement
| Module | Description | Route |
|--------|-------------|-------|
| Service Templates | Predefined service packages | `/service-templates` |
| Estimates | Cost estimation system | `/estimates` |
| Appointments | Booking & scheduling | `/appointments` |
| Work Orders | Detailed work management | `/work-orders` |
| Purchase Orders | Supplier ordering | `/purchase-orders` |
| Suppliers | Vendor management | `/suppliers` |
| Reports & Analytics | Business intelligence | `/reports` |
| Notifications | Alert management | `/notifications` |

#### Phase 3: Advanced Features
| Module | Description | Route |
|--------|-------------|-------|
| Multi-Branch | Branch network management | `/branches` |
| Warranty Tracking | Warranty claims & coverage | `/warranty` |
| Loyalty Program | Customer rewards | `/loyalty` |
| Technician Performance | Staff KPIs | `/technician-kpis` |
| Equipment Management | Tools & machinery | `/equipment` |
| Time Tracking | Labor hour logging | `/time-tracking` |
| Document Management | File storage & retrieval | `/documents` |
| Audit Trail | Action history logging | `/audit-trail` |

#### Phase 4: Integration & Automation
| Module | Description | Route |
|--------|-------------|-------|
| Email Marketing | Campaign management | `/email-marketing` |
| SMS Integration | Text notifications | `/sms-notifications` |
| Accounting Integration | Financial sync | `/accounting` |
| Payment Gateway | Online payments | `/payments` |
| Calendar Sync | Google Calendar | `/calendar-sync` |
| Vehicle History | Service timeline | `/vehicle-history` |
| Customer Feedback | Reviews & ratings | `/customer-feedback` |
| Import/Export | Data migration tools | `/import-export` |

#### Phase 5: Enterprise Features
| Module | Description | Route |
|--------|-------------|-------|
| Franchise Management | Multi-tenant network | `/franchise` |
| OBD Diagnostics | Vehicle diagnostics | `/diagnostics` |
| OEM Software | License management | `/oem-software` |
| Globalization | Multi-currency/language | `/globalization` |
| Parts Network | B2B supply chain | `/parts-network` |
| Contract Management | SLA tracking | `/contracts` |
| Fleet Management | Corporate fleets | `/fleet` |
| Insurance Claims | Claim processing | `/insurance` |

#### Phase 6: Advanced Analytics
| Module | Description | Route |
|--------|-------------|-------|
| Business Intelligence | Advanced BI dashboard | `/business-intelligence` |
| Profit Analysis | Margin tracking | `/profit-analysis` |
| Customer Lifetime Value | CLV calculations | `/customer-ltv` |
| Predictive Maintenance | AI predictions | `/predictive-maintenance` |
| Demand Forecasting | Inventory planning | `/demand-forecast` |
| Competitor Analysis | Market intelligence | `/competitor-analysis` |
| ROI Calculator | Investment analysis | `/roi-calculator` |
| Custom Reports | Report builder | `/custom-reports` |

#### Phase 7: Customer Experience
| Module | Description | Route |
|--------|-------------|-------|
| Client Portal | Customer self-service | `/client-portal` |
| Live Tracking | Real-time job status | `/live-tracking` |
| Digital Signatures | E-signature capture | `/e-signatures` |
| Service Reminders | Automated notifications | `/service-reminders` |
| Review System | Customer reviews | `/reviews` |
| Chat Support | In-app messaging | `/chat-support` |
| Knowledge Base | FAQ & help articles | `/knowledge-base` |
| Training LMS | Learning management | `/training` |

#### Phase 8: Compliance & Quality
| Module | Description | Route |
|--------|-------------|-------|
| ZATCA E-Invoicing | Saudi tax compliance | `/zatca` |
| VAT Management | Tax calculations | `/vat-management` |
| Quality Control | QC workflows | `/quality-control` |
| Safety Compliance | Safety standards | `/safety-compliance` |
| Environmental | Eco-regulations | `/environmental` |
| Certification | Staff certifications | `/certifications` |
| Incident Reports | Safety reporting | `/incidents` |
| Compliance Dashboard | Regulatory overview | `/compliance-dashboard` |

#### Phase 9: Hardware Integration
| Module | Description | Route |
|--------|-------------|-------|
| Barcode Scanner | Inventory scanning | `/barcode-scanner` |
| QR Code System | QR generation/reading | `/qr-codes` |
| Digital Signage | Display management | `/digital-signage` |
| Kiosk Check-In | Self-service kiosks | `/kiosk` |
| License Plate Reader | LPR integration | `/lpr` |
| IoT Sensors | Equipment monitoring | `/iot-sensors` |
| Printer Integration | Receipt/label printing | `/printing` |
| POS Integration | Point of sale | `/pos` |

#### Phase 10: AI & Automation
| Module | Description | Route |
|--------|-------------|-------|
| AI Chatbot | Customer assistant | `/ai-chatbot` |
| Smart Diagnostics | AI-powered analysis | `/smart-diagnostics` |
| Parts Recommendations | AI suggestions | `/smart-parts` |
| Smart Job Assignment | AI scheduling | `/smart-assignment` |
| Sentiment Analysis | Feedback analysis | `/sentiment-analysis` |
| Voice Commands | Voice control | `/voice-commands` |
| Automated Workflows | Process automation | `/automation` |
| Machine Learning | ML models | `/ml-models` |

#### Phase 11: Blockchain & Security
| Module | Description | Route |
|--------|-------------|-------|
| Blockchain History | Immutable records | `/blockchain` |
| Smart Contracts | Automated agreements | `/smart-contracts` |
| Two-Factor Auth | 2FA security | `/two-factor` |
| Data Encryption | Security settings | `/encryption` |
| Access Logs | Security audit | `/access-logs` |
| Backup & Restore | Data protection | `/data-backup` |
| Privacy Controls | GDPR compliance | `/privacy` |
| Security Dashboard | Security overview | `/security-dashboard` |

#### Phase 12: Emerging Technologies
| Module | Description | Route |
|--------|-------------|-------|
| AR/VR Training | Immersive training | `/ar-vr` |
| Quantum Computing | Advanced processing | `/quantum` |
| Edge Computing | Distributed processing | `/edge-computing` |
| 5G Integration | High-speed connectivity | `/5g-integration` |
| Digital Twin | Virtual modeling | `/digital-twin` |
| Sustainable Energy | Green initiatives | `/sustainable-energy` |
| Biometrics | Biometric auth | `/biometrics` |
| Wearables | Wearable devices | `/wearables` |

#### Phase 13: Operations
| Module | Description | Route |
|--------|-------------|-------|
| Payroll Management | Staff payroll | `/payroll` |
| Expense Tracking | Expense management | `/expenses` |
| Towing Services | Roadside assistance | `/towing` |
| Vehicle Storage | Storage management | `/vehicle-storage` |
| Telematics | Vehicle telemetry | `/telematics` |
| Google My Business | GMB integration | `/google-business` |
| Call Center | Call management | `/call-center` |
| Dashboard Widgets | Customizable widgets | `/dashboard-widgets` |

---

## Database Architecture

### Storage Implementation
The project uses `DatabaseStorage` class in `server/storage.ts` that implements the `IStorage` interface with Drizzle ORM for PostgreSQL operations.

```typescript
// server/storage.ts - DatabaseStorage class
export class DatabaseStorage implements IStorage {
  // All CRUD operations use Drizzle ORM
  async getUser(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  // ... 200+ methods for all 290+ tables
}
```

### Schema Definition
All database schemas are defined in `shared/schema.ts` using Drizzle ORM (290+ tables).

```typescript
// Example schema definition
import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id),
  make: text('make').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  vin: text('vin').unique(),
  licensePlate: text('license_plate'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert schema (omit auto-generated fields)
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
```

### Key Schema Patterns
```typescript
// Array columns - use .array() method
tags: text('tags').array(),

// JSON columns
settings: jsonb('settings').$type<UserSettings>(),

// Relations
customerId: integer('customer_id').references(() => customers.id),

// Enums
status: text('status').$type<'pending' | 'active' | 'completed'>(),
```

### Storage Interface Pattern
```typescript
// IStorage interface defines all database operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(data: InsertUser): Promise<User>;
  
  // Vehicles
  getVehicles(garageId: string): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | null>;
  createVehicle(data: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, data: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;
  
  // ... methods for all 290+ tables
}
```

### Migration Commands
```bash
# Push schema changes to database (preferred method)
npm run db:push

# Force push with data loss (use cautiously)
npm run db:push --force
```

### Database Connection
```typescript
// Database initialized with Neon serverless PostgreSQL
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

---

## Authentication & Authorization

### Authentication Flow
1. User submits credentials via `/api/login`
2. Server validates with Passport.js local strategy
3. Session created with express-session
4. Session stored in PostgreSQL via connect-pg-simple

### Role-Based Access Control (RBAC)

#### 24 Professional Roles
| Category | Roles |
|----------|-------|
| Management | Super Admin, Garage Owner, Franchise Manager |
| Operations | Service Manager, Parts Manager, Inventory Manager |
| Service | Service Advisor, Senior Technician, Technician |
| Finance | Accountant, Billing Specialist, Cashier |
| Customer | Call Center Agent, Customer Service Rep |
| Marketing | Marketing Manager, Content Specialist |
| HR | HR Manager, Training Coordinator |
| Quality | QC Inspector, Compliance Officer |

#### Permission Structure
```typescript
// Permission check pattern
const hasPermission = (user: User, resource: string, action: string): boolean => {
  const role = roles.find(r => r.id === user.roleId);
  return role?.permissions.includes(`${resource}:${action}`) ?? false;
};
```

### Protected Routes
```typescript
// Backend route protection
app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  // Only authenticated admins can access
});

// Frontend route protection
<Route path="/admin">
  {user?.role === 'admin' ? <AdminDashboard /> : <Redirect to="/login" />}
</Route>
```

---

## RBAC System

### Complete Role Hierarchy

#### Tier 1: Super Administrators
| Role | Access Level | Permissions |
|------|--------------|-------------|
| Super Admin | Full system access | All resources, all actions |
| System Administrator | Technical administration | System settings, user management, security |

#### Tier 2: Business Owners
| Role | Access Level | Permissions |
|------|--------------|-------------|
| Garage Owner | Full garage access | All garage operations, staff management, reporting |
| Franchise Owner | Multi-garage access | Franchise oversight, inter-branch transfers |

#### Tier 3: Managers
| Role | Access Level | Permissions |
|------|--------------|-------------|
| General Manager | Operations oversight | Staff, scheduling, inventory, reporting |
| Service Manager | Service operations | Job cards, technicians, quality control |
| Parts Manager | Inventory management | Stock, orders, suppliers, pricing |
| Sales Manager | Sales operations | Estimates, invoices, customer relations |
| Finance Manager | Financial operations | Payments, accounting, payroll, reports |
| HR Manager | Human resources | Staff records, training, attendance, payroll |
| Marketing Manager | Marketing operations | Campaigns, loyalty, feedback, analytics |

#### Tier 4: Specialists
| Role | Access Level | Permissions |
|------|--------------|-------------|
| Service Advisor | Customer interaction | Appointments, estimates, job cards, follow-ups |
| Senior Technician | Technical work | Job execution, diagnostics, mentoring |
| Accountant | Financial processing | Invoices, payments, VAT, reconciliation |
| QC Inspector | Quality assurance | Inspections, checklists, certifications |
| Compliance Officer | Regulatory compliance | ZATCA, safety, environmental |

#### Tier 5: Staff
| Role | Access Level | Permissions |
|------|--------------|-------------|
| Technician | Service execution | Assigned jobs, time logging, parts requests |
| Parts Specialist | Inventory operations | Stock checks, receiving, transfers |
| Call Center Agent | Customer support | Calls, appointments, basic inquiries |
| Cashier | Payment processing | Payments, receipts, basic invoicing |
| Receptionist | Front desk | Check-in, scheduling, basic customer info |

### Permission Matrix

```typescript
// Permission format: resource:action
const permissions = {
  // Customer permissions
  'customers:read': ['all'],
  'customers:create': ['service_advisor', 'manager', 'admin'],
  'customers:update': ['service_advisor', 'manager', 'admin'],
  'customers:delete': ['admin'],
  
  // Vehicle permissions
  'vehicles:read': ['all'],
  'vehicles:create': ['service_advisor', 'technician', 'manager'],
  'vehicles:update': ['service_advisor', 'technician', 'manager'],
  'vehicles:delete': ['manager', 'admin'],
  
  // Job card permissions
  'jobcards:read': ['technician', 'service_advisor', 'manager'],
  'jobcards:create': ['service_advisor', 'manager'],
  'jobcards:update': ['technician', 'service_advisor', 'manager'],
  'jobcards:complete': ['qc_inspector', 'manager'],
  
  // Financial permissions
  'invoices:read': ['accountant', 'manager', 'admin'],
  'invoices:create': ['service_advisor', 'accountant', 'manager'],
  'payments:process': ['cashier', 'accountant', 'manager'],
  'refunds:process': ['accountant', 'finance_manager', 'admin'],
  
  // Admin permissions
  'users:manage': ['hr_manager', 'admin'],
  'settings:manage': ['admin'],
  'reports:access': ['manager', 'admin'],
};
```

### 70 Seeded Staff Users

| Department | Count | Roles |
|------------|-------|-------|
| Service | 15 | Service Advisors, Technicians |
| Parts | 8 | Parts Managers, Specialists |
| Finance | 10 | Accountants, Cashiers |
| Customer Service | 12 | Call Center Agents, Reps |
| Quality | 5 | QC Inspectors, Officers |
| HR | 5 | HR Managers, Coordinators |
| Marketing | 5 | Marketing Managers, Specialists |
| Management | 10 | General/Branch Managers |

---

## API Reference

### Core API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | User login |
| POST | `/api/logout` | User logout |
| GET | `/api/user` | Get current user |
| POST | `/api/register` | Register new user |
| POST | `/api/forgot-password` | Password reset request |

#### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PATCH | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/customers/:id/vehicles` | Customer's vehicles |
| GET | `/api/customers/:id/history` | Service history |

#### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Create vehicle |
| PATCH | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |
| GET | `/api/vehicles/:id/service-history` | Service history |
| GET | `/api/vehicles/vin/:vin` | Lookup by VIN |

#### Job Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/job-cards` | List job cards |
| GET | `/api/job-cards/:id` | Get job card |
| POST | `/api/job-cards` | Create job card |
| PATCH | `/api/job-cards/:id` | Update job card |
| PATCH | `/api/job-cards/:id/status` | Update status |
| POST | `/api/job-cards/:id/assign` | Assign technician |
| POST | `/api/job-cards/:id/complete` | Complete job |

#### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List inventory items |
| GET | `/api/inventory/:id` | Get item details |
| POST | `/api/inventory` | Add inventory item |
| PATCH | `/api/inventory/:id` | Update item |
| PATCH | `/api/inventory/:id/stock` | Adjust stock |
| GET | `/api/inventory/low-stock` | Low stock alerts |
| POST | `/api/inventory/transfer` | Cross-branch transfer |

#### Invoicing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/:id` | Get invoice |
| POST | `/api/invoices` | Create invoice |
| POST | `/api/invoices/:id/payment` | Record payment |
| GET | `/api/invoices/:id/pdf` | Generate PDF |
| POST | `/api/invoices/:id/email` | Email invoice |

#### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create appointment |
| PATCH | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |
| GET | `/api/appointments/available-slots` | Get available slots |

#### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/revenue` | Revenue report |
| GET | `/api/reports/technician-performance` | Staff KPIs |
| GET | `/api/reports/inventory-turnover` | Inventory analytics |
| GET | `/api/reports/customer-satisfaction` | Feedback analytics |
| GET | `/api/reports/dashboard-stats` | Dashboard metrics |

### Real-Time WebSocket Events

#### Chat Support (`/ws/chat`)
| Event | Direction | Payload |
|-------|-----------|---------|
| `message` | Both | `{ ticketId, content, sender }` |
| `typing` | Both | `{ ticketId, userId, isTyping }` |
| `read` | Client→Server | `{ ticketId, messageId }` |
| `presence` | Server→Client | `{ userId, status }` |

#### Notifications (`/ws/notifications`)
| Event | Direction | Payload |
|-------|-----------|---------|
| `notification` | Server→Client | `{ type, title, message }` |
| `job-update` | Server→Client | `{ jobCardId, status }` |
| `appointment-reminder` | Server→Client | `{ appointmentId }` |

---

## API Design Standards

### RESTful Conventions
| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve resources | `GET /api/vehicles` |
| POST | Create resources | `POST /api/vehicles` |
| PATCH | Partial update | `PATCH /api/vehicles/:id` |
| PUT | Full replacement | `PUT /api/vehicles/:id` |
| DELETE | Remove resources | `DELETE /api/vehicles/:id` |

### Response Format
```typescript
// Success response
{
  "data": { ... },
  "message": "Operation successful"
}

// Error response
{
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}

// Paginated response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Request Validation
```typescript
// Always validate with Zod schemas
app.post('/api/vehicles', isAuthenticated, async (req, res) => {
  const result = insertVehicleSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: result.error.errors 
    });
  }
  const vehicle = await storage.createVehicle(result.data);
  res.status(201).json(vehicle);
});
```

---

## Frontend Development

### Component Patterns

#### Page Component Structure
```typescript
// Standard page structure
export default function VehiclesPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <StandardTablePage
      title={t('vehicles.title')}
      description={t('vehicles.description')}
    >
      <VehicleTable data={data} />
    </StandardTablePage>
  );
}
```

#### Form Handling
```typescript
// Form with react-hook-form and Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<InsertVehicle>({
  resolver: zodResolver(insertVehicleSchema),
  defaultValues: {
    make: '',
    model: '',
    year: new Date().getFullYear(),
  },
});
```

### Data Fetching with TanStack Query

#### Queries
```typescript
// Basic query
const { data, isLoading } = useQuery<Vehicle[]>({
  queryKey: ['/api/vehicles'],
});

// Query with parameters
const { data } = useQuery<Vehicle>({
  queryKey: ['/api/vehicles', vehicleId],
  enabled: !!vehicleId,
});
```

#### Mutations
```typescript
// Mutation with cache invalidation
const mutation = useMutation({
  mutationFn: (data: InsertVehicle) => 
    apiRequest('/api/vehicles', { method: 'POST', body: data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    toast({ title: t('vehicles.created') });
  },
});
```

### Archetype Wrappers
Use these 7 production-ready layout wrappers:

| Archetype | Use Case |
|-----------|----------|
| `StandardPageLayout` | Simple pages with header/description |
| `StandardTablePage` | Data tables with CRUD operations |
| `DashboardPage` | Metrics, cards, and KPIs |
| `FormPage` | Form-centric workflows |
| `AnalyticsPage` | Reports and data visualization |
| `MobileCardPage` | Mobile-optimized card layouts |
| `TabsPageLayout` | Multi-tab interfaces |

---

## Component Library

### shadcn/ui Components (40+ Components)

#### Layout Components
| Component | Import | Use Case |
|-----------|--------|----------|
| `Card` | `@/components/ui/card` | Content containers |
| `Dialog` | `@/components/ui/dialog` | Modal windows |
| `Sheet` | `@/components/ui/sheet` | Side panels |
| `Tabs` | `@/components/ui/tabs` | Tabbed content |
| `Accordion` | `@/components/ui/accordion` | Collapsible sections |
| `Collapsible` | `@/components/ui/collapsible` | Toggle content |
| `ScrollArea` | `@/components/ui/scroll-area` | Custom scrollbars |
| `Separator` | `@/components/ui/separator` | Visual dividers |
| `AspectRatio` | `@/components/ui/aspect-ratio` | Responsive ratios |

#### Form Components
| Component | Import | Use Case |
|-----------|--------|----------|
| `Form` | `@/components/ui/form` | Form wrapper with validation |
| `Input` | `@/components/ui/input` | Text inputs |
| `Textarea` | `@/components/ui/textarea` | Multi-line text |
| `Select` | `@/components/ui/select` | Dropdown selection |
| `Checkbox` | `@/components/ui/checkbox` | Boolean inputs |
| `RadioGroup` | `@/components/ui/radio-group` | Single selection |
| `Switch` | `@/components/ui/switch` | Toggle switches |
| `Slider` | `@/components/ui/slider` | Range inputs |
| `Calendar` | `@/components/ui/calendar` | Date picker |
| `DatePicker` | `@/components/ui/date-picker` | Date selection |

#### Interactive Components
| Component | Import | Use Case |
|-----------|--------|----------|
| `Button` | `@/components/ui/button` | Actions & triggers |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Action menus |
| `ContextMenu` | `@/components/ui/context-menu` | Right-click menus |
| `Menubar` | `@/components/ui/menubar` | Navigation menus |
| `NavigationMenu` | `@/components/ui/navigation-menu` | Site navigation |
| `Command` | `@/components/ui/command` | Command palette |
| `Popover` | `@/components/ui/popover` | Floating content |
| `Tooltip` | `@/components/ui/tooltip` | Hover information |
| `HoverCard` | `@/components/ui/hover-card` | Rich previews |

#### Feedback Components
| Component | Import | Use Case |
|-----------|--------|----------|
| `Alert` | `@/components/ui/alert` | Status messages |
| `AlertDialog` | `@/components/ui/alert-dialog` | Confirmation dialogs |
| `Toast` | `@/components/ui/toast` | Notifications |
| `Progress` | `@/components/ui/progress` | Loading indicators |
| `Skeleton` | `@/components/ui/skeleton` | Loading placeholders |
| `Badge` | `@/components/ui/badge` | Status labels |
| `Avatar` | `@/components/ui/avatar` | User avatars |

#### Data Display
| Component | Import | Use Case |
|-----------|--------|----------|
| `Table` | `@/components/ui/table` | Data tables |
| `DataTable` | `@/components/DataTable` | Advanced tables |
| `Label` | `@/components/ui/label` | Form labels |

### Custom Components

| Component | Path | Purpose |
|-----------|------|---------|
| `Layout` | `@/components/Layout` | Main app layout with sidebar |
| `PageHeader` | `@/components/PageHeader` | Page title & actions |
| `EmptyState` | `@/components/EmptyState` | Empty data placeholders |
| `DataTable` | `@/components/DataTable` | Sortable data tables |
| `FilterBar` | `@/components/FilterBar` | Search & filter controls |
| `DateRangePicker` | `@/components/DateRangePicker` | Date range selection |
| `BarcodeScanner` | `@/components/BarcodeScanner` | Barcode scanning |
| `QRScanner` | `@/components/QRScanner` | QR code scanning |
| `SignaturePad` | `@/components/SignaturePad` | Digital signatures |
| `MediaUpload` | `@/components/MediaUpload` | File uploads |
| `MediaGallery` | `@/components/MediaGallery` | Image galleries |
| `LanguageSwitcher` | `@/components/LanguageSwitcher` | i18n language selector |
| `ThemeToggle` | `@/components/ThemeToggle` | Dark/light mode toggle |
| `NotificationBell` | `@/components/NotificationBell` | Notification center |
| `GlobalSearch` | `@/components/GlobalSearch` | App-wide search |

---

## Styling & Theming

### Design System

#### Color Palette (Grayscale)
```css
/* Light theme */
--background: 0 0% 100%;
--foreground: 0 0% 3.9%;
--muted: 0 0% 96.1%;
--muted-foreground: 0 0% 45.1%;

/* Dark theme */
.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
}
```

#### Typography
- **Headings & Numbers**: Montserrat
- **Body Text**: Poppins

### Tailwind CSS Guidelines
```typescript
// Always use dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// Use semantic color classes
<Button variant="primary">Submit</Button>
<Alert variant="destructive">Error message</Alert>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Component Library (shadcn/ui)
Import components from `@/components/ui`:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
```

---

## Internationalization (i18n)

### Supported Languages
| Code | Language | Direction |
|------|----------|-----------|
| en | English | LTR |
| ar | Arabic | RTL |
| fr | French | LTR |
| es | Spanish | LTR |
| de | German | LTR |
| zh | Chinese | LTR |
| hi | Hindi | LTR |

### Configuration
```typescript
// client/src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Load saved language before initialization
const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';

i18n.use(initReactI18next).init({
  lng: savedLanguage,
  fallbackLng: 'en',
  resources: { en, ar, fr, es, de, zh, hi },
});
```

### Usage in Components
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('dashboard.welcome', { name: user.name })}</p>
      
      <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
```

### Translation File Structure
```json
// client/src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "nav": {
    "dashboard": "Dashboard",
    "vehicles": "Vehicles"
  },
  "vehicles": {
    "title": "Vehicle Management",
    "addNew": "Add New Vehicle"
  }
}
```

---

## Real-Time Features

### WebSocket Implementation
```typescript
// Server-side WebSocket
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ server, path: '/ws/chat' });

wss.on('connection', (ws, req) => {
  // Authenticate session
  const sessionId = parseSessionCookie(req.headers.cookie);
  
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    // Handle message types
  });
});
```

### Client WebSocket Hook
```typescript
// Custom WebSocket hook
function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      setMessages(prev => [...prev, JSON.parse(event.data)]);
    };
    setSocket(ws);
    return () => ws.close();
  }, [url]);

  return { socket, messages, send: socket?.send.bind(socket) };
}
```

---

## Saudi Arabia Compliance

### ZATCA E-Invoicing Integration

#### Requirements
- Tax Registration Number (TRN) validation
- QR code generation for invoices
- Digital signature support
- XML invoice format (UBL 2.1)

#### Implementation
```typescript
// ZATCA invoice generation
interface ZATCAInvoice {
  invoiceNumber: string;
  issueDate: Date;
  sellerTRN: string;
  buyerTRN?: string;
  totalAmount: number;
  vatAmount: number;
  qrCode: string;
  signature: string;
}

// TRN validation (15-digit format)
const validateTRN = (trn: string): boolean => {
  return /^3\d{14}$/.test(trn);
};
```

### VAT Management

| Rate | Description | Application |
|------|-------------|-------------|
| 15% | Standard Rate | Most goods & services |
| 0% | Zero Rate | Exports, certain supplies |
| Exempt | Exempt | Financial services, residential rent |

### Hijri Calendar Support
```typescript
// Convert Gregorian to Hijri
import { toHijri } from 'hijri-converter';

const hijriDate = toHijri(new Date());
// Returns: { year: 1446, month: 5, day: 15 }
```

### Arabic Language Support
- Full RTL layout support
- Arabic translations in `client/src/i18n/locales/ar.json`
- Arabic number formatting
- Arabic date formatting

### Zakat Compliance
- Zakat calculation utilities
- Annual reporting support
- Asset valuation tools

---

## AI & Automation

### OpenAI Integration

#### Configuration
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

#### AI Chatbot
```typescript
// Customer query handling
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful automotive service assistant.' },
    { role: 'user', content: customerQuery },
  ],
});
```

### AI Features

| Feature | Description | Endpoint |
|---------|-------------|----------|
| Smart Diagnostics | AI-powered fault analysis | `/api/ai/diagnostics` |
| Parts Recommendations | Intelligent parts suggestions | `/api/ai/parts-recommend` |
| Job Assignment | Optimal technician matching | `/api/ai/smart-assignment` |
| Sentiment Analysis | Customer feedback analysis | `/api/ai/sentiment` |
| Predictive Maintenance | Failure prediction | `/api/ai/predictive` |

### Smart Job Assignment Algorithm
```typescript
// Factors considered:
// 1. Technician skills & certifications
// 2. Current workload
// 3. Job complexity
// 4. Historical performance
// 5. Availability

const recommendation = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'system',
    content: `Analyze job requirements and technician profiles.
              Return the best technician match with reasoning.`
  }],
});
```

---

## Mobile Applications

### Three Cross-Platform Apps

| App | Target Users | Key Features |
|-----|--------------|--------------|
| Technician App | Service staff | Job queue, time tracking, parts requests |
| Customer App | Vehicle owners | Appointments, tracking, payments |
| Manager App | Supervisors | KPIs, approvals, staff management |

### PWA Configuration
```json
// public/manifest.json
{
  "name": "SALIS AUTO",
  "short_name": "SALIS",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a1a",
  "background_color": "#ffffff",
  "icons": [...]
}
```

### Mobile-Responsive Layouts

| Breakpoint | Width | Target Device |
|------------|-------|---------------|
| `sm` | 640px | Mobile phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Offline Mode
```typescript
// Service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// IndexedDB for offline data
const db = await openDB('salis-auto', 1, {
  upgrade(db) {
    db.createObjectStore('pending-jobs');
  },
});
```

---

## Data Seeding

### 9-Phase Comprehensive Seeding

| Phase | Records | Description |
|-------|---------|-------------|
| 1 | Roles & Permissions | 24 roles with permissions |
| 2 | Users | 70 staff users across departments |
| 3 | Customers | 500+ customer profiles |
| 4 | Vehicles | 800+ vehicle records |
| 5 | Inventory | 1000+ parts & supplies |
| 6 | Job Cards | 300+ service records |
| 7 | Invoices | 400+ billing records |
| 8 | Training | Courses & certifications |
| 9 | IoT & Blockchain | Sensor data & records |

### Running Seeders
```bash
# Full database seed
npm run db:seed

# Seed specific phase
npm run db:seed:users
npm run db:seed:vehicles
npm run db:seed:inventory
```

### Stock Images
35+ professional stock images for:
- Customer avatars
- Vehicle photos
- Technician profiles
- Product images
- Location photos

### Sample Data Patterns
```typescript
// Realistic data generation with Faker.js
import { faker } from '@faker-js/faker';

const customer = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number('+966 5## ### ####'),
  address: faker.location.streetAddress(),
};
```

---

## Error Handling

### Frontend Error Boundaries
```typescript
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Consistent error response format
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors,
    });
  }
  
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }
  
  res.status(500).json({
    message: 'Internal server error',
  });
});
```

### Toast Notifications
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success notification
toast({
  title: 'Success',
  description: 'Vehicle added successfully',
});

// Error notification
toast({
  title: 'Error',
  description: 'Failed to save changes',
  variant: 'destructive',
});
```

### Query Error Handling
```typescript
const { data, error, isError } = useQuery({
  queryKey: ['/api/vehicles'],
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

---

## Testing Guidelines

### Test ID Conventions
Add `data-testid` to all interactive and meaningful elements:

```typescript
// Interactive elements: {action}-{target}
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" />
<Link data-testid="link-profile">Profile</Link>

// Display elements: {type}-{content}
<span data-testid="text-username">{user.name}</span>
<img data-testid="img-avatar" src={avatarUrl} />

// Dynamic elements: {type}-{description}-{id}
<Card data-testid={`card-vehicle-${vehicle.id}`}>
```

### Testing Patterns
```typescript
// Component testing with data-testid
const submitButton = screen.getByTestId('button-submit');
const emailInput = screen.getByTestId('input-email');

// Asserting displayed content
expect(screen.getByTestId('text-total-vehicles')).toHaveTextContent('25');
```

---

## Performance Best Practices

### Code Splitting
```typescript
// Lazy load pages
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const VehiclesPage = lazy(() => import('./pages/Vehicles'));

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/dashboard" component={DashboardPage} />
</Suspense>
```

### Query Optimization
```typescript
// Stale time for frequently accessed data
useQuery({
  queryKey: ['/api/dashboard/stats'],
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Prefetching
queryClient.prefetchQuery({
  queryKey: ['/api/vehicles'],
});
```

### Memoization
```typescript
// Memoize expensive computations
const sortedVehicles = useMemo(() => 
  vehicles.sort((a, b) => a.make.localeCompare(b.make)),
  [vehicles]
);

// Memoize callbacks
const handleSubmit = useCallback((data) => {
  mutation.mutate(data);
}, [mutation]);
```

---

## Security Guidelines

### Input Validation
- Always validate on both client and server
- Use Zod schemas for consistent validation
- Sanitize HTML content before rendering

### Authentication
- Store sessions securely in PostgreSQL
- Use HTTP-only cookies for session tokens
- Implement rate limiting on auth endpoints

### Data Protection
- Never expose sensitive data in responses
- Use environment variables for secrets
- Implement proper CORS configuration

### API Security
```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts',
});

app.post('/api/login', authLimiter, loginHandler);
```

---

## Deployment

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Express session encryption |
| `OPENAI_API_KEY` | OpenAI API access |
| `TWILIO_*` | SMS service credentials |
| `STRIPE_*` | Payment processing |

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

### Health Checks
The application exposes `/api/health` for monitoring:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Quick Reference

### Common Import Paths
```typescript
// Components
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Utilities
import { apiRequest, queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Types
import type { Vehicle, InsertVehicle } from '@shared/schema';

// Assets
import logoUrl from '@assets/logo.png';
```

### Workflow Navigation Groups (18 Groups)
1. Dashboard & Overview
2. Customer Intake & Appointments
3. Vehicle Management
4. Inspection & Check-In
5. Diagnostics & Assessment
6. Service Planning & Scheduling
7. Parts & Inventory
8. Service Execution & Operations
9. Quality & Delivery
10. Billing & Payments
11. Analytics & Business Intelligence
12. Customer Experience & Growth
13. Team & HR Management
14. Compliance & Safety
15. Enterprise & Franchise
16. Emerging Technologies
17. AI & Automation Hub
18. System & Settings

---

## Troubleshooting

### Common Issues & Solutions

#### Database Connection Issues
```bash
# Check database connection
npm run db:push

# If connection fails:
# 1. Verify DATABASE_URL environment variable
# 2. Check Neon dashboard for database status
# 3. Ensure IP is whitelisted (if applicable)
```

#### Build Errors
| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Missing dependency | Run `npm install` |
| `Type errors` | TypeScript issues | Run `npm run check` |
| `Vite build failed` | Configuration issue | Check vite.config.ts |

#### Authentication Issues
```typescript
// Debug session issues
app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  next();
});
```

#### API Errors
| Status | Meaning | Fix |
|--------|---------|-----|
| 401 | Unauthorized | Check login, session expired |
| 403 | Forbidden | Check role permissions |
| 404 | Not found | Verify API endpoint path |
| 500 | Server error | Check server logs |

#### Frontend Issues
```typescript
// Debug React Query issues
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to App.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

#### i18n Issues
```typescript
// Debug translation issues
console.log(i18n.language); // Current language
console.log(i18n.t('key')); // Translation result
console.log(i18n.exists('key')); // Key exists?
```

### Performance Debugging

```typescript
// React performance profiling
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

### Log Locations
| Log Type | Location |
|----------|----------|
| Server logs | Console output |
| Database logs | Neon dashboard |
| Client errors | Browser console |
| Build logs | Terminal output |

---

## Related Documentation

For more detailed information, refer to these project documentation files:

| Document | Description |
|----------|-------------|
| `README.md` | Project overview and setup |
| `replit.md` | Project memory & agent preferences |
| `QUICK-START-GUIDE.md` | Getting started guide |
| `USER-MANUAL.md` | Complete user manual |
| `RBAC-DOCUMENTATION.md` | Role-based access control details |
| `DATA-SEEDING-GUIDE.md` | Database seeding instructions |
| `AUTHENTICATION_GUIDE.md` | Authentication implementation |
| `DEPLOYMENT_GUIDE.md` | Deployment procedures |
| `SAUDI_ARABIA_FEATURES.md` | Saudi compliance (VAT, ZATCA) |
| `STAFF-USERS-GUIDE.md` | Staff user management |
| `ADMINISTRATOR-GUIDE.md` | Admin configuration |
| `TROUBLESHOOTING-GUIDE.md` | Common issues & solutions |
| `FEATURE-CATALOG.md` | Complete feature list |
| `PLATFORM-NAVIGATION-GUIDE.md` | Navigation structure |
| `SIDEBAR_ORGANIZATION.md` | Sidebar layout details |

---

*Last Updated: November 2025*
*SALIS AUTO ERP v1.0*
