# SALIS AUTO - Administrator Guide

## 📋 Table of Contents
- [Overview](#overview)
- [System Administration](#system-administration)
- [User Management](#user-management)
- [Security Administration](#security-administration)
- [Database Management](#database-management)
- [System Configuration](#system-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Backup & Recovery](#backup--recovery)
- [Performance Optimization](#performance-optimization)

---

## Overview

This guide is for **System Administrators** who manage and maintain the SALIS AUTO platform. It covers installation, configuration, user management, security, and ongoing maintenance tasks.

### Administrator Responsibilities

- ✅ System installation and configuration
- ✅ User account management
- ✅ Security and access control
- ✅ Database administration
- ✅ System monitoring and performance
- ✅ Backup and disaster recovery
- ✅ Integration management
- ✅ Compliance and auditing

---

## System Administration

### Accessing Admin Panel

1. Login as System Administrator
   ```
   Email: admin@salisauto.com
   Password: password123 (change immediately!)
   ```

2. Navigate to **Settings** → **System Administration**

3. Admin panel includes:
   - User Management
   - Role & Permission Management
   - System Configuration
   - Integration Settings
   - Security & Audit Logs
   - Database Management
   - System Health Monitoring

### System Information

View system status at **Settings** → **System Info**:

- **Version**: Current platform version
- **Database**: Connection status, size, table count
- **Server**: CPU, memory, disk usage
- **Active Users**: Currently logged in users
- **Workflows**: Background jobs status
- **Integrations**: Connected services status

---

## User Management

### Creating User Accounts

1. Navigate to **Settings** → **User Management**
2. Click **"+ Add User"**
3. Enter user details:
   - Full Name *
   - Email Address * (will be username)
   - Phone Number
   - User Type: staff / customer
   - Garage Assignment
   - Branch Assignment (for branch-level roles)
4. Assign Role (see RBAC section)
5. Click **"Create User"**
6. System sends welcome email with temp password

### Assigning Roles

SALIS AUTO includes **24 pre-configured professional roles**:

**System Level:**
- System Administrator (full access)

**Garage Level:**
- Business Owner
- General Manager
- Garage Manager
- Finance Manager
- Accountant
- HR Manager
- Marketing Manager
- Warehouse Manager

**Branch Level:**
- Service Manager
- Service Advisor
- Parts Manager
- Lead Technician
- Technician
- Call Center Agent
- Customer Service Representative
- Receptionist
- Quality Control Inspector

**To Assign Role:**
1. Select user
2. Go to **Roles** tab
3. Click **"+ Assign Role"**
4. Select Role
5. Select Branch (for branch-level roles)
6. Set as Primary Role (checkbox)
7. Click **"Assign"**

### Managing Permissions

**View User Permissions:**
1. Select user
2. Go to **Permissions** tab
3. View all granted permissions by category

**Permission Override:**
1. Select user
2. Click **"Add Override"**
3. Select resource and action
4. Grant or Deny
5. Add reason (for audit trail)
6. Set expiration date (optional)
7. Click **"Save Override"**

### Deactivating Users

1. Navigate to user profile
2. Click **"Deactivate Account"**
3. Enter reason
4. Confirm deactivation
5. User cannot login (data preserved)
6. Can reactivate anytime

### Resetting Passwords

**Force Password Reset:**
1. Select user
2. Click **"Reset Password"**
3. Choose method:
   - Send reset link via email
   - Generate temporary password
4. User must change on next login

---

## Security Administration

### Two-Factor Authentication (2FA)

**Enable 2FA for Administrators:**
1. Navigate to **Security Settings**
2. Toggle **"Require 2FA for Administrators"**
3. All admin users must setup 2FA on next login

**Setup 2FA (User)**:
1. Profile → Security
2. Click **"Enable 2FA"**
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes

### Session Management

**Configure Session Settings:**
- **Session Timeout**: 30 minutes (configurable)
- **Max Sessions Per User**: 3 (configurable)
- **Remember Me**: 30 days
- **Force Logout**: After password change

**View Active Sessions:**
1. Navigate to **Security** → **Active Sessions**
2. View all logged-in users
3. Force logout individual sessions
4. Bulk logout all sessions

### Access Control

**IP Whitelisting:**
1. Navigate to **Security** → **IP Whitelist**
2. Add allowed IP ranges
3. Block all others
4. Useful for restricting admin access

**Rate Limiting:**
- Login attempts: 5 per 15 minutes
- API requests: 100 per minute per user
- Password resets: 3 per hour

### Audit Logs

**View Audit Trail:**
1. Navigate to **Security** → **Audit Logs**
2. Filter by:
   - User
   - Action type
   - Resource
   - Date range
   - IP address
3. Export logs for compliance

**Logged Actions:**
- User login/logout
- Password changes
- Permission changes
- Data modifications (create/update/delete)
- Configuration changes
- Payment transactions
- Failed login attempts

---

## Database Management

### Database Health

**Monitor Database:**
1. Navigate to **Settings** → **Database**
2. View metrics:
   - Total size
   - Table count (290+ tables)
   - Row counts
   - Index health
   - Query performance
   - Connection pool status

### Database Backup

**Automated Backups:**
- Frequency: Every 6 hours
- Retention: 30 days
- Storage: Encrypted cloud storage
- Includes: Full database dump

**Manual Backup:**
```bash
# Create backup
npm run db:backup

# Backup saved to: backups/salis-auto-YYYY-MM-DD-HHmmss.sql
```

**Restore from Backup:**
```bash
# List available backups
npm run db:list-backups

# Restore specific backup
npm run db:restore backups/salis-auto-2025-01-15-120000.sql
```

### Database Maintenance

**Optimize Database:**
```bash
# Analyze and optimize tables
npm run db:optimize

# Rebuild indexes
npm run db:reindex

# Vacuum database (PostgreSQL)
npm run db:vacuum
```

**Monitor Slow Queries:**
1. Navigate to **Database** → **Query Performance**
2. View slowest queries
3. Review execution plans
4. Add indexes as needed

### Data Migration

**Export Data:**
```bash
# Export specific table
npm run db:export --table=customers --format=csv

# Export all data
npm run db:export-all --format=json
```

**Import Data:**
```bash
# Import CSV
npm run db:import --table=customers --file=data.csv

# Validate before import
npm run db:import --validate --file=data.csv
```

---

## System Configuration

### Garage Configuration

**General Settings:**
1. Navigate to **Settings** → **Garage Settings**
2. Configure:
   - Garage Name
   - Address & Contact Info
   - Working Hours
   - Time Zone
   - Date Format
   - Default Currency

**Tax Configuration:**
1. Navigate to **Financial Settings** → **Tax**
2. Configure:
   - VAT/Sales Tax Rate
   - Tax Registration Number
   - ZATCA E-Invoicing (Saudi Arabia)
   - Tax Categories
   - Tax Exemptions

### Email Configuration

**SMTP Settings:**
1. Navigate to **Settings** → **Email Configuration**
2. Enter SMTP details:
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your-email@domain.com
   - Password: app-specific password
   - From Name: SALIS AUTO
   - From Email: noreply@salisauto.com

**Email Templates:**
1. Navigate to **Settings** → **Email Templates**
2. Customize templates:
   - Appointment Confirmations
   - Invoice Emails
   - Payment Receipts
   - Service Reminders
   - Welcome Emails
   - Password Resets

### SMS Configuration

**Twilio Setup:**
1. Navigate to **Settings** → **Integrations** → **Twilio**
2. Enter credentials (from Secrets):
   - Account SID
   - Auth Token
   - Phone Number
3. Test connection
4. Configure SMS templates

### Payment Gateway Configuration

**Stripe Setup:**
1. Navigate to **Settings** → **Integrations** → **Stripe**
2. Enter API keys (from Secrets):
   - Publishable Key
   - Secret Key
3. Configure:
   - Accepted currencies
   - Payment methods (cards, wallets)
   - Webhook endpoint
4. Test in sandbox mode

**PayPal Setup:**
1. Navigate to **Settings** → **Integrations** → **PayPal**
2. Enter credentials
3. Configure webhooks
4. Test transactions

---

## Monitoring & Maintenance

### System Health Monitoring

**Dashboard Metrics:**
1. Navigate to **System Administration** → **Health**
2. Monitor:
   - Server CPU usage
   - Memory consumption
   - Disk space
   - Database connections
   - API response times
   - Error rates
   - Active users count

**Set Up Alerts:**
1. Configure thresholds:
   - CPU > 80%: Warning
   - Memory > 90%: Critical
   - Disk > 85%: Warning
   - Error rate > 5%: Critical
2. Alert destinations:
   - Email notifications
   - SMS alerts
   - Webhook to monitoring service

### Application Logs

**View Logs:**
```bash
# View all logs
tail -f logs/application.log

# View error logs only
grep ERROR logs/application.log

# View specific date
grep "2025-01-15" logs/application.log
```

**Log Levels:**
- **ERROR**: Critical errors requiring attention
- **WARN**: Warnings that should be investigated
- **INFO**: General information
- **DEBUG**: Detailed debugging info (dev only)

### Performance Monitoring

**Key Metrics to Track:**
- Average response time: < 200ms
- 95th percentile response time: < 500ms
- Error rate: < 0.1%
- Database query time: < 50ms
- API uptime: > 99.9%

**Tools:**
1. Built-in Performance Dashboard
2. Database slow query log
3. Application profiler
4. External monitoring (optional): New Relic, Datadog

---

## Backup & Recovery

### Backup Strategy

**Automated Backups:**
- **Database**: Every 6 hours
- **File uploads**: Daily incremental
- **Configuration**: On every change
- **Retention**: 30 days

**Backup Verification:**
```bash
# Test backup restore
npm run db:test-restore

# Verify backup integrity
npm run db:verify-backup --file=backup.sql
```

### Disaster Recovery

**Recovery Time Objectives:**
- **RTO** (Recovery Time): < 4 hours
- **RPO** (Recovery Point): < 6 hours (last backup)

**Recovery Procedure:**
1. Assess incident severity
2. Notify stakeholders
3. Isolate affected systems
4. Restore from latest backup
5. Verify data integrity
6. Test critical functions
7. Resume normal operations
8. Post-mortem analysis

### Data Export for Migration

**Full System Export:**
```bash
# Export everything
npm run system:export-all

# Creates:
# - database-export.sql
# - uploads-backup.tar.gz
# - config-export.json
# - users-export.csv
```

---

## Performance Optimization

### Database Optimization

**Indexing Strategy:**
```sql
-- Frequently queried columns
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
CREATE INDEX idx_jobcards_status ON job_cards(status);
CREATE INDEX idx_invoices_date ON invoices(created_at DESC);
```

**Query Optimization:**
1. Use database query analyzer
2. Identify slow queries
3. Add appropriate indexes
4. Optimize JOIN operations
5. Use query caching where appropriate

### Application Optimization

**Caching Strategy:**
- **User Sessions**: In-memory (Redis)
- **Static Assets**: CDN
- **API Responses**: 5-minute cache for read-only
- **Database Queries**: Selective caching

**Enable Caching:**
```bash
# Configure Redis (if available)
REDIS_URL=redis://localhost:6379

# Enable query cache
ENABLE_QUERY_CACHE=true
CACHE_TTL=300
```

### Server Optimization

**Scaling Options:**

**Vertical Scaling:**
- Increase CPU cores
- Add more RAM
- Faster SSD storage

**Horizontal Scaling:**
- Load balancer
- Multiple application servers
- Database read replicas
- Separate WebSocket server

---

## Integration Management

### Connected Integrations

Manage integrations at **Settings** → **Integrations**:

1. **OpenAI (AI Features)**
   - Status: Connected/Disconnected
   - Usage: API calls per month
   - Cost tracking
   - Rate limits

2. **Twilio (SMS/Calls)**
   - Status
   - Phone numbers
   - Message history
   - Call logs

3. **Stripe (Payments)**
   - Status
   - Webhook health
   - Transaction volume
   - Settlement status

4. **Google (Calendar/Gmail)**
   - Status
   - Calendar sync
   - Email sending
   - OAuth status

### Webhook Management

**Configure Webhooks:**
1. Navigate to **Integrations** → **Webhooks**
2. Add webhook URL
3. Select events to trigger
4. Test webhook delivery
5. Monitor webhook logs

---

## Troubleshooting

### Common Admin Tasks

**Clear Application Cache:**
```bash
npm run cache:clear
```

**Rebuild Indexes:**
```bash
npm run db:reindex
```

**Fix Permissions:**
```bash
npm run rbac:sync
```

**Reset Demo Data:**
```bash
npm run db:seed --force
```

---

## Compliance & Auditing

### GDPR Compliance

**Data Export (User Request):**
1. Navigate to user profile
2. Click **"Export User Data"**
3. Generates complete data package
4. Includes: profile, vehicles, history, invoices

**Data Deletion (Right to be Forgotten):**
1. Navigate to user profile
2. Click **"Delete User Data"**
3. Anonymizes personal data
4. Keeps transaction records (required by law)
5. Logs deletion in audit trail

### Financial Auditing

**Export Audit Reports:**
1. Navigate to **Reports** → **Audit Reports**
2. Select date range
3. Choose report type:
   - All Transactions
   - Payment History
   - Refunds & Credits
   - User Actions
4. Export as PDF/Excel

---

## Best Practices

1. **Regular Maintenance:**
   - Weekly: Review audit logs
   - Monthly: Database optimization
   - Quarterly: Security audit
   - Annually: Disaster recovery test

2. **Security:**
   - Change default passwords immediately
   - Enable 2FA for all admins
   - Regular security updates
   - Monitor failed login attempts

3. **Performance:**
   - Monitor system health daily
   - Optimize slow queries
   - Clean up old data
   - Review and optimize indexes

4. **Backup:**
   - Test backup restoration monthly
   - Verify backup integrity
   - Store backups off-site
   - Document recovery procedures

---

## Support & Resources

- [Security & Compliance Guide](SECURITY-COMPLIANCE-GUIDE.md)
- [Database Schema Guide](DATABASE-SCHEMA-GUIDE.md)
- [API Documentation](API-DOCUMENTATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md)

---

**System Administration Best Practices Applied!** 🔧✨
