# Architecture - Awthar Marketplace

## System Overview

Two separate Next.js apps on Vercel, backed by Supabase.

```
                    Vercel (Free Tier)
    ┌─────────────────────┐    ┌─────────────────────┐
    │   FRONTEND           │    │   BACKEND            │
    │   Next.js 15         │    │   Next.js 15         │
    │                      │    │                      │
    │   - SSR/SSG pages    │───>│   - /api/* routes    │
    │   - React components │    │   - Drizzle ORM      │
    │   - TailwindCSS      │    │   - Zod validation   │
    │   - shadcn/ui        │    │   - JWT verification │
    │   - TanStack Query   │    │   - Rate limiting    │
    └──────────┬───────────┘    └──────────┬───────────┘
               │                           │
               │    ┌──────────────────┐   │
               └───>│    SUPABASE       │<──┘
                    │                   │
                    │  - PostgreSQL DB  │
                    │  - Auth (JWT)     │
                    │  - Storage (S3)   │
                    │  - Realtime       │
                    └──────────────────┘
```

## Why Two Separate Apps

1. **Independent scaling** - Frontend can be edge-cached globally, backend scales serverless functions independently
2. **Vercel free tier optimization** - Two projects = double the free limits
3. **Separation of concerns** - Frontend team vs backend team can work independently
4. **Deployment isolation** - Frontend deploy doesn't restart backend, and vice versa
5. **Developer familiarity** - Mirrors the common pattern of separate frontend/backend repos

## Data Flow

### Page Load (SSR)
```
Browser -> Vercel Edge -> Frontend Server Component
                              │
                              ├── Reads auth cookie via @supabase/ssr
                              ├── Fetches data from Backend API (with Bearer token)
                              └── Returns rendered HTML
```

### Client-Side Action (e.g. Create Booking)
```
User clicks "Book" -> React component -> TanStack Query mutation
    -> fetch(BACKEND_URL/api/bookings, { Authorization: Bearer <jwt> })
    -> Backend validates JWT, runs business logic, writes to Supabase DB
    -> Returns response -> TanStack Query invalidates cache -> UI updates
```

### Real-time Chat
```
User A sends message -> POST /api/messages (Backend) -> INSERT into DB
                                                            │
                                        Supabase Realtime detects INSERT
                                                            │
                        User B's browser receives via Supabase Realtime channel
                                                            │
                        useSupabaseRealtime hook -> updates TanStack Query cache
```

## Authentication Flow

```
1. User logs in via Supabase Auth (frontend)
2. @supabase/ssr stores session in cookies
3. Next.js middleware refreshes session on every request
4. Frontend reads session for route protection + UI state
5. API calls include Bearer token in Authorization header
6. Backend verifies JWT using SUPABASE_JWT_SECRET
7. Backend looks up/creates user in local DB via supabaseId
```

## Key Architectural Decisions

| Decision | Choice | Alternative Considered |
|----------|--------|----------------------|
| Hosting | Vercel (2 free projects) | Render (current), Railway |
| Realtime | Supabase Realtime | Custom WebSocket (old), Pusher, Ably |
| Image handling | Next.js `<Image>` + raw upload | Sharp processing (old) |
| Auth in SSR | `@supabase/ssr` cookies | `@supabase/supabase-js` localStorage (old) |
| Shared types | Copy types to frontend | Turborepo monorepo, npm package |
| Rate limiting | In-memory Map | Upstash Redis (future upgrade) |
| ORM | Drizzle (kept) | Prisma |

---

*Last updated: February 9, 2026*
