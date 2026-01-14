# Development & Deployment Workflow

Quick reference for the Awthar Marketplace development workflow.

## 🔄 Auto-Deployment Setup

**GitHub → Render (Automatic)**

```
Push to main branch → Render auto-deploys → Live in 2-5 minutes
```

## 💻 Daily Development Workflow

### 1. Make Changes Locally

```bash
# Start development server
npm run dev

# Make your code changes
# Test locally at http://localhost:5000
```

### 2. Commit Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: your feature description"
# or
git commit -m "fix: bug description"
# or
git commit -m "docs: documentation updates"
```

### 3. Push to GitHub (Auto-Deploys)

```bash
# Push to main branch
git push origin main

# Render automatically:
# - Detects the push
# - Runs npm run build
# - Restarts with npm start
# - Live in 2-5 minutes
```

### 4. Monitor Deployment

- Go to [Render Dashboard](https://dashboard.render.com)
- Check "Events" tab for deployment status
- View "Logs" tab for build and runtime logs
- Test the production URL once deployed

## 🔧 Common Commands

### Development
```bash
npm run dev              # Start development server
npm run check            # TypeScript type checking
```

### Database
```bash
npm run db:generate      # Generate new migration
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio
```

### Production Build (Local Testing)
```bash
npm run build            # Build for production
npm start                # Start production server
```

## 🚨 Emergency Rollback

If something breaks after deployment:

```bash
# Option 1: Revert the last commit
git revert HEAD
git push origin main
# Render will auto-deploy the reverted version

# Option 2: Roll back to specific commit
git revert <commit-hash>
git push origin main
```

## 📋 Pre-Push Checklist

Before pushing to main:

- [ ] Test changes locally with `npm run dev`
- [ ] Run `npm run check` (TypeScript validation)
- [ ] Ensure no sensitive data in code
- [ ] Write clear commit message
- [ ] Check Render dashboard after push

## 🔍 Debugging Deployment Issues

### Build Fails
1. Check Render build logs for errors
2. Test build locally: `npm run build`
3. Fix errors and push again

### Runtime Errors
1. Check Render runtime logs
2. Look for environment validation errors
3. Verify all env vars are set in Render
4. Check database connection

### Environment Issues
1. Go to Render → Environment tab
2. Verify all required variables are set:
   - DATABASE_URL
   - SESSION_SECRET
   - SUPABASE_ENDPOINT
   - SUPABASE_ACCESS_KEY
   - SUPABASE_SECRET_KEY
   - SUPABASE_BUCKET
   - NODE_ENV=production

## 📚 Documentation Links

- **Main README:** [README.md](README.md)
- **Production Guide:** [docs/PRODUCTION.md](docs/PRODUCTION.md)
- **Security Summary:** [docs/PRODUCTION-READY-SUMMARY.md](docs/PRODUCTION-READY-SUMMARY.md)
- **Docs Index:** [docs/README.md](docs/README.md)

## 💡 Pro Tips

1. **Commit Often:** Small, focused commits are easier to debug
2. **Watch Logs:** Monitor Render logs during deployment
3. **Test First:** Always test locally before pushing
4. **Clear Messages:** Use descriptive commit messages
5. **Check Status:** Verify deployment completes successfully

## 🎯 Commit Message Conventions

```bash
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

---

**Remember:** Every push to `main` triggers a production deployment!
