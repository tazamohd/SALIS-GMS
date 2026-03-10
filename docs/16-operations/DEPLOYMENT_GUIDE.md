# SALIS AUTO - Production Deployment Guide

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Platform:** Replit

---

## Pre-Deployment Checklist

### ✅ Environment Configuration

1. **Environment Variables**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:port/database
   
   # Session
   SESSION_SECRET=your-secure-random-string-min-32-chars
   
   # Stripe (if using payments)
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   
   # PayPal (if using payments)
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   
   # Twilio (SMS notifications)
   TWILIO_ACCOUNT_SID=...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   
   # OpenAI (AI features)
   OPENAI_API_KEY=sk-...
   
   # Google APIs (Calendar/Gmail)
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   
   # Application
   NODE_ENV=production
   PORT=5000
   ```

2. **Database Setup**
   - Provision Neon PostgreSQL database
   - Run migrations: `npm run db:push`
   - Verify connection: Test DATABASE_URL
   - Create database backup

3. **Security Configuration**
   - Generate strong SESSION_SECRET (32+ characters)
   - Enable HTTPS (automatic on Replit)
   - Configure CORS if needed
   - Set secure cookie flags

### ✅ Code Quality

1. **Testing**
   - Run all tests: `npm test` (when implemented)
   - Check for LSP errors
   - Verify build: `npm run build`
   - Test critical user flows

2. **Performance**
   - Optimize images
   - Enable caching
   - Minimize bundle size
   - Test load times

3. **Security**
   - No hardcoded secrets
   - Input validation on all endpoints
   - SQL injection prevention (via ORM)
   - XSS protection (React escaping)

---

## Deployment Steps on Replit

### Step 1: Database Migration

```bash
# Push schema to production database
npm run db:push

# Verify tables created
# Check in Database pane or run:
# SELECT table_name FROM information_schema.tables 
# WHERE table_schema = 'public';
```

### Step 2: Environment Variables

1. Open **Secrets** tab in Replit
2. Add all required environment variables
3. Verify sensitive data is not in code
4. Test connection to external services

### Step 3: Deploy Application

1. Click **Publish** button in Replit
2. Configure custom domain (optional)
3. Set deployment region (if available)
4. Enable always-on (for production)
5. Confirm deployment

### Step 4: Post-Deployment Verification

```bash
# Test endpoints
curl https://your-domain.replit.app/api/health

# Check logs
# Monitor Replit console for errors

# Test authentication
# Login via /login page

# Verify database connections
# Check active connections in Database pane
```

---

## Custom Domain Setup

### Option 1: Replit Custom Domain

1. Go to **Deployments** tab
2. Click **Add custom domain**
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning (automatic)

### Option 2: External Domain Provider

1. **Add DNS Records:**
   ```
   Type: CNAME
   Name: www (or subdomain)
   Value: your-repl.replit.app
   TTL: 3600
   ```

2. **Configure in Replit:**
   - Add domain in deployment settings
   - Verify ownership
   - Wait for SSL provisioning

---

## Database Management

### Backup Strategy

**Automated Backups (Neon):**
- Point-in-time recovery enabled
- Retention: 7 days (free tier) / 30 days (paid)
- Automatic daily backups

**Manual Backups:**
```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup_20251103.sql
```

### Migration Strategy

```bash
# Generate migration
npm run db:generate

# Review migration SQL
cat drizzle/migrations/*.sql

# Apply migration
npm run db:push

# Rollback (manual)
# Execute reverse SQL statements
```

---

## Scaling Recommendations

### Application Scaling

**Vertical Scaling (Replit):**
- Upgrade to higher tier for more resources
- Enable always-on for 24/7 availability
- Monitor resource usage

**Horizontal Scaling (Future):**
- Load balancer setup
- Multiple Replit instances
- Shared session store (Redis)

### Database Scaling

**Read Replicas:**
- Neon supports read replicas (paid tier)
- Configure for read-heavy workloads
- Reduce primary database load

**Connection Pooling:**
- Already configured in `server/db.ts`
- Adjust pool size based on load:
  ```typescript
  max: 20  // Maximum connections
  ```

**Indexing:**
- Review slow queries
- Add indexes on frequently queried columns
- Monitor query performance

---

## Monitoring & Alerts

### Application Monitoring

**Replit Built-in:**
- CPU usage
- Memory usage
- Network traffic
- Error rates

**Custom Monitoring (Future):**
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- User analytics

### Database Monitoring

**Neon Dashboard:**
- Connection count
- Query performance
- Storage usage
- Backup status

**Alerts Setup:**
- High connection count
- Storage threshold (80%)
- Query timeouts
- Failed backups

---

## Security Hardening

### SSL/TLS

- ✅ Automatic HTTPS on Replit
- ✅ Force HTTPS redirect
- ✅ HSTS headers
- ✅ Secure cookies

### Authentication

```typescript
// Session configuration
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,  // HTTPS only
    httpOnly: true, // No JavaScript access
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
})
```

### Rate Limiting

**Implement (Future):**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Input Validation

- ✅ Zod validation on all endpoints
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ XSS protection (React escaping)
- ⏳ CSRF tokens (future enhancement)

---

## Performance Optimization

### Frontend Optimization

**Build Optimization:**
```bash
# Production build
npm run build

# Check bundle size
du -sh dist/
```

**Caching Strategy:**
- Static assets: 1 year cache
- API responses: No cache or short TTL
- Service worker for offline support

**Code Splitting:**
- Route-based code splitting (already implemented)
- Lazy loading for heavy components
- Dynamic imports for modals

### Backend Optimization

**Database Queries:**
- Use indexes on foreign keys
- Limit result sets
- Avoid N+1 queries
- Use database joins efficiently

**API Response Caching:**
```typescript
// Cache expensive queries
const cacheKey = `analytics:${startDate}:${endDate}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await expensiveQuery();
await redis.setex(cacheKey, 300, JSON.stringify(result));
```

---

## Disaster Recovery

### Backup Procedures

**Daily Automated:**
1. Neon automatic backups
2. Point-in-time recovery window
3. Retention policy: 7-30 days

**Weekly Manual:**
1. Export full database dump
2. Store in secure location (AWS S3, Google Cloud Storage)
3. Test restoration procedure

### Recovery Procedures

**Database Failure:**
1. Restore from latest Neon backup
2. Verify data integrity
3. Update application connection
4. Test critical functions

**Application Failure:**
1. Check Replit logs for errors
2. Rollback to previous deployment
3. Investigate root cause
4. Deploy fix

**Complete System Failure:**
1. Provision new Replit environment
2. Restore database from backup
3. Configure environment variables
4. Deploy application
5. Update DNS records (if needed)
6. Verify functionality

---

## Maintenance Windows

### Scheduled Maintenance

**Database Updates:**
- Schedule during low-traffic hours
- Notify users 24 hours in advance
- Test migrations on staging first
- Have rollback plan ready

**Application Updates:**
- Deploy during off-peak hours
- Use blue-green deployment (future)
- Monitor error rates post-deployment
- Rollback if issues detected

### Zero-Downtime Deployments (Future)

1. Deploy to new instance
2. Run health checks
3. Switch traffic to new instance
4. Monitor for errors
5. Keep old instance for rollback

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```
Error: connect ECONNREFUSED
```
**Solution:** Verify DATABASE_URL, check Neon status, verify IP allowlist

**Session Issues:**
```
Error: Session cookie not set
```
**Solution:** Check SESSION_SECRET, verify cookie settings, ensure HTTPS

**API Errors:**
```
500 Internal Server Error
```
**Solution:** Check Replit logs, verify environment variables, check database

### Debug Mode

```bash
# Enable debug logging
DEBUG=express:* npm run dev

# View detailed logs
# Check Replit console
```

---

## Rollback Procedures

### Application Rollback

1. **Via Replit:**
   - Go to Deployments tab
   - Select previous deployment
   - Click "Rollback to this version"

2. **Via Git:**
   ```bash
   git revert HEAD
   git push
   # Replit auto-deploys
   ```

### Database Rollback

1. **Point-in-time Recovery:**
   - Use Neon dashboard
   - Select recovery timestamp
   - Create new database branch
   - Update DATABASE_URL

2. **Manual Restore:**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup_file.sql
   ```

---

## Checklist: Pre-Production

- [ ] All environment variables configured
- [ ] Database migrated successfully
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Backup strategy implemented
- [ ] Monitoring enabled
- [ ] Error tracking configured
- [ ] Performance tested
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team trained on procedures
- [ ] Support plan in place

---

## Checklist: Post-Deployment

- [ ] Application accessible via URL
- [ ] User login working
- [ ] Database connections stable
- [ ] Payment processing functional (if applicable)
- [ ] SMS notifications sending (if applicable)
- [ ] Email delivery working
- [ ] AI features operational (if applicable)
- [ ] Mobile apps accessible
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Backup verified
- [ ] Monitoring active

---

## Support & Escalation

### Internal Team
- **DevOps Lead:** [Contact]
- **Database Admin:** [Contact]
- **Security Lead:** [Contact]

### External Support
- **Replit Support:** https://replit.com/support
- **Neon Support:** https://neon.tech/docs/support
- **Stripe Support:** https://support.stripe.com
- **Twilio Support:** https://support.twilio.com

---

**Document Version:** 1.0  
**Next Review:** Every 3 months  
**Owner:** DevOps Team
