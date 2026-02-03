# Awthar Marketplace Documentation

## Quick Links

| Document | Description |
|----------|-------------|
| **[PROJECT-STATUS.md](./PROJECT-STATUS.md)** | Complete project overview, features, and roadmap |
| [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) | Neon to Supabase migration details |
| [PRODUCTION.md](./PRODUCTION.md) | Deployment and production setup guide |

## Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 SUPABASE (All-in-One)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Auth     │  │  Database   │  │   Storage   │    │
│  │  Email/OAuth│  │ PostgreSQL  │  │    S3       │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   RENDER (Hosting)                      │
│              Node.js + Express + React                  │
└─────────────────────────────────────────────────────────┘
```

## Quick Commands

```bash
# Development
npm run dev

# Build & Deploy
npm run build
npm start

# Database
npm run db:generate  # Generate migration
npm run db:migrate   # Run migrations

# Type Check
npm run check
```

## Environment Setup

See [.env.example](../.env.example) for all required environment variables.

### Key Variables

```env
DATABASE_URL=postgresql://...      # Supabase PostgreSQL
SUPABASE_URL=https://...           # Supabase project URL
SUPABASE_ANON_KEY=...              # Supabase anon key
SUPABASE_JWT_SECRET=...            # JWT secret for auth
```

## Documentation Index

### Active Documents

| Document | Description |
|----------|-------------|
| [PROJECT-STATUS.md](./PROJECT-STATUS.md) | Complete project status and feature list |
| [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) | Neon to Supabase PostgreSQL migration |
| [PRODUCTION.md](./PRODUCTION.md) | Production deployment guide |

### Historical Documents

| Document | Status |
|----------|--------|
| [PROGRESS-SUMMARY.md](./PROGRESS-SUMMARY.md) | Phase 1 progress (Jan 2026) |
| [PRODUCTION-READY-SUMMARY.md](./PRODUCTION-READY-SUMMARY.md) | Security audit (Jan 2026) |
| [ISSUES-AUDIT.md](./ISSUES-AUDIT.md) | Original issues audit |

### Archived Documents

The following documents are archived in [archive/](./archive/) for historical reference:

| Document | Description |
|----------|-------------|
| design_guidelines.md | Pre-Bayut design guidelines |
| FEATURES_ROADMAP.md | Original feature roadmap (Nov 2025) |
| IMPLEMENTATION_TRACKER.md | Implementation tracking (Phases 1-13) |
| ISSUES_AND_FIXES.md | Original issues list (Nov 2025) |
| PHASE_2_PLAN.md | App mode context implementation |
| ENV_SETUP_GUIDE.md | Old environment setup |
| GEMINI.md | Old project overview |
| replit.md | Original Replit architecture |

---

*Last Updated: February 1, 2026*
