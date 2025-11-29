# SALIS AUTO - Audit Trail & Action History Guide

## Overview

SALIS AUTO implements comprehensive audit trail and action history tracking across all 141+ modules. This ensures complete accountability, regulatory compliance, and the ability to trace every change made within the system.

---

## Audit Trail Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUDIT TRAIL SYSTEM                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Action    │────▶│   Capture   │────▶│   Store     │────▶│   Query     │
│   Trigger   │     │   Details   │     │   Record    │     │   & Report  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
  User Action        Metadata           PostgreSQL           Analytics
  API Request        Timestamp          Indexed              Exports
  System Event       Context            Searchable           Compliance
```

---

## Tracked Events

### User Actions

| Event Type | Description | Data Captured |
|------------|-------------|---------------|
| `LOGIN` | User authentication | IP, device, timestamp, success/fail |
| `LOGOUT` | Session end | Duration, reason |
| `CREATE` | Record creation | Entity type, ID, full payload |
| `UPDATE` | Record modification | Before/after values, changed fields |
| `DELETE` | Record deletion | Soft delete marker, full record |
| `VIEW` | Sensitive data access | Entity type, ID, user |
| `EXPORT` | Data export | Format, record count, filters |
| `PRINT` | Document print | Document type, ID |

### System Events

| Event Type | Description | Data Captured |
|------------|-------------|---------------|
| `WORKFLOW_START` | Process initiated | Workflow type, initiator |
| `WORKFLOW_COMPLETE` | Process completed | Duration, outcome |
| `NOTIFICATION_SENT` | Alert dispatched | Type, recipient, content |
| `PAYMENT_PROCESSED` | Financial transaction | Amount, method, status |
| `INTEGRATION_CALL` | External API | Service, endpoint, response |
| `BACKUP_CREATED` | Data backup | Size, duration, location |
| `ERROR` | System error | Stack trace, context |

---

## Database Schema

### Action History Table

```sql
CREATE TABLE action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID NOT NULL REFERENCES garages(id),
  user_id UUID REFERENCES users(id),
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  
  -- Context
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  
  -- Tracking
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexing
  INDEX idx_action_history_garage (garage_id),
  INDEX idx_action_history_user (user_id),
  INDEX idx_action_history_entity (entity_type, entity_id),
  INDEX idx_action_history_date (created_at)
);
```

### Audit Log Entry Structure

```typescript
interface AuditLogEntry {
  id: string;
  garageId: string;
  userId: string | null;
  
  // Action
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  entityType: string;  // 'job_card', 'invoice', 'customer', etc.
  entityId: string | null;
  
  // Details
  description: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  metadata: Record<string, any>;
  
  // Context
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  
  // Timestamp
  createdAt: Date;
}
```

---

## Implementation Patterns

### Backend Logging

```typescript
// server/utils/audit.ts
import { db } from '../db';
import { actionHistory } from '@shared/schema';

export async function logAction(params: {
  garageId: string;
  userId: string | null;
  actionType: string;
  entityType: string;
  entityId?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  req?: Express.Request;
}) {
  await db.insert(actionHistory).values({
    garageId: params.garageId,
    userId: params.userId,
    actionType: params.actionType,
    entityType: params.entityType,
    entityId: params.entityId,
    description: params.description,
    oldValues: params.oldValues,
    newValues: params.newValues,
    metadata: params.metadata,
    ipAddress: params.req?.ip,
    userAgent: params.req?.headers['user-agent'],
    sessionId: params.req?.sessionID,
  });
}
```

### Route Integration

```typescript
// Example: Job Card Update
app.patch('/api/job-cards/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Get current values
  const oldJobCard = await storage.getJobCard(id);
  
  // Perform update
  const newJobCard = await storage.updateJobCard(id, updates);
  
  // Log action
  await logAction({
    garageId: req.user.garageId,
    userId: req.user.id,
    actionType: 'UPDATE',
    entityType: 'job_card',
    entityId: id,
    description: `Updated job card ${oldJobCard.jobNumber}`,
    oldValues: oldJobCard,
    newValues: newJobCard,
    req,
  });
  
  res.json(newJobCard);
});
```

---

## Querying Audit Logs

### API Endpoints

```typescript
// Get audit logs for entity
GET /api/audit-logs?entityType=job_card&entityId=xxx

// Get user activity
GET /api/audit-logs?userId=xxx&from=2025-01-01&to=2025-01-31

// Get all actions by type
GET /api/audit-logs?actionType=DELETE&limit=100

// Search descriptions
GET /api/audit-logs?search=invoice&from=2025-01-01
```

### Response Format

```json
{
  "data": [
    {
      "id": "abc-123",
      "actionType": "UPDATE",
      "entityType": "job_card",
      "entityId": "xyz-789",
      "description": "Updated job card JC-2025-001",
      "user": {
        "id": "user-456",
        "fullName": "Ahmed Hassan",
        "role": "service_advisor"
      },
      "changes": {
        "status": {
          "from": "in_progress",
          "to": "completed"
        },
        "laborCost": {
          "from": 500,
          "to": 750
        }
      },
      "createdAt": "2025-11-29T10:30:00Z",
      "ipAddress": "192.168.1.100"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250
  }
}
```

---

## Audit Trail UI

### Viewing Action History

Location: `/action-history` or entity-specific history tabs

**Features:**
- Filterable by date range, user, action type, entity
- Searchable descriptions
- Expandable change details (before/after)
- Export to PDF/Excel
- Real-time updates

### Entity History View

Each entity (job card, invoice, customer, etc.) has a "History" tab showing:
- Timeline of all changes
- Who made each change
- What was changed (diff view)
- When it happened

---

## Compliance Features

### Data Retention

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Financial records | 7 years | Tax compliance |
| Customer data | 5 years post-inactive | GDPR/local laws |
| Login history | 2 years | Security audit |
| System events | 1 year | Performance analysis |

### Regulatory Support

| Regulation | Feature |
|------------|---------|
| GDPR | Data access logs, deletion tracking |
| ZATCA | Invoice audit trail, e-invoicing logs |
| SOX | Financial transaction history |
| PCI-DSS | Payment data access logs |

### Export Formats

- **PDF**: Formatted reports for auditors
- **Excel**: Filterable spreadsheets
- **JSON**: Machine-readable logs
- **CSV**: Data analysis

---

## Security Considerations

### Access Control

| Role | Permissions |
|------|-------------|
| Super Admin | Full access to all logs |
| Garage Admin | Garage-specific logs only |
| Manager | Department logs only |
| Staff | Own actions only |

### Data Protection

- Audit logs are **immutable** (no DELETE allowed)
- Sensitive data (passwords, tokens) are **never** logged
- PII is **masked** in certain views
- Access to logs is itself **audited**

### Integrity

- Each entry has a checksum
- Sequential ID verification
- Timestamp validation
- Foreign key constraints

---

## Blockchain Integration

For critical records, SALIS AUTO offers blockchain-backed audit trails:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Standard   │────▶│  Blockchain │────▶│  Verified   │
│  Audit Log  │     │  Record     │     │  History    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Immutable  │
                    │  Hash Chain │
                    └─────────────┘
```

**Blockchain-backed entities:**
- Vehicle service history
- Smart contracts
- Payment records
- Warranty claims

---

## Best Practices

### For Developers

1. **Always log before & after** for UPDATE operations
2. **Include context** (req object) for IP/user-agent tracking
3. **Use descriptive messages** that are human-readable
4. **Don't log sensitive data** (passwords, tokens, full card numbers)
5. **Log at the right level** (not every GET request)

### For Administrators

1. **Review logs regularly** for suspicious activity
2. **Set up alerts** for critical actions (DELETE, bulk exports)
3. **Archive old logs** according to retention policy
4. **Test audit queries** before compliance audits
5. **Document access** for external auditors

---

## Related Documentation

- [Security Audit Checklist](./SECURITY_AUDIT_CHECKLIST.md)
- [Backup & Recovery Procedures](./BACKUP_RECOVERY_PROCEDURES.md)
- [RBAC Documentation](../RBAC-DOCUMENTATION.md)
- [Monitoring & Logging Guide](./MONITORING_LOGGING_GUIDE.md)

---

*Last Updated: November 2025*
*SALIS AUTO v1.0 - Comprehensive Audit Trail System*
