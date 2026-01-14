# Production Deployment Guide

This guide covers all steps necessary to securely deploy Awthar Marketplace to production.

## 🔒 Pre-Deployment Security Checklist

### 1. Environment Variables

**CRITICAL**: Never commit real credentials to git!

1. Copy `.env.example` to `.env` in your production environment
2. Generate a secure session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Set all required environment variables:
   - `DATABASE_URL` - Your production PostgreSQL database URL
   - `SESSION_SECRET` - Generated secure random string (min 32 chars)
   - `SUPABASE_ENDPOINT` - Your Supabase storage endpoint
   - `SUPABASE_ACCESS_KEY` - Supabase S3 access key
   - `SUPABASE_SECRET_KEY` - Supabase S3 secret key
   - `SUPABASE_BUCKET` - Your S3 bucket name
   - `NODE_ENV=production`
   - `SENTRY_DSN` (optional) - For error tracking

### 2. Database Setup

**Use migrations instead of db:push in production!**

```bash
# Generate migrations from schema changes
npm run db:generate

# Run migrations on production database
npm run db:migrate

# Never use db:push in production - it bypasses migrations
```

### 3. Rotate All Exposed Credentials

The following credentials were found in the repository and **MUST** be rotated:

- ❌ Database password: `npg_2Xw1ESIlbfsW`
- ❌ Session secret: `your-secret-key-change-this-in-production`
- ❌ Supabase access key: `26cd60d81e53648619250c4bf79e019d`
- ❌ Supabase secret key: `cf3fcda427b5ff641fd4b44ae6dab22903f36bad33e9074b80e23e35a356ad79`

**Action required:**
1. Generate new database credentials in your Neon console
2. Generate new Supabase access keys
3. Update all environment variables
4. Test the application with new credentials

## 🚀 Deployment Steps

### Step 1: Build the Application

```bash
# Install dependencies
npm install

# Run TypeScript type checking
npm run check

# Build for production (client + server)
npm run build
```

This creates:
- `dist/` - Compiled server code
- `dist/public/` - Static client assets (via Vite)

### Step 2: Set Up Production Database

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run db:migrate
```

### Step 3: Start the Production Server

```bash
# Set NODE_ENV
export NODE_ENV=production

# Start the server
npm start
```

The server will:
- Validate all required environment variables on startup
- Fail fast if any secrets are missing or weak
- Serve on port specified by `PORT` env var (default: 5000)

## 📊 Production Configuration

### Rate Limits

The following rate limits are enforced:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Signup | 5 accounts | 1 hour |
| Bookings | 10 bookings | 1 hour |
| Reviews | 5 reviews | 1 hour |
| Messages | 30 messages | 1 minute |
| File Uploads | 10 uploads | 15 minutes |
| Write Operations | 20 requests | 15 minutes |

### Password Requirements

- Minimum 12 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

### Security Headers

Session cookies are configured with:
- `httpOnly: true` - Prevents XSS access
- `secure: true` (production only) - HTTPS only
- `sameSite: "strict"` (production) - CSRF protection
- `maxAge: 7 days`

## 🔍 Monitoring & Logging

### Logging

The application uses a structured logging system in `server/lib/logger.ts`.

In production:
- Only warnings and errors are logged
- Errors include stack traces and context
- Ready for integration with error tracking services

### Error Tracking (Recommended)

Integrate Sentry or similar:

1. Set `SENTRY_DSN` environment variable
2. Uncomment Sentry integration in `server/lib/logger.ts`
3. Install Sentry SDK if not already installed:
   ```bash
   npm install @sentry/node
   ```

## 🔧 Known Issues & Limitations

### NPM Security Vulnerabilities

There are 5 moderate vulnerabilities related to `esbuild` in development dependencies:

```
esbuild <=0.24.2
Severity: moderate
```

**Impact:** Only affects development server, not production builds.

**Mitigation:** The vulnerabilities are in:
- `vite` (dev dependency only)
- `drizzle-kit` (dev dependency only)
- Production builds use compiled code and don't include these packages

**Action:** Monitor for `vite@7.x` release and upgrade when stable.

## 📝 Deployment Platforms

### Render.com Deployment with Auto-Deploy

**Current Setup:** The project is configured with automatic deployment from GitHub.

#### How It Works

1. **Push to GitHub** → Automatic deployment to Render
   ```bash
   git add .
   git commit -m "your changes"
   git push origin main
   ```

2. **Render automatically:**
   - Detects the push to `main` branch
   - Pulls the latest code
   - Runs `npm run build`
   - Restarts the service with `npm start`
   - No manual intervention needed!

#### Initial Setup (One-Time)

If you need to set up a new Render service:

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `awthar` repository
   - Branch: `main`

2. **Configure Build Settings**
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Add Environment Variables**
   Go to Environment tab and add all required variables:
   - `DATABASE_URL` - Your production PostgreSQL URL
   - `SESSION_SECRET` - Secure random string (32+ chars)
   - `SUPABASE_ENDPOINT` - Supabase storage endpoint
   - `SUPABASE_ACCESS_KEY` - Supabase S3 access key
   - `SUPABASE_SECRET_KEY` - Supabase S3 secret key
   - `SUPABASE_BUCKET` - Your S3 bucket name
   - `NODE_ENV=production`

4. **Enable Auto-Deploy**
   - Under "Settings" → "Build & Deploy"
   - Enable "Auto-Deploy: Yes"
   - This is already configured for the current setup

#### Development Workflow

```bash
# 1. Make changes locally
npm run dev  # Test changes

# 2. Commit and push
git add .
git commit -m "feat: your feature description"
git push origin main

# 3. Render automatically deploys
# Watch deployment progress in Render dashboard
# Typically takes 2-5 minutes

# 4. Verify deployment
# Check Render logs for any errors
# Test the production URL
```

#### Monitoring Deployments

- **Dashboard:** [Render Dashboard](https://dashboard.render.com) → Your Service
- **Build Logs:** Shows build output and any errors
- **Deploy Logs:** Real-time logs during deployment
- **Runtime Logs:** Application logs after deployment

#### Deployment Best Practices

1. **Test Locally First**
   ```bash
   npm run check    # TypeScript checks
   npm run build    # Ensure build succeeds
   ```

2. **Monitor After Push**
   - Watch Render dashboard for deployment status
   - Check logs for any startup errors
   - Verify environment validation passes

3. **Rollback if Needed**
   ```bash
   git revert <commit-hash>
   git push origin main
   # Render will auto-deploy the reverted version
   ```

### Database (Neon)

Recommended: Use Neon serverless PostgreSQL

1. Create a new project
2. Copy connection string
3. Enable connection pooling for better performance
4. Set `sslmode=require` in connection string

## 🧪 Pre-Production Testing

Before deploying to production:

1. **Environment Validation Test**
   ```bash
   NODE_ENV=production npm start
   ```
   Should fail if any required env vars are missing

2. **Migration Test**
   ```bash
   npm run db:migrate
   ```
   Should complete without errors

3. **Build Test**
   ```bash
   npm run build
   ```
   Should create `dist/` directory

4. **Password Strength Test**
   - Try creating account with weak password
   - Should reject passwords < 12 chars
   - Should reject passwords without complexity

5. **Rate Limiting Test**
   - Try making rapid requests
   - Should receive 429 status after hitting limits

## 🔄 Post-Deployment

### Verify Deployment

1. Check server logs for startup errors
2. Verify database connection
3. Test user registration and login
4. Verify file uploads work
5. Test WebSocket connection (messaging)

### Monitoring Checklist

- [ ] Server is running and accepting requests
- [ ] Database migrations completed successfully
- [ ] File uploads to Supabase working
- [ ] WebSocket connections establishing
- [ ] Rate limiting functioning
- [ ] Sessions persisting correctly
- [ ] SSL/HTTPS enabled
- [ ] No exposed credentials in logs

## 🚨 Rollback Procedure

If issues arise after deployment:

1. **Revert to previous version:**
   ```bash
   git revert <commit-hash>
   git push
   ```

2. **Database rollback:**
   - Unfortunately, Drizzle doesn't generate down migrations automatically
   - Keep database backups before major changes
   - Manually write down migrations if needed

3. **Check logs:**
   ```bash
   # On Render
   View logs in Render dashboard
   ```

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "Missing required environment variables"
- **Solution:** Check all vars in `.env.example` are set

**Issue:** "Session secret is weak"
- **Solution:** Generate a secure random string (min 32 chars)

**Issue:** Database connection timeout
- **Solution:** Verify DATABASE_URL and check Neon dashboard

**Issue:** File uploads failing
- **Solution:** Verify Supabase credentials and bucket permissions

**Issue:** WebSocket not connecting
- **Solution:** Ensure WebSocket protocol is enabled on hosting platform

## 📚 Additional Resources

- [Drizzle ORM Migrations](https://orm.drizzle.team/kit-docs/overview#prototyping-with-db-push)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [Render Deployment Docs](https://render.com/docs)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
