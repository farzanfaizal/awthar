# Awthar - Service Marketplace Platform

## Project Overview
Awthar is a corporate-grade, dual-interface service marketplace platform connecting customers with verified service providers across the GCC region. It features a professional end-user interface for service discovery and a dedicated dashboard for providers to manage listings and bookings.

## Technology Stack

### Frontend
*   **Framework:** React 18 (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, Shadcn UI, Radix UI
*   **State Management:** TanStack Query v5
*   **Routing:** Wouter
*   **Animations:** Framer Motion

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** PostgreSQL (Neon) via Drizzle ORM
*   **Real-time:** WebSocket (`ws`)
*   **Authentication:** Passport.js / Replit Auth (OpenID Connect)

## Project Structure

```text
AwtharMarketplace/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/     # UI components (Shadcn UI)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Route pages
│   │   └── App.tsx         # Main application component
│   ├── index.html          # HTML entry point
│   └── vite.config.ts      # Vite configuration
├── server/                 # Backend application
│   ├── index.ts            # Entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database interaction layer
│   └── auth.ts             # Authentication setup
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Drizzle ORM schema & Zod types
├── attached_assets/        # Project assets and documentation
├── design_guidelines.md    # UI/UX standards
└── replit.md               # Detailed architectural documentation
```

## Development Workflow

### Prerequisites
*   Node.js (v20+ recommended)
*   PostgreSQL database (configured via `DATABASE_URL`)

### Key Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server (frontend + backend). |
| `npm run build` | Builds the frontend and backend for production. |
| `npm run start` | Starts the production server. |
| `npm run db:push` | Pushes schema changes to the PostgreSQL database. |
| `npm run check` | Runs TypeScript type checking. |

### Database Management
The project uses Drizzle ORM. The schema is defined in `shared/schema.ts`.
To update the database after modifying the schema:
```bash
npm run db:push
```

## Design & Coding Conventions

### UI/UX Guidelines
*   **Design System:** Strictly follow `design_guidelines.md`.
*   **Components:** Use Shadcn UI components located in `client/src/components/ui`. Avoid custom raw CSS/divs where a standard component exists.
*   **Colors:**
    *   **Primary:** Deep Professional Blue (HSL: 210 85% 35%)
    *   **Secondary:** Teal Accent (HSL: 160 60% 45%)
*   **Typography:** Inter (English), Tajawal/Cairo (Arabic).
*   **Responsiveness:** Mobile-first approach using Tailwind breakpoints.

### Code Style
*   **Imports:** Use path aliases `@/` for `client/src` and `@shared/` for `shared`.
*   **Typing:** Extensive use of TypeScript. Shared types are derived from the Drizzle schema using `zod`.
*   **API:** API routes are defined in `server/routes.ts`. Frontend uses `tanstack-query` for data fetching.

## Key Features
1.  **Dual Interface:** Separate workflows for Consumers (Search, Book) and Providers (Manage Listings, Analytics).
2.  **Real-time Messaging:** WebSocket-powered chat between users and providers.
3.  **Service Discovery:** Advanced filtering by category, location, price, and rating.
4.  **Bilingual Support:** Architecture supports English and Arabic switching.

For more detailed architectural decisions, refer to `replit.md`.
