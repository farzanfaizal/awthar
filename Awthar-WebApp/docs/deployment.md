# Deployment Guide - Awthar Marketplace

## Overview

Two Vercel projects (free tier), one Supabase project.

| Service | Platform | URL Pattern |
|---------|----------|-------------|
| Frontend | Vercel | `awthar.vercel.app` (or custom domain) |
| Backend | Vercel | `awthar-api.vercel.app` (or custom domain) |
| Database | Supabase | `*.supabase.co` |

---

## Vercel Setup

### Frontend Project

1. Go to [vercel.com](https://vercel.com) -> "Add New Project"
2. Import repository, set **Root Directory** to `Awthar-WebApp/frontend`
3. Framework: Next.js (auto-detected)
4. Build Command: `npm run build`
5. Output Directory: `.next` (default)
6. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_BACKEND_URL=https://awthar-api.vercel.app
   ```

### Backend Project

1. Go to [vercel.com](https://vercel.com) -> "Add New Project"
2. Import same repository, set **Root Directory** to `Awthar-WebApp/backend`
3. Framework: Next.js (auto-detected)
4. Build Command: `npm run build`
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   SUPABASE_JWT_SECRET=your-jwt-secret
   SUPABASE_ENDPOINT=https://your-project.supabase.co/storage/v1/s3
   SUPABASE_ACCESS_KEY=...
   SUPABASE_SECRET_KEY=...
   SUPABASE_BUCKET=uploads
   FRONTEND_URL=https://awthar.vercel.app
   ```

---

## CORS Configuration

In `backend/next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL || '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ]
}
```

---

## Supabase Configuration

### Auth Redirect URLs

In Supabase Dashboard -> Authentication -> URL Configuration:
- **Site URL:** `https://awthar.vercel.app`
- **Redirect URLs:**
  - `https://awthar.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for dev)

### Realtime

In Supabase Dashboard -> Database -> Replication:
- Enable Realtime for `messages` table

### Storage

- Bucket: `uploads` (public)
- Max file size: 2MB (configure in bucket settings)

---

## Vercel Free Tier Limits

| Resource | Limit |
|----------|-------|
| Serverless function duration | 10 seconds |
| Bandwidth | 100 GB/month |
| Serverless function invocations | 100,000/month |
| Build minutes | 6,000 min/month |
| Deployments | Unlimited |
| Team members | 1 (Hobby plan) |

---

## Deploy Workflow

```
git push origin main
    │
    ├── Vercel auto-deploys frontend/ (if files changed)
    └── Vercel auto-deploys backend/ (if files changed)
```

Both projects auto-deploy on push to `main`. Vercel detects which root directories changed and only rebuilds affected projects.

---

## Custom Domain (Optional)

1. Vercel Dashboard -> Project -> Settings -> Domains
2. Add domain (e.g. `app.awthar.com` for frontend, `api.awthar.com` for backend)
3. Update DNS records as instructed by Vercel
4. Update `NEXT_PUBLIC_BACKEND_URL` and `FRONTEND_URL` env vars
5. Update Supabase Auth redirect URLs

---

*Last updated: February 9, 2026*
