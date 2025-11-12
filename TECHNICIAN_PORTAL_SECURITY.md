# Technician Portal Security Notice

## ⚠️ CRITICAL: Production Deployment Requirements

### Current Implementation Status
The technician portal is **DEMONSTRATION/PROTOTYPE ONLY** and requires critical security updates before production use.

## Critical Security Issues

### Problem 1: Client-Side Data Filtering
The following API endpoints return ALL job cards without server-side scoping:

- `/api/job-cards` - Returns ALL job cards from all technicians

**Risk Level**: CRITICAL - Any authenticated technician can enumerate and access other technicians' job cards.

### Current Workaround
Technician portal pages filter data on the frontend:
```typescript
const jobCards = allJobCards?.filter((job) => job.assignedTechnicianId === user?.id);
```

**This is insufficient** - The raw data is still transmitted to the client and can be intercepted.

### Problem 2: Missing API Endpoints
- `/api/time-clock` - Does not exist, Time Clock page will error
- Photo/video upload endpoints - Not implemented

## Production Requirements

### 1. Implement Server-Side Technician Scoping

Create technician-scoped endpoints that ONLY return data for the authenticated technician:

```typescript
// ✅ CORRECT - Server-side scoped
app.get('/api/technicians/:technicianId/job-cards', isAuthenticated, async (req, res) => {
  const { technicianId } = req.params;
  
  // Verify the authenticated user matches the requested technicianId
  if (req.user.id !== technicianId && req.user.userType !== 'admin') {
    return res.status(403).json({ message: "Unauthorized" });
  }
  
  const jobCards = await storage.getTechnicianJobCards(technicianId);
  res.json(jobCards);
});

// ❌ WRONG - Returns all data
app.get('/api/job-cards', isAuthenticated, async (req, res) => {
  const jobCards = await storage.getJobCards();
  res.json(jobCards);
});
```

### 2. Required Endpoint Updates

| Resource | Current Endpoint | Required Technician-Scoped Endpoint |
|----------|-----------------|-------------------------------------|
| Job Cards | `/api/job-cards` (all) | `/api/technicians/:id/job-cards` |
| Time Clock | Not implemented | `/api/technicians/:id/time-clock` |
| Job Media | Not implemented | `/api/job-cards/:jobId/media` |

### 3. Authorization Middleware

Add authorization checks to all technician-scoped routes:

```typescript
function authorizeTechnician(req: any, res: any, next: any) {
  const { technicianId } = req.params;
  
  // Only allow access if:
  // 1. User is requesting their own data
  // 2. User is an admin/manager
  if (req.user.id !== technicianId && !['admin', 'manager'].includes(req.user.userType)) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
}

// Use it:
app.get('/api/technicians/:technicianId/job-cards', isAuthenticated, authorizeTechnician, handler);
```

### 4. Storage Layer Updates

Update storage methods to enforce technician scoping at the database query level:

```typescript
// server/storage.ts
async getTechnicianJobCards(technicianId: string): Promise<JobCard[]> {
  return await db.select()
    .from(jobCards)
    .where(eq(jobCards.assignedTechnicianId, technicianId))
    .orderBy(desc(jobCards.createdAt));
}

async getTechnicianTimeClock(technicianId: string): Promise<TimeClockEntry[]> {
  return await db.select()
    .from(timeClockEntries)
    .where(eq(timeClockEntries.technicianId, technicianId))
    .orderBy(desc(timeClockEntries.clockIn));
}
```

### 5. Frontend Updates

Update all technician portal pages to use technician-scoped endpoints:

```typescript
// ✅ CORRECT
const { data: jobCards } = useQuery({
  queryKey: ["/api/technicians", user?.id, "job-cards"],
  enabled: !!user?.id,
});

// ❌ WRONG
const { data: jobCards } = useQuery({
  queryKey: ["/api/job-cards"],
  enabled: !!user?.id,
});
```

## Implementation Status

### ❌ Requires Implementation (Insecure)
- Job Cards: Still using `/api/job-cards` with client-side filtering
- Time Clock: Missing `/api/technicians/:id/time-clock` endpoint
- Job Media: Missing upload/download endpoints
- All job mutations: Not scoped to technician's assigned jobs

## Technician Portal Features

The technician portal includes these features (all need security updates):

1. **Dashboard** - Today's jobs and stats
2. **My Jobs** - Job card management with status updates
3. **Time Clock** - Clock in/out tracking (API missing)
4. **Parts Lookup** - Inventory search
5. **Job Documentation** - Photo/video uploads (API missing)
6. **Profile** - Skills, certifications, experience

## Testing Security

Before production deployment, verify:

1. **Test with multiple technician accounts**
   - Create Technician A and Technician B
   - Log in as Technician A
   - Verify Technician A CANNOT see Technician B's job cards in API responses

2. **API Response Verification**
   - Use browser DevTools Network tab
   - Check actual API response payloads
   - Confirm only technician's own assigned jobs are returned

3. **Authorization Testing**
   - Try accessing `/api/technicians/{OTHER_TECH_ID}/job-cards`
   - Should return 403 Forbidden

## Migration Path

1. **Create technician-scoped storage methods** (as shown above)
2. **Add new technician-scoped API routes** with authorization
3. **Implement Time Clock and Media APIs**
4. **Update frontend** to use new endpoints
5. **Add authorization middleware** to all routes
6. **Remove client-side filtering** once backend is ready
7. **Test thoroughly** with multiple technician accounts
8. **Security audit** before production deployment

## Summary

**DO NOT deploy to production** without implementing server-side technician scoping for all endpoints. The current implementation is suitable for:
- Development and testing
- UI/UX demonstrations
- Proof of concept

For production use, all data access MUST be verified server-side before returning to the client.
