# EazyRentals Deployment Guide

This guide covers deploying EazyRentals to Vercel and other platforms.

## Table of Contents

1. [Quick Deploy to Vercel](#quick-deploy-to-vercel)
2. [Manual Deployment](#manual-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Custom Domain](#custom-domain)
6. [Troubleshooting](#troubleshooting)

---

## Quick Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/NickGwanzura/easyrentals)

### Steps:

1. Click the **"Deploy with Vercel"** button above
2. Sign in to Vercel (or create an account)
3. Select your GitHub repository
4. Configure environment variables (see below)
5. Click **Deploy**

That's it! Your app will be live in minutes.

---

## Manual Deployment

### Prerequisites

- A Vercel account (free)
- GitHub repository connected to Vercel
- Node.js 18+ installed locally

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Navigate to project
cd eazyrentals

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://eazyrentals.vercel.app` |
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode | `true` |

### Optional Variables (Database)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` |

### Setting Environment Variables in Vercel

#### Option 1: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable

#### Option 2: Vercel CLI

```bash
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_DEMO_MODE
```

#### Option 3: Project Settings File

The project includes `vercel.json` with environment variable mappings:

```json
{
  "env": {
    "NEXT_PUBLIC_APP_URL": "@next_public_app_url"
  }
}
```

Store sensitive values in Vercel Secrets:

```bash
vercel secrets add next_public_app_url https://your-domain.vercel.app
```

---

## Database Setup

### Option 1: Demo Mode (No Database)

The app works out-of-the-box with mock data. No database setup required.

### Option 2: Supabase (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the schema:
   - Open Supabase SQL Editor
   - Copy contents of `lib/db/schema.sql`
   - Run the SQL

3. Get your credentials:
   - Go to **Settings** → **API**
   - Copy `URL` and `anon public` key

4. Add to environment variables:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Redeploy:
   ```bash
   vercel --prod
   ```

### Option 3: PostgreSQL (Self-Hosted)

1. Set up PostgreSQL database
2. Run `lib/db/schema.sql`
3. Update database connection string
4. Configure in environment variables

---

## Custom Domain

### Adding a Custom Domain on Vercel

1. Go to **Project Settings** → **Domains**
2. Enter your domain (e.g., `eazyrentals.com`)
3. Follow Vercel's DNS configuration instructions
4. Add `NEXT_PUBLIC_APP_URL` environment variable with your custom domain

### DNS Configuration Example

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## GitHub Actions CI/CD

The project includes automatic deployment via GitHub Actions:

### Setup

1. Get Vercel tokens:
   ```bash
   vercel tokens create
   ```

2. Add secrets to GitHub:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add:
     - `VERCEL_TOKEN`
     - `VERCEL_ORG_ID`
     - `VERCEL_PROJECT_ID`

3. Push to `master` branch → Auto-deploys to production
4. Create a PR → Gets preview deployment

---

## Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database connected (if using real data)
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)
- [ ] Email service configured (optional)
- [ ] Build passes locally: `npm run build`
- [ ] All pages load correctly
- [ ] Demo login works
- [ ] Responsive design tested

---

## Build Configuration

### Build Output

The project uses `output: 'standalone'` in `next.config.js` for optimal Vercel deployment.

### Build Command

```bash
npm run build
```

### Output Directory

```
.next/
├── standalone/     # Self-contained app
├── static/         # Static assets
└── ...
```

---

## Troubleshooting

### Issue: Build Fails

**Solution:**
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Issue: Environment Variables Not Working

**Solution:**
- Check variable names start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Verify in Vercel dashboard

### Issue: Images Not Loading

**Solution:**
- Add image domains to `next.config.js`
- Check `images.unsplash.com` is in the domains list
- For external images, use `unoptimized: true`

### Issue: Demo Mode Not Working

**Solution:**
- Ensure `NEXT_PUBLIC_DEMO_MODE=true` is set
- Check browser localStorage isn't cleared
- Verify mock data is loading

### Issue: Database Connection Failed

**Solution:**
- Verify Supabase URL and key
- Check database is running
- Ensure IP allowlist includes Vercel IPs
- Review connection pooling settings

---

## Performance Optimization

### Vercel Analytics

Enable Web Vitals tracking:

1. Go to **Analytics** tab in Vercel dashboard
2. Click **Enable**
3. Redeploy

### Speed Insights

Vercel automatically optimizes:
- Image optimization
- Edge caching
- Compression
- Global CDN

### Manual Optimizations

1. **Code Splitting**: Automatic with Next.js
2. **Lazy Loading**: Use `next/dynamic` for heavy components
3. **Image Optimization**: Use `next/image` component
4. **Font Optimization**: Fonts are automatically optimized

---

## Security Checklist

- [ ] Environment variables marked as secrets
- [ ] Database credentials not exposed
- [ ] API routes protected with authentication
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured in `next.config.js`
- [ ] CORS configured properly

---

## Post-Deployment

### Verify Deployment

1. **Homepage**: Visit `/landing`
2. **Login**: Test demo login
3. **Dashboard**: Verify role-based access
4. **API Routes**: Test if using real database

### Monitoring

1. **Vercel Analytics**: Monitor traffic and performance
2. **Error Tracking**: Consider Sentry integration
3. **Uptime**: Vercel provides 99.99% uptime SLA

### Updates

To update your deployment:

```bash
# Push to GitHub (auto-deploys)
git push origin master

# Or manual redeploy
vercel --prod
```

---

## Support

For deployment issues:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Project Issues: [GitHub Issues](https://github.com/NickGwanzura/easyrentals/issues)

---

**Happy Deploying!** 🚀
