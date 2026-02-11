# Environment Variables - Awthar Marketplace

## Frontend (`Awthar-WebApp/frontend/.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public (anon) key | `eyJhbGci...` |
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API base URL | `http://localhost:3001` (dev) or Vercel URL |

> All frontend env vars must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

---

## Backend (`Awthar-WebApp/backend/.env.local`)

### Database
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Supabase Auth
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase public key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin) | `eyJhbGci...` |
| `SUPABASE_JWT_SECRET` | Yes | JWT signing secret for token verification | `super-secret-jwt-token...` |

### Supabase Storage (S3-compatible)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_ENDPOINT` | Yes | S3 storage endpoint | `https://abc123.supabase.co/storage/v1/s3` |
| `SUPABASE_ACCESS_KEY` | Yes | S3 access key | `...` |
| `SUPABASE_SECRET_KEY` | Yes | S3 secret key | `...` |
| `SUPABASE_BUCKET` | Yes | S3 bucket name | `uploads` |

### Application
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FRONTEND_URL` | Yes | Frontend URL for CORS | `http://localhost:3000` (dev) or Vercel URL |

---

## Where to Find These Values

1. **Supabase Dashboard** -> Project Settings -> API
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` `secret` key
   - `SUPABASE_JWT_SECRET` = JWT Secret

2. **Supabase Dashboard** -> Project Settings -> Database
   - `DATABASE_URL` = Connection string (URI tab)

3. **Supabase Dashboard** -> Storage -> Settings
   - `SUPABASE_ENDPOINT`, `SUPABASE_ACCESS_KEY`, `SUPABASE_SECRET_KEY` = S3 Connection info

---

## Development Setup

```bash
# Frontend
cp frontend/.env.local.example frontend/.env.local
# Fill in values

# Backend
cp backend/.env.local.example backend/.env.local
# Fill in values

# Start both
cd frontend && npm run dev    # Port 3000
cd backend && npm run dev     # Port 3001
```

---

*Last updated: February 9, 2026*
