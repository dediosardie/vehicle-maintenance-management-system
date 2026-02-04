# VMMS Production Deployment Guide (HTTPS)

## Overview

This guide covers deploying the Vehicle Maintenance Management System from localhost to a production environment with HTTPS enabled.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel:**
- ✅ Automatic HTTPS
- ✅ Zero configuration
- ✅ Fast CDN
- ✅ Free tier available
- ✅ Git integration
- ✅ Easy environment variables

#### Vercel Deployment Steps

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy from Project Root**
   ```powershell
   cd D:\Projects\vehicle-maintenance-management-system
   vercel
   ```

4. **Follow Prompts:**
   - Set up and deploy? `Y`
   - Which scope? `[Your account]`
   - Link to existing project? `N`
   - What's your project's name? `vmms` or `vehicle-maintenance`
   - In which directory is your code located? `./`
   - Want to override settings? `N`

5. **Configure Build Settings (if prompted):**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. **Set Environment Variables** (Critical!)
   ```powershell
   vercel env add VITE_SUPABASE_URL
   # Paste your Supabase project URL
   
   vercel env add VITE_SUPABASE_ANON_KEY
   # Paste your Supabase anon key
   
   vercel env add VITE_GITHUB_AI_TOKEN
   # Paste your GitHub AI token (if using)
   ```

7. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

8. **Your App is Live!**
   - URL: `https://vmms-xxxxx.vercel.app`
   - Automatic HTTPS ✅
   - Free SSL certificate ✅

---

### Option 2: Netlify

**Why Netlify:**
- ✅ Automatic HTTPS
- ✅ Simple deployment
- ✅ Free tier
- ✅ Git integration

#### Netlify Deployment Steps

1. **Install Netlify CLI**
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login**
   ```powershell
   netlify login
   ```

3. **Build Your Project**
   ```powershell
   npm run build
   ```

4. **Deploy**
   ```powershell
   netlify deploy
   ```

5. **Follow Prompts:**
   - Create & configure a new site
   - Team: `[Your team]`
   - Site name: `vmms` (or custom)
   - Publish directory: `dist`

6. **Deploy to Production**
   ```powershell
   netlify deploy --prod
   ```

7. **Set Environment Variables**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GITHUB_AI_TOKEN`

8. **Trigger Redeploy**
   ```powershell
   netlify deploy --prod
   ```

---

### Option 3: GitHub Pages with Custom Domain

**Note:** GitHub Pages serves HTTPS by default, but requires custom routing for SPA.

#### Steps:

1. **Update `vite.config.ts`**
   ```typescript
   export default defineConfig({
     base: '/vehicle-maintenance-management-system/',
     build: {
       outDir: 'dist',
     },
   });
   ```

2. **Build Project**
   ```powershell
   npm run build
   ```

3. **Deploy to GitHub Pages**
   ```powershell
   # Install gh-pages
   npm install --save-dev gh-pages
   
   # Add to package.json scripts
   "deploy": "gh-pages -d dist"
   
   # Deploy
   npm run deploy
   ```

4. **Configure Custom Domain (Optional)**
   - Add `CNAME` file in `public/` folder
   - Configure DNS records
   - Enable HTTPS in GitHub settings

---

### Option 4: Self-Hosted (VPS/Cloud Server)

**Requirements:**
- Domain name
- SSL certificate (Let's Encrypt)
- Web server (Nginx/Apache)
- Node.js environment

#### Nginx Configuration Example

1. **Build Project**
   ```powershell
   npm run build
   ```

2. **Upload `dist` folder to server**
   ```bash
   scp -r dist/* user@your-server:/var/www/vmms/
   ```

3. **Nginx Config** (`/etc/nginx/sites-available/vmms`)
   ```nginx
   server {
       listen 80;
       server_name vmms.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name vmms.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/vmms.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/vmms.yourdomain.com/privkey.pem;

       root /var/www/vmms;
       index index.html;

       # SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d vmms.yourdomain.com
   ```

---

## Pre-Deployment Checklist

### 1. Environment Variables

Create `.env.production` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GITHUB_AI_TOKEN=your-github-token-here
```

⚠️ **Never commit this file to Git!**

### 2. Update Supabase Configuration

In your Supabase dashboard:

**Authentication Settings:**
- Site URL: `https://vmms.yourdomain.com`
- Redirect URLs: Add production URL

**Storage Settings:**
- Ensure `driver-attendance` bucket is created
- Bucket must be public
- CORS configured for your domain

**Database:**
- Run all migrations
- Verify RLS policies are enabled
- Add page restrictions including `/attendance`

### 3. Build Optimization

Update `vite.config.ts` for production:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
```

### 4. Test Build Locally

```powershell
# Build production
npm run build

# Preview build
npm run preview

# Access at http://localhost:4173
```

### 5. Security Headers

Add to your hosting platform or server config:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=self, geolocation=self
```

---

## Post-Deployment Configuration

### 1. Update Supabase URLs

Add your production URL to Supabase:

**SQL Editor:**
```sql
-- Update allowed origins if needed
-- This depends on your RLS policies
```

**Dashboard:**
- Authentication → URL Configuration
- Add production domain

### 2. Test Camera Permissions

⚠️ **Important:** Camera API requires HTTPS in production!

Test on your deployed URL:
1. Visit `/attendance` page
2. Click "Capture Photo"
3. Allow camera permissions
4. Verify image capture works

### 3. Test Geolocation

Geolocation also requires HTTPS. Test:
1. Login/Logout on attendance page
2. Verify GPS coordinates are captured
3. Check database records

### 4. Verify Storage Bucket

Test image upload:
1. Capture attendance image
2. Check Supabase Storage dashboard
3. Verify folder structure: `attendance/2026/02/04/`
4. Confirm image is accessible via public URL

---

## Environment-Specific Code

If you need different behavior for production:

```typescript
// src/config/environment.ts
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  enableDebugLogs: isDevelopment,
  cameraTimeout: isProduction ? 500 : 1000,
};

// Usage
if (config.enableDebugLogs) {
  console.log('Debug info...');
}
```

---

## Troubleshooting

### Camera Not Working on HTTPS

**Problem:** Camera permission denied on production

**Solutions:**
1. Ensure site is using HTTPS (not HTTP)
2. Check browser permissions
3. Try different browser
4. Check console for specific errors

### Geolocation Not Working

**Problem:** GPS coordinates not captured

**Solutions:**
1. Must use HTTPS
2. User must grant location permission
3. Test on mobile device (better GPS)

### Images Not Uploading

**Problem:** "Failed to upload image"

**Checklist:**
- ✅ Bucket `driver-attendance` exists
- ✅ Bucket is public
- ✅ RLS policies allow uploads
- ✅ CORS configured for your domain
- ✅ File size under limit

**Test:**
```typescript
// Browser console
const { data: buckets } = await supabase.storage.listBuckets();
console.log(buckets);
```

### Environment Variables Not Working

**Problem:** Getting "Missing Supabase environment variables"

**Solutions:**
1. Verify env vars are set in hosting dashboard
2. Prefix must be `VITE_` for Vite
3. Redeploy after adding env vars
4. Check build logs for errors

### 404 on Page Refresh

**Problem:** SPA routing not working

**Solutions:**

**Vercel:** Create `vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify:** Create `netlify.toml`
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## Performance Optimization

### 1. Enable Compression

Most platforms enable this by default, but verify:
- Gzip compression enabled
- Brotli compression enabled

### 2. CDN Configuration

**Vercel/Netlify:** Automatic CDN

**Custom Server:**
```nginx
# Enable Gzip
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 3. Image Optimization

For attendance images:
```typescript
// Already implemented in attendanceService
canvas.toBlob((blob) => {
  // ...
}, 'image/jpeg', 0.8); // 80% quality
```

---

## Monitoring & Analytics

### 1. Error Tracking

Add error tracking service (optional):

**Sentry:**
```powershell
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "your-sentry-dsn",
    environment: "production",
  });
}
```

### 2. Usage Analytics

Track attendance usage:
```sql
-- Daily attendance statistics
SELECT 
  attendance_date,
  COUNT(DISTINCT driver_id) as unique_drivers,
  COUNT(CASE WHEN action_type = 'login' THEN 1 END) as logins,
  COUNT(CASE WHEN action_type = 'logout' THEN 1 END) as logouts
FROM driver_attendance
WHERE attendance_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY attendance_date
ORDER BY attendance_date DESC;
```

---

## Cost Estimates

### Vercel Free Tier
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domain support
- 💰 **Cost: FREE** (for most use cases)

### Netlify Free Tier
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- 💰 **Cost: FREE** (for most use cases)

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth
- 💰 **Cost: FREE** (upgrade as needed)

### Custom Server (VPS)
- 💰 **$5-10/month** (DigitalOcean, Linode, Vultr)
- + Domain: ~$12/year
- SSL: Free (Let's Encrypt)

---

## Quick Deploy Commands

### Vercel (One Command)
```powershell
# Deploy to production with environment variables
vercel --prod
```

### Netlify (One Command)
```powershell
# Build and deploy
npm run build && netlify deploy --prod
```

### GitHub Pages
```powershell
# Deploy
npm run deploy
```

---

## Support & Resources

- **Vite Docs:** https://vitejs.dev/guide/static-deploy.html
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs
- **Let's Encrypt:** https://letsencrypt.org

---

## Next Steps After Deployment

1. ✅ Test all features on production URL
2. ✅ Set up monitoring/alerts
3. ✅ Configure backup strategy
4. ✅ Document production URL and credentials
5. ✅ Train users on the system
6. ✅ Set up staging environment (optional)

Your VMMS is now live on HTTPS! 🚀
