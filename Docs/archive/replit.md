# Awthar - Professional Service Marketplace Platform

## Overview
Awthar is a corporate-grade, dual-interface service marketplace platform connecting customers with verified service providers across the GCC region. The platform supports both casual taskers and licensed professionals, offering comprehensive service discovery, real-time messaging, and trust/safety features.

## Project Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (via Neon) with Drizzle ORM
- **Real-time**: WebSocket (ws package)
- **Authentication**: Replit Auth (OpenID Connect)
- **File Storage**: Replit Object Storage
- **State Management**: TanStack Query v5

### Design System
- **Primary Color**: Deep Professional Blue (HSL: 210 85% 35%) - Trust & stability
- **Secondary Color**: Teal Accent (HSL: 160 60% 45%) - Verified actions
- **Typography**: Inter for English, Tajawal for Arabic
- **Spacing**: 2, 4, 6, 8, 12, 16, 20, 24 (Tailwind units)
- **Border Radius**: sm: 4px, md: 8px, lg: 12px, xl: 16px

## Core Features (MVP)

### Dual Interface Architecture
1. **End User Interface**
   - Hero section with search
   - Service discovery (featured, search-based suggestions, browse all)
   - Advanced filtering (category, price, location, rating, verification)
   - Service detail pages
   - Provider profiles
   - Real-time messaging
   - Review system

2. **Provider Dashboard**
   - Sidebar navigation
   - Analytics dashboard
   - Listing management (create, edit, pause, delete)
   - Message center
   - Booking management
   - Profile settings

### Key Functionalities
- **Service Listings**: Rich media upload, multiple pricing models (fixed/hourly/custom)
- **Location-Based Search**: GCC-optimized address input, radius-based filtering
- **Verification System**: Identity verified and licensed professional badges
- **Real-Time Messaging**: Secure chat between customers and providers
- **Quality Scorecard (QSC)**: Performance metrics, ratings, response time
- **Bilingual Support**: Full EN/AR language switching (infrastructure ready)

## Database Schema

### Core Tables
- **users**: Customer and provider accounts (Replit Auth)
- **provider_profiles**: Extended provider information
- **categories**: Hierarchical service taxonomy (EN/AR)
- **services**: Service listings with location data
- **bookings**: Service appointments
- **reviews**: Verified customer reviews
- **conversations**: Chat threads
- **messages**: Real-time messaging

### Key Relationships
- User 1:1 ProviderProfile
- ProviderProfile 1:N Services
- Service N:1 Category
- Booking 1:1 Review
- Conversation 1:N Messages

## Recent Changes
- **2025-01-22**: Initial project setup with complete schema design
- Professional blue/teal color scheme implemented
- Corporate-grade design system configured
- Comprehensive data models for service marketplace

## User Preferences
- Corporate-grade professional aesthetic
- GCC region optimization (addressing, bilingual)
- No RFQ submission forms (all via chat messaging)
- Focus on visual excellence and polish
- Dual-interface support (customers & providers)

## Development Guidelines
- Follow design_guidelines.md religiously for all UI implementations
- Use Shadcn components exclusively (no custom styled divs)
- Implement proper loading, error, and empty states
- Ensure responsive design across all breakpoints
- Add data-testid attributes to all interactive elements
- Use proper semantic HTML and accessibility features

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (auto-configured)
- `SESSION_SECRET`: Session encryption key (auto-configured)
- `REPLIT_DOMAINS`: Domains for auth callback (auto-configured)
- `PUBLIC_OBJECT_SEARCH_PATHS`: Object storage paths (setup required)
- `PRIVATE_OBJECT_DIR`: Private file directory (setup required)

## API Routes Structure
- `/api/auth/*`: Authentication (Replit Auth)
- `/api/services/*`: Service CRUD operations
- `/api/providers/*`: Provider profile management
- `/api/categories/*`: Service categories
- `/api/messages/*`: Messaging endpoints
- `/api/reviews/*`: Review system
- `/api/bookings/*`: Booking management
- `/ws`: WebSocket connection for real-time messaging

## Deployment Notes
- Platform operates as listing/classifieds service (no payment processing)
- Providers handle payments externally
- Focus on connection, trust, and discovery
- GCC compliance (labor laws, data governance, e-commerce licensing)
