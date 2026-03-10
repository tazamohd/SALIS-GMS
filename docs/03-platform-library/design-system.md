# SALIS AUTO — Design System

**Document Type:** Design System  
**Version:** 14.0.0  
**Theme:** Dark-first, monochrome with brand accent colors  

---

## Brand Identity

### Logo
The SALIS AUTO logo is stored at `client/src/assets/salis-auto-logo.png` and used throughout the platform in the sidebar header and on authentication screens.

### Brand Philosophy
- **Professional:** Enterprise-grade automotive software
- **Modern:** Dark theme with clean typography
- **Trustworthy:** Consistent, predictable UI patterns
- **Accessible:** WCAG 2.1 AA compliant

---

## Color Palette

### Logo-Only Color Rules
The color palette is strictly derived from the SALIS AUTO logo:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue Start | `#0A5ED7` | Gradient start, primary buttons, success |
| Primary Blue End | `#0BB3FF` | Gradient end, highlights, links |
| Deep Navy | `#0B1F3B` | Headers, sidebar, dark surfaces |
| Action Orange | `#F97316` | **Warnings ONLY** — never for success/primary |

### Color Rules (STRICT)
- Blue gradient → Primary actions, success states, main CTAs
- Deep Navy → Navigation, page headers, dark backgrounds
- Orange (#F97316) → Warnings, cautions, pending states ONLY
- NEVER use orange for success or primary actions

### CSS Variables (`client/src/index.css`)
```css
:root {
  --background: hsl(222, 84%, 5%);          /* Deep navy background */
  --foreground: hsl(210, 40%, 98%);         /* Near-white text */
  --card: hsl(222, 60%, 9%);               /* Card surfaces */
  --card-foreground: hsl(210, 40%, 98%);
  --primary: hsl(217, 91%, 60%);           /* Brand blue */
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(222, 47%, 15%);         /* Secondary surfaces */
  --muted: hsl(222, 47%, 15%);
  --accent: hsl(217, 91%, 60%);            /* Accent blue */
  --destructive: hsl(0, 62%, 54%);         /* Error red */
  --border: hsl(222, 47%, 20%);            /* Border color */
  --warning: hsl(25, 95%, 53%);            /* Orange warning (#F97316) */
}
```

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-3xl font-bold` | 30px | 700 | Page titles |
| `text-2xl font-bold` | 24px | 700 | Section headers |
| `text-xl font-semibold` | 20px | 600 | Card titles |
| `text-lg font-medium` | 18px | 500 | Sub-headers |
| `text-base` | 16px | 400 | Body text |
| `text-sm` | 14px | 400 | Secondary text |
| `text-xs` | 12px | 400 | Labels, captions |

### Arabic Typography
When the language is set to Arabic (ar), the platform switches to:
```css
font-family: 'IBM Plex Arabic', 'Noto Sans Arabic', sans-serif;
direction: rtl;
text-align: right;
```

---

## Spacing System

Based on Tailwind's default spacing scale (4px base unit):
| Token | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px | Tight internal padding |
| `p-2` | 8px | Small component padding |
| `p-4` | 16px | Standard card padding |
| `p-6` | 24px | Page section padding |
| `p-8` | 32px | Large section spacing |
| `gap-4` | 16px | Standard grid gap |
| `gap-6` | 24px | Card grid gap |

---

## Component Design

### Cards
```
┌─────────────────────────────────────┐
│ bg-card border border-border        │
│ rounded-lg p-6                      │
│                                     │
│ Card Title (text-lg font-semibold)  │
│ Subtitle (text-sm text-muted)       │
│                                     │
│ Content area                        │
│                                     │
└─────────────────────────────────────┘
```

### Buttons
| Variant | Style | Usage |
|---------|-------|-------|
| Default | Blue gradient background | Primary actions |
| Secondary | Muted background | Secondary actions |
| Outline | Border only | Tertiary actions |
| Destructive | Red background | Delete actions |
| Ghost | No background | Inline actions |
| Warning | Orange (#F97316) | Warning confirmations |

### Status Badges
```
bg-green-500/10 text-green-400  → Active, Completed, Paid
bg-blue-500/10 text-blue-400    → In Progress, Pending Review
bg-orange-500/10 text-orange-400 → Warning, Pending (orange = caution ONLY)
bg-red-500/10 text-red-400      → Error, Cancelled, Overdue
bg-gray-500/10 text-gray-400    → Inactive, Draft, Archived
```

---

## Page Layout Archetypes

### 7 Production-Ready Wrappers

#### 1. StandardPageLayout
For simple pages with a header and description.
```tsx
<StandardPageLayout
  title="Page Title"
  description="Page description text"
  icon={<Icon />}
  headerActions={<Button>Action</Button>}
>
  {/* Page content */}
</StandardPageLayout>
```

#### 2. StandardTablePage
For data tables with filtering, pagination, and CRUD.
```tsx
<StandardTablePage
  title="Customers"
  columns={columns}
  data={customers}
  searchPlaceholder="Search customers..."
  onAdd={() => setAddDialogOpen(true)}
/>
```

#### 3. DashboardPage
For metric cards and overview dashboards.
```tsx
<DashboardPage
  title="Dashboard"
  metrics={[
    { label: "Total Revenue", value: "SAR 450,000", trend: "+12%" },
    { label: "Active Jobs", value: "47", trend: "+8%" },
  ]}
>
  {/* Charts and widgets */}
</DashboardPage>
```

#### 4. FormPage
For form-centric create/edit pages.
```tsx
<FormPage
  title="Add Customer"
  description="Enter customer details"
  onSubmit={handleSubmit}
  isSubmitting={mutation.isPending}
>
  {/* Form fields */}
</FormPage>
```

#### 5. AnalyticsPage
For reporting and analytics with chart-heavy layouts.

#### 6. MobileCardPage
For mobile-optimized card-based views.

#### 7. TabsPageLayout
For multi-tab interfaces.

---

## Navigation Design

### Sidebar Structure
- **Width:** 200px–400px (user-resizable, default 280px)
- **Persistence:** localStorage for resize preference
- **Groups:** 18 workflow-based navigation groups

### Navigation Color Coding
Active items use blue gradient background. Inactive items use transparent background with muted text.

### Mobile Navigation
On mobile screens, the sidebar collapses to a drawer with a hamburger toggle.

---

## Icons

Icons are sourced from **Lucide React**:
```tsx
import { Car, Wrench, Package, FileText, Users } from 'lucide-react';
```

Company/brand logos use **react-icons/si**:
```tsx
import { SiStripe, SiPaypal, SiOpenai } from 'react-icons/si';
```

---

## Dark Theme Enforcement

The platform enforces a **pure dark theme** — white backgrounds are never used in the main application interface.

```tsx
// Correct - dark theme
<div className="bg-background text-foreground">

// Wrong - avoid white in main UI
<div className="bg-white text-black">
```

---

## Arabic (RTL) Layout

When Arabic language is active:
```css
html[dir="rtl"] {
  direction: rtl;
}

html[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}
```

All text automatically right-aligns. Flexbox direction reverses for RTL compatibility.

---

*SALIS AUTO Design System — Version 14.0.0*
