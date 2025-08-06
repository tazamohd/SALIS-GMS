# Login Dashboard Project

## Overview
Full-stack React/Express application with a login dashboard imported from Figma. Features a modern UI with shadcn/ui components, Tailwind CSS styling, and TypeScript throughout.

## Project Architecture
- **Frontend**: React 18 with Vite, wouter for routing, TanStack Query for state management
- **Backend**: Express server with TypeScript, in-memory storage
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens from Figma
- **Database**: In-memory storage (MemStorage) for development

## Tech Stack
- React 18 + TypeScript
- Express.js backend
- Vite build tool
- wouter (routing)
- @tanstack/react-query (state management)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)
- Drizzle ORM (schema definitions)
- Zod (validation)

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/ui/     # shadcn/ui components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and query client
│   │   └── App.tsx           # Main app component
│   └── public/figmaAssets/   # Figma exported assets
├── server/
│   ├── index.ts             # Express server setup
│   ├── routes.ts            # API routes
│   ├── storage.ts           # In-memory storage interface
│   └── vite.ts              # Vite development setup
├── shared/
│   └── schema.ts            # Shared TypeScript types and Zod schemas
└── package.json             # Dependencies and scripts
```

## Key Features
- Login dashboard with email/password form
- Responsive design matching Figma mockup
- Custom design tokens and typography
- Form validation ready (hooks available)
- API-ready architecture with storage interface

## Development Setup
- Run `npm run dev` to start both frontend and backend
- Frontend served on port 5000 (same as backend)
- Hot reloading enabled for development

## User Preferences
- Modern React patterns with hooks
- TypeScript throughout
- Component-based architecture
- Responsive design

## Recent Changes
- Migrated Figma design to Replit environment
- Set up full-stack architecture with proper client/server separation
- Configured shadcn/ui components with custom design tokens
- Implemented in-memory storage for development
- Created login dashboard page matching Figma design

## Migration Status
Successfully migrated from Figma to Replit with:
- ✅ All packages installed and configured
- ✅ Proper project structure established
- ✅ Security best practices implemented
- ✅ Client/server separation maintained
- ✅ Development workflow configured