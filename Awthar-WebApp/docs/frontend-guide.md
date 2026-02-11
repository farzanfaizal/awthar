# Frontend Guide - Awthar Marketplace

## Overview

Next.js 15 with App Router. 28 pages organized into route groups.

---

## Page Rendering Strategies

| Page | Strategy | Why |
|------|----------|-----|
| Landing `/` | SSG + client sections | Static hero, dynamic featured services |
| Browse `/browse` | Client | Heavy filtering, search, real-time updates |
| Categories `/categories` | SSG (revalidate) | Rarely changes |
| Category `/category/[slug]` | SSG + `generateStaticParams` | SEO, predictable slugs |
| Service Detail `/service/[id]` | SSR | SEO, fresh data, view count |
| Provider Profile `/provider/[id]` | SSR | SEO, fresh rating/reviews |
| Static pages | SSG | No API calls: about, terms, privacy, etc. |
| Auth pages | Client | Supabase auth state management |
| Protected pages | Client | User-specific data, no SEO needed |

---

## Route Groups

```
src/app/
├── layout.tsx              # Root: providers, theme, fonts
├── page.tsx                # Landing (/)
├── not-found.tsx           # 404
├── error.tsx               # Error boundary
│
├── (auth)/                 # No shared layout
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── auth/
│       ├── callback/page.tsx
│       └── reset-password/page.tsx
│
├── (public)/               # Public pages
│   ├── browse/page.tsx
│   ├── categories/page.tsx
│   ├── category/[slug]/page.tsx
│   ├── service/[id]/page.tsx
│   ├── provider/[id]/page.tsx
│   ├── how-it-works/page.tsx
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── terms/page.tsx
│   └── privacy/page.tsx
│
└── (protected)/            # Auth required
    ├── layout.tsx          # Auth guard
    ├── profile/page.tsx
    ├── bookings/page.tsx
    ├── messages/page.tsx
    ├── become-provider/page.tsx
    └── dashboard/
        ├── layout.tsx      # Sidebar layout
        ├── page.tsx
        ├── listings/
        │   ├── page.tsx
        │   ├── new/page.tsx
        │   └── [id]/edit/page.tsx
        ├── bookings/page.tsx
        ├── analytics/page.tsx
        └── settings/page.tsx
```

---

## State Management

| Type | Tool | Where |
|------|------|-------|
| Server state (API data) | TanStack React Query v5 | Caching, fetching, mutations |
| Auth state | Supabase + AuthContext | Session, user profile |
| App mode (customer/provider) | AppModeContext + localStorage | UI switching |
| UI state | React useState/useReducer | Component-local |

---

## Component Organization

```
src/components/
├── ui/                     # shadcn/ui (42 components, don't edit)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── header.tsx              # Main site header
├── footer.tsx              # Main site footer
├── service-card.tsx        # Service listing card
├── provider-card.tsx       # Provider card
├── skeletons.tsx           # Loading skeletons
├── browse-filters.tsx      # Browse page filters sidebar
├── image-gallery.tsx       # Service image gallery
├── image-upload.tsx        # Image upload component
├── location-picker.tsx     # Location autocomplete
├── map-view.tsx            # Leaflet map display
├── reviews-list.tsx        # Reviews display
├── review-dialog.tsx       # Create review dialog
├── booking-form.tsx        # Booking creation form
├── dashboard-layout.tsx    # Dashboard sidebar navigation
├── error-boundary.tsx      # Error boundary wrapper
├── theme-provider.tsx      # Dark/light theme
├── theme-toggle.tsx        # Theme switch button
└── chat/
    ├── chat-window.tsx     # Full chat interface
    ├── message-list.tsx    # Message list display
    └── message-input.tsx   # Message input + send
```

---

## Design System

### Bayut-Style Patterns

| Element | Classes |
|---------|---------|
| Cards | `border-2 rounded-xl hover:shadow-xl hover:border-primary/30` |
| Buttons | `h-12 rounded-xl font-semibold` |
| Icon boxes | `w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center` |
| Glass header | `bg-background/95 backdrop-blur-md` |
| Filter pills | `rounded-full border-2 px-4 py-2.5` |
| Avatars | `rounded-full` |

### Colors (HSL CSS Variables)

| Variable | Value | Use |
|----------|-------|-----|
| `--primary` | 210 85% 35% | Blue - main actions |
| `--secondary` | 160 50% 40% | Teal - secondary |
| `--warning` | 38 92% 50% | Orange - ratings/stars |

---

## API Communication

All API calls go through `src/lib/api.ts`:

```typescript
// Wraps fetch with:
// - NEXT_PUBLIC_BACKEND_URL prefix
// - Authorization: Bearer <jwt> header (if authenticated)
// - JSON content type
// - Error handling
```

Used with TanStack Query:
```typescript
const { data } = useQuery({
  queryKey: ['services', filters],
  queryFn: () => api.get('/api/services', { params: filters })
})
```

---

*Last updated: February 9, 2026*
