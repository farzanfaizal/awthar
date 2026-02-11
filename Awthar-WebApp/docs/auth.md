# Authentication - Awthar Marketplace

## Overview

Authentication is handled by **Supabase Auth**. The frontend uses `@supabase/ssr` for cookie-based sessions (SSR-compatible). The backend verifies JWTs from the `Authorization` header.

---

## Auth Providers

| Provider | Status |
|----------|--------|
| Email/Password | Active |
| Google OAuth | Active |
| Apple OAuth | Prepared (not configured) |
| GitHub OAuth | Prepared (not configured) |

---

## Frontend Auth Flow

### 1. Supabase SSR Client

Two client types:

**Browser client** (`frontend/src/lib/supabase/client.ts`):
- Used in client components (`'use client'`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Manages auth state, login/signup/signout

**Server client** (`frontend/src/lib/supabase/server.ts`):
- Used in server components and server actions
- Uses `createServerClient` from `@supabase/ssr`
- Reads session from cookies (read-only)

### 2. Middleware (`frontend/middleware.ts`)

Runs on every request:
- Refreshes expired Supabase sessions (reads/writes cookies)
- Checks auth for protected routes (`/profile`, `/dashboard/*`, `/bookings`, `/messages`, `/become-provider`)
- Redirects unauthenticated users to `/login`

### 3. Auth Context (`frontend/src/context/auth-context.tsx`)

Client-side provider wrapping the app:
- Exposes: `signUp()`, `signIn()`, `signInWithGoogle()`, `signOut()`, `resetPassword()`, `updatePassword()`
- Listens to `onAuthStateChange` for session updates
- Stores user state + loading state

### 4. useAuth Hook (`frontend/src/hooks/useAuth.ts`)

Returns:
```typescript
{
  user: AuthUser | null,
  isLoading: boolean,
  isAuthenticated: boolean,
  isProvider: boolean,
  isCustomer: boolean,
  emailVerified: boolean,
  authProvider: "email" | "google" | "apple" | "github"
}
```

---

## Backend Auth Flow

### JWT Verification (`backend/src/lib/auth.ts`)

```
Request arrives with Authorization: Bearer <jwt>
    │
    ▼
Extract token from header
    │
    ▼
jwt.verify(token, SUPABASE_JWT_SECRET)
    │
    ▼
Extract `sub` (Supabase user ID) from decoded token
    │
    ▼
Lookup user in DB: WHERE supabase_id = sub
    │
    ├── Found → return user object
    │
    └── Not found → auto-create user from Supabase profile
                     (syncs email, name, auth provider)
                     → return new user object
```

### Route Handler Pattern

```typescript
// backend/src/app/api/example/route.ts
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  // ... use user.id for queries
}
```

### Public vs Protected Routes

- **Public routes:** Don't call `getUserFromRequest()`, or call it optionally
- **Protected routes:** Call `getUserFromRequest()` and return 401 if null

---

## OAuth Callback

1. User clicks "Sign in with Google" -> Supabase redirects to Google
2. Google redirects back to `/auth/callback`
3. `auth/callback/page.tsx` exchanges the code for a session
4. Session stored in cookies via `@supabase/ssr`
5. User redirected to dashboard or home

---

## Session Management

| Aspect | Details |
|--------|---------|
| Storage | HTTP-only cookies (via `@supabase/ssr`) |
| Refresh | Automatic via middleware on every request |
| Expiry | Configurable in Supabase dashboard (default: 1 hour access, 7 day refresh) |
| Logout | Clears cookies + calls `supabase.auth.signOut()` |

---

*Last updated: February 9, 2026*
