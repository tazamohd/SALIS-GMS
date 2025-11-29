# SALIS AUTO - Component Library Guide

## Overview

SALIS AUTO uses a comprehensive component library built on **shadcn/ui** with **Radix UI** primitives, styled with **Tailwind CSS**. This guide documents all custom components, patterns, and usage guidelines.

---

## Design System Foundation

### Brand Colors

```css
/* SALIS AUTO Brand Palette */
--dark-navy: #0a0f1a;
--electric-blue: #3b82f6;
--neon-blue: #60a5fa;
--soft-white: #f8fafc;
--salis-gray-dark: #1a1f2e;
--salis-gray-light: #f3f4f6;
```

### Typography

| Type | Font Family | Usage |
|------|-------------|-------|
| Headings | Montserrat | Titles, numbers, KPIs |
| Body | Poppins | Paragraphs, descriptions |
| Monospace | JetBrains Mono | Code, IDs, technical data |

---

## Page Layout Archetypes (7 Types)

### 1. StandardPageLayout
Simple pages with header and description.

```tsx
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

<StandardPageLayout
  title="Page Title"
  description="Page description"
>
  {/* Page content */}
</StandardPageLayout>
```

### 2. StandardTablePage
Data tables with filtering, sorting, and actions.

```tsx
import { StandardTablePage } from "@/components/layouts/StandardTablePage";

<StandardTablePage
  title="Data Table"
  columns={columns}
  data={data}
  searchPlaceholder="Search..."
  onAdd={() => {}}
  onEdit={(row) => {}}
  onDelete={(row) => {}}
/>
```

### 3. DashboardPage
Metrics cards, charts, and KPI displays.

```tsx
import { DashboardPage } from "@/components/layouts/DashboardPage";

<DashboardPage
  title="Dashboard"
  metrics={metricsArray}
  charts={chartsArray}
/>
```

### 4. FormPage
Form-centric pages with validation.

```tsx
import { FormPage } from "@/components/layouts/FormPage";

<FormPage
  title="Create Item"
  schema={zodSchema}
  onSubmit={handleSubmit}
  fields={formFields}
/>
```

### 5. AnalyticsPage
Reporting and data visualization.

```tsx
import { AnalyticsPage } from "@/components/layouts/AnalyticsPage";

<AnalyticsPage
  title="Analytics"
  dateRange={dateRange}
  charts={analyticsCharts}
  exportOptions={['pdf', 'excel']}
/>
```

### 6. MobileCardPage
Mobile-optimized card layouts.

```tsx
import { MobileCardPage } from "@/components/layouts/MobileCardPage";

<MobileCardPage
  title="Mobile View"
  cards={cardData}
  onCardClick={(card) => {}}
/>
```

### 7. TabsPageLayout
Multi-tab interfaces.

```tsx
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

<TabsPageLayout
  title="Settings"
  tabs={[
    { id: "general", label: "General", content: <GeneralSettings /> },
    { id: "security", label: "Security", content: <SecuritySettings /> },
  ]}
/>
```

---

## Core UI Components

### Buttons

```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Cards

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card data-testid="card-example">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Forms

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "" }
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} data-testid="input-name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit" data-testid="button-submit">Submit</Button>
  </form>
</Form>
```

### Dialogs/Modals

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent data-testid="modal-example">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tables

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

<Table data-testid="table-example">
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row, i) => (
      <TableRow key={i} data-testid={`row-item-${i}`}>
        <TableCell>{row.col1}</TableCell>
        <TableCell>{row.col2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Custom Components

### QuickActionsModal

Global navigation modal triggered by `Ctrl+K`.

```tsx
import { QuickActionsModal } from "@/components/QuickActionsModal";

<QuickActionsModal open={open} onOpenChange={setOpen} />
```

### AddCustomerDialog

Customer creation form dialog.

```tsx
import { AddCustomerDialog } from "@/components/AddCustomerDialog";

<AddCustomerDialog
  open={open}
  onOpenChange={setOpen}
  onSuccess={() => refetch()}
/>
```

### Sidebar Navigation

Main application navigation.

```tsx
import { Sidebar } from "@/components/Sidebar";

<Sidebar collapsed={collapsed} onToggle={setCollapsed} />
```

### NotificationBell

In-app notifications indicator.

```tsx
import { NotificationBell } from "@/components/NotificationBell";

<NotificationBell userId={user.id} />
```

### ThemeToggle

Light/dark mode switcher.

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

<ThemeToggle />
```

---

## Data Fetching Patterns

### useQuery Pattern

```tsx
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ['/api/customers'],
});

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
```

### useMutation Pattern

```tsx
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/customers', { method: 'POST', body: data }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    toast({ title: "Success", description: "Customer created" });
  },
});
```

---

## Icon Usage

### Lucide React Icons

```tsx
import { Wrench, Calendar, Users, Car, FileText, Settings } from "lucide-react";

<Wrench className="h-5 w-5" />
<Calendar className="h-5 w-5 text-electric-blue" />
```

### Company Logos (react-icons)

```tsx
import { SiStripe, SiPaypal, SiGoogle } from "react-icons/si";

<SiStripe className="h-6 w-6" />
```

---

## Testing Attributes

All interactive and display elements include `data-testid` attributes:

| Pattern | Example |
|---------|---------|
| Buttons | `data-testid="button-submit"` |
| Inputs | `data-testid="input-email"` |
| Cards | `data-testid="card-customer-123"` |
| Tables | `data-testid="table-customers"` |
| Rows | `data-testid="row-customer-${id}"` |
| Modals | `data-testid="modal-add-customer"` |
| Links | `data-testid="link-dashboard"` |

---

## Dark Theme Classes

Always use explicit dark mode variants:

```tsx
// Correct
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

// For SALIS AUTO grayscale
<div className="bg-gray-50 dark:bg-salis-gray-dark/30">
```

---

## Related Documentation

- [UI Screens Reference](../UI_SCREENS_REFERENCE.md)
- [Tech Guidelines](../TECH_GUIDELINES.md)
- [Sidebar Organization](../SIDEBAR_ORGANIZATION.md)

---

*Last Updated: November 2025*
*SALIS AUTO Component Library v1.0*
