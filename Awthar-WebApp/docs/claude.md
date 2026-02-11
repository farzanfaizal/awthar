# CLAUDE.md - Awthar Marketplace (v3 - Next.js Migration)

## Project Overview

**Awthar Marketplace** - UAE-focused service marketplace connecting customers with service providers.
Two separate Next.js apps on Vercel + Supabase (DB, Auth, Storage, Realtime).

- **Frontend:** `Awthar-WebApp/frontend/` (Next.js 16, App Router, SSR/SSG)
- **Backend:** `Awthar-WebApp/backend/` (Next.js 16, API Routes only, port 3001)
- **Old Version:** `AwtharMarketplace/` (Express + React, Render.com)
- **GitHub:** https://github.com/farzanfaizal/awthar

> For detailed documentation on any topic, see [docs/index.md](index.md)

---

## Quick Commands

### Frontend (`Awthar-WebApp/frontend/`)
```bash
npm run dev          # Start frontend dev server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
```

### Backend (`Awthar-WebApp/backend/`)
```bash
npm run dev          # Start backend dev server (localhost:3001)
npm run build        # Build for production
npm start            # Start production server
npm run db:generate  # Generate Drizzle migration
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16.1.6, React 19.2.3, TypeScript 5, App Router |
| Styling | TailwindCSS v4, shadcn/ui (42 Radix components) |
| State | TanStack React Query 5.90 |
| Forms | React Hook Form 7.71 + Zod 4.3 |
| Backend | Next.js 16.1.6 API Routes (port 3001) |
| Database | PostgreSQL (Supabase) + Drizzle ORM 0.45 |
| Auth | Supabase Auth via `@supabase/ssr` 0.8 |
| Storage | Supabase Storage (S3 via AWS SDK 3.986) |
| Realtime | Supabase Realtime (replaces WebSocket) |
| Hosting | Vercel (free tier, 2 projects) |

### Key Version Notes
- **Zod v4** (not v3) — API differs from v3: `z.string()` etc. remain similar but `createInsertSchema` from `drizzle-zod` 0.8 uses Zod v4 internally
- **React 19** — supports `use()` hook, Server Components, Actions
- **Tailwind v4** — CSS-based config via `@theme` blocks, not JS config file
- **Next.js 16** — latest stable, full App Router support

---

## Project Structure

```
Awthar-WebApp/
├── frontend/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── (auth)/          # Login, signup, password reset
│   │   │   ├── (public)/        # Browse, categories, service detail
│   │   │   └── (protected)/     # Dashboard, profile, bookings, messages
│   │   ├── components/          # UI components + shadcn/ui
│   │   ├── hooks/               # useAuth, useSupabaseRealtime, etc.
│   │   ├── context/             # AuthContext, AppModeContext
│   │   ├── lib/                 # Supabase clients, API wrapper, utils
│   │   └── types/               # TypeScript types (from backend schema)
│   └── middleware.ts            # Auth session refresh + route protection
│
├── backend/                     # Next.js Backend (API only)
│   ├── src/
│   │   ├── app/api/             # API route handlers
│   │   │   ├── auth/            # User profile, provider profiles
│   │   │   ├── services/        # CRUD + search
│   │   │   ├── bookings/        # CRUD + status
│   │   │   ├── conversations/   # Chat conversations
│   │   │   ├── messages/        # Chat messages
│   │   │   ├── reviews/         # Create + list
│   │   │   ├── favorites/       # Add/remove/check
│   │   │   ├── upload/          # Image upload (no Sharp)
│   │   │   ├── categories/      # List + by slug
│   │   │   ├── locations/       # UAE locations
│   │   │   ├── reports/         # Abuse reports
│   │   │   └── analytics/       # Dashboard stats
│   │   ├── lib/                 # DB, auth, errors, upload utils
│   │   ├── services/            # Business logic layer
│   │   └── shared/              # Drizzle schema + Zod validators
│   └── migrations/              # Drizzle SQL migrations
│
└── docs/                        # Documentation
    ├── claude.md                # This file
    ├── index.md                 # Master index -> all docs
    ├── implementation_tracker.md
    ├── api.md
    ├── architecture.md
    ├── database.md
    ├── auth.md
    ├── deployment.md
    ├── environment.md
    ├── frontend-guide.md
    └── realtime.md
```

---

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/app/layout.tsx` | Root layout: providers, theme, auth |
| `frontend/middleware.ts` | Supabase session refresh + route guards |
| `frontend/src/lib/supabase/client.ts` | Browser Supabase client |
| `frontend/src/lib/api.ts` | Fetch wrapper to backend API |
| `frontend/src/hooks/useSupabaseRealtime.ts` | Realtime chat subscription |
| `backend/src/lib/db.ts` | Drizzle ORM + PostgreSQL connection |
| `backend/src/lib/auth.ts` | JWT verification (`getUserFromRequest`) |
| `backend/src/shared/schema.ts` | All DB tables, relations, types |
| `backend/src/shared/validators.ts` | Zod validation schemas |

---

## Environment Variables

### Frontend
```
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase public key
NEXT_PUBLIC_BACKEND_URL=         # Backend API URL (e.g. http://localhost:3001)
```

### Backend
```
DATABASE_URL=                    # PostgreSQL connection string
SUPABASE_URL=                    # Supabase project URL
SUPABASE_ANON_KEY=               # Supabase public key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key
SUPABASE_JWT_SECRET=             # JWT signing secret
SUPABASE_ENDPOINT=               # S3 storage endpoint
SUPABASE_ACCESS_KEY=             # S3 access key
SUPABASE_SECRET_KEY=             # S3 secret key
SUPABASE_BUCKET=                 # S3 bucket name
FRONTEND_URL=                    # Frontend URL (for CORS)
```

---

## Design System (Bayut-Style)

### Color Palette (HSL)
```css
--primary: 210 85% 35%;       /* Blue */
--secondary: 160 50% 40%;     /* Teal */
--warning: 38 92% 50%;        /* Orange (ratings) */
```

### Common Patterns
```tsx
// Card: border-2 rounded-xl hover:shadow-xl hover:border-primary/30
// Button: h-12 rounded-xl font-semibold
// Icon box: w-8 h-8 rounded-lg bg-primary/10
// Glass header: bg-background/95 backdrop-blur-md
// Filter pills: rounded-full border-2 px-4 py-2.5
```

---

## Common Tasks

| Task | How |
|------|-----|
| Add new page | Create file in `frontend/src/app/(group)/page-name/page.tsx` |
| Add API endpoint | Create `backend/src/app/api/resource/route.ts` with GET/POST/etc exports |
| Add DB table | Update `backend/src/shared/schema.ts`, run `npm run db:generate` then `db:migrate` |
| Add UI component | `npx shadcn@latest add <component>` in frontend/ |
| Update types in frontend | Edit `frontend/src/types/schema.ts` to match backend schema |

---

*Last updated: February 9, 2026*
