/**
 * POST /api/auth/sync
 * Called client-side after Auth0 login to upsert the Auth0 user into Neon.
 * Returns the user's Neon profile (including role and company info).
 */
import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { sql } from '@/lib/db/client';

export async function POST() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { sub, email, name, picture } = session.user;
  const nameParts = (name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Upsert user into Neon — preserve existing role if already set
  const rows = await sql`
    INSERT INTO users (auth0_sub, email, first_name, last_name, avatar_url, email_verified)
    VALUES (${sub}, ${email}, ${firstName}, ${lastName}, ${picture ?? null}, true)
    ON CONFLICT (auth0_sub) DO UPDATE SET
      email         = EXCLUDED.email,
      first_name    = COALESCE(NULLIF(users.first_name, ''), EXCLUDED.first_name),
      last_name     = COALESCE(NULLIF(users.last_name,  ''), EXCLUDED.last_name),
      avatar_url    = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
      email_verified = true,
      updated_at    = NOW()
    RETURNING id, email, first_name, last_name, role, avatar_url, phone,
              current_company_id, primary_company_id, created_at
  `;

  const user = rows[0];

  // Fetch company memberships
  const companies = await sql`
    SELECT cu.role AS user_role, c.id, c.name, c.slug
    FROM company_users cu
    JOIN companies c ON c.id = cu.company_id
    WHERE cu.user_id = ${user.id}
      AND cu.invitation_status = 'active'
    ORDER BY cu.joined_at ASC
  `;

  return NextResponse.json({ user, companies });
}
