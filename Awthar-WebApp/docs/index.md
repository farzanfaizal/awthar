# Documentation Index - Awthar Marketplace

Master index for all project documentation. Start with [claude.md](claude.md) for quick context.

---

## Core Documentation

| Document | Description | When to Read |
|----------|-------------|--------------|
| [claude.md](claude.md) | Project overview, commands, structure, key files | First thing - quick context |
| [implementation_tracker.md](implementation_tracker.md) | Migration progress tracker with phase checklists | Track what's done vs pending |
| [api.md](api.md) | Complete API reference (all endpoints) | Building/debugging API calls |

---

## Architecture & Design

| Document | Description | When to Read |
|----------|-------------|--------------|
| [architecture.md](architecture.md) | System design, data flow, why 2 apps | Understanding the big picture |
| [database.md](database.md) | All 11 tables, columns, relations, enums | Working with DB / schema changes |
| [auth.md](auth.md) | Supabase Auth flow, JWT, middleware, SSR auth | Auth issues or changes |
| [realtime.md](realtime.md) | Supabase Realtime for chat (replaces WebSocket) | Working on messaging feature |

---

## Setup & Operations

| Document | Description | When to Read |
|----------|-------------|--------------|
| [environment.md](environment.md) | All env vars for both apps with descriptions | Setting up or debugging env |
| [deployment.md](deployment.md) | Vercel setup, CORS, domains, CI/CD | Deploying or configuring Vercel |
| [frontend-guide.md](frontend-guide.md) | Pages, components, routing, state, SSR patterns | Working on frontend |

---

## Quick Links

- **Old project (reference):** `../AwtharMarketplace/`
- **Frontend app:** `../frontend/`
- **Backend app:** `../backend/`
- **Database schema:** `../backend/src/shared/schema.ts`
- **API routes:** `../backend/src/app/api/`
- **Frontend pages:** `../frontend/src/app/`

---

*Last updated: February 9, 2026*
