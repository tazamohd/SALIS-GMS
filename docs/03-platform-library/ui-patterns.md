# SALIS AUTO — UI Patterns Guide

**Document Type:** Platform Library — UI Patterns  
**Version:** 14.0.0  
**Framework:** React 18 + shadcn/ui + Tailwind CSS  

---

## Overview

This guide documents the reusable UI patterns used throughout SALIS AUTO. Following these patterns ensures consistency across all 235+ screens.

---

## Pattern 1: Data Table Page

**Used on:** Customers, Job Cards, Invoices, Inventory, and most list views.

```tsx
function CustomersPage() {
  const { data: customers, isLoading } = useQuery({
    queryKey: ['/api/customers'],
  });
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = customers?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StandardPageLayout
      title="Customers"
      description="Manage your customer database"
      headerActions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      }
    >
      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Data table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : filtered?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-green-400">Active</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </StandardPageLayout>
  );
}
```

---

## Pattern 2: KPI / Metric Cards

**Used on:** Dashboard, HR, Finance overview pages.

```tsx
function MetricCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">SAR 125,000</p>
              <p className="text-xs text-green-400">+12% vs last month</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Repeat for other metrics */}
    </div>
  );
}
```

---

## Pattern 3: Status Badge

**Consistent status display across all modules.**

```tsx
function StatusBadge({ status }) {
  const config = {
    active: { label: 'Active', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    pending: { label: 'Pending', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'in-progress': { label: 'In Progress', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    completed: { label: 'Completed', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
    cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    warning: { label: 'Warning', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
```

---

## Pattern 4: Confirmation Dialog

**Before any destructive action (delete, void, cancel).**

```tsx
function DeleteConfirmButton({ itemName, onConfirm, isPending }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{itemName}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Pattern 5: Filter Bar

**Used on tables that need date range or category filtering.**

```tsx
function FilterBar({ onFilter }) {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [status, setStatus] = useState('all');

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      {/* Date range picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {dateRange.from ? format(dateRange.from, 'PP') : 'Select Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
        </PopoverContent>
      </Popover>

      {/* Status filter */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      <Button variant="ghost" size="sm" onClick={() => { setDateRange({}); setStatus('all'); }}>
        Clear Filters
      </Button>
    </div>
  );
}
```

---

## Pattern 6: Loading State

**Skeleton loading while data fetches.**

```tsx
function LoadingTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Usage
{isLoading ? <LoadingTable rows={8} cols={5} /> : <DataTable data={data} />}
```

---

## Pattern 7: Toast Notification

**Feedback after user actions.**

```tsx
const { toast } = useToast();

// Success
toast({
  title: 'Customer saved',
  description: 'The customer record has been created.',
});

// Error
toast({
  title: 'Error',
  description: 'Failed to save. Please try again.',
  variant: 'destructive',
});

// Warning (orange - use sparingly)
toast({
  title: 'Warning',
  description: 'Stock level is below minimum threshold.',
});
```

---

## Pattern 8: Empty State

**When a list or table has no data.**

```tsx
function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// Usage
{customers?.length === 0 && (
  <EmptyState
    title="No customers yet"
    description="Start by adding your first customer to the system."
    action={<Button onClick={() => setDialogOpen(true)}>Add First Customer</Button>}
  />
)}
```

---

## Pattern 9: Stats With Trend

**KPI card with trend indicator.**

```tsx
function StatCard({ label, value, trend, trendPositive }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trendPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Pattern 10: Export Button

**Consistent data export capability.**

```tsx
function ExportButton({ data, filename }) {
  const handleExport = () => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}
```

---

*SALIS AUTO UI Patterns Guide — Version 14.0.0*
