import { getRedisClient } from './client';

// Default cache TTL in seconds (5 minutes)
const DEFAULT_TTL = 300;

/**
 * Cache data in Redis
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in seconds (default: 300)
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Get cached data from Redis
 * @param key Cache key
 * @returns Cached data or null
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Delete cached data from Redis
 * @param key Cache key
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Delete multiple cached keys by pattern
 * @param pattern Key pattern (e.g., "user:*")
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
}

/**
 * Cache decorator for functions
 * @param keyGenerator Function to generate cache key
 * @param ttl Time to live in seconds
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = DEFAULT_TTL
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const cacheKey = keyGenerator(...args);
      
      // Try to get from cache
      const cached = await getCache<ReturnType<T>>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await setCache(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Generate cache key with prefix
 * @param prefix Key prefix
 * @param identifier Unique identifier
 */
export function generateCacheKey(prefix: string, identifier: string | number): string {
  return `${prefix}:${identifier}`;
}
