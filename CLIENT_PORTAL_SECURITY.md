# Client Portal Security Notice

## ⚠️ CRITICAL: Production Deployment Requirements

### Current Implementation Status
The client portal is **DEMONSTRATION/PROTOTYPE ONLY** and requires critical security updates before production use.

## Critical Security Issue

### Problem: Client-Side Data Filtering
The following API endpoints return ALL customer data without server-side scoping:

- `/api/vehicles` - Returns ALL vehicles from all customers
- `/api/appointments` - Returns ALL appointments  
- `/api/invoices` - Returns ALL invoices
- `/api/job-cards` - Returns ALL job cards

**Risk Level**: CRITICAL - Any authenticated customer can enumerate and access other customers' private data.

### Current Workaround
Client portal pages filter data on the frontend:
```javascript
const myVehicles = vehicles.filter((v) => v.customerId === user?.id);
```

**This is insufficient** - The raw data is still transmitted to the client and can be intercepted.

## Production Requirements

### 1. Implement Server-Side Customer Scoping

Create customer-scoped endpoints that ONLY return data for the authenticated customer:

```typescript
// ✅ CORRECT - Server-side scoped
app.get('/api/customers/:customerId/vehicles', isAuthenticated, async (req, res) => {
  const { customerId } = req.params;
  
  // Verify the authenticated user matches the requested customerId
  if (req.user.id !== customerId && req.user.userType !== 'admin') {
    return res.status(403).json({ message: "Unauthorized" });
  }
  
  const vehicles = await storage.getCustomerVehicles(customerId);
  res.json(vehicles);
});

// ❌ WRONG - Returns all data
app.get('/api/vehicles', isAuthenticated, async (req, res) => {
  const vehicles = await storage.getVehicles();
  res.json(vehicles);
});
```

### 2. Required Endpoint Updates

| Resource | Current Endpoint | Required Customer-Scoped Endpoint |
|----------|-----------------|----------------------------------|
| Vehicles | `/api/vehicles` | `/api/customers/:id/vehicles` ✅ (already exists) |
| Appointments | `/api/appointments` | `/api/customers/:id/appointments` |
| Invoices | `/api/invoices` | `/api/customers/:id/invoices` |
| Job Cards | `/api/job-cards` | `/api/customers/:id/job-cards` |

### 3. Authorization Middleware

Add authorization checks to all customer-scoped routes:

```typescript
function authorizeCustomer(req: any, res: any, next: any) {
  const { customerId } = req.params;
  
  // Only allow access if:
  // 1. User is requesting their own data
  // 2. User is an admin/manager
  if (req.user.id !== customerId && !['admin', 'manager'].includes(req.user.userType)) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
}

// Use it:
app.get('/api/customers/:customerId/vehicles', isAuthenticated, authorizeCustomer, handler);
```

### 4. Storage Layer Updates

Update storage methods to enforce customer scoping at the database query level:

```typescript
// server/storage.ts
async getCustomerAppointments(customerId: string): Promise<Appointment[]> {
  return await db.select()
    .from(appointments)
    .where(eq(appointments.customerId, customerId))
    .orderBy(desc(appointments.appointmentDate));
}

async getCustomerInvoices(customerId: string): Promise<Invoice[]> {
  return await db.select()
    .from(invoices)
    .where(eq(invoices.customerId, customerId))
    .orderBy(desc(invoices.createdAt));
}
```

### 5. Frontend Updates

Update all client portal pages to use customer-scoped endpoints:

```typescript
// ✅ CORRECT
const { data: vehicles } = useQuery({
  queryKey: ["/api/customers", user?.id, "vehicles"],
  enabled: !!user?.id,
});

// ❌ WRONG
const { data: vehicles } = useQuery({
  queryKey: ["/api/vehicles"],
  enabled: !!user?.id,
});
```

## Implementation Status

### ✅ Already Implemented (Secure)
- Service Reminders: `/api/customers/:customerId/service-reminders`
- Service Chat: `/api/job-cards/:jobCardId/chat`
- Service Reviews: `/api/customers/:customerId/reviews`
- Service Signatures: `/api/customers/:customerId/signatures`
- Customer Vehicles: `/api/customers/:customerId/vehicles`

### ❌ Requires Implementation (Insecure)
- Appointments: Still using `/api/appointments` with client-side filtering
- Invoices: Still using `/api/invoices` with client-side filtering
- Job Cards: Still using `/api/job-cards` with client-side filtering

## Testing Security

Before production deployment, verify:

1. **Test with multiple customer accounts**
   - Create Customer A and Customer B
   - Log in as Customer A
   - Verify Customer A CANNOT see Customer B's data in API responses

2. **API Response Verification**
   - Use browser DevTools Network tab
   - Check actual API response payloads
   - Confirm only customer's own data is returned

3. **Authorization Testing**
   - Try accessing `/api/customers/{OTHER_CUSTOMER_ID}/vehicles`
   - Should return 403 Forbidden

## Migration Path

1. **Create customer-scoped storage methods** (as shown above)
2. **Add new customer-scoped API routes** with authorization
3. **Update frontend** to use new endpoints
4. **Add authorization middleware** to all routes
5. **Remove or deprecate** old insecure endpoints
6. **Test thoroughly** with multiple customer accounts
7. **Security audit** before production deployment

## Current Features Status

The client portal includes these features (all need security updates):

1. ✅ **Service History** - View completed job cards
2. ✅ **E-Signature** - Digital signature capture for approvals
3. ✅ **Service Reminders** - Custom maintenance reminders (SECURE)
4. ✅ **Live Tracking** - Real-time service progress updates
5. ✅ **Review & Chat** - Customer reviews and live chat (SECURE)

## Summary

**DO NOT deploy to production** without implementing server-side customer scoping for all endpoints. The current implementation is suitable for:
- Development and testing
- UI/UX demonstrations
- Proof of concept

For production use, all data access MUST be verified server-side before returning to the client.
