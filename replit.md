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
### Color Palette (Monochrome - Updated October 18, 2025)
**Simple Monochrome Palette:**
- **Black (#010101)**: Primary text, active states, primary buttons, dark backgrounds
- **White (#FFFFFF)**: Backgrounds (light mode), text on dark backgrounds, light elements
- **Gray (#6B7280)**: Secondary text, muted elements, borders
- **Gray Light (#D1D5DB)**: Subtle borders, disabled states, light backgrounds
- **Gray Dark (#374151)**: Hover states, dark mode borders, tertiary elements
- **50% Black (#808080)**: Secondary buttons, muted accents

**Additional:**
- No colored accents - pure grayscale design
- Supports both light and dark modes with proper contrast

**Gradient**: Linear gradient from Black (#000000) → Gray (#505050) → 50% Black (#808080)

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
- **Monochrome Tailwind color palette**: `salis-black`, `salis-white`, `salis-gray`, `salis-gray-light`, `salis-gray-dark`, `salis-50-black`
- **NO colored accents - pure grayscale design throughout the entire application**
- Typography utilities: `font-montserrat`, `font-poppins`, `font-inter`
- Gradient utility class: `text-gradient-salis` for logo (grayscale gradient)
- Updated shadcn/ui theme colors to match monochrome palette
- **All primary buttons use black (#010101)** with white text
- Applied across Layout (sidebar, header, search bar), Dashboard, Security, and all major components
- **Light/Dark Theme Implementation**:
  - Official SALIS AUTO S logo displayed in sidebar and login screen
  - Light Mode:
    - Backgrounds: White (#FFFFFF) for main backgrounds, light gray for cards
    - Text: Black (#010101) for primary text, grays for secondary
    - Borders: Light gray (#D1D5DB) for subtle separations
  - Dark Mode:
    - Backgrounds: Near-black (#010101) for main backgrounds, dark gray for cards
    - Text: White (#FFFFFF) for primary text, light grays for secondary
    - Borders: Dark gray (#374151) for subtle separations
  - Navigation: Active items use black background with white text (light mode) or white background with black text (dark mode)
  - Status badges use grayscale variations

## System Architecture
The application utilizes a full-stack architecture with clear client-server separation.
- **Frontend**: React 18 with Vite, `wouter` for routing, `TanStack Query` for state management, and `shadcn/ui` (Radix UI) for components, adhering to the original Figma design.
- **Backend**: Express server written in TypeScript.
- **Authentication**: Custom email/password authentication with role-based access control.
- **Database**: PostgreSQL with Drizzle ORM - **48 comprehensive modules** with 70+ tables.
- **Real-Time Features**: WebSocket server for in-app chat support and live notifications.

### **Core Modules (1-36)** - Fully Implemented
1. **SaaS & Multi-Tenant Management**: Garage and branch management with plans
2. **User & Role Management**: 7 user types with granular permissions
3. **Customer Profiles**: Comprehensive customer data with preferences
4. **Technician Management**: Skills, certifications, performance tracking
5. **Vehicle Management**: Complete vehicle records with service history, VIN decoding, maintenance schedules
6. **Job Cards**: Work order management with status tracking
7. **Appointments**: Scheduling system with reminders
8. **Tool Management**: Equipment tracking and calibration
9. **Spare Parts Inventory**: Multi-location stock management, barcode scanning, low stock alerts
10. **TecDoc Integration**: Parts catalog lookup
11. **Purchase Orders**: Supplier management and ordering
12. **Invoicing & Billing**: Multi-currency invoice generation
13. **Payments**: Stripe & PayPal integration with payment plans
14. **Estimates & Quotes**: Digital estimate generation and approval
15. **Reports & Analytics**: Business intelligence dashboard
16. **SMS Notifications**: Twilio integration for customer communications
17. **Service Reminders**: Automated maintenance notifications
18. **Vehicle Service History**: Complete repair and maintenance logs
19. **Tax Configuration**: Automated tax calculations
20. **Discounts & Promotions**: Campaign management
21. **Data Import/Export**: Bulk operations support
22. **Global Search**: Advanced filtering across all entities
23. **Saved Filter Presets**: Custom search configurations
24. **Notifications**: In-app, email, and SMS notifications
25. **Commission Management**: Technician commission tracking and rules
26. **Employee Attendance**: Time tracking and shift management
27. **Shift Templates**: Flexible scheduling system
28. **Performance Reviews**: Employee evaluation system
29. **Training Programs**: Employee skill development tracking
30. **Stock Alerts**: Low inventory notifications
31. **Security & Compliance**: 2FA, audit logs, GDPR tools
32. **User Settings**: Personalized preferences
33. **Action History**: Complete audit trail
34. **Permission System**: Granular access control
35. **Consent Management**: GDPR compliance
36. **In-App Chat Support**: Real-time WebSocket-based team collaboration

### **Advanced Modules (37-48)**
37. **Customer Self-Service Portal** (✓ COMPLETED): Online booking, service history viewing, estimate approval, payment processing, digital receipts, session management with token revocation
38. **Digital Signatures & Media Documentation** (✓ COMPLETED): Canvas-based signature capture with consent tracking, photo/video upload with validation, before/after comparison gallery, media categorization (damage/walkaround/invoice/estimate), server-side security (10MB limit, MIME type whitelist, base64 validation), audit trail (IP address, device info, timestamps), reusable components across job cards/estimates/inspections
39. **QR Code Check-In System** (✓ COMPLETED): Server-side QR generation with PNG images, unique QR codes per appointment/customer/vehicle, scan validation (expiration/already used/invalid), automated check-in workflow (appointment status update, SMS notification, in-app notification), scan logging (device info, IP address, scan results), appointment status history tracking, frontend components (QRCodeGenerator with download/print, QRScanner with autoCheckIn support)
40. **Fleet Management** (✓ COMPLETED): 5-tab interface (Groups, Vehicles, Contracts, Pricing, Schedules) with full CRUD operations, corporate fleet client management with billing details, fleet vehicle assignments, service contracts with terms & conditions, volume-based pricing tiers with garage-specific rules, automated maintenance scheduling, comprehensive filtering and search, data-testid coverage for QA automation
41. **Warranty Tracking** (✓ COMPLETED): 2 database tables (warranties, warranty_claims) with indexes, 16 storage methods (10 warranties, 6 claims), 16 API routes with authentication, 3-tab UI (Active Warranties, Expired, Claims), parts & labor warranty management, warranty claims processing with status tracking (Submitted/Approved/Rejected/Paid), expiration alerts (30-day banner), transferable warranties, comprehensive data-testid coverage for QA automation, strong TypeScript typing throughout, SALIS AUTO design system compliance
42. **Marketing Automation**: Email/SMS campaigns, customer segmentation, birthday promotions, review requests, campaign analytics
43. **Vendor/Supplier Portal** (✓ COMPLETED): 2 database tables (supplierPriceList, supplierPerformance), 11 storage methods (price lists, performance tracking, price comparison), 11 API routes with authentication & Zod validation, 4-tab UI (Suppliers, Price Lists, Performance, Reorder Rules), multi-supplier price comparison with side-by-side cards, automated reordering rules with min/max stock levels, supplier performance tracking with quality scores, comprehensive data-testid coverage (71 attributes), SALIS AUTO monochrome design compliance, zero LSP errors
44. **Customer Loyalty Program**: Points system, membership tiers (Bronze/Silver/Gold/Platinum), referral tracking, rewards catalog, redemption management
45. **Vehicle Inspection Checklists** (✓ COMPLETED): 2 database tables (inspection_templates, vehicle_inspections), 10 storage methods (templates & inspections CRUD), 10 API routes with authentication & Zod validation, 2-tab UI (Templates, Inspections), customizable inspection templates with JSON checklist items, digital multi-point inspections with findings & recommendations, auto-estimate generation support, comprehensive data-testid coverage, SALIS AUTO design system compliance, zero LSP errors
46. **Towing & Roadside Assistance** (✓ COMPLETED): 2 database tables (towing_requests, tow_trucks), 11 storage methods (requests, trucks, GPS location tracking), 11 API routes with authentication & Zod validation, 2-tab UI (Towing Requests, Tow Trucks), service type tracking (towing, jumpstart, tire change, fuel delivery, lockout), GPS coordinates for pickup/dropoff locations, status badges (requested/assigned/en_route/arrived/in_progress/completed/cancelled), urgency levels (normal/urgent/emergency), truck fleet management with capacity levels, comprehensive data-testid coverage, SALIS AUTO design system compliance, zero LSP errors
47. **Document Management**: Centralized document storage, expiration tracking, access logging, category management (insurance, registration, contracts)
48. **Loaner Vehicle Management** (✓ COMPLETED): 2 database tables (loaner_vehicles, loaner_reservations), 10 storage methods (vehicles & reservations CRUD), 10 API routes with authentication & Zod validation, 2-tab UI (Loaner Fleet, Reservations), fleet inventory management with vehicle condition tracking (excellent/good/fair/poor), reservation system with start/end dates and fuel level tracking (empty/quarter/half/three_quarters/full), damage documentation with damage charge tracking, deposit management (paid/refunded), mileage tracking (start/end), status tracking (available/reserved/on_loan/maintenance/retired for vehicles, reserved/active/returned/late/cancelled for reservations), comprehensive data-testid coverage, SALIS AUTO design system compliance, zero LSP errors

- **UI/UX Decisions**: Preserves Figma design, ensures responsiveness, and uses a consistent component-based approach with tabbed interfaces. Implements PWA support, mobile-responsive navigation, and WCAG 2.1 AA accessibility features. Includes an offline mode with service worker caching. The sidebar navigation is reorganized into 11 logical, collapsible groups.
- **Technical Implementations**: Form validation uses Zod schemas shared between frontend and backend. Comprehensive user settings, print system, undo/redo system, keyboard shortcuts, and a robust currency system are implemented. Action history is tracked for audit trails. Database seeded with realistic sample data across all major sections.

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