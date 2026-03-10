# SALIS AUTO — Frontend Architecture Guide

**Document Type:** Technical Architecture  
**Audience:** Frontend Developers  
**Version:** 14.0.0  

---

## Overview

The SALIS AUTO frontend is a single-page application (SPA) built with React 18, TypeScript, and Vite. It communicates with the Express backend via REST API and WebSocket.

---

## Technology Stack

```
React 18               — UI framework
TypeScript             — Type safety
Vite 5                 — Build tool + dev server
Wouter                 — Client-side routing (lightweight)
TanStack Query v5      — Server state management
react-hook-form        — Form management
Zod                    — Schema validation
shadcn/ui              — Base component library
Radix UI               — Accessible primitives
Tailwind CSS           — Utility-first CSS
Recharts               — Data visualization
react-big-calendar     — Calendar (workshop scheduling)
@dnd-kit               — Drag-and-drop
react-i18next          — Internationalization
```

---

## Project Structure

```
client/
├── index.html                    # HTML entry point
└── src/
    ├── main.tsx                  # React DOM root
    ├── App.tsx                   # Router + AuthProvider
    ├── index.css                 # Global CSS + CSS variables
    ├── components/
    │   ├── ui/                   # shadcn/ui components (30+)
    │   ├── Layout.tsx            # Main sidebar layout
    │   ├── layouts/              # Page archetype wrappers (7)
    │   └── ArabicLanguageToggle.tsx
    ├── hooks/
    │   ├── useAuth.tsx           # Authentication context
    │   └── use-toast.ts         # Toast notifications
    ├── lib/
    │   ├── queryClient.ts        # TanStack Query + fetch setup
    │   └── utils.ts             # cn() and utilities
    ├── pages/                    # 235+ page components
    └── i18n/
        ├── index.ts             # i18n config
        └── locales/
            ├── en.json          # English (fallback)
            └── ar.json          # Arabic (2000+ keys)
```

---

## Authentication Pattern

```typescript
// App.tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>        {/* Provides useAuth() hook */}
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <Route component={ProtectedRoutes} />
          </Switch>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

```typescript
// hooks/useAuth.tsx
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials) => apiRequest('POST', '/api/login', credentials),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/user'] }),
  });

  return { user, isLoading, login: loginMutation.mutate, ... };
}
```

---

## Routing Pattern

SALIS AUTO uses **Wouter** for lightweight client-side routing:

```typescript
// App.tsx Router structure
<Router>
  <Switch>
    {/* Public routes (no auth) */}
    <Route path="/login" component={Login} />
    <Route path="/register" component={Register} />
    <Route path="/track/:token" component={PublicTracking} />

    {/* Main layout (sidebar navigation) */}
    <Route path="/">
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/customers" component={Customers} />
          {/* 200+ routes */}
        </Switch>
      </Layout>
    </Route>

    {/* Specialized portal layouts */}
    <Route path="/technician-portal">
      <TechnicianLayout>
        <Switch>
          <Route path="/technician-portal" component={TechnicianDashboard} />
          {/* sub-routes */}
        </Switch>
      </TechnicianLayout>
    </Route>
  </Switch>
</Router>
```

---

## Data Fetching Pattern (TanStack Query)

```typescript
// Query — GET data
const { data: customers, isLoading, error } = useQuery({
  queryKey: ['/api/customers'],
  // queryFn is set globally in queryClient.ts to use fetch
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Hierarchical query key (for cache scoping)
const { data: vehicle } = useQuery({
  queryKey: ['/api/vehicles', vehicleId],
});
```

```typescript
// Mutation — POST/PATCH/DELETE
const createCustomerMutation = useMutation({
  mutationFn: (data: InsertCustomer) =>
    apiRequest('POST', '/api/customers', data),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    toast({ title: 'Customer created successfully' });
    setDialogOpen(false);
  },
  onError: (error) => {
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  },
});
```

---

## Form Pattern

```typescript
// 1. Define schema (shared with backend)
const insertCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(8, 'Invalid phone number'),
});

type CustomerFormData = z.infer<typeof insertCustomerSchema>;

// 2. Create form
function CustomerForm() {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  // 3. Submit handler
  const onSubmit = (data: CustomerFormData) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Customer name" {...field} />
              </FormControl>
              <FormMessage />  {/* Shows validation errors */}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createCustomerMutation.isPending}>
          {createCustomerMutation.isPending ? 'Saving...' : 'Save Customer'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## State Management Strategy

| State Type | Tool | When |
|-----------|------|------|
| Server state | TanStack Query | API data |
| Form state | react-hook-form | Form inputs |
| UI state | useState | Dialogs, toggles |
| Global auth | React Context | User session |
| URL state | Wouter | Route params |

---

## Internationalization (i18n)

```typescript
// Setup (client/src/i18n/index.ts)
i18n.use(initReactI18next).init({
  resources: { en: { translation: enJson }, ar: { translation: arJson } },
  lng: localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
});

// Usage in components
import { useTranslation } from 'react-i18next';

function Customers() {
  const { t } = useTranslation();
  return <h1>{t('customers.title', 'Customers')}</h1>;
}

// RTL toggle
document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
```

---

## WebSocket Connection (Real-Time Features)

```typescript
// Connect to WebSocket server
const ws = new WebSocket(`ws://${window.location.host}/ws/chat`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'chat_message':
      dispatch(addMessage(message));
      break;
    case 'bay_update':
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      break;
    case 'notification':
      toast({ title: message.content });
      break;
  }
};
```

---

## Environment Variables

Frontend-accessible variables (must be prefixed with `VITE_`):
```
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

Access in code:
```typescript
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
```

Note: Never put secrets in `VITE_` variables — they are exposed in the browser bundle.

---

## Build & Deploy

```bash
# Development
npm run dev          # Start Vite dev server + Express backend

# Production build
npm run build        # Vite builds to dist/public/

# The Express server serves the built files in production
```

---

## Performance Patterns

```typescript
// Lazy loading pages (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Skeleton loading states
if (isLoading) return <Skeleton className="h-48 w-full" />;

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateJobStatus,
  onMutate: async (newStatus) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['/api/job-cards', id] });
    // Snapshot the previous value
    const previousData = queryClient.getQueryData(['/api/job-cards', id]);
    // Optimistically update
    queryClient.setQueryData(['/api/job-cards', id], { ...previousData, status: newStatus });
    return { previousData };
  },
  onError: (err, newStatus, context) => {
    // Rollback on error
    queryClient.setQueryData(['/api/job-cards', id], context?.previousData);
  },
});
```

---

*SALIS AUTO Frontend Architecture Guide — Version 14.0.0*
