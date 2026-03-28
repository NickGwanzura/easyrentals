# Dokploy Deployment Guide

This guide covers deploying the EazyRentals application on Dokploy using Docker.

## Prerequisites

- Dokploy instance running
- Domain name pointing to your Dokploy server
- Supabase project (or PostgreSQL database)
- Environment variables ready

## Quick Start

### 1. Prepare Environment Variables

Create a `.env` file with the following variables:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Monitoring
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional: Analytics
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 2. Deploy on Dokploy

#### Option A: Git Repository (Recommended)

1. In Dokploy dashboard, create a new **Application**
2. Select **Git** as source
3. Enter your repository URL
4. Select the branch (e.g., `main` or `production`)
5. In build settings:
   - **Build Type**: Docker
   - **Dockerfile Path**: `Dockerfile`
6. Add your environment variables in the Dokploy UI
7. Deploy!

#### Option B: Docker Compose

1. In Dokploy dashboard, create a new **Compose**
2. Select **Git** as source
3. Enter your repository URL
4. Set **Compose File**: `docker-compose.yml`
5. Add your environment variables
6. Deploy!

## Configuration Details

### Dockerfile Structure

The Dockerfile uses a **multi-stage build**:

1. **deps**: Install production dependencies
2. **builder**: Build the Next.js application
3. **runner**: Production-optimized image (~150MB)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `NEXT_PUBLIC_SENTRY_DSN` | ❌ | Sentry error tracking |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | ❌ | Enable analytics (true/false) |

### Build Arguments

The Dockerfile accepts these build arguments (passed at build time):

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg SUPABASE_SERVICE_ROLE_KEY=... \
  -t eazyrentals:latest .
```

## Health Checks

The container includes a health check that monitors:
- Endpoint: `http://localhost:3000/api/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

## SSL/TLS Configuration

Dokploy automatically handles SSL certificates via Let's Encrypt:

1. Add your domain in Dokploy
2. Enable HTTPS
3. Certificates are auto-renewed

## Monitoring & Logs

### View Logs
```bash
# Via Dokploy UI
# OR via SSH to server:
docker logs eazyrentals-app -f
```

### Monitoring Stack (Optional)

Add to your Dokploy setup:
- **Uptime Kuma**: For uptime monitoring
- **Plausible**: For analytics
- **Sentry**: For error tracking

## Updates & Rollbacks

### Updating the Application

1. Push changes to your Git repository
2. Dokploy auto-detects (if webhook configured)
3. Or click "Deploy" in Dokploy UI

### Rollback

In Dokploy UI:
1. Go to Deployments
2. Select previous deployment
3. Click "Rollback"

## Performance Optimization

### Build Optimizations
- Multi-stage build reduces image size
- Only production dependencies included
- Static files served from `.next/static`

### Runtime Optimizations
- Node.js 20 Alpine (lightweight)
- Non-root user for security
- Health checks for reliability

## Troubleshooting

### Build Fails

1. Check environment variables are set
2. Verify Supabase credentials are valid
3. Check build logs in Dokploy

### Container Won't Start

```bash
# Check container logs
docker logs eazyrentals-app

# Check health status
docker ps
```

### High Memory Usage

- Increase container memory limit in Dokploy
- Monitor with `docker stats`

## Security Considerations

1. **Non-root user**: Container runs as `nextjs` user (UID 1001)
2. **Secrets**: Never commit `.env` files
3. **CORS**: Configure in Supabase dashboard
4. **Rate Limiting**: Implement via middleware or API gateway

## Backup & Restore

### Database (Supabase)
- Enable Point-in-Time Recovery in Supabase
- Schedule automated backups

### Application Data
- User uploads stored in Supabase Storage
- Application state in PostgreSQL

## Cost Optimization

### Dokploy Server
- Start with 2 CPU / 4GB RAM
- Scale based on traffic

### Supabase
- Use connection pooling (PgBouncer)
- Enable row-level security
- Monitor API usage

## Support

- **Dokploy Docs**: https://docs.dokploy.com
- **Carbon DS**: https://carbondesignsystem.com
- **Next.js**: https://nextjs.org/docs/deployment

## Example Dokploy Configuration

```json
{
  "name": "eazyrentals",
  "source": {
    "type": "git",
    "repository": "https://github.com/yourusername/eazyrentals",
    "branch": "main"
  },
  "build": {
    "type": "docker",
    "dockerfile": "Dockerfile"
  },
  "deploy": {
    "replicas": 1,
    "healthCheck": {
      "path": "/api/health",
      "port": 3000
    }
  }
}
```
