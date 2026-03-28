import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

/**
 * Health check endpoint for Docker/Dokploy
 * Returns 200 OK when the application is healthy
 * Includes Redis connectivity status
 */
export async function GET() {
  const startTime = Date.now();
  
  // Check Redis connectivity
  let redisStatus = 'disabled';
  let redisPing = false;
  
  try {
    const redis = getRedisClient();
    if (redis) {
      redisPing = await redis.ping() === 'PONG';
      redisStatus = redisPing ? 'connected' : 'error';
    }
  } catch (error) {
    redisStatus = 'error';
    console.error('Redis health check failed:', error);
  }

  const responseTime = Date.now() - startTime;
  
  const isHealthy = redisStatus !== 'error';
  
  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      responseTime: `${responseTime}ms`,
      services: {
        app: 'healthy',
        redis: redisStatus,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

// Also support HEAD requests for lightweight health checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
