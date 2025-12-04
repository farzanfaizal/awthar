# Environment Configuration Guide

## 1. Local Development (.env)

Create or update the `.env` file in your project root (`AwtharMarketplace/.env`) with the following credentials:

```env
# Database
DATABASE_URL=postgresql://... (Your existing DB URL)

# Supabase Storage (S3 Compatible)
SUPABASE_ENDPOINT=https://xkrsqpwzptneeebyxgls.storage.supabase.co/storage/v1/s3
SUPABASE_REGION=ap-northeast-1
SUPABASE_ACCESS_KEY=26cd60d81e53648619250c4bf79e019d
SUPABASE_SECRET_KEY=cf3fcda427b5ff641fd4b44ae6dab22903f36bad33e9074b80e23e35a356ad79
SUPABASE_BUCKET=awthar-s3-key
```

## 2. Production (Render.com)

When deploying to Render:
1. Go to your **Dashboard** -> **Select your Web Service**.
2. Click on **Environment** in the left sidebar.
3. Click **Add Environment Variable**.
4. Add each of the keys above (`SUPABASE_ENDPOINT`, `SUPABASE_ACCESS_KEY`, etc.) with their corresponding values.

**Note on Compression:**
The backend will automatically compress images to < 200KB before uploading to this bucket to save bandwidth and storage.
