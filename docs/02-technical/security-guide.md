# SALIS AUTO — Security Guide

**Document Type:** Security Guide  
**Version:** 14.0.0  
**Classification:** Internal Technical  

---

## Security Architecture Overview

SALIS AUTO implements a defense-in-depth security model with multiple layers of protection: authentication, session management, role-based access control, data validation, and secure coding practices.

---

## Authentication

### Mechanism
SALIS AUTO uses **session-based authentication** via Passport.js with the Local Strategy.

```
Login Request
     ↓
Passport.js LocalStrategy
     ↓
Email lookup in users table
     ↓
bcrypt.compare(password, hashedPassword)
     ↓
Session created (express-session)
     ↓
Session cookie returned to client
```

### Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Storage:** Only hashed passwords stored in `users.password`
- **Reset:** Not exposed in API (admin resets only)

### Session Configuration
```typescript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### Two-Factor Authentication (2FA)
- Implemented via **TOTP** (Time-based One-Time Password)
- Libraries: `speakeasy` (token generation), `qrcode` (QR code display)
- User can enable/disable in User Settings
- Compatible with Google Authenticator, Authy, etc.

---

## Role-Based Access Control (RBAC)

### Architecture
```
User → UserRoleBranch → Role → RolePermissions → Permission
```

### Roles (20 Defined)
| Role | Scope | Access Level |
|------|-------|-------------|
| SYSTEM_ADMIN | System | Full wildcard access |
| OWNER | Garage | Full garage access |
| GENERAL_MANAGER | Garage | Operational management |
| SERVICE_MANAGER | Branch | Service operations |
| SERVICE_ADVISOR | Branch | Customer interaction |
| PARTS_MANAGER | Branch | Inventory and supply |
| LEAD_TECHNICIAN | Branch | Senior technical |
| TECHNICIAN | Branch | Assigned jobs only |
| FINANCE_MANAGER | Garage | Financial oversight |
| ACCOUNTANT | Garage | Bookkeeping |
| HR_MANAGER | Garage | Personnel |
| MARKETING_MANAGER | Garage | CRM and campaigns |
| CSR | Branch | Customer support |
| RECEPTIONIST | Branch | Front desk |
| QC_INSPECTOR | Branch | Quality control |
| WAREHOUSE_MANAGER | Garage | Logistics |
| FRANCHISE_MANAGER | Franchise | Multi-location |
| ANALYST | Garage | Read-only analytics |
| CALL_CENTER_AGENT | Branch | Tele-support |
| APPRENTICE | Branch | Limited access |

### Permission Actions (18)
`CREATE`, `READ`, `UPDATE`, `DELETE`, `APPROVE`, `REJECT`, `EXPORT`, `IMPORT`, `ASSIGN`, `MANAGE`, `VIEW_ALL`, `VIEW_OWN`, `EDIT_ALL`, `EDIT_OWN`, `CANCEL`, `REFUND`, `VOID`, `PRINT`

### Resource Categories (141+)
Dashboard, Customers, Vehicles, Job Cards, Appointments, Inventory, Invoices, Payments, Reports, Staff, AI Features, Compliance, and more.

---

## Development vs Production Security

### Development Mode
```
AUTH_BYPASS=true
```
When set, authentication checks are skipped. This is for development convenience ONLY.

**WARNING:** Never deploy with `AUTH_BYPASS=true` in production.

### Production Checklist
- [ ] `AUTH_BYPASS` removed or set to `false`
- [ ] `SESSION_SECRET` set to a strong random value
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enforced (TLS/SSL)
- [ ] Database connection over SSL (`?ssl=require` in DATABASE_URL)
- [ ] All secrets in environment variables (never in code)
- [ ] `garageId` enforced on all multi-tenant queries

---

## Data Security

### SQL Injection Prevention
All database queries use Drizzle ORM's parameterized query builder:
```typescript
// SAFE - Drizzle parameterized
const customer = await db.select().from(customers)
  .where(eq(customers.id, customerId));

// NEVER use string concatenation for queries
```

### XSS Prevention
- React's JSX automatically escapes content
- Never use `dangerouslySetInnerHTML` without sanitization
- All user input is validated before storage

### Input Validation
All API endpoints use Zod schema validation:
```typescript
const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/),
});

// In route handler:
const body = createCustomerSchema.parse(req.body);
```

### Secrets Management
All sensitive configuration is stored in environment variables:
- `DATABASE_URL` — PostgreSQL connection
- `SESSION_SECRET` — Session signing key
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI access
- `TWILIO_*` — SMS integration
- `STRIPE_SECRET_KEY` — Payment processing

---

## Multi-Tenant Security

### Tenant Isolation
All queries that touch tenant-specific data include `garageId`:

```typescript
// Correct - always filter by garageId
const jobs = await db.select().from(jobCards)
  .where(eq(jobCards.garageId, req.user.garageId));

// Wrong - would expose all garages' data
const jobs = await db.select().from(jobCards);
```

### Production Note (from replit.md)
> HR module queries use optional garage-based filtering — in development mode without garageId, returns all records. **Production deployments must enforce garageId for tenant isolation.**

---

## API Security

### Session Validation Pattern
```typescript
// Every protected route should check:
if (!req.isAuthenticated()) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Role checking example:
if (!req.user.roles.includes('FINANCE_MANAGER')) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### Rate Limiting (Recommended for Production)
Implement with `express-rate-limit`:
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});
app.use('/api/', apiLimiter);
```

---

## Security Headers (Production)

Recommended headers to add:
```typescript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```

---

## Audit Trail

The platform maintains audit logs for sensitive operations:
- All invoice creation, modification, and voiding
- Payment processing
- User role changes
- Stock adjustments (`inventory_audit_trail` table)
- ZATCA submission events
- Safety incident reports

---

## Incident Response

### Suspected Breach Protocol
1. Immediately revoke all active sessions (clear `sessions` table)
2. Rotate `SESSION_SECRET` environment variable
3. Review audit logs for unauthorized access
4. Reset compromised user passwords
5. Notify affected users
6. Document and analyze root cause

### Contact
Security concerns should be reported to the system administrator with access to the production environment.

---

*SALIS AUTO Security Guide — Version 14.0.0*
