# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Type check
tsc -b

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

This is a React 19 + TypeScript + Vite frontend application using a **Feature-Sliced Design** architecture pattern.

### Tech Stack
- **React 19** with TypeScript
- **Vite 7** for build tooling
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Hook Form + Zod** for form validation
- **React Router v7** for routing
- **Tailwind CSS 4** for styling
- **Axios** for HTTP requests
- **Vitest** for testing (configured but no tests yet)

### Project Structure

```
src/
├── app/              # Application setup and providers
│   ├── App.tsx
│   ├── AppProviders.tsx    # QueryClient, Router setup
│   └── router.tsx          # Route definitions with lazy loading
├── features/         # Feature modules (auth, dashboard, etc.)
│   └── auth/
│       ├── api/            # API calls and types
│       ├── components/     # Feature-specific components
│       ├── hooks/          # Feature-specific hooks
│       ├── pages/          # Feature pages
│       ├── store/          # Zustand store for auth state
│       ├── utils/          # Token storage and validation
│       └── validation/     # Zod schemas
├── shared/           # Shared resources
│   ├── components/   # Reusable UI components and layouts
│   ├── constants/    # API configuration
│   ├── lib/          # Shared utilities and API client
│   └── types/        # Shared TypeScript types
└── styles/           # Global styles
```

### Key Architecture Patterns

**Authentication Flow:**
- JWT-based authentication with access and refresh tokens
- Access tokens stored in memory (+ sessionStorage for recovery)
- Refresh tokens stored in localStorage
- Automatic token refresh via axios interceptors (src/shared/lib/api/interceptors.ts:22-100)
- Proactive refresh when token is within 5 minutes of expiry
- Zustand store manages auth state (src/features/auth/store/auth.store.ts)

**API Client:**
- Centralized axios instance in src/shared/lib/api/api-client.ts:4
- Base URL configured via VITE_API_BASE_URL env var (defaults to http://crits-quest.local)
- Dev server proxies `/api` requests to backend at http://crits-quest.local (vite.config.ts:16-19)
- Request interceptor adds Authorization header and handles token refresh
- Response interceptor retries 401 errors with refreshed token

**State Management:**
- **Server state:** TanStack Query with 5-minute stale time, 1 retry, no refetch on window focus
- **Client state:** Zustand with devtools middleware
- Auth state initialized on app mount via useAuthStore initializeAuth (src/app/AppProviders.tsx:24)

**Routing:**
- React Router v7 with lazy-loaded pages
- Protected routes use ProtectedRoute wrapper component (src/features/auth/components/ProtectedRoute.tsx)
- Redirects unauthenticated users to /login
- MainLayout wraps authenticated routes

**Forms:**
- React Hook Form for form management
- Zod for schema validation via @hookform/resolvers
- Validation schemas in feature/validation directories

**Path Aliases:**
- `@/*` maps to `src/*` (configured in vite.config.ts:10 and tsconfig.app.json)

## Environment Configuration

Create `.env.development` (or `.env.production` for production):
```bash
VITE_API_BASE_URL=http://crits-quest.local
```

Backend is expected to be accessible at http://crits-quest.local (configured via Laragon).

## Adding New Features

Follow the Feature-Sliced Design pattern:

1. Create feature directory under `src/features/[feature-name]/`
2. Structure as:
   - `api/` - API calls, types, endpoints
   - `components/` - Feature-specific UI components
   - `hooks/` - Custom hooks for the feature
   - `pages/` - Page components
   - `store/` - Zustand stores (if needed)
   - `utils/` - Feature-specific utilities
   - `validation/` - Zod schemas
3. Add routes in `src/app/router.tsx`
4. Keep shared/reusable code in `src/shared/`

## Important Implementation Details

**Token Security:**
- Access tokens are stored in memory and sessionStorage (for page refresh recovery only)
- Never log tokens or include them in error messages
- The interceptor pattern prevents race conditions during token refresh (src/shared/lib/api/interceptors.ts:8-19)

**Form Patterns:**
- Use React Hook Form with Zod resolver
- Define schemas in feature validation directories
- Keep validation simple: only validate required fields unless specific validation is needed
- See LoginForm (src/features/auth/components/LoginForm.tsx) for reference

**Authentication Details:**
- Login uses `username` and `password` (not email)
- User object contains `username` and `roles` fields
- Form validation only requires fields to be filled (no length or format validation)

**Component Patterns:**
- UI components in src/shared/components/ui/ use Tailwind with tailwind-merge for className handling
- Use the `cn()` utility (src/shared/lib/utils/cn.ts) to merge Tailwind classes
- Layouts in src/shared/components/layout/
- Feature components in their respective feature directories
