# SALIS-GMS — Data Flow

## Request Lifecycle (REST)

A typical authenticated API request follows this path:

```
Client browser
  └─ fetch('/api/job-cards', { credentials: 'include' })
       |
       v
Express middleware stack (server/index.ts)
  1. requestId middleware          -- assigns X-Request-ID
  2. express.json()                -- parses JSON body
  3. express-rate-limit            -- checks rate limit bucket
  4. Security headers middleware   -- sets X-Frame-Options, etc.
  5. Request logging middleware    -- records start time
       |
       v
Route match in Express router (server/routes/index.ts)
  - Modular handler checked first (if path is extracted)
  - Legacy monolith checked if no modular match
       |
       v
Route handler middleware chain
  1. isAuthenticated               -- checks req.isAuthenticated() (Passport)
                                      → 401 if session absent or expired
  2. requireRole / requirePlan     -- checks role/plan entitlement (if applied)
                                      → 403 if insufficient privilege
  3. validate(schema)              -- Zod body validation (if applied)
                                      → 400 with field errors if invalid
  4. Route handler (async)
       |
       v
server/storage.ts                  -- Drizzle ORM query execution
  └─ db.select(...).from(table)... (or insert/update/delete)
       |
       v
@neondatabase/serverless           -- Neon PostgreSQL serverless driver
  └─ PostgreSQL over WebSocket connection
       |
       v
Response: res.json(data)           -- serialized to JSON
  └─ Request logger records: METHOD path status duration
```

### Error Path

Any thrown error in a route handler propagates to the global error handler in `server/index.ts`:
- HTTP 4xx errors return `{ message: "..." }` with the error message
- HTTP 5xx errors return `{ message: "Internal Server Error" }` in production (full message in dev)
- All errors are logged to stdout with stack trace in development

---

## Auth Flow (Passport.js Session + RBAC)

### Login

```
POST /api/login  { username, password }
  |
  v
Auth rate limiter (10 req / 15 min)
  |
  v
passport.authenticate('local')
  |
  v
LocalStrategy callback (server/auth.ts)
  ├── storage.getUserByUsername(username)
  ├── bcrypt.compare(password, user.passwordHash)
  └── done(null, user)  -- success
       |
       v
req.logIn(user)          -- serializes user.id to session
  |
  v
connect-pg-simple        -- writes session row to PostgreSQL sessions table
  |
  v
Response: { user: { id, username, role, garageId, ... } }
  Cookie: connect.sid (httpOnly, secure in production)
```

### Subsequent Requests

```
Request with Cookie: connect.sid
  |
  v
express-session          -- reads session from PostgreSQL
  |
  v
passport.session()       -- calls deserializeUser(id)
  └── storage.getUser(id) → req.user
  |
  v
isAuthenticated check    -- req.isAuthenticated() → true
  |
  v
requireRole / requirePlan (if applicable)
  └── req.user.role, req.user.garageId checked against RBAC config
```

### RBAC Configuration

Roles are defined in `server/rbac-config.ts`. Permissions are checked either via:
- `requireRole(allowedRoles)` middleware — coarse role check
- `server/rbac-middleware.ts` factory functions — fine-grained permission check (e.g., `canManageInventory`, `canViewPayroll`)

Garage multi-tenancy: all queries in `server/storage.ts` filter by `req.user.garageId` for tenant isolation.

---

## TanStack Query — Client State Management

All server state on the client is managed through TanStack Query v5. There is no separate client-side store.

### Query Pattern

```typescript
// Inside a page component (e.g., client/src/pages/JobCards.tsx)
const { data: jobCards, isLoading, error } = useQuery({
  queryKey: ['/api/job-cards'],
  queryFn: () => fetch('/api/job-cards', { credentials: 'include' }).then(r => r.json()),
});
```

The `queryClient` instance (in `client/src/lib/queryClient.ts`) manages:
- Cache with default stale time
- Request deduplication across components
- Background refetching on window focus
- Retry on transient failures

### Mutation Pattern

```typescript
const mutation = useMutation({
  mutationFn: (data) => fetch('/api/job-cards', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] }),
});
```

Cache invalidation after mutations triggers automatic refetch of affected query keys.

---

## WebSocket Real-Time Paths

### Connection Establishment

```
Client (App.tsx or component)
  └─ new WebSocket('ws://host/ws')
       |
       v
server/websocket.ts
  └─ server.on('upgrade', ...)   -- validates session cookie
  └─ wss.handleUpgrade(...)      -- completes WebSocket handshake
  └─ Client added to registry
```

### Chat Messages

```
Client sends: { type: 'chat', garageId, message, senderId }
  |
  v
WebSocket message handler (server/websocket.ts)
  └─ storage.saveChatMessage(...)
  └─ Broadcast to all clients in same garageId
  |
  v
Other clients receive: { type: 'chat', message, sender, timestamp }
  └─ UI updates in Chat.tsx page
```

### Notifications

```
Server-side event (e.g., job card status change)
  └─ workflow engine trigger OR direct service call
  |
  v
server/websocket.ts broadcast function
  └─ Send typed event to target clients (by userId or garageId)
  |
  v
Client Notifications.tsx
  └─ Receives message, updates notification badge count
```

### Service Bay Tracking

```
Technician updates job card status via POST /api/job-cards/:id
  |
  v
Route handler → storage.updateJobCard(...)
  └─ After DB write: emit bay-update event via WebSocket broadcast
  |
  v
Dashboard / ServiceBay page on client
  └─ Receives bay-update, re-renders bay status in real time
```

---

## Workflow Engine Event Flow

The `server/engine/` module provides an internal event bus that decouples cross-module side effects:

```
Route handler completes DB write
  └─ Emits domain event to event-bus.ts (e.g., JOB_CARD_CLOSED)
       |
       v
event-bus.ts routes event to registered handlers (triggers.ts)
  ├─ Trigger: create draft invoice when job card closes
  ├─ Trigger: send customer notification
  └─ Trigger: update technician availability

scheduled-checks.ts (setInterval-based)
  └─ Runs every N minutes
  ├─ Check overdue appointments → emit APPOINTMENT_OVERDUE
  └─ Check service reminders due → emit REMINDER_DUE
       |
       v
Handlers in triggers.ts
  └─ storage.createNotification(...)
  └─ services/notification-center.ts dispatch
```

State machines in `server/engine/state-machines.ts` enforce valid status transitions (e.g., a job card cannot move from CLOSED back to IN_PROGRESS without explicit reopening logic), preventing invalid state mutations at the engine level.
