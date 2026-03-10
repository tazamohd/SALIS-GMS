# SALIS AUTO Design System

## Brand Colors

### Primary Blue Gradient
- Start: `#0A5ED7`
- End: `#0BB3FF`
- CSS Variable: `var(--salis-blue-gradient)`
- Usage: Primary CTAs, headers, brand elements

### Deep Navy
- Hex: `#0B1F3B`
- CSS Variable: `var(--salis-navy)`
- Usage: Dark backgrounds, contrast elements

### Action Orange
- Hex: `#F97316`
- CSS Variable: `var(--salis-orange)`
- Usage: Warnings, critical decisions, urgent CTAs only

## Theme Colors

### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0E1117` | Page background |
| Surface | `#151A23` | Cards, panels |
| Border | `#232A36` | Borders, dividers |
| Text Primary | `#E6EAF0` | Main text |
| Text Muted | `#9BA4B0` | Secondary text |

### Light Mode (Logo-Only Palette)
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#E6E9ED` | Silver Light - Page background |
| Surface | `#FFFFFF` | White - Cards, panels |
| Border | `#C9D1DA` | Cool Gray Light - Borders, dividers |
| Text Primary | `#2A2F3A` | Graphite Gray - Main text |
| Text Muted | `#6B7280` | Muted text |

### Forbidden Colors
- NO green/red/yellow/purple/pink/teal
- NO extra grays not in palette
- NO random hex colors
- NO "success green" – use Blue semantics instead

### Semantic Rules
- **Blue** = data / active / progress / selected / success
- **Orange** = warnings / decisions / risk / critical CTA ONLY
- **Gray/Navy/Silver** = structure, surfaces, borders

## Typography (Strict Scale)

### Fonts
- **Inter**: Primary UI font (fallback: SF Pro, IBM Plex Sans)
- **JetBrains Mono**: Numbers, metrics, code

### Hierarchy
| Level | Size | Weight | Tracking | Usage |
|-------|------|--------|----------|-------|
| H1 | 28-32px | Bold (700) | -0.03em | Page titles |
| H2 | 20-24px | Medium (500) | -0.02em | Section headers |
| H3 | 16-18px | Medium (500) | -0.02em | Card titles |
| Body | 14-15px | Regular (400) | normal | Content text |
| Label | 11-12px | Medium (500) | 0.025em | Form labels, captions |

## Components

### Buttons
- **Primary**: Blue gradient background
- **Secondary**: Outline with blue border
- **Danger**: Orange background (use sparingly)

### Cards
- Surface background with subtle border
- Hover: slight elevation + blue border accent
- Rounded corners: 0.75rem

### Status Pills
- Blue: Info, active states
- Gray: Neutral, inactive
- Orange: Warnings, attention needed

### Forms
- Input height: 44px (touch-friendly)
- States: default, hover, focus, error, disabled
- Focus: Blue ring

## Layout

### AppShell Structure
1. **Left Sidebar**: Icon-first, collapsible (200-400px)
2. **Top Bar**: Search, notifications, theme toggle, user menu
3. **Main Content**: Modular cards with proper spacing
4. **Right Panel** (optional): Activity, alerts

### Spacing
- Section: 2rem (32px)
- Content: 1.5rem (24px)
- Item: 1rem (16px)

## Accessibility

- WCAG 2.1 AA compliant
- Touch targets: minimum 44x44px
- Focus states: visible ring on all interactive elements
- Skip links for keyboard navigation
- High contrast text ratios

## Chart Colors
Use brand-safe palette only:
- Blues: `#0A5ED7`, `#0BB3FF`, `#38BDF8`
- Grays: `#64748B`, `#9BA4B0`
- Orange: `#F97316` (warnings only)

## CSS Utility Classes

```css
.btn-primary      /* Gradient blue button */
.btn-secondary    /* Outline blue button */
.btn-danger       /* Orange button */
.brand-card       /* Themed card */
.status-pill-blue /* Blue status pill */
.status-pill-orange /* Orange status pill */
.status-pill-gray /* Gray status pill */
.text-gradient-salis /* Gradient text */
.empty-state-container /* Empty state wrapper */
```
