# Deployment Guide for Awthar on Render

This guide will help you deploy the Awthar service marketplace platform to Render's free tier.

## Prerequisites

- Render account (free tier): https://render.com
- PostgreSQL database (Neon): Already provisioned
- GitHub repository with your code

## Database Setup

Your Neon PostgreSQL database is already configured:
```
postgresql://neondb_owner:npg_2Xw1ESIlbfsW@ep-falling-math-a11wgsc6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**
   - **Name**: awthar (or your preferred name)
   - **Region**: Singapore (or closest to your users)
   - **Branch**: `claude/awthar-initial-setup-014eQ1zR8knxQNvbeBCLCWmY`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build && npm run db:push`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

3. **Set Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_2Xw1ESIlbfsW@ep-falling-math-a11wgsc6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
   | `SESSION_SECRET` | Click "Generate" to create a secure random value |

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Wait for the deployment to complete (usually 3-5 minutes)

### Option 2: Deploy via render.yaml (Blueprint)

A `render.yaml` file has been created in your repository. To use it:

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Select the branch: `claude/awthar-initial-setup-014eQ1zR8knxQNvbeBCLCWmY`
5. Render will automatically detect the `render.yaml` file
6. **Important**: You still need to manually add the `DATABASE_URL` environment variable:
   - After the blueprint is created, go to your service
   - Click "Environment" tab
   - Add `DATABASE_URL` with your Neon connection string
7. Trigger a manual deploy

## Post-Deployment Steps

### 1. Verify Database Schema
After the first deployment, the database schema will be automatically pushed via `npm run db:push` during the build process.

### 2. Seed Initial Data (Optional)
If you need to seed your database with initial categories or data:
- Use Render's Shell feature in the dashboard
- Or connect to your Neon database directly using a PostgreSQL client

### 3. Custom Domain (Optional)
- In your Render service settings, you can add a custom domain
- Free tier includes a `.onrender.com` subdomain

## Important Notes for Render Free Tier

⚠️ **Free Tier Limitations:**
- Service will spin down after 15 minutes of inactivity
- First request after spin-down will be slow (~30-60 seconds)
- 750 hours/month of usage (sufficient for testing/demo)
- Automatic HTTPS included

💡 **Tips:**
- Use a cron service (like cron-job.org) to ping your app every 14 minutes to keep it awake
- Monitor your service logs via Render dashboard
- Free tier databases on Neon have connection limits (watch for pool exhaustion)

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify `NODE_ENV=production` is set

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly with `sslmode=require`
- Check Neon database is active and accepting connections
- Ensure connection pooling is configured (already done in `server/db.ts`)

### App Crashes on Start
- Check the application logs in Render dashboard
- Verify `SESSION_SECRET` is set
- Ensure database migrations ran successfully

## Monitoring

- **Logs**: Available in Render dashboard under "Logs" tab
- **Metrics**: Basic metrics available in free tier (CPU, Memory)
- **Events**: Deployment history and events in "Events" tab

## Next Steps After Deployment

1. **Test the Application**
   - Visit your Render URL (e.g., `https://awthar.onrender.com`)
   - Test basic functionality (homepage, browsing, etc.)

2. **Configure Authentication**
   - Update authentication callbacks if needed
   - The app currently uses session-based auth

3. **Set Up Monitoring**
   - Consider adding error tracking (Sentry, etc.)
   - Set up uptime monitoring

4. **Optimize for Production**
   - Add logging
   - Configure CORS if needed
   - Set up rate limiting

## Support

- Render Documentation: https://render.com/docs
- Neon Documentation: https://neon.tech/docs
- GitHub Issues: [Your repository URL]

---

**Deployment Date**: {{ Current Date }}
**Platform Version**: Node.js (Render managed)
**Database**: PostgreSQL 15+ (Neon)
