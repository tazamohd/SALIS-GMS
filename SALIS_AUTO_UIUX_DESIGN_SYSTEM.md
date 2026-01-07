# SalisEngine.AI - UI/UX Design System Documentation

**Version:** 2.0.0 (Logo-Aligned)  
**Theme:** Deep Space & Corporate Steel  
**Last Updated:** January 2026  
**Platform:** Enterprise Automotive ERP  
**Pages:** 235+ screens  

---

## Design Philosophy

The **SalisEngine** aesthetic is built to feel like a high-performance "Command Center" for autonomous AI. It combines the sleek, calculated precision of **corporate steel** with the futuristic, infinite depth of **deep space**.

The palette is strictly derived from the official logo:
- **Sky Blue (`#0ea5e9`)**: Represents intelligence, clarity, and the core engine
- **Vibrant Orange (`#f97316`)**: Represents action, execution, and critical data points
- **Deep Void (`#050510`)**: A backdrop that reduces eye strain and provides contrast for glowing elements

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Library](#5-component-library)
6. [Page Layout Patterns](#6-page-layout-patterns)
7. [Navigation System](#7-navigation-system)
8. [Interactive States](#8-interactive-states)
9. [Dark Mode Implementation](#9-dark-mode-implementation)
10. [Accessibility (WCAG 2.1 AA)](#10-accessibility-wcag-21-aa)
11. [Responsive Design](#11-responsive-design)
12. [Animation & Motion](#12-animation--motion)
13. [Iconography](#13-iconography)
14. [Data Visualization](#14-data-visualization)
15. [Form Design](#15-form-design)
16. [Empty & Loading States](#16-empty--loading-states)
17. [RTL & Internationalization](#17-rtl--internationalization)
18. [Design Tokens Reference](#18-design-tokens-reference)

---

## 1. Brand Identity

### Brand Overview
SALIS AUTO is a world-class automotive ERP platform designed for efficient garage operations at scale. The visual identity reflects professionalism, trust, and modern technology.

### Logo Usage
- **Primary Logo:** SALIS AUTO wordmark with automotive-inspired styling
- **Logo Placement:** Top-left corner of sidebar navigation
- **Minimum Clear Space:** 16px on all sides
- **Logo Asset:** `attached_assets/Salis Logo-1.png`

### Brand Personality
- **Professional:** Enterprise-grade reliability
- **Modern:** Clean, contemporary aesthetics
- **Trustworthy:** Consistent, predictable interface patterns
- **Efficient:** Optimized for productivity and speed

---

## 2. Color System

### Core Backgrounds - Deep Space

| Variable | Hex | Description |
|----------|-----|-------------|
| `--bg-dark` | `#050510` | Primary background - near-black void |
| `--bg-deep` | `#0b0b1a` | Deeper recessed areas, sidebars |
| `--bg-card` | `rgba(15, 23, 42, 0.6)` | Slate-tinted glass for UI cards |

### Brand Accents (Logo Matched)

| Variable | Hex | Usage |
|----------|-----|-------|
| `--accent-primary` | `#0ea5e9` (Sky Blue) | Primary actions, active tabs, main glows |
| `--accent-secondary` | `#f97316` (Orange) | Highlights, data logs, secondary CTA |
| `--accent-dark-blue` | `#1e3a8a` | Deep blue for gradients and borders |
| `--accent-silver` | `#e2e8f0` | Subtitle text, inactive borders, "Steel" look |

### Functional Colors

| Variable | Hex | Usage |
|----------|-----|-------|
| `--accent-success` | `#10b981` (Emerald) | System Online, success logs, completed tasks |
| `--accent-error` | `#ef4444` (Red) | Error logs, critical alerts, delete actions |
| `--warning` | `#f97316` (Orange) | Warnings, pending states |
| `--info` | `#0ea5e9` (Sky Blue) | Informational callouts |

### Brand Gradients
```css
--gradient-main: linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%);
--gradient-accent: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
```
Used for: Primary buttons, active states, progress indicators, hero sections

### Glass Variables - Physical Glass Effect
```css
--glass-border: rgba(255, 255, 255, 0.08);    /* Subtle white edge */
--glass-surface: rgba(255, 255, 255, 0.03);   /* Base transparency */
--glass-highlight: rgba(255, 255, 255, 0.08); /* Top-down lighting */
--glass-heavy: rgba(15, 23, 42, 0.85);        /* Almost opaque */
```

### Glow Effects
```css
--glow-primary: 0 0 25px rgba(14, 165, 233, 0.3);
--glow-secondary: 0 0 20px rgba(249, 115, 22, 0.25);
--glow-success: 0 0 20px rgba(16, 185, 129, 0.25);
--glow-error: 0 0 20px rgba(239, 68, 68, 0.25);
```

### Light Mode - Corporate Steel

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#f1f5f9` | Slate 100 - Page background |
| Surface | `#FFFFFF` | Cards, dialogs |
| Border | `#cbd5e1` | Slate 300 - Dividers, outlines |
| Text Primary | `#0f172a` | Slate 900 - Main text |
| Text Muted | `#64748b` | Slate 500 - Secondary text |

### Dark Mode - Deep Space

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#050510` | Near-black void |
| Surface | `rgba(15, 23, 42, 0.6)` | Glass card surface |
| Border | `rgba(255, 255, 255, 0.08)` | Glass edge |
| Text Primary | `#e2e8f0` | Slate 200 - Main text |
| Text Muted | `#94a3b8` | Slate 400 - Secondary text |

### Color Usage Rules

1. **Sky Blue (`#0ea5e9`)** - Primary actions, active states, main glows
2. **Orange (`#f97316`)** - Secondary CTA, highlights, data emphasis
3. **Emerald Green (`#10b981`)** - Success states, completed tasks
4. **Red (`#ef4444`)** - Errors, critical alerts, destructive actions
5. **Deep Void (`#050510`)** - Dark mode background for maximum contrast
6. **Glass effects** - Use backdrop blur with subtle white borders for depth

---

## 3. Typography

### Font Family Stack

```css
/* Primary - Inter */
font-family: 'Inter', 'SF Pro', 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace - For metrics and code */
font-family: 'JetBrains Mono', 'Inter Mono', 'SF Mono', monospace;
```

### Type Scale

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display Large | 32px | 700 | 1.2 | -0.03em | Page titles, hero text |
| Display Medium | 24px | 600 | 1.3 | -0.02em | Section headers |
| Display Small | 20px | 500 | 1.4 | -0.02em | Subsection headers |
| Headline | 20px | 600 | 1.3 | -0.02em | Card titles |
| Title Medium | 16px | 500 | 1.4 | -0.01em | Widget headers |
| Body Base | 16px | 400 | 1.5 | 0 | Default body text |
| Body Regular | 14px | 400 | 1.4 | 0 | Standard UI text |
| Body Semibold | 14px | 600 | 1.4 | 0 | Emphasized text |
| Label Medium | 12px | 500 | 1.4 | 0.025em | Form labels |
| Label Small | 11px | 400 | normal | 0.025em | Helper text |
| Caps MD | 12px | 500 | 1.4 | 0.3px | Uppercase labels |

### Typography CSS Variables

```css
--body-base-font-family: "Inter", Helvetica;
--body-base-font-size: 16px;
--body-base-font-weight: 400;
--body-base-line-height: 140%;

--headline-semibold-font-family: "Inter", Helvetica;
--headline-semibold-font-size: 20px;
--headline-semibold-font-weight: 600;
--headline-semibold-letter-spacing: -0.02em;

--display-large-semibold-font-size: 32px;
--display-large-semibold-font-weight: 700;
--display-large-semibold-letter-spacing: -0.03em;
```

### Typography Utility Classes

```css
.text-display-lg   /* 32px, bold, display titles */
.text-display-md   /* 24px, semibold, section headers */
.text-display-sm   /* 20px, medium, subsections */
.text-headline     /* 20px, semibold, card titles */
```

---

## 4. Spacing & Layout

### Spacing Scale (8px Base Unit)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight groupings |
| sm | 8px | Related elements |
| md | 16px | Standard spacing |
| lg | 24px | Section separation |
| xl | 32px | Major sections |
| 2xl | 48px | Page margins |
| 3xl | 64px | Hero sections |

### Page Padding

```css
/* Responsive page padding */
.page-padding {
  padding: 16px;           /* Mobile */
  padding: 24px;           /* Tablet (sm:) */
  padding: 32px;           /* Desktop (lg:) */
}
```

### Content Width

| Breakpoint | Max Width | Usage |
|------------|-----------|-------|
| Mobile | 100% | Full width |
| Tablet | 768px | Constrained content |
| Desktop | 1280px | Standard max |
| Wide | 1536px | Dashboard grids |

### Grid System

```css
/* 12-column grid with responsive gaps */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;     /* Mobile */
  gap: 24px;     /* Desktop */
}
```

### Spacing Utility Classes

```css
.section-spacing { @apply space-y-8; }   /* 32px between sections */
.content-spacing { @apply space-y-6; }   /* 24px between content */
.item-spacing    { @apply space-y-4; }   /* 16px between items */
```

---

## 5. Component Library

### 5.1 Buttons

#### Primary Button (Gradient)
```css
.btn-primary {
  background: linear-gradient(135deg, #0A5ED7 0%, #0BB3FF 100%);
  color: #FFFFFF;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0952C0 0%, #0AA3EE 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 94, 215, 0.3);
}
```

#### Secondary Button (Outline)
```css
.btn-secondary {
  background-color: transparent;
  color: #0A5ED7;
  border: 1.5px solid #0A5ED7;
}

.btn-secondary:hover {
  background-color: rgba(10, 94, 215, 0.1);
}
```

#### Danger Button (Orange - Warnings Only)
```css
.btn-danger {
  background-color: #F97316;
  color: #FFFFFF;
}

.btn-danger:hover {
  background-color: #EA580C;
}
```

#### Button Sizes
| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 32px | 12px 16px | 12px |
| default | 40px | 8px 16px | 14px |
| lg | 48px | 12px 24px | 16px |
| touch | 44px+ | 12px 16px | 14px |

### 5.2 Cards

#### Brand Card
```css
.brand-card {
  @apply rounded-xl border transition-all duration-200;
  background-color: var(--salis-surface-light);
  border-color: var(--salis-border-light);
}

.dark .brand-card {
  background-color: var(--salis-surface-dark);
  border-color: var(--salis-border-dark);
}

.brand-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(10, 94, 215, 0.1);
}
```

#### Elevated Card
```css
.card-elevated {
  box-shadow: 0px 4px 6px -2px rgba(1, 1, 1, 0.05), 
              0px 12px 16px -4px rgba(1, 1, 1, 0.1);
}

.card-elevated:hover {
  transform: translateY(-4px);
  box-shadow: 0px 8px 16px -4px rgba(1, 1, 1, 0.1), 
              0px 16px 24px -6px rgba(1, 1, 1, 0.15);
}
```

#### Stat Card
```css
.stat-card {
  @apply rounded-xl p-8 border-2 transition-all duration-300;
}

.stat-card-number {
  @apply font-bold text-5xl tracking-tight;
  font-family: 'JetBrains Mono', monospace;
}

.stat-card-label {
  @apply font-medium text-sm uppercase tracking-wider;
}
```

### 5.3 Status Indicators

#### Status Pills
```css
.status-pill {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-pill-blue {
  background-color: rgba(10, 94, 215, 0.1);
  color: #0A5ED7;
}

.status-pill-orange {
  background-color: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.status-pill-gray {
  background-color: rgba(107, 114, 128, 0.1);
  color: #6B7280;
}
```

### 5.4 UI Component Inventory

| Component | Location | Description |
|-----------|----------|-------------|
| Accordion | `ui/accordion.tsx` | Collapsible content sections |
| Alert Dialog | `ui/alert-dialog.tsx` | Confirmation modals |
| Avatar | `ui/avatar.tsx` | User profile images |
| Badge | `ui/badge.tsx` | Status indicators |
| Brand Card | `ui/brand-card.tsx` | SALIS-branded card |
| Button | `ui/button.tsx` | All button variants |
| Calendar | `ui/calendar.tsx` | Date picker |
| Card | `ui/card.tsx` | Content containers |
| Chart | `ui/chart.tsx` | Recharts wrapper |
| Checkbox | `ui/checkbox.tsx` | Selection control |
| Command | `ui/command.tsx` | Command palette |
| Dialog | `ui/dialog.tsx` | Modal windows |
| Dropdown Menu | `ui/dropdown-menu.tsx` | Action menus |
| Empty State | `ui/empty-state.tsx` | No data display |
| Form | `ui/form.tsx` | Form wrapper with react-hook-form |
| Input | `ui/input.tsx` | Text input field |
| Label | `ui/label.tsx` | Form labels |
| Linear Loader | `ui/linear-loader.tsx` | Progress indicator |
| Pagination | `ui/pagination.tsx` | Page navigation |
| Popover | `ui/popover.tsx` | Floating content |
| Progress | `ui/progress.tsx` | Progress bar |
| Select | `ui/select.tsx` | Dropdown selection |
| Sheet | `ui/sheet.tsx` | Slide-out panels |
| Skeleton | `ui/skeleton.tsx` | Loading placeholder |
| Slider | `ui/slider.tsx` | Range input |
| Status Badge | `ui/status-badge.tsx` | Status indicators |
| Status Pill | `ui/status-pill.tsx` | Rounded status |
| Switch | `ui/switch.tsx` | Toggle control |
| Table | `ui/table.tsx` | Data tables |
| Tabs | `ui/tabs.tsx` | Tab navigation |
| Textarea | `ui/textarea.tsx` | Multi-line input |
| Toast | `ui/toast.tsx` | Notifications |
| Tooltip | `ui/tooltip.tsx` | Hover hints |

---

## 6. Page Layout Patterns

### 6.1 StandardPageLayout

The primary layout wrapper for most pages.

```typescript
interface StandardPageLayoutProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: PageAction[];
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}
```

**Features:**
- Brand background with subtle gradient orbs
- Skip link for accessibility
- Responsive padding (16px mobile → 32px desktop)
- PageHeader component integration
- Main content area with `content-spacing` class

**Background Design:**
```css
/* Light mode - Clean silver background */
background: #F8FAFC;

/* Dark mode - Deep dark background */
background: #0E1117;

/* Decorative gradient orbs */
.top-right-orb {
  background: radial-gradient(from-[#0A5ED7]/5 to-transparent);
  width: 600px;
  height: 600px;
  filter: blur(48px);
}

.bottom-left-orb {
  background: radial-gradient(from-[#0BB3FF]/5 to-transparent);
  width: 400px;
  height: 400px;
  filter: blur(48px);
}
```

### 6.2 Layout Archetype Wrappers

The application uses 7 production-ready archetype wrappers:

| Archetype | Use Case | Key Features |
|-----------|----------|--------------|
| **StandardPageLayout** | Simple pages | Header, description, actions |
| **StandardTablePage** | Data tables | Table with filters, pagination |
| **DashboardPage** | Metrics/cards | Grid layout, stat cards |
| **FormPage** | Form-centric | Form container, validation |
| **AnalyticsPage** | Reporting | Charts, date ranges |
| **MobileCardPage** | Mobile cards | Touch-optimized cards |
| **TabsPageLayout** | Multi-tab | Tab navigation, panels |

### 6.3 Page Structure

```
┌─────────────────────────────────────────────────────┐
│ SkipLink (hidden, accessible)                       │
├─────────────────────────────────────────────────────┤
│ PageHeader                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Icon | Title                        | Actions  │ │
│ │      | Description                             │ │
│ └─────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Main Content (id="main-content")                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │                                                 │ │
│ │  Cards, Tables, Forms, etc.                     │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 7. Navigation System

### 7.1 Sidebar Navigation

**Structure:**
- Resizable width: 200px - 400px (default: 280px)
- Persisted in localStorage
- 18 workflow-based navigation groups
- Collapsible groups with icons

**Resize Behavior:**
```typescript
const [sidebarWidth, setSidebarWidth] = useState(() => {
  const saved = localStorage.getItem('sidebarWidth');
  return saved ? parseInt(saved, 10) : 280;
});
// Min: 200px, Max: 400px
const newWidth = Math.min(Math.max(e.clientX, 200), 400);
```

### 7.2 Navigation Groups (18 Workflow-Based)

| # | Group | Purpose |
|---|-------|---------|
| 1 | Dashboard & Overview | Main dashboard, welcome |
| 2 | Customer Intake & Appointments | Customers, appointments |
| 3 | Vehicle Management | Vehicles, fleet, VIN |
| 4 | Inspection & Check-In | Vehicle check-in, inspections |
| 5 | Diagnostics & Assessment | OBD, predictive diagnostics |
| 6 | Service Planning & Scheduling | Job cards, scheduling |
| 7 | Parts & Inventory | Inventory, parts network |
| 8 | Service Execution & Operations | Service bay, quality |
| 9 | Quality & Delivery | Quality control, handover |
| 10 | Billing & Payments | Invoices, payments |
| 11 | Analytics & Business Intelligence | Reports, BI |
| 12 | Customer Experience & Growth | Loyalty, feedback |
| 13 | Team & HR Management | Staff, payroll |
| 14 | Compliance & Safety | ZATCA, VAT, safety |
| 15 | Enterprise & Franchise | Multi-location, global |
| 16 | Emerging Technologies | IoT, AR/VR, blockchain |
| 17 | AI & Automation Hub | AI features |
| 18 | System & Settings | Settings, integrations |

### 7.3 Header Bar

**Components (Left to Right):**
1. Mobile menu toggle (hamburger)
2. Logo/Brand
3. Smart Search bar
4. Quick Actions (Cmd+K)
5. Language Switcher
6. Arabic Toggle (AR/EN)
7. Theme Toggle (Light/Dark)
8. Notification Bell
9. User Avatar + Dropdown

---

## 8. Interactive States

### Hover Effects

```css
/* Standard hover lift */
.hover-lift {
  transition: all 0.2s ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 2px rgba(11, 179, 255, 0.3), 
              0 8px 16px rgba(10, 94, 215, 0.15);
}

/* Interactive card hover */
.interactive-card {
  transition: all 0.3s ease-in-out;
}

.interactive-card:hover {
  @apply shadow-lg -translate-y-1 cursor-pointer;
}

/* Row hover */
.interactive-hover:hover {
  @apply bg-accent/50 cursor-pointer;
}
```

### Focus States

```css
.focus-visible-ring {
  @apply focus-visible:outline-none 
         focus-visible:ring-2 
         focus-visible:ring-ring 
         focus-visible:ring-offset-2 
         focus-visible:ring-offset-background;
}
```

### Active/Selected States

- Primary blue background with white text
- 2px left border accent
- Subtle blue glow

### Disabled States

- 50% opacity
- No pointer events
- Grayscale filter on icons

---

## 9. Dark Mode Implementation - Deep Space Theme

### Theme Toggle

Uses `next-themes` with class-based switching:

```typescript
// ThemeProvider setup
darkMode: ["class"] // in tailwind.config.ts

// Toggle logic
document.documentElement.classList.toggle("dark");
```

### Color Variables (Dark Mode - Deep Space)

```css
.dark {
  /* Background - Deep Void */
  --background: 240 33% 3%;        /* #050510 - Near-black void */
  --foreground: 210 40% 93%;       /* #e2e8f0 - Slate 200 */

  /* Muted - Recessed Areas */
  --muted: 240 24% 7%;             /* #0b0b1a - Deep recessed */
  --muted-foreground: 215 20% 65%; /* #94a3b8 - Slate 400 */

  /* Card - Slate Glass */
  --card: 222 47% 11% / 0.6;       /* rgba(15, 23, 42, 0.6) */
  --card-foreground: 210 40% 93%;

  /* Border - Glass Edge */
  --border: 0 0% 100% / 0.08;      /* White 8% - subtle edge */

  /* Primary - Sky Blue */
  --primary: 199 89% 48%;          /* #0ea5e9 */
  --primary-foreground: 240 33% 3%;

  /* Secondary - Orange */
  --secondary: 24 95% 53%;         /* #f97316 */
  --secondary-foreground: 0 0% 100%;

  /* Semantic Colors */
  --success: 160 84% 39%;          /* #10b981 - Emerald */
  --error: 0 84% 60%;              /* #ef4444 - Red */
}
```

### Glassmorphism Effects

The design relies heavily on "Physical Glass" — glass that feels substantial, not just blurry.

```css
.glass-card {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
    0 4px 24px -1px rgba(0, 0, 0, 0.3);
}
```

### Motion & Glows

Elements should "lift" and "glow" upon interaction:

```css
.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 25px rgba(14, 165, 233, 0.3);
}
```

### Dark Mode Best Practices

1. **Use Deep Void background (`#050510`)** - Maximum contrast, reduces eye strain

2. **Glass card surfaces** - Use `rgba(15, 23, 42, 0.6)` with backdrop blur

3. **Subtle white borders** - 8% white (`rgba(255,255,255,0.08)`) for glass edges

4. **Glow effects on hover** - Sky blue glow for interactive elements

5. **High contrast text** - Use `#e2e8f0` (Slate 200) for primary text

---

## 10. Accessibility (WCAG 2.1 AA)

### Touch Targets

All interactive elements meet 44x44px minimum:

```css
.btn-touch {
  @apply min-h-[44px] min-w-[44px] px-4 py-3;
}

.input-touch {
  @apply min-h-[44px] px-4 py-3 text-base;
}
```

### Skip Link

```tsx
<SkipLink />
// Renders: <a href="#main-content">Skip to main content</a>
```

```css
.skip-link {
  @apply sr-only 
         focus:not-sr-only 
         focus:absolute 
         focus:top-4 
         focus:left-4 
         focus:z-50 
         focus:px-4 
         focus:py-2 
         focus:bg-primary 
         focus:text-primary-foreground 
         focus:rounded-md;
}
```

### Color Contrast

| Element | Light Mode | Dark Mode | Ratio |
|---------|------------|-----------|-------|
| Body text | #2A2F3A on #F8FAFC | #E6EAF0 on #0E1117 | 12:1+ |
| Muted text | #6B7280 on #FFFFFF | #9BA4B0 on #151A23 | 4.5:1+ |
| Primary button | #FFFFFF on #0A5ED7 | #0E1117 on #0BB3FF | 7:1+ |

### Keyboard Navigation

- All interactive elements focusable via Tab
- Focus visible ring on all focused elements
- Escape closes modals and dropdowns
- Arrow keys navigate menus
- Cmd+K opens quick actions

### ARIA Implementation

- `role` attributes on custom components
- `aria-label` on icon-only buttons
- `aria-expanded` on collapsibles
- `aria-current="page"` on active nav items
- `aria-live` regions for dynamic content

---

## 11. Responsive Design

### Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Mobile-First Utilities

```css
@media (max-width: 768px) {
  .mobile-stack {
    @apply flex-col space-y-2;
  }
  
  .mobile-full-width {
    @apply w-full;
  }
  
  .mobile-hide {
    @apply hidden;
  }
}
```

### Responsive Table

```css
.table-responsive {
  @apply w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0;
}

.table-responsive table {
  @apply min-w-full;
}

.table-sticky-header thead {
  @apply sticky top-0 bg-background z-10 shadow-sm;
}
```

### Mobile Navigation

- Hamburger menu toggle
- Full-screen slide-out navigation
- Touch-optimized nav items
- Close on route change

---

## 12. Animation & Motion

### Page Transitions

```css
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

### Fade In

```css
.fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Up

```css
.slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Chart Animation

```css
.chart-animate {
  animation: chart-reveal 0.8s ease-out forwards;
}

@keyframes chart-reveal {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}
```

### Linear Progress Loader

```css
.linear-loader {
  @apply h-1 w-full bg-muted overflow-hidden rounded-full;
}

.linear-loader::after {
  content: '';
  display: block;
  width: 40%;
  height: 100%;
  background: linear-gradient(135deg, #0A5ED7 0%, #0BB3FF 100%);
  animation: linear-progress 1.5s ease-in-out infinite;
}

@keyframes linear-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
```

### Duration Guidelines

| Action | Duration | Easing |
|--------|----------|--------|
| Micro-interactions | 0.1-0.2s | ease-out |
| Hover/Focus | 0.2s | ease |
| Transitions | 0.3s | ease-in-out |
| Page transitions | 0.3-0.5s | ease |
| Complex animations | 0.5-0.8s | ease-out |

---

## 13. Iconography

### Icon Library

Primary: **Lucide React** - Modern, consistent icon set

```typescript
import { 
  Home, Users, Car, Wrench, Package, 
  Settings, BarChart3, Calendar, Bell 
} from "lucide-react";
```

### Company Logos

For brand logos: **React Icons (Simple Icons)**

```typescript
import { SiGoogle, SiStripe, SiPaypal } from "react-icons/si";
```

### Icon Sizes

| Context | Size | Usage |
|---------|------|-------|
| Inline | 16px | Buttons, inline text |
| Default | 20px | Navigation, cards |
| Large | 24px | Headers, empty states |
| Hero | 48px+ | Empty state illustrations |

### Icon Color Rules

- Navigation icons: `text-muted-foreground`
- Active nav icons: `text-primary`
- Button icons: inherit from button color
- Status icons: match semantic color

---

## 14. Data Visualization

### Chart Library

**Recharts** - React-based charting library

### Chart Colors (SALIS Brand Palette)

```typescript
const chartColors = {
  primary: '#0A5ED7',    // Deep Blue
  secondary: '#0BB3FF',  // Bright Blue
  accent: '#0B1F3B',     // Deep Navy
  warning: '#F97316',    // Orange (warnings only)
  muted: '#9BA4B0',      // Gray
};
```

### Chart Types Used

1. **Line Charts** - Trend analysis
2. **Bar Charts** - Comparisons
3. **Area Charts** - Volume over time
4. **Pie/Donut Charts** - Proportions
5. **Gauge Charts** - KPI indicators

### Chart Container

```tsx
<ChartCard title="Revenue Overview" description="Monthly revenue">
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</ChartCard>
```

---

## 15. Form Design

### Form Library Stack

- **react-hook-form** - Form state management
- **zod** - Schema validation
- **@hookform/resolvers** - Zod integration

### Form Layout

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Enter your email</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Input Styling

```css
/* Default input */
height: 40px;
padding: 8px 12px;
border-radius: 8px;
border: 1px solid var(--border);
background: var(--background);

/* Focus state */
border-color: var(--ring);
box-shadow: 0 0 0 2px var(--ring);

/* Error state */
border-color: var(--destructive);
```

### Validation Messages

- Red text below input
- Icon indicator on invalid fields
- Toast notification on submit errors

---

## 16. Empty & Loading States

### Empty State Container

```css
.empty-state-container {
  @apply flex flex-col items-center justify-center py-16 px-4 text-center;
}

.empty-state-icon {
  @apply w-24 h-24 mb-6 text-muted-foreground/40;
}

.empty-state-title {
  @apply text-xl font-semibold text-foreground mb-2;
}

.empty-state-description {
  @apply text-sm text-muted-foreground mb-6 max-w-md;
}
```

### Empty State Component

```tsx
<EmptyState
  icon={Package}
  title="No items found"
  description="Get started by creating your first item."
  action={{
    label: "Add Item",
    onClick: () => setDialogOpen(true)
  }}
/>
```

### Loading States

**Skeleton Loading:**
```css
.skeleton {
  @apply animate-pulse bg-muted rounded;
}
```

**Linear Loader (Preferred):**
- No spinners - use linear progress bars
- Brand gradient animation
- Subtle, non-intrusive

---

## 17. RTL & Internationalization

### Language Support

- **English (en)** - Default, LTR
- **Arabic (ar)** - Full RTL support

### i18n Implementation

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Usage
t('nav.dashboard', 'Dashboard')
t('common.save', 'Save')
```

### RTL Styling

When Arabic is active:
```css
html[dir="rtl"] {
  /* Mirror layout */
  .sidebar { right: 0; left: auto; }
  
  /* Flip icons */
  .icon-arrow { transform: scaleX(-1); }
  
  /* Adjust text alignment */
  text-align: right;
}
```

### Translation Coverage

- **2000+ translation keys** in `ar.json`
- All 235 pages fully translated
- Navigation, buttons, forms, messages
- Date/number formatting (Hijri calendar support)

---

## 18. Design Tokens Reference

### Complete Token List

```css
:root {
  /* Brand Colors */
  --salis-blue-start: #0A5ED7;
  --salis-blue-end: #0BB3FF;
  --salis-blue-gradient: linear-gradient(135deg, #0A5ED7 0%, #0BB3FF 100%);
  --salis-navy: #0B1F3B;
  --salis-orange: #F97316;

  /* Light Mode Surfaces */
  --salis-bg-light: #E6E9ED;
  --salis-surface-light: #FFFFFF;
  --salis-border-light: #C9D1DA;
  --salis-text-primary-light: #2A2F3A;
  --salis-text-muted-light: #6B7280;

  /* Dark Mode Surfaces */
  --salis-bg-dark: #0E1117;
  --salis-surface-dark: #151A23;
  --salis-border-dark: #232A36;
  --salis-text-primary-dark: #E6EAF0;
  --salis-text-muted-dark: #9BA4B0;

  /* Shadows */
  --shadow: 0px 1px 3px 1px rgba(1, 1, 1, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.15);
  --shadow-black-sm: 0px 1px 2px 0px rgba(1, 1, 1, 0.06), 0px 1px 3px 0px rgba(1, 1, 1, 0.1);
  --shadow-black-lg: 0px 4px 6px -2px rgba(1, 1, 1, 0.05), 0px 12px 16px -4px rgba(1, 1, 1, 0.1);
  --drop-shadow-100: 0px 1px 4px 0px rgba(1, 1, 1, 0.1);

  /* Border Radius */
  --radius: 0.5rem;

  /* Typography Tokens (see Section 3) */
}
```

---

## Appendix A: Screenshot Gallery

All 235 application screenshots are available in the `GUI PRTSCN/` folder:

- **Resolution:** 1920x1080 (Full HD)
- **Format:** PNG
- **Naming:** `###-Page-Name.png` (sequential numbering)
- **Total Size:** 38MB

### Screenshot Categories

| Range | Category | Count |
|-------|----------|-------|
| 001-011 | Dashboard & Customers | 11 |
| 012-018 | Appointments & Scheduling | 7 |
| 019-036 | Vehicle Management | 18 |
| 037-066 | Diagnostics & Inventory | 30 |
| 067-089 | Suppliers & Purchasing | 23 |
| 090-126 | Portals (Tech/Client/Customer) | 37 |
| 127-144 | Reports & HR | 18 |
| 145-171 | Accounting & Finance | 27 |
| 172-192 | Marketing & Compliance | 21 |
| 193-235 | AI, Tech & Settings | 43 |

---

## Appendix B: File Structure

```
client/src/
├── components/
│   ├── ui/              # 53 shadcn/ui components
│   ├── layouts/         # Page layout wrappers
│   ├── Layout.tsx       # Main app shell
│   ├── PageHeader.tsx   # Standard page header
│   ├── SkipLink.tsx     # Accessibility skip link
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   └── ...
├── hooks/
│   ├── use-toast.ts     # Toast notifications
│   └── ...
├── lib/
│   └── utils.ts         # cn() utility for classnames
├── pages/               # 235+ page components
├── i18n/
│   └── locales/
│       ├── en.json      # English translations
│       └── ar.json      # Arabic translations (2000+ keys)
└── index.css            # Design tokens & global styles
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12 | Initial design system documentation |
| 2.0 | 2026-01 | Complete rewrite with logo-only palette, 235 pages |

---

*This document is the authoritative source for SALIS AUTO UI/UX design decisions. All implementations should conform to these guidelines.*
