# Login Dashboard Project

## Overview
This project is a full-stack SaaS application for garage management, offering a comprehensive, module-based system for managing operations, technician workflows, customer service, and business analytics. It features a modern, responsive UI, built with TypeScript, and covers job cards, appointments, invoicing, reporting, vehicle management, estimates, SMS notifications, and scheduling. The business vision is to provide a complete, integrated platform for efficient garage operations, enhancing customer satisfaction and business growth.

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- Continue developing and testing new features directly within the authenticated Figma interface
- SALIS AUTO brand design system applied across entire UI (October 17, 2025)
- Official SALIS AUTO logo integrated (October 17, 2025)
- Dark theme enforced - avoid white backgrounds throughout the application

## Design System (SALIS AUTO Brand)
### Color Palette (Updated October 17, 2025)
- **Dark Navy (#0A0F1C)**: Primary background color for sidebar, cards, and dark sections
- **Electric Blue (#00BFFF)**: Main wireframe lines, primary accent for interactive elements
- **Cyber Blue (#008CFF)**: Highlighted lines, active states, and CTAs
- **Neon Blue (#1F6FFF)**: Secondary glow, icon outlines, and hover states
- **Teal Glow (#00E0FF)**: Subtle digital aura and highlight effects
- **Brand Blue (#0055b4)**: Primary brand accent for buttons and key actions
- **Brand Orange (#ce5c17)**: Energy/growth accent used for alerts and special actions
- **Soft White (#eaf2ff)**: Typography and highlights in dark backgrounds
- **Gradient**: Linear gradient from Electric Blue (#00BFFF) → Cyber Blue (#008CFF) → Teal Glow (#00E0FF)

### Typography
- **Primary Font (Headers/Logo)**: Montserrat (Medium/SemiBold/Bold)
  - Logo: Montserrat Bold, with gradient text effect
  - H1: Montserrat SemiBold, 2.5rem
  - H2: Montserrat SemiBold, 2rem
  - H3: Montserrat Medium, 1.5rem
- **Secondary Font (Body/UI)**: Poppins and Inter
  - Body text: Poppins Regular, 14-16px
  - Subheadings: Poppins Medium, 18-24px
  - Captions/Labels: Inter Light/Regular, 12-14px
  - UI elements: Poppins Medium/SemiBold

### Implementation Details
- Google Fonts imported in index.css
- Custom Tailwind color classes: `dark-navy`, `electric-blue`, `cyber-blue`, `neon-blue`, `teal-glow`, `brand-blue`, `brand-orange`, `soft-white`, `chrome-silver`, `dark-steel`
- Typography utilities: `font-montserrat`, `font-poppins`, `font-inter`
- Gradient utility class: `text-gradient-salis` for logo and special text
- Updated shadcn/ui theme colors to match brand palette
- **All primary buttons use brand orange (#ce5c17)** - button.tsx primary variant updated
- Applied across Layout (sidebar, header, search bar), Dashboard, and all major components
- **Dark Theme Implementation**:
  - Official SALIS AUTO S logo displayed in sidebar and login screen
  - Backgrounds: Dark Navy (#0A0F1C) for all backgrounds, cards, sidebar, and header
  - Text: Soft White (#eaf2ff) for primary text, with reduced opacity for secondary text
  - Borders: Neon Blue (#1F6FFF) at 30% opacity for subtle separations and glows
  - Search bar: Neon Blue background at 10% opacity with matching borders
  - No white backgrounds used - all surfaces use dark theme colors from the tech palette
  - Cards feature gradients with brand colors (Electric Blue, Cyber Blue, Teal Glow) at low opacity (20-30%) over dark backgrounds
  - Status badges use Electric Blue, Cyber Blue, Neon Blue, Teal Glow, and Brand Orange with 10% background opacity
  - Navigation: Active items use Electric Blue background with dark navy text, inactive items use soft white text with neon blue hover effect

## System Architecture
The application utilizes a full-stack architecture with clear client-server separation.
- **Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components, adhering to the original Figma design.
- **Backend**: Express server written in TypeScript.
- **Authentication**: Replit Auth for secure session management.
- **Database**: PostgreSQL with Drizzle ORM.
- **Key Features**: Includes modules for Job Cards, Appointments, Tool Management, Customer Management, Purchase Orders, Invoicing, Reporting, Vehicle Management (service history, VIN decoding, reminders), Estimates & Quotes, SMS Notifications (Twilio), Scheduling & Calendar, Inventory & Parts Management (low stock alerts, barcode scanning, TecDoc integration), Advanced Financial Features (multi-provider payments, payment plans, tax automation, profit margin analysis), Search & Filtering (global search, advanced filters, bulk operations, data import/export), Business Intelligence & Analytics (customer lifetime value, profitable services, peak hours, technician utilization), Staff & HR Management (time tracking, shift scheduling, commission calculation, performance reviews), AI Automation & Insights (AI-powered estimations, predictive maintenance, parts recommendations, schedule optimization, AI chatbot via Replit AI/OpenAI gpt-5), Third-Party Integrations (Google Calendar, Gmail), and Security & Compliance (2FA via speakeasy, audit logging, data backup/restore, GDPR tools, granular permissions).
- **UI/UX Decisions**: Preserves Figma design, ensures responsiveness, and uses a consistent component-based approach with tabbed interfaces. Implements PWA support, mobile-responsive navigation, and WCAG 2.1 AA accessibility features. Includes an offline mode with service worker caching. The sidebar navigation is reorganized into 11 logical, collapsible groups.
- **Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Comprehensive user settings, print system, undo/redo system, keyboard shortcuts, and a robust currency system are implemented. Action history is tracked for audit trails.

## External Dependencies
- **Replit Auth**: User authentication.
- **PostgreSQL**: Primary database.
- **Express.js**: Backend framework.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **wouter**: Frontend routing.
- **@tanstack/react-query**: Data fetching.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: CSS framework.
- **Drizzle ORM**: ORM for PostgreSQL.
- **Zod**: Schema validation.
- **recharts**: Data visualization.
- **Twilio**: SMS notifications.
- **NHTSA API**: VIN decoding.
- **TecDoc API**: Parts catalog lookup.
- **Stripe**: Payment processing.
- **PayPal**: Payment processing.
- **react-big-calendar**: Calendar component.
- **date-fns**: Date utility library.
- **@zxing/library**: Barcode scanning.
- **Replit AI Integrations (OpenAI)**: AI features (gpt-5 model).
- **Google Calendar**: Replit connector integration.
- **Gmail**: Replit connector integration.
- **speakeasy**: Two-factor authentication.
- **qrcode**: QR code generation.