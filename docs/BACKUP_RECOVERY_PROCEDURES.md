# SALIS AUTO - Backup & Recovery Procedures

**Version:** 1.0  
**Last Updated:** November 3, 2025  
**Review Frequency:** Monthly

---

## Backup Strategy

### Automated Backups

**Neon PostgreSQL (Primary Database):**
- **Frequency:** Continuous (point-in-time recovery)
- **Retention:** 7 days (free tier) / 30 days (paid tier)
- **Recovery Window:** Any point in the last N days
- **Storage:** Neon cloud storage (encrypted)
- **Verification:** Automated integrity checks

**Configuration:**
```
Location: Neon Dashboard → Database → Backups
Schedule: Automatic (continuous WAL streaming)
Encryption: AES-256 at rest
```

### Manual Backups

**When to Create Manual Backups:**
- Before major database migrations
- Before deploying significant changes
- Before bulk data operations
- Monthly archival backups
- Before system upgrades

**How to Create:**

```bash
# Export full database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Export with compression
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz

# Export specific tables
pg_dump $DATABASE_URL -t customers -t vehicles > critical_data.sql

# Export schema only
pg_dump $DATABASE_URL --schema-only > schema_backup.sql
```

**Storage Locations:**
1. **Primary:** Neon automatic backups
2. **Secondary:** Manual exports to AWS S3 / Google Cloud Storage
3. **Tertiary:** Local secure storage (encrypted)

---

## Backup Schedule

| Type | Frequency | Retention | Owner |
|------|-----------|-----------|-------|
| Continuous (Neon) | Real-time | 7-30 days | Automatic |
| Daily Manual | Daily | 90 days | DevOps |
| Weekly Archive | Weekly | 1 year | Admin |
| Monthly Archive | Monthly | 3 years | Compliance |
| Pre-Migration | As needed | Until verified | DevOps |

---

## Recovery Procedures

### Scenario 1: Recent Data Loss (Within Recovery Window)

**Use Case:** Accidental deletion, corrupted data

**Steps:**

1. **Identify Recovery Point:**
   ```
   - Determine exact time before data loss
   - Example: "Yesterday at 3:00 PM"
   ```

2. **Via Neon Dashboard:**
   ```
   1. Go to Neon Dashboard
   2. Select your database
   3. Click "Backups & Recovery"
   4. Choose "Point-in-time Recovery"
   5. Select timestamp: [2025-11-02 15:00:00]
   6. Click "Restore to new branch"
   7. Wait for restoration (5-10 minutes)
   8. Verify data in new branch
   ```

3. **Update Application:**
   ```
   1. Update DATABASE_URL to new branch
   2. Restart application
   3. Verify functionality
   4. Monitor for issues
   ```

4. **Verification:**
   - [ ] Data integrity confirmed
   - [ ] Application connects successfully
   - [ ] Critical functions tested
   - [ ] Users notified (if downtime)

**Recovery Time Objective (RTO):** 15-30 minutes  
**Recovery Point Objective (RPO):** Up to 1 minute

---

### Scenario 2: Complete Database Failure

**Use Case:** Database server failure, corruption

**Steps:**

1. **Assess Situation:**
   - Check Neon status dashboard
   - Verify it's not a connection issue
   - Confirm database is inaccessible

2. **Create New Database:**
   ```bash
   # Provision new Neon database
   # (via Neon dashboard or CLI)
   ```

3. **Restore from Latest Backup:**
   ```bash
   # If using Neon automatic backup
   # Use point-in-time recovery to latest timestamp
   
   # If using manual backup
   psql $NEW_DATABASE_URL < backup_latest.sql
   ```

4. **Update Application:**
   ```bash
   # Update DATABASE_URL in Replit Secrets
   # Restart application workflow
   npm run dev
   ```

5. **Verification:**
   - [ ] All tables present
   - [ ] Data counts match expectations
   - [ ] Foreign key constraints intact
   - [ ] Application functions normally

**RTO:** 1-2 hours  
**RPO:** Last backup (ideally < 24 hours)

---

### Scenario 3: Partial Data Corruption

**Use Case:** Specific table corrupted, application still running

**Steps:**

1. **Identify Affected Tables:**
   ```sql
   SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
   ```

2. **Restore Specific Tables:**
   ```bash
   # From manual backup
   pg_restore -t customers -t vehicles backup_latest.sql | psql $DATABASE_URL
   
   # Or from point-in-time
   # Create temp database with recovery point
   # Export specific tables
   # Import into production
   ```

3. **Verify Data:**
   ```sql
   SELECT COUNT(*) FROM customers;
   SELECT COUNT(*) FROM vehicles;
   -- Compare with expected counts
   ```

**RTO:** 30 minutes - 1 hour  
**RPO:** Last backup

---

### Scenario 4: Accidental Data Deletion

**Use Case:** User accidentally deletes records

**Steps:**

1. **Stop Further Damage:**
   - Immediately identify what was deleted
   - Prevent additional operations if possible

2. **Recovery Options:**

   **Option A: Point-in-time Recovery**
   ```
   1. Determine time before deletion
   2. Use Neon PITR to that timestamp
   3. Create new branch
   4. Export deleted records
   5. Import into production
   ```

   **Option B: From Manual Backup**
   ```bash
   # Restore to temporary database
   psql $TEMP_DB_URL < backup_latest.sql
   
   # Export deleted records
   psql $TEMP_DB_URL -c "COPY (SELECT * FROM customers WHERE id IN (...)) TO STDOUT" > deleted_records.csv
   
   # Import back to production
   psql $DATABASE_URL -c "COPY customers FROM STDIN" < deleted_records.csv
   ```

3. **Audit Log Check:**
   ```sql
   -- Check activity log
   SELECT * FROM activity_logs 
   WHERE entity_type = 'customer' 
   AND action = 'delete' 
   AND created_at > NOW() - INTERVAL '1 hour';
   ```

**RTO:** 15-30 minutes  
**RPO:** Real-time (via audit logs)

---

## Testing Procedures

### Quarterly Backup Testing

**Schedule:** 1st Monday of each quarter

**Test Checklist:**

1. **Restore Test:**
   - [ ] Restore latest automatic backup to test database
   - [ ] Verify table count matches production
   - [ ] Verify row counts match production
   - [ ] Test application connection
   - [ ] Run sample queries

2. **Recovery Speed Test:**
   - [ ] Time the restoration process
   - [ ] Document RTO achieved
   - [ ] Compare against target RTO

3. **Data Integrity:**
   - [ ] Run checksum verification
   - [ ] Verify foreign key constraints
   - [ ] Check for orphaned records

4. **Documentation:**
   - [ ] Update recovery time estimates
   - [ ] Document any issues encountered
   - [ ] Update procedures if needed

**Test Report Template:**
```
Date: [Date]
Tested By: [Name]
Backup Date: [Timestamp]
Restore Duration: [Minutes]
Data Integrity: ☐ Pass ☐ Fail
Issues: [Description]
```

---

## Backup Monitoring

### Daily Checks

- [ ] Verify Neon automatic backup completed
- [ ] Check backup size (should be consistent)
- [ ] Review any backup warnings/errors
- [ ] Monitor database disk usage

### Weekly Checks

- [ ] Verify manual backups completed
- [ ] Test sample restoration
- [ ] Review backup storage capacity
- [ ] Update backup documentation

### Monthly Checks

- [ ] Full restoration drill
- [ ] Review retention policies
- [ ] Archive old backups
- [ ] Update disaster recovery plan

---

## Backup Security

### Encryption

- ✅ Database backups encrypted at rest (AES-256)
- ✅ Encrypted connections for backup transfer
- ⏳ Backup files encrypted before offsite storage

### Access Control

- Backup access limited to:
  - Database administrators
  - DevOps team
  - Automated backup systems

### Compliance

- GDPR: Customer data in backups handled per privacy policy
- Saudi Arabia: VAT/financial data retention per regulations
- Industry: Maintain backups per compliance requirements (3 years)

---

## Disaster Recovery Plan

### Critical Scenarios

**1. Replit Platform Failure:**
- **Plan:** Migrate to alternative hosting
- **RTO:** 4-8 hours
- **Requirements:** 
  - Database backup accessible
  - Code in Git repository
  - Environment variables documented

**2. Database Catastrophic Failure:**
- **Plan:** Restore from latest backup
- **RTO:** 1-2 hours
- **Requirements:**
  - Recent backup available
  - Backup integrity verified
  - Recovery procedure tested

**3. Region Failure:**
- **Plan:** Failover to different region
- **RTO:** 2-4 hours
- **Requirements:**
  - Multi-region backup storage
  - Geographic redundancy
  - Failover documentation

### Recovery Team

**Roles:**
- **Incident Commander:** [Name]
- **Database Lead:** [Name]
- **Application Lead:** [Name]
- **Communications Lead:** [Name]

**Contact Tree:**
```
Incident Commander
├── Database Lead → DevOps Team
├── Application Lead → Development Team
└── Communications → Stakeholders
```

---

## Backup Costs & Storage

### Current Storage

- **Neon Automatic:** Included in plan
- **Manual Backups:** ~10GB/month (compressed)
- **Archive Storage:** ~50GB/year

### Cost Optimization

- Compress old backups (gzip)
- Archive to cheaper storage tiers
- Delete backups beyond retention period
- Use incremental backups for large databases

---

## Appendix: Common Commands

### Backup Commands

```bash
# Full database backup
pg_dump $DATABASE_URL > full_backup.sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > full_backup.sql.gz

# Backup with timestamp
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump $DATABASE_URL --schema-only > schema.sql

# Data only
pg_dump $DATABASE_URL --data-only > data.sql

# Specific tables
pg_dump $DATABASE_URL -t customers -t vehicles > critical_tables.sql
```

### Restore Commands

```bash
# Restore full database
psql $DATABASE_URL < full_backup.sql

# Restore compressed backup
gunzip < full_backup.sql.gz | psql $DATABASE_URL

# Restore specific table
psql $DATABASE_URL -c "TRUNCATE customers CASCADE;"
pg_restore -t customers backup.sql | psql $DATABASE_URL

# Restore with verbose output
psql $DATABASE_URL < backup.sql -v ON_ERROR_STOP=1
```

### Verification Commands

```bash
# Count records
psql $DATABASE_URL -c "SELECT COUNT(*) FROM customers;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# List all tables
psql $DATABASE_URL -c "\dt"

# Check table sizes
psql $DATABASE_URL -c "SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) FROM information_schema.tables WHERE table_schema = 'public' ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;"
```

---

## Changelog

- **2025-11-03:** Initial documentation created
- **Next Review:** 2025-12-01

**Document Owner:** DevOps Team  
**Emergency Contact:** devops@salis-auto.com
