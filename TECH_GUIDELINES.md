# SALIS AUTO ERP - Technical Guidelines Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Design Standards](#api-design-standards)
7. [Frontend Development](#frontend-development)
8. [Styling & Theming](#styling--theming)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Real-Time Features](#real-time-features)
11. [Testing Guidelines](#testing-guidelines)
12. [Performance Best Practices](#performance-best-practices)
13. [Security Guidelines](#security-guidelines)
14. [Deployment](#deployment)
15. [Related Documentation](#related-documentation)

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
