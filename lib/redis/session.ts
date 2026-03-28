import { getRedisClient } from './client';

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400;

/**
 * Session data interface
 */
export interface SessionData {
  userId: string;
  email: string;
  role?: string;
  companyId?: string;
  [key: string]: any;
}

/**
 * Create a new session
 * @param sessionId Unique session ID
 * @param data Session data
 * @returns Session ID
 */
export async function createSession(
  sessionId: string,
  data: SessionData
): Promise<string> {
  const client = getRedisClient();
  if (!client) return sessionId;

  try {
    await client.setex(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify({
        ...data,
        createdAt: new Date().toISOString(),
      })
    );
    return sessionId;
  } catch (error) {
    console.error('Session creation error:', error);
    return sessionId;
  }
}

/**
 * Get session data
 * @param sessionId Session ID
 * @returns Session data or null
 */
export async function getSession(sessionId: string): Promise<SessionData | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(`session:${sessionId}`);
    if (!data) return null;
    
    // Refresh TTL on access
    await client.expire(`session:${sessionId}`, SESSION_TTL);
    
    return JSON.parse(data) as SessionData;
  } catch (error) {
    console.error('Session get error:', error);
    return null;
  }
}

/**
 * Update session data
 * @param sessionId Session ID
 * @param data Partial session data to update
 */
export async function updateSession(
  sessionId: string,
  data: Partial<SessionData>
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const existing = await getSession(sessionId);
    if (!existing) return;

    await client.setex(
      `session:${sessionId}`,
      SESSION_TTL,
      JSON.stringify({
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Session update error:', error);
  }
}

/**
 * Delete session
 * @param sessionId Session ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(`session:${sessionId}`);
  } catch (error) {
    console.error('Session delete error:', error);
  }
}

/**
 * Get all active sessions for a user
 * @param userId User ID
 */
export async function getUserSessions(userId: string): Promise<string[]> {
  const client = getRedisClient();
  if (!client) return [];

  try {
    const keys = await client.keys('session:*');
    const sessions: string[] = [];

    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          sessions.push(key.replace('session:', ''));
        }
      }
    }

    return sessions;
  } catch (error) {
    console.error('Get user sessions error:', error);
    return [];
  }
}

/**
 * Invalidate all sessions for a user
 * @param userId User ID
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    const sessions = await getUserSessions(userId);
    if (sessions.length > 0) {
      await client.del(...sessions.map(id => `session:${id}`));
    }
  } catch (error) {
    console.error('Invalidate user sessions error:', error);
  }
}
