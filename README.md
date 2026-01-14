# Awthar Marketplace

A production-ready marketplace platform connecting service providers with customers. Built with React, Express, PostgreSQL, and TypeScript.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Run migrations
npm run db:migrate

# Start production server
npm start
```

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Supabase account for file storage

## ⚙️ Environment Setup

1. Copy `.env.example` to `.env`
2. Set all required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SESSION_SECRET` - Secure random string (32+ chars)
   - `SUPABASE_*` - Supabase storage credentials
   - `NODE_ENV` - Set to `production` for production

## 📚 Documentation

- **[Production Deployment Guide](docs/PRODUCTION.md)** - Complete deployment instructions
- **[Production Ready Summary](docs/PRODUCTION-READY-SUMMARY.md)** - Security improvements and fixes

## 🔒 Security Features

- Strong password requirements (12+ chars with complexity)
- Rate limiting on all write endpoints
- Environment validation on startup
- Secure session management with httpOnly cookies
- Structured logging for production monitoring

## 🛠 Tech Stack

**Frontend:**
- React 18
- TailwindCSS
- Radix UI
- Wouter (routing)
- TanStack Query

**Backend:**
- Express.js
- PostgreSQL with Drizzle ORM
- Passport.js authentication
- WebSocket for real-time messaging
- Supabase for file storage

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## 🚀 Deployment Workflow

The project uses **automatic deployment from GitHub to Render**:

```bash
# Make your changes
git add .
git commit -m "your changes"
git push origin main

# Render automatically deploys! (2-5 minutes)
# Monitor progress at dashboard.render.com
```

No manual deployment needed - just push to GitHub!

## 🚨 Before Production Deployment

**CRITICAL:** Rotate all credentials found in the repository:
1. Generate new database password
2. Create new session secret
3. Rotate Supabase access keys
4. Update all environment variables

See [docs/PRODUCTION.md](docs/PRODUCTION.md) for detailed instructions.

## 📄 License

MIT
