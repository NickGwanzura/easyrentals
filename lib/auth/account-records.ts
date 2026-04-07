import { sql } from '@/lib/db/client';
import type { User, UserRole } from '@/types';

export interface AccountRecord {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: UserRole | null;
  avatar_url?: string | null;
  phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  primary_company_id?: string | null;
  current_company_id?: string | null;
}

interface SyncIdentityInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
}

export async function getAccountRecord(userId: string): Promise<AccountRecord | null> {
  const rows = await sql`
    SELECT id, email, first_name, last_name, role, avatar_url, phone,
           created_at, updated_at, primary_company_id, current_company_id
    FROM users
    WHERE id = ${userId}::uuid
    LIMIT 1
  `;
  return (rows[0] as AccountRecord) ?? null;
}

export function mapAccountToUser(authUser: any, account: AccountRecord | null): User {
  return {
    id: authUser.id || account?.id || '',
    email: authUser.email || account?.email || '',
    firstName: account?.first_name || authUser.given_name || (authUser.name || '').split(' ')[0] || '',
    lastName:  account?.last_name  || authUser.family_name || (authUser.name || '').split(' ').slice(1).join(' ') || '',
    role: (account?.role || 'tenant') as UserRole,
    avatar: account?.avatar_url || authUser.picture || undefined,
    phone:  account?.phone || undefined,
    createdAt: account?.created_at || new Date().toISOString(),
    updatedAt: account?.updated_at || new Date().toISOString(),
  };
}

export async function syncAccountIdentity(input: SyncIdentityInput): Promise<void> {
  await sql`
    INSERT INTO users (id, email, first_name, last_name, role, phone, avatar_url)
    VALUES (
      ${input.id}::uuid,
      ${input.email},
      ${input.firstName},
      ${input.lastName},
      ${input.role},
      ${input.phone ?? null},
      ${input.avatarUrl ?? null}
    )
    ON CONFLICT (id) DO UPDATE SET
      email      = EXCLUDED.email,
      first_name = COALESCE(NULLIF(users.first_name, ''), EXCLUDED.first_name),
      last_name  = COALESCE(NULLIF(users.last_name,  ''), EXCLUDED.last_name),
      phone      = COALESCE(users.phone, EXCLUDED.phone),
      avatar_url = COALESCE(users.avatar_url, EXCLUDED.avatar_url),
      updated_at = NOW()
  `;
}

export async function syncAccountCompanyContext(
  userId: string,
  companyId: string,
  options?: { setPrimaryCompany?: boolean }
): Promise<void> {
  if (options?.setPrimaryCompany) {
    await sql`
      UPDATE users
      SET current_company_id = ${companyId}::uuid,
          primary_company_id = ${companyId}::uuid,
          updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;
  } else {
    await sql`
      UPDATE users
      SET current_company_id = ${companyId}::uuid,
          updated_at = NOW()
      WHERE id = ${userId}::uuid
    `;
  }
}
