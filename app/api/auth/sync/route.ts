/**
 * POST /api/auth/sync
 * Called client-side after login to ensure the Better Auth user exists
 * in our business `users` table, then returns company memberships.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db/client';
import { headers } from 'next/headers';

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const u = session.user as any;
  const firstName = u.firstName || u.name?.split(' ')[0] || '';
  const lastName  = u.lastName  || u.name?.split(' ').slice(1).join(' ') || '';
  const role      = u.role || 'tenant';

  // Upsert into business users table
  await sql`
    INSERT INTO users (id, email, first_name, last_name, role, avatar_url, email_verified)
    VALUES (
      ${u.id}::uuid,
      ${u.email},
      ${firstName},
      ${lastName},
      ${role},
      ${u.image ?? null},
      ${u.emailVerified ?? false}
    )
    ON CONFLICT (id) DO UPDATE SET
      email          = EXCLUDED.email,
      first_name     = COALESCE(NULLIF(users.first_name, ''), EXCLUDED.first_name),
      last_name      = COALESCE(NULLIF(users.last_name,  ''), EXCLUDED.last_name),
      avatar_url     = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
      email_verified = EXCLUDED.email_verified,
      updated_at     = NOW()
  `;

  // Return company memberships
  const companies = await sql`
    SELECT cu.role AS user_role, c.id, c.name, c.slug
    FROM company_users cu
    JOIN companies c ON c.id = cu.company_id
    WHERE cu.user_id = ${u.id}::uuid
      AND cu.invitation_status = 'active'
    ORDER BY cu.joined_at ASC
  `;

  return NextResponse.json({ user: u, companies });
}
