# Dokploy Deployment with Redis

This guide covers deploying EazyRentals on Dokploy with Redis for caching and session management.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Nginx Proxy   │────▶│  Next.js App    │────▶│  Redis Cache    │
│   (Dokploy)     │     │  (Docker)       │     │  (Docker)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Supabase      │
                        │   (Database)    │
                        └─────────────────┘
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. In Dokploy dashboard:
   - Create **Compose**
   - Source: **Git**
   - Repository: Your GitHub repo
   - Compose File: `docker-compose.yml`

2. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   REDIS_ENABLED=true
   ```

3. Deploy!

### Option 2: Separate Services

If you prefer separate applications:

1. **Create Redis Service**:
   - In Dokploy: Create **Compose** or **Database**
   - Use Redis template or custom Docker image: `redis:7-alpine`
   - Port: 6379

2. **Create App Service**:
   - Build: Docker
   - Dockerfile: `Dockerfile`
   - Add env vars including `REDIS_URL=redis://redis:6379`

## Redis Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `REDIS_ENABLED` | `false` | Enable Redis features |

### Redis Features

#### 1. Caching

```typescript
import { setCache, getCache, deleteCache } from '@/lib/redis';

// Cache data for 5 minutes
await setCache('user:123', userData, 300);

// Retrieve cached data
const user = await getCache('user:123');

// Delete cache
await deleteCache('user:123');

// Delete by pattern
await deleteCachePattern('user:*');
```

#### 2. Session Management

```typescript
import { 
  createSession, 
  getSession, 
  deleteSession,
  invalidateUserSessions 
} from '@/lib/redis/session';

// Create session
const sessionId = await createSession('session-123', {
  userId: 'user-123',
  email: 'user@example.com',
  role: 'admin'
});

// Get session
const session = await getSession('session-123');

// Delete session
await deleteSession('session-123');

// Invalidate all user sessions
await invalidateUserSessions('user-123');
```

#### 3. Cache Decorator

```typescript
import { withCache } from '@/lib/redis';

class UserService {
  @withCache((id) => `user:${id}`, 300)
  async getUser(id: string) {
    // This result will be cached for 5 minutes
    return await db.users.findById(id);
  }
}
```

## Health Checks

The `/api/health` endpoint now includes Redis status:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "app": "healthy",
    "redis": "connected"
  }
}
```

## Monitoring Redis

### Using Redis CLI

```bash
# Access Redis container
docker exec -it eazyrentals-redis redis-cli

# Check info
INFO

# Monitor commands
MONITOR

# View keys
KEYS *

# Get memory usage
INFO memory
```

### Key Metrics

- **Memory Usage**: `used_memory_human`
- **Connected Clients**: `connected_clients`
- **Hit Rate**: `keyspace_hits` / (`keyspace_hits` + `keyspace_misses`)

## Troubleshooting

### Redis Connection Failed

1. Check if Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Check logs:
   ```bash
   docker logs eazyrentals-redis
   ```

3. Verify network:
   ```bash
   docker network ls
   docker network inspect eazyrentals-network
   ```

### High Memory Usage

Redis is configured with:
- Max memory: 256MB
- Eviction policy: `allkeys-lru` (removes least recently used keys)

To increase:
```yaml
# docker-compose.yml
command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
```

### Cache Not Working

1. Check `REDIS_ENABLED=true` is set
2. Verify `REDIS_URL` is correct
3. Check app logs for Redis connection errors

## Performance Tips

1. **Use appropriate TTL**: Don't cache forever, set reasonable expiration times
2. **Cache invalidation**: Delete cache when data changes
3. **Key naming**: Use consistent patterns like `entity:id:field`
4. **Avoid large values**: Redis works best with small values (< 1MB)

## Security

1. **Network**: Redis is only accessible within the Docker network
2. **No auth**: By default, no password required (internal network only)
3. **For production**: Consider adding Redis password:
   ```yaml
   command: redis-server --requirepass yourpassword
   ```

## Backup & Persistence

Redis is configured with AOF persistence:
- Data saved to `/data/appendonly.aof`
- Survives container restarts
- Volume mounted for persistence

To backup:
```bash
docker exec eazyrentals-redis redis-cli BGSAVE
docker cp eazyrentals-redis:/data/dump.rdb ./backup.rdb
```

## Resources

- **Redis Commands**: https://redis.io/commands
- **ioredis Docs**: https://github.com/redis/ioredis
- **Redis Persistence**: https://redis.io/topics/persistence
