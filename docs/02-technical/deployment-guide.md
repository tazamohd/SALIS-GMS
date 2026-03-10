# SALIS AUTO — Deployment Guide

**Document Type:** Deployment Guide  
**Version:** 14.0.0  
**Platform:** Replit  

---

## Overview

SALIS AUTO is deployed on Replit's cloud infrastructure using the built-in deployment system. The application runs as a single Node.js process serving both the Express API and the Vite-built React frontend.

---

## Development Environment

### Starting the Application
The application is configured with a workflow named **"Start application"**:
```bash
npm run dev
```

This starts:
- **Vite dev server** for the React frontend (with HMR)
- **Express backend** with automatic restart on changes
- Both served on **port 5000**

### Environment Variables Required
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Session signing key | Yes (production) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | Yes (for AI features) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | For SMS |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | For SMS |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | For SMS |
| `AUTH_BYPASS` | Skip auth (dev only) | Development only |

---

## Production Deployment

### Pre-Deployment Checklist
- [ ] Remove `AUTH_BYPASS=true` from environment
- [ ] Set strong `SESSION_SECRET` (32+ random characters)
- [ ] Set `NODE_ENV=production`
- [ ] All secrets configured in Replit Secrets
- [ ] Database migrations applied
- [ ] Test credentials changed or removed
- [ ] Error logging configured

### Deployment Steps

1. **Prepare Environment**
   - Navigate to Replit Secrets panel
   - Set all required environment variables
   - Remove `AUTH_BYPASS` or set to `false`

2. **Database Check**
   ```bash
   npm run db:push
   ```
   Apply any pending schema changes.

3. **Build Verification**
   ```bash
   npm run build
   ```
   Ensures the frontend builds without errors.

4. **Deploy via Replit**
   - Click the "Deploy" button in Replit
   - Select deployment type (Reserved VM or Autoscale)
   - Configure domain if using custom domain
   - Replit handles SSL/TLS automatically

### Production URL
After deployment, the application is accessible at:
- `https://[repl-name].replit.app`
- Or custom domain if configured

---

## Database Management

### Schema Migrations
```bash
# Push schema changes to database
npm run db:push

# Generate migration files
npm run db:generate

# View database studio
npm run db:studio
```

### Database Seeding
The platform seeds realistic sample data on first run including:
- Sample garages and branches
- 70 staff users across departments
- Sample customers and vehicles
- Demo job cards and invoices
- Sample inventory items

### Backup Strategy (Production)
- Replit PostgreSQL databases are backed up automatically
- Export critical data regularly via Data Import/Export module
- ZATCA-related records must be retained for 10 years (Saudi law)

---

## Monitoring & Logs

### Application Logs
View live logs in the Replit console/workflow pane.

### Key Log Patterns
```
[INFO] Server started on port 5000
[INFO] Database connected
[ERROR] Authentication failed for user: ...
[WARN] Rate limit exceeded for IP: ...
```

### Health Check
```
GET /api/user → Returns user if session valid
GET /openapi.json → Returns API spec (verifies server is up)
```

---

## Performance Tuning

### Database Connection Pool
```typescript
// server/db.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,           // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Frontend Build Optimization
Vite automatically handles:
- Code splitting by route
- Tree shaking
- Asset optimization
- Gzip compression

---

## Rollback Procedure

If a deployment introduces issues:

1. **Quick Rollback** — Use Replit's checkpoint system to revert to a previous working state
2. **Database Rollback** — If schema was changed, restore from backup before reverting code
3. **Environment Rollback** — Revert any environment variable changes

---

## Scaling Considerations

| Scenario | Recommendation |
|----------|---------------|
| < 50 concurrent users | Single instance (current) |
| 50–200 concurrent users | Upgrade Replit Reserved VM |
| 200+ concurrent users | Consider microservices + load balancer |
| Real-time features under load | Add Redis for WebSocket state |
| Large parts catalog | Add Elasticsearch for search |

---

*SALIS AUTO Deployment Guide — Version 14.0.0*
