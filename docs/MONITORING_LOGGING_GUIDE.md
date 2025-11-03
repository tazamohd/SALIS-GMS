# SALIS AUTO - Monitoring & Logging Guide

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Production

---

## Overview

This guide covers monitoring, logging, error tracking, and performance metrics for SALIS AUTO.

---

## Application Monitoring

### Current Setup

**Replit Built-in Monitoring:**
- CPU usage
- Memory usage
- Network traffic
- Deployment status
- Workflow status

**Access:** Replit Dashboard → Your Repl → Metrics

### Key Metrics

| Metric | Normal Range | Alert Threshold |
|--------|--------------|-----------------|
| CPU Usage | 10-40% | > 80% |
| Memory Usage | 200-500MB | > 800MB |
| Response Time | < 200ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Active Connections | 10-50 | > 100 |

---

## Logging Strategy

### Log Levels

```typescript
// Logging levels in order of severity
enum LogLevel {
  DEBUG = 'debug',     // Detailed information for debugging
  INFO = 'info',       // General informational messages
  WARN = 'warn',       // Warning messages
  ERROR = 'error',     // Error messages
  CRITICAL = 'critical' // Critical failures
}
```

### What to Log

**✅ DO Log:**
- API requests (method, path, status, duration)
- Authentication events (login, logout, failures)
- Database errors
- External API failures
- Security events (failed auth, permission denied)
- Business logic errors
- Performance bottlenecks

**❌ DON'T Log:**
- Passwords or credentials
- API keys or secrets
- Credit card numbers
- Personal sensitive data (SSN, etc.)
- Session tokens
- Full request bodies with sensitive data

### Log Format

**Structured Logging:**
```json
{
  "timestamp": "2025-11-03T14:30:00Z",
  "level": "error",
  "message": "Database connection failed",
  "context": {
    "userId": "uuid-here",
    "requestId": "req-123",
    "endpoint": "/api/customers",
    "error": "Connection timeout"
  }
}
```

---

## Implementation

### Server Logging

**Current Setup (Console Logs):**
```typescript
// server/index.ts
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

**Enhanced Logging (Recommended):**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err.message, query: query });
```

### Error Tracking

**Future: Sentry Integration**
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}
```

---

## Database Monitoring

### Connection Monitoring

**Check Active Connections:**
```sql
SELECT 
  count(*) as active_connections,
  max_conn,
  max_conn - count(*) as available_connections
FROM pg_stat_activity,
  (SELECT setting::int as max_conn FROM pg_settings WHERE name='max_connections') mc
GROUP BY max_conn;
```

**Long-Running Queries:**
```sql
SELECT 
  pid,
  now() - pg_stat_activity.query_start AS duration,
  query,
  state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state = 'active';
```

### Performance Monitoring

**Slow Query Log:**
```sql
-- Find slowest queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Table Sizes:**
```sql
SELECT 
  schemaname as schema,
  tablename as table,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Performance Metrics

### API Endpoint Metrics

**Track for Each Endpoint:**
- Request count
- Average response time
- 95th percentile response time
- Error rate
- Throughput (requests/second)

**Implementation:**
```typescript
const metrics = {
  '/api/customers': {
    count: 1523,
    avgResponseTime: 145,
    p95: 320,
    errorRate: 0.02,
  }
};
```

### Business Metrics

**Track:**
- Daily active users
- New customers per day
- Job cards created per day
- Revenue per day
- Invoice payment rate
- Average job completion time

**Query Examples:**
```sql
-- Daily active users
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Revenue per day
SELECT 
  DATE(payment_date) as date,
  SUM(amount) as revenue
FROM payments
WHERE status = 'paid'
GROUP BY DATE(payment_date)
ORDER BY date;
```

---

## Alerts & Notifications

### Alert Conditions

**Critical Alerts (Immediate Action):**
- Application down (health check fails)
- Database connection lost
- Critical error rate > 5%
- Payment processing failures
- Security breach detected

**Warning Alerts (Monitor):**
- High error rate (> 1%)
- Slow response times (> 1s)
- High memory usage (> 80%)
- Database connection pool exhausted
- Disk space low (< 10%)

**Info Alerts:**
- Deployment completed
- Daily backup completed
- Scheduled maintenance reminder

### Notification Channels

**Future Implementation:**
```typescript
// Email alerts
sendAlert({
  type: 'critical',
  message: 'Database connection lost',
  recipients: ['admin@salis-auto.com']
});

// Slack/Discord webhooks
notifySlack({
  channel: '#alerts',
  message: 'High error rate detected: 3.5%'
});

// SMS (via Twilio)
sendSMS({
  to: '+1234567890',
  message: 'CRITICAL: Application down'
});
```

---

## Log Management

### Log Storage

**Current:**
- Console logs (Replit)
- Temporary (cleared on restart)

**Recommended:**
- Centralized logging (CloudWatch, Datadog, Loggly)
- Long-term storage (30-90 days)
- Searchable and filterable

### Log Rotation

**Future Setup:**
```typescript
import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});
```

### Log Analysis

**Common Queries:**

```bash
# Find all errors in last hour
grep "ERROR" application.log | grep "$(date -u +%Y-%m-%d) $(date -u +%H)"

# Count errors by endpoint
grep "ERROR" application.log | awk '{print $5}' | sort | uniq -c

# Find slow requests (>1s)
grep "ms" application.log | awk '$NF > 1000' | wc -l

# Most accessed endpoints
grep "GET\|POST" application.log | awk '{print $3}' | sort | uniq -c | sort -rn | head -10
```

---

## Health Checks

### Application Health Endpoint

**Implementation:**
```typescript
// server/routes.ts
app.get('/api/health', async (req, res) => {
  try {
    // Check database
    await db.execute(sql`SELECT 1`);
    
    // Check external services
    const checks = {
      database: 'healthy',
      stripe: await checkStripe(),
      twilio: await checkTwilio(),
      openai: await checkOpenAI(),
    };
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Monitoring Health Check

**External Monitoring:**
- UptimeRobot (free tier): Ping every 5 minutes
- Pingdom: Advanced monitoring
- StatusPage: Public status page

**Setup:**
```
URL: https://your-domain.replit.app/api/health
Method: GET
Interval: 5 minutes
Timeout: 30 seconds
Expected: 200 status code
```

---

## Performance Optimization

### Identify Bottlenecks

**Database Queries:**
```sql
-- Identify missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1;
```

**API Response Times:**
```typescript
// Middleware to track slow endpoints
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow request', {
        method: req.method,
        path: req.path,
        duration,
      });
    }
  });
  next();
});
```

### Optimization Checklist

- [ ] Database indexes on foreign keys
- [ ] Query result caching
- [ ] API response caching
- [ ] Image optimization
- [ ] Code splitting (frontend)
- [ ] Lazy loading components
- [ ] Database connection pooling
- [ ] CDN for static assets

---

## Incident Response

### Monitoring During Incidents

**Steps:**
1. Check health endpoint
2. Review error logs (last 15 minutes)
3. Check database connections
4. Verify external services
5. Check resource usage (CPU/memory)
6. Review recent deployments

**Commands:**
```bash
# Check application status
curl https://your-domain.replit.app/api/health

# View recent errors
tail -n 100 error.log | grep ERROR

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"
```

### Post-Incident Analysis

**Document:**
- Timeline of events
- Root cause
- Impact (users affected, duration)
- Resolution steps
- Preventive measures
- Lessons learned

---

## Dashboard (Future)

### Metrics Dashboard

**Tools:**
- Grafana: Open-source dashboards
- Datadog: All-in-one monitoring
- New Relic: Application performance

**Key Panels:**
1. **System Health**
   - Application status
   - Database status
   - Error rate

2. **Performance**
   - Response times
   - Throughput
   - Database query times

3. **Business Metrics**
   - Daily revenue
   - Active users
   - Job cards created

4. **Alerts**
   - Recent alerts
   - Alert history
   - On-call schedule

---

## Best Practices

### DO:
✅ Log errors with context (user ID, request ID)  
✅ Use structured logging (JSON)  
✅ Set up alerts for critical issues  
✅ Monitor business metrics  
✅ Review logs regularly  
✅ Test alerting system  
✅ Document incidents  

### DON'T:
❌ Log sensitive data  
❌ Ignore warning signs  
❌ Over-alert (alert fatigue)  
❌ Log synchronously (use async)  
❌ Store logs indefinitely  
❌ Forget to rotate logs  

---

## Next Steps

### Implementation Roadmap

**Phase 1 (Immediate):**
- [ ] Set up structured logging (Winston)
- [ ] Implement health check endpoint
- [ ] Configure error tracking (Sentry)

**Phase 2 (Month 1):**
- [ ] Set up external monitoring (UptimeRobot)
- [ ] Create performance dashboard
- [ ] Configure alerts

**Phase 3 (Month 2):**
- [ ] Implement log aggregation
- [ ] Set up APM (Application Performance Monitoring)
- [ ] Create incident runbooks

---

**Document Owner:** DevOps Team  
**Next Review:** December 3, 2025
