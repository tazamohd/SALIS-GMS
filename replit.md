# Login Dashboard Project

## Overview
This project is a full-stack SaaS application for garage management. It provides a comprehensive, module-based system for managing garage operations, technician workflows, customer service, and business analytics. The application features a modern, responsive UI, is built with TypeScript, and offers a complete solution covering job cards, appointments, invoicing, reporting, vehicle management, estimates, SMS notifications, and scheduling for garage businesses. The business vision is to provide a complete, integrated platform for efficient garage operations, enhancing customer satisfaction and business growth.

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design
- Continue developing and testing new features directly within the authenticated Figma interface
- Preserve original Figma design while adding functionality

## System Architecture
The application utilizes a full-stack architecture with clear client-server separation.
- **Frontend**: React 18 with Vite, `wouter` for routing, and `TanStack Query` for state management. UI components use `shadcn/ui` based on Radix UI primitives, adhering to the original Figma design with custom design tokens and typography.
- **Backend**: Express server written in TypeScript.
- **Authentication**: Replit Auth handles secure session management.
- **Database**: PostgreSQL with Drizzle ORM for schema definition and interaction, supporting complex schemas for various garage management entities.
- **Key Features**: Includes a login dashboard and modules for Job Cards, Appointments, Tool Management, Customer Management, Purchase Orders, Invoicing, Reporting, Vehicle Management (including service history, maintenance schedules, VIN decoding, photo gallery, service reminders, warranty tracking), Estimates & Quotes (with status workflow and conversion to job cards/invoices), SMS Notifications (via Twilio with granular preferences), Scheduling & Calendar (with multiple views, technician availability, recurring appointments, and conflict detection), Inventory & Parts Management (Module 27: featuring low stock alerts with acknowledgment workflow, automatic reordering based on thresholds, barcode scanning with HTML5 camera API, pricing history tracking, complete inventory audit trail, multi-location transfers with approval workflow, and TecDoc integration for parts catalog lookup with response caching), Advanced Financial Features (Module 28: multi-provider payment processing with Stripe and PayPal, payment plans/installments with automated scheduling, refund management with approval workflow, rule-based tax calculation automation, comprehensive discounts/promotions system with validation, and profit margin analysis with cost tracking), Search & Filtering (Module 29: global search across all modules with cross-module results, advanced filtering with saved filter presets for user-specific and garage-wide configurations, bulk operations for delete/update across modules, and data import/export functionality with CSV/JSON support for data migration and backups), Business Intelligence & Analytics (Module 30: customer lifetime value tracking with top customer rankings, most profitable services analysis with profit margin visualization, peak hours/days analysis with hourly and daily distribution charts, technician utilization rates showing hours worked vs available, and customer acquisition cost tracking with source attribution), Staff & HR Management (Module 31: comprehensive employee time tracking with clock in/out and break management, shift scheduling with reusable templates and assignments, automated commission calculation for technicians with flexible rule-based system supporting percentage/fixed/tiered structures, performance reviews with multi-dimensional ratings and acknowledgment workflow, training and certification tracking with expiry monitoring, all features fully secured with garage-scoped multi-tenant isolation and Zod input validation), and AI Automation & Insights (Module 32: AI-powered job time and cost estimation with historical data analysis, predictive maintenance suggestions based on vehicle history and mileage, automated parts recommendations for service types, smart schedule optimization for technician assignments, AI customer support chatbot for inquiries, powered by Replit AI Integrations using OpenAI gpt-5 model, all features with confidence scores and reasoning explanations), Third-Party Integrations (Module 33: Google Calendar and Gmail integrations via Replit connectors with connection management UI, sync status tracking, and graceful error handling for missing connections, stub implementations for QuickBooks/Xero accounting and OBD-II diagnostics awaiting user API credentials), and Security & Compliance (Module 34: comprehensive two-factor authentication (2FA) with TOTP, QR codes, and backup codes using speakeasy library, automatic audit logging middleware tracking all CRUD operations with user ID, IP address, and resource details, data backup and restore functionality with full/incremental/database-only options, GDPR compliance tools for data export/deletion/rectification requests with workflow management, user consent tracking with IP address logging for marketing/analytics/data processing, and granular permission overrides system with expiration dates and reason tracking, all features integrated with tabbed Security & Compliance UI page). Form validation is implemented using Zod schemas shared between frontend and backend.
- **UI/UX Decisions**: Emphasizes preserving the original Figma design, ensuring responsiveness, and utilizing a consistent component-based approach with tabbed interfaces for complex modules.

## External Dependencies
- **Replit Auth**: User authentication and secure session management.
- **PostgreSQL**: Primary database.
- **Express.js**: Backend web framework.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **wouter**: Frontend routing.
- **@tanstack/react-query**: Data fetching and state management.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **Zod**: Schema declaration and validation.
- **recharts**: Data visualization.
- **Twilio**: SMS notification integration.
- **NHTSA API**: Free VIN decoding service.
- **TecDoc API**: Parts catalog lookup service (requires TECDOC_API_URL and TECDOC_API_KEY environment variables).
- **Stripe**: Payment processing provider (requires STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY environment variables).
- **PayPal**: Payment processing provider (requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables, managed via Replit blueprint integration).
- **react-big-calendar**: Calendar component for scheduling.
- **date-fns**: Date utility library (used with react-big-calendar).
- **@zxing/library**: Barcode scanning library for inventory management.
- **Replit AI Integrations (OpenAI)**: AI-powered features using gpt-5 model for job estimation, predictive maintenance, parts recommendations, schedule optimization, and customer support chatbot (requires AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY environment variables, automatically set by Replit).
- **Google Calendar**: Replit connector integration for appointment syncing (connection:conn_google-calendar_01K7P5FJS6Q2VZMWCN5FGWYBFN).
- **Gmail**: Replit connector integration for email notifications (connection:conn_google-mail_01K7P5HHZF5PMG9XG1NW7AK0Y9).
- **speakeasy**: TOTP-based two-factor authentication library for generating and verifying time-based one-time passwords.
- **qrcode**: QR code generation library for 2FA setup QR codes.

## Integration Notes
- **HubSpot CRM**: User declined the connector integration. For CRM functionality, request HubSpot API credentials to store as secrets for manual integration if needed in the future.
- **QuickBooks/Xero**: No native Replit connector available. Will implement manual integration with user-provided API credentials when requested.
- **OBD-II Diagnostics**: No native connector. Will implement manual integration with OBD adapter API/SDK when requested.

## Recent Updates (Module 35 - System Improvements)
### Settings & Preferences (Completed)
- **User Settings Database**: Created user_settings table with comprehensive preference storage including timezone, date/time formats, language, currency, theme, font size, notification preferences, and custom print settings
- **Settings UI**: Built tabbed interface with 6 sections:
  - General: Timezone, date/time formats, notifications, sounds
  - Language: Multi-language support (UI ready, translations pending)
  - Currency: Multi-currency support with 9 major currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR)
  - Appearance: Theme (light/dark/auto), font size, compact mode
  - Print: Paper size, header/footer options, logo display
  - Keyboard Shortcuts: Display of available shortcuts with enable/disable toggle

### Print System (Completed)
- **Print Styles**: Comprehensive CSS media queries in index.css for professional printing
- **Document Types**: Specialized styles for invoices, job cards, reports, and general documents
- **Print Features**: Page breaks, signature lines, header/footer support, QR code/barcode printing, terms and conditions formatting

### Undo/Redo System (Completed)
- **UndoRedoContext**: React context provider with action history tracking (max 50 actions)
- **Action Tracking**: Backend integration saves action history to database for audit trail
- **API**: Full undo/redo functionality with async action execution
- **UI Integration**: Available via keyboard shortcuts and will integrate into future UI controls

### Keyboard Shortcuts (Completed)
- **Global Shortcuts Hook**: Created useKeyboardShortcuts with platform-aware handling (Mac/Windows)
- **Default Shortcuts**:
  - Cmd/Ctrl + Z: Undo last action
  - Cmd/Ctrl + Shift + Z / Cmd/Ctrl + Y: Redo action
  - Cmd/Ctrl + P: Print current page
  - Cmd/Ctrl + S: Save prompt
  - Cmd/Ctrl + K: Quick actions (already implemented)
  - Esc: Close dialogs/modals
- **Settings Integration**: Keyboard shortcuts can be enabled/disabled in Settings page
- **Custom Shortcuts**: useCustomShortcut hook available for component-specific shortcuts

### Currency System (Completed)
- **Currency Utilities**: Created comprehensive currency formatting library in client/src/lib/currency.ts
- **Features**: Format amounts, convert between currencies, parse currency strings, get symbols
- **Exchange Rates**: Mock exchange rates included (ready for real-time API integration)
- **User Preferences**: Integration with user settings for default currency display

### Action History (Completed)
- **Database**: action_history table tracks all user actions with type, description, and metadata
- **API Routes**: POST endpoint for creating action history records
- **Integration**: UndoRedoContext automatically saves actions to backend for persistence and audit trail

## Recent Updates (Module 36 - Mobile & Accessibility)
### Progressive Web App (PWA) Support (Completed)
- **PWA Manifest**: Complete manifest.json with app metadata, icons, screenshots, and shortcuts
- **Service Worker**: Comprehensive offline caching with cache-first for static assets, network-first for API calls
- **Install Prompts**: Automatic PWA install prompt with beforeinstallprompt handling
- **Push Notifications**: Service worker support for push notifications and notification clicks
- **Background Sync**: Foundation for syncing offline data when connection is restored

### Mobile-Responsive Navigation (Completed)
- **Hamburger Menu**: Mobile-friendly navigation with slide-in sidebar and overlay
- **Responsive Header**: Adaptive header with mobile menu toggle and responsive search bar
- **Touch-Friendly**: Large touch targets (min 44x44px) for mobile interactions
- **Auto-Close**: Mobile menu automatically closes on route change
- **Smooth Transitions**: CSS transitions for drawer open/close animations

### Accessibility Features (WCAG 2.1 AA) (Completed)
- **Skip Links**: Keyboard-accessible skip to main content link
- **ARIA Labels**: Comprehensive aria-label, aria-live, role attributes throughout UI
- **Keyboard Navigation**: Full keyboard support with visible focus states
- **Screen Reader Support**: Semantic HTML, proper heading hierarchy, and ARIA live regions
- **Offline Indicator**: Visual and screen reader accessible offline/online status with aria-live regions

### Offline Mode (Completed)
- **Service Worker Caching**: Cache-first strategy for static assets, network-first with cache fallback for API
- **Offline Detection**: Real-time online/offline status monitoring
- **Visual Indicators**: Toast notifications when going offline/back online
- **Cached API Responses**: GET API requests cached for offline access
- **Graceful Degradation**: App continues to work with cached data when offline
