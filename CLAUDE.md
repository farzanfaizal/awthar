# CLAUDE.md - Project Context for Claude Code

## Project Overview

**Awthar Marketplace** - A UAE-focused service marketplace connecting customers with service providers. Production-ready platform with Bayut-inspired design and Arabic/English support.

- **Live URL:** https://awthar-marketplace.onrender.com
- **GitHub:** https://github.com/farzanfaizal/awthar
- **Version:** 2.0.0

---

## Quick Commands

```bash
# Development
npm run dev          # Start dev server (localhost:5000)

# Build & Deploy
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:generate  # Generate Drizzle migration
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio

# Type Check
npm run check        # TypeScript type checking
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 5 |
| Styling | Tailwind CSS 3.4, shadcn/ui |
| State | TanStack Query |
| Routing | Wouter |
| Forms | React Hook Form + Zod |
| Backend | Express.js, Node.js 20 |
| Database | PostgreSQL (Supabase) + Drizzle ORM |
| Auth | Supabase Auth (Email + Google OAuth) |
| Storage | Supabase Storage (S3) |
| Hosting | Render.com |

---

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── service-card.tsx
│   │   │   └── skeletons.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── landing.tsx
│   │   │   ├── browse.tsx
│   │   │   ├── service-detail.tsx
│   │   │   └── provider-profile.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities
│   │   │   ├── supabase.ts # Supabase client
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   └── App.tsx         # Main app + routing
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts            # Server entry
│   ├── routes.ts           # API routes
│   ├── auth.ts             # Supabase Auth middleware
│   └── storage.ts          # S3 storage handler
├── shared/                 # Shared types
│   └── schema.ts           # Drizzle schema + types
├── db/                     # Database
│   ├── index.ts            # DB connection
│   └── migrations/         # SQL migrations
└── docs/                   # Documentation
```

---

## Key Files

| File | Purpose |
|------|---------|
| `client/src/App.tsx` | Routes, providers, global layout |
| `client/src/pages/browse.tsx` | Service listing with filters |
| `client/src/components/service-card.tsx` | Service card component |
| `server/routes.ts` | All API endpoints |
| `server/auth.ts` | Supabase Auth middleware |
| `shared/schema.ts` | Database schema (Drizzle) |
| `db/index.ts` | Database connection |

---

## Design System

### Bayut-Style Patterns

The UI follows Bayut.com's professional marketplace style:

```tsx
// Card styling
className="border-2 rounded-xl hover:shadow-xl hover:border-primary/30"

// Buttons
className="h-12 rounded-xl font-semibold"

// Icon boxes
<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
  <Icon className="h-4 w-4 text-primary" />
</div>

// Glass header
className="bg-background/95 backdrop-blur-md"

// Quick filter pills
className="rounded-full border-2 px-4 py-2.5"
```

### Color Palette (HSL)

```css
--primary: 210 85% 35%;     /* Blue */
--secondary: 160 50% 40%;   /* Teal */
--warning: 38 92% 50%;      /* Orange (ratings) */
```

### Common Classes

| Pattern | Usage |
|---------|-------|
| `border-2` | All cards and inputs |
| `rounded-xl` | Buttons, inputs, cards |
| `rounded-full` | Pills, badges, avatars |
| `shadow-md` / `shadow-xl` | Card elevation |
| `bg-primary/10` | Icon backgrounds |
| `hover:border-primary/30` | Hover states |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List services (with filters) |
| GET | `/api/services/:id` | Get service detail |
| GET | `/api/categories` | List categories |
| GET | `/api/providers/:id` | Get provider profile |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/user` | Get current user |
| POST | `/api/bookings` | Create booking |
| GET | `/api/conversations` | List conversations |
| WS | `/ws` | Real-time messaging |

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md) | Complete project status & features |
| [docs/PRODUCTION.md](docs/PRODUCTION.md) | Deployment guide |
| [docs/DATABASE_MIGRATION.md](docs/DATABASE_MIGRATION.md) | Neon to Supabase migration |
| [.env.example](.env.example) | Environment variables template |

---

## Development Notes

### Running Locally

1. Copy `.env.example` to `.env`
2. Fill in Supabase credentials
3. Run `npm install`
4. Run `npm run db:migrate`
5. Run `npm run dev`

### Environment Variables Required

- `DATABASE_URL` - Supabase PostgreSQL connection
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_JWT_SECRET` - JWT secret for auth
- `SESSION_SECRET` - Express session secret

### Git Workflow

```bash
# Auto-deploys to Render on push to main
git add .
git commit -m "feat: description"
git push origin main
```

### Common Tasks

| Task | Command/File |
|------|-------------|
| Add new page | Create in `client/src/pages/`, add route in `App.tsx` |
| Add API endpoint | Add in `server/routes.ts` |
| Add DB table | Update `shared/schema.ts`, run `npm run db:generate` |
| Add UI component | Use `npx shadcn@latest add <component>` |

---

## Current Status (Feb 2026)

### Completed
- Bayut-style redesign (landing, browse, service detail, provider profile)
- Supabase Auth migration (email, Google OAuth, password reset)
- Database migration (Neon to Supabase)
- Production security (rate limiting, validation, error handling)

### In Progress
- Browse page Bayut-style polish (Feb 2, 2026)

### Pending
- Arabic translations
- SEO optimization
- Analytics integration
- Admin dashboard

---

*Last updated: February 2, 2026*
