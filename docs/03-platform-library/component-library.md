# SALIS AUTO — Component Library

**Document Type:** Component Library  
**Version:** 14.0.0  
**Framework:** React 18 + shadcn/ui + Radix UI  

---

## Overview

SALIS AUTO uses shadcn/ui as its base component library, extended with custom platform-specific components. All components are written in TypeScript with full type safety.

---

## Base UI Components (shadcn/ui)

Located at `client/src/components/ui/`

| Component | File | Usage |
|-----------|------|-------|
| Button | `button.tsx` | All clickable actions |
| Card | `card.tsx` | Content containers |
| Dialog | `dialog.tsx` | Modal overlays |
| Form | `form.tsx` | Form wrapper with validation |
| Input | `input.tsx` | Text inputs |
| Label | `label.tsx` | Form labels |
| Select | `select.tsx` | Dropdown selects |
| Table | `table.tsx` | Data tables |
| Badge | `badge.tsx` | Status indicators |
| Tabs | `tabs.tsx` | Tab navigation |
| Toast | `toast.tsx` | Notification toasts |
| Toaster | `toaster.tsx` | Toast container |
| Tooltip | `tooltip.tsx` | Hover tooltips |
| Progress | `progress.tsx` | Progress bars |
| Slider | `slider.tsx` | Range sliders |
| Switch | `switch.tsx` | Toggle switches |
| Checkbox | `checkbox.tsx` | Checkbox inputs |
| RadioGroup | `radio-group.tsx` | Radio button groups |
| Textarea | `textarea.tsx` | Multi-line text |
| Separator | `separator.tsx` | Visual dividers |
| Avatar | `avatar.tsx` | User avatars |
| Alert | `alert.tsx` | Alert messages |
| AlertDialog | `alert-dialog.tsx` | Confirmation dialogs |
| Sheet | `sheet.tsx` | Side drawers |
| Popover | `popover.tsx` | Floating content |
| DropdownMenu | `dropdown-menu.tsx` | Context menus |
| Command | `command.tsx` | Command palette |
| Calendar | `calendar.tsx` | Date pickers |
| ScrollArea | `scroll-area.tsx` | Custom scrollbars |
| Skeleton | `skeleton.tsx` | Loading placeholders |
| Collapsible | `collapsible.tsx` | Expandable sections |
| Accordion | `accordion.tsx` | FAQ-style sections |

---

## Layout Components

### Main Application Layout
**File:** `client/src/components/Layout.tsx`

The primary layout wrapper that includes:
- **Resizable sidebar** (drag handle, 200–400px, default 280px)
- **Navigation groups** (18 workflow-based groups)
- **Role-based filtering** via `roleNavigationMap`
- **Language toggle** (Arabic/English)
- **User avatar** with dropdown menu
- **Notification bell**

```tsx
<Layout>
  {/* Page content goes here */}
</Layout>
```

### Specialized Layouts
| Layout | File | Used By |
|--------|------|---------|
| `TechnicianLayout` | Technician portal wrapper | /technician-portal/* |
| `PurchaseAgentLayout` | Purchase agent wrapper | /purchase-agent/* |
| `ClientLayout` | Client portal wrapper | /client/* |
| `CustomerPortalLayout` | Customer portal | /portal/* |
| `CustomerMobileLayout` | Mobile customer app | /customer-app/* |
| `TechnicianMobileLayout` | Mobile technician app | /technician-app/* |
| `PartsNetworkLayout` | B2B network portal | /parts-network/* |

---

## Page Archetype Wrappers

Located at `client/src/components/layouts/`

### StandardPageLayout
```tsx
interface StandardPageLayoutProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}
```

**When to use:** Simple pages with a header, description, and content below.

### StandardTablePage
```tsx
interface StandardTablePageProps {
  title: string;
  description?: string;
  columns: ColumnDef[];
  data: any[];
  searchPlaceholder?: string;
  onAdd?: () => void;
  addButtonLabel?: string;
  isLoading?: boolean;
  filterOptions?: FilterOption[];
}
```

**When to use:** Any page primarily displaying a data table with CRUD operations.

### DashboardPage
```tsx
interface DashboardPageProps {
  title: string;
  metrics: MetricCard[];
  children?: React.ReactNode;
}
```

**When to use:** Overview pages with KPI cards and charts.

### FormPage
```tsx
interface FormPageProps {
  title: string;
  description?: string;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
}
```

**When to use:** Dedicated create/edit form pages.

### AnalyticsPage
For chart-heavy reporting pages with date range filters.

### MobileCardPage
For mobile-optimized card list views.

### TabsPageLayout
For pages with multiple tab sections.

---

## Custom Feature Components

### ArabicLanguageToggle
**File:** `client/src/components/ArabicLanguageToggle.tsx`

Toggles between English and Arabic with RTL layout support.
```tsx
<ArabicLanguageToggle />
```

### AuthProvider / useAuth
**File:** `client/src/hooks/useAuth.tsx`

Provides authentication context throughout the app.
```tsx
const { user, login, logout, isLoading } = useAuth();
```

---

## Data Fetching Patterns

### Standard Query
```tsx
const { data: customers, isLoading } = useQuery({
  queryKey: ['/api/customers'],
});

if (isLoading) return <Skeleton />;
```

### Standard Mutation
```tsx
const createMutation = useMutation({
  mutationFn: (data: InsertCustomer) => 
    apiRequest('POST', '/api/customers', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    toast({ title: 'Customer created successfully' });
  },
  onError: () => {
    toast({ title: 'Error creating customer', variant: 'destructive' });
  },
});
```

---

## Form Pattern

```tsx
const form = useForm<CustomerForm>({
  resolver: zodResolver(insertCustomerSchema),
  defaultValues: {
    name: '',
    email: '',
    phone: '',
  },
});

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
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        Submit
      </Button>
    </form>
  </Form>
);
```

---

## Internationalization Pattern

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('customers.title', 'Customers')}</h1>
      <p>{t('customers.description', 'Manage your customer database')}</p>
    </div>
  );
}
```

---

## Toast Notifications

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({ title: 'Saved successfully' });

// Error
toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });

// Warning
toast({ title: 'Warning', description: 'Please review the information' });
```

---

*SALIS AUTO Component Library — Version 14.0.0*
