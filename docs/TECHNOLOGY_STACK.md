# SALIS AUTO - Technology Stack Documentation

## Platform Overview
SALIS AUTO is a world-class automotive ERP platform built with modern web technologies, designed for efficient garage operations at enterprise scale with 141+ comprehensive modules across 13 phases.

---

## Core Technology Stack

### Frontend Technologies

#### Framework & Build Tools
- **React 18** - Modern UI library with hooks and concurrent features
- **Vite** - Next-generation frontend build tool for fast development
- **TypeScript** - Static typing for improved code quality and developer experience
- **Wouter** - Lightweight client-side routing (~1.5KB)

#### State Management & Data Fetching
- **TanStack Query v5** (React Query) - Powerful async state management
  - Server state synchronization
  - Automatic caching and invalidation
  - Background refetching
  - Optimistic updates

#### UI Component Library
- **shadcn/ui** - High-quality, accessible component collection built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
  - Accordion, Dialog, Dropdown, Select, Tabs, Toast, and 20+ more components
  - WCAG 2.1 AA compliant
  - Keyboard navigation support

#### Styling & Design System
- **Tailwind CSS v4** - Utility-first CSS framework
  - Custom color palette based on SALIS AUTO branding
  - Dark mode support with class-based theming
  - Responsive design utilities
- **Tailwind CSS Plugins**:
  - @tailwindcss/typography - Beautiful typographic defaults
  - tailwindcss-animate - Animation utilities
  - tw-animate-css - Extended animation library
- **CSS Variables** - HSL-based theming system for light/dark modes

#### Form Management
- **React Hook Form** - Performant form state management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between React Hook Form and Zod
- **drizzle-zod** - Auto-generated Zod schemas from database models

#### Data Visualization
- **Recharts** - Composable charting library built on React components
  - Line charts, bar charts, pie charts, area charts
  - Responsive and customizable
  - Used in analytics dashboards across 20+ modules

#### Specialized Libraries
- **React Big Calendar** - Event calendar component with drag-and-drop
- **React DnD** - Drag-and-drop functionality with HTML5 backend
- **date-fns** - Modern date utility library
- **Lucide React** - Beautiful, consistent icon set (600+ icons)
- **React Icons** - Icon library aggregator (company logos via react-icons/si)

#### Advanced Features
- **Framer Motion** - Production-ready animation library
- **React Resizable Panels** - Flexible panel layouts
- **Embla Carousel** - Lightweight carousel library
- **Input OTP** - One-time password input component
- **React Day Picker** - Accessible date picker component
- **Next Themes** - Theme management with system preference detection

---

### Backend Technologies

#### Server Framework
- **Express.js** - Fast, unopinionated web framework for Node.js
- **TypeScript** - Full type safety across backend codebase
- **tsx** - TypeScript execution and REPL for Node.js

#### Database & ORM
- **PostgreSQL** - Enterprise-grade relational database (Neon-backed on Replit)
  - 290+ tables supporting 141 modules
  - ACID compliance for data integrity
  - Advanced indexing and query optimization
- **Drizzle ORM** - TypeScript ORM with type-safe queries
  - Zero runtime overhead
  - Automatic migrations with drizzle-kit
  - Full TypeScript inference
  - SQL-like query builder

#### Authentication & Security
- **Passport.js** - Authentication middleware
  - passport-local for email/password authentication
  - Session-based authentication
- **bcrypt** - Password hashing (10 rounds)
- **express-session** - Session middleware
  - connect-pg-simple for PostgreSQL session store
  - memorystore for in-memory session backup
- **cookie-signature** - Cookie signing for tamper prevention
- **speakeasy** - Two-factor authentication (TOTP)
- **qrcode** - QR code generation for 2FA setup
- **express-rate-limit** - API rate limiting protection

#### Real-Time Communication
- **WebSocket (ws)** - Bidirectional real-time communication
  - In-app chat support system
  - Live notifications
  - Call center real-time updates
  - IoT dashboard live monitoring
  - Session-based authentication for WebSocket connections

---

## External Integrations & APIs

### Payment Processing
- **Stripe** - Primary payment gateway
  - @stripe/stripe-js - Client-side Stripe library
  - @stripe/react-stripe-js - React components for Stripe
  - stripe (server SDK) - Server-side payment processing
- **PayPal** - Alternative payment gateway
  - @paypal/paypal-server-sdk - Server-side PayPal integration

### Communication Services
- **Twilio** - SMS and communication platform
  - Appointment reminders
  - Marketing campaigns
  - Two-factor authentication
  - Emergency notifications

### AI & Machine Learning
- **OpenAI** (via Replit AI Integrations)
  - GPT-5 for predictive diagnostics
  - AI chatbot assistant
  - Smart job assignment recommendations
  - Intelligent parts recommendations
  - Schedule optimization

### Productivity & Calendar
- **Google Calendar** - Appointment scheduling integration
- **Gmail (Google Mail)** - Email integration for communications

### Automotive Data
- **NHTSA API** - Vehicle identification and safety data
- **TecDoc API** - OEM parts catalog integration

### OAuth & Identity
- **OpenID Client** - OpenID Connect authentication

---

## Development Tools & Utilities

### Build & Development
- **Vite Plugins**:
  - @vitejs/plugin-react - Fast Refresh and JSX support
  - @replit/vite-plugin-cartographer - Replit-specific optimizations
  - @replit/vite-plugin-runtime-error-modal - Enhanced error display
- **esbuild** - Fast JavaScript bundler
- **PostCSS** - CSS transformation tool
- **Autoprefixer** - Automatic vendor prefixes for CSS

### Code Quality
- **TypeScript** - Static type checking across entire codebase
  - @types/node, @types/react, @types/express (and 15+ more type packages)
- **ESLint** (configured) - Code linting
- **Prettier** (configured) - Code formatting

### Utilities
- **class-variance-authority (cva)** - CSS class variance management
- **clsx** - Conditional className utility
- **tailwind-merge** - Intelligent Tailwind class merging
- **memoizee** - Function memoization for performance
- **jspdf** - PDF generation
- **jspdf-autotable** - PDF table generation
- **@zxing/library** - Barcode and QR code scanning

### Internationalization
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **i18next-browser-languagedetector** - Automatic language detection

---

## Architecture Patterns

### Design Patterns
- **Component-Based Architecture** - Modular, reusable UI components
- **Custom Hooks** - Shared business logic extraction
- **Layout Components** - 7 standardized page archetypes:
  - StandardPageLayout - General-purpose pages
  - StandardTablePage - Data table pages with filters
  - TabsPageLayout - Multi-tab interfaces
  - DashboardPage - KPI metrics and dashboards
  - AnalyticsPage - Charts and analytics
  - MobileCardPage - Mobile-responsive card layouts
  - FormPage - Form-centric pages

### State Management Strategy
- **Server State** - TanStack Query for API data
- **UI State** - React useState and useReducer
- **Form State** - React Hook Form
- **Global State** - Context API where needed
- **Cache Management** - Automatic with TanStack Query

### Type Safety
- **End-to-End Types** - Shared types between frontend and backend
- **Schema Validation** - Zod schemas for runtime validation
- **Database Types** - Auto-generated from Drizzle schema
- **API Types** - Type-safe request/response contracts

---

## Data Architecture

### Database Schema
- **141 Modules** with 290+ tables
- **Schema Definition** - Single source of truth in `shared/schema.ts`
- **Relationships** - Foreign keys and proper indexing
- **Audit Trail** - Created/updated timestamps on all entities

### Key Modules
- SaaS & Multi-Tenant Management
- User & Role Management (RBAC)
- Customer & Vehicle Management
- Job Cards & Work Orders
- Inventory & Parts Management
- Invoicing & Payment Processing
- Analytics & Reporting
- Franchise Management
- OBD Diagnostics Integration
- AI & Automation
- Blockchain Service History
- IoT & Telematics
- And 129+ more...

---

## Security Features

### Authentication
- Secure password hashing with bcrypt
- Session-based authentication
- Two-factor authentication (TOTP)
- Role-based access control (RBAC)
- WebSocket authentication

### Data Protection
- SQL injection prevention (parameterized queries)
- XSS protection (React's built-in escaping)
- CSRF protection (session tokens)
- Rate limiting on API endpoints
- Secure cookie handling

### Compliance
- GDPR compliance features
- Saudi Arabia VAT & ZATCA E-Invoicing
- Audit logs for all critical actions
- Data encryption at rest (PostgreSQL)
- TLS encryption in transit

---

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Image optimization
- Lazy loading for heavy components
- Memoization with React.memo and useMemo
- Virtual scrolling for large lists
- Optimistic UI updates

### Backend
- Database query optimization
- Connection pooling
- Response caching where appropriate
- Efficient WebSocket event handling

### Build
- Vite's fast HMR (Hot Module Replacement)
- Tree shaking for smaller bundles
- CSS purging with Tailwind
- Asset compression

---

## Mobile & Progressive Web App

### PWA Features
- Service worker for offline support
- App manifest for installation
- Responsive design across all breakpoints
- Touch-optimized interactions

### Mobile Applications
- **React Native** - Cross-platform mobile apps (separate codebase)
  - Technician mobile app
  - Customer mobile app
  - Manager dashboard app
- Backend API documentation for mobile integration

---

## Development Workflow

### Package Management
- **npm** - Node package manager
- Automatic dependency installation via Replit
- Version locking with package-lock.json

### Development Server
- Vite dev server with HMR
- Express backend server
- Concurrent frontend/backend serving on port 5000
- WebSocket server on /ws/chat

### Database Migrations
- **Drizzle Kit** - Schema migrations
- `npm run db:push` - Push schema changes to database
- No manual SQL migrations

### Environment Variables
- Frontend: `VITE_` prefixed variables
- Backend: Standard process.env
- Secret management via Replit Secrets
- DATABASE_URL auto-configured

---

## Deployment

### Replit Platform
- Automatic deployments (Publishing)
- Built-in PostgreSQL database (Neon)
- TLS certificates included
- Custom domain support
- `.replit.app` subdomain
- Health checks
- Auto-scaling

### Build Process
- `npm run build` - Production build
- TypeScript compilation
- Vite production optimization
- Asset bundling and minification

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+ (Chromium)
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Mobile 90+

### Polyfills
- Modern JavaScript features (ES2020+)
- CSS Grid and Flexbox
- CSS Custom Properties

---

## Accessibility

### WCAG 2.1 AA Compliance
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast ratios
- Skip links on all pages

### Accessible Components
- All Radix UI components are accessible by default
- Custom components follow accessibility best practices
- data-testid attributes for automated testing

---

## Testing Strategy

### Testing Tools
- data-testid attributes on all interactive elements
- Unique identifiers for automated testing
- Pattern: `{action}-{target}` for interactive elements
- Pattern: `{type}-{content}` for display elements

---

## Monitoring & Logging

### Application Logging
- Console logging for development
- Error tracking in production
- Audit trail in database
- User action history

### Performance Monitoring
- Vite build performance metrics
- React DevTools integration
- Network request monitoring

---

## File Structure

```
workspace/
├── client/               # Frontend application
│   └── src/
│       ├── components/   # Reusable UI components
│       │   ├── ui/      # shadcn/ui components
│       │   └── layouts/ # Page layout archetypes
│       ├── pages/       # Route components (156 pages)
│       ├── lib/         # Utility functions
│       ├── hooks/       # Custom React hooks
│       └── index.css    # Global styles & theme
├── server/              # Backend application
│   ├── index.ts        # Express server entry
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data access layer
│   └── vite.ts         # Vite middleware
├── shared/              # Shared code
│   └── schema.ts       # Database schema & types
├── attached_assets/     # Static assets
└── package.json        # Dependencies
```

---

## Key Dependencies Summary

### Production Dependencies (80+)
- **Frontend**: React, Vite, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: Express, Drizzle ORM, Passport.js
- **Database**: PostgreSQL with Neon
- **Payments**: Stripe, PayPal
- **Communication**: Twilio
- **AI**: OpenAI (via Replit)
- **Calendar**: Google Calendar & Gmail

### Development Dependencies (20+)
- TypeScript and all @types packages
- Vite plugins
- Drizzle Kit
- PostCSS and Autoprefixer

---

## Version Information

- **Node.js**: Compatible with Node 18+
- **Package Manager**: npm
- **React**: 18.x
- **TypeScript**: 5.x
- **Vite**: 6.x
- **TanStack Query**: 5.x
- **Tailwind CSS**: 4.x

---

## Future Technology Considerations

### Planned/Emerging Technologies
- Quantum Computing integration (Phase 11)
- AR/VR capabilities (repair guides, showroom)
- Edge computing for diagnostics
- Blockchain for service history
- Neural network predictions
- Wearable device integration
- Voice command interface
- Drone inspection capabilities
- Digital twin technology

---

## Conclusion

SALIS AUTO leverages a modern, production-ready technology stack that prioritizes:
- **Developer Experience** - TypeScript, hot reload, type-safe APIs
- **Performance** - Vite, React 18, optimized queries
- **Scalability** - PostgreSQL, proper architecture, modular design
- **User Experience** - Responsive design, dark mode, accessibility
- **Security** - Authentication, authorization, data protection
- **Maintainability** - Shared types, component library, design system

This technology stack enables rapid development while maintaining enterprise-grade quality, security, and performance across all 141 modules of the platform.
