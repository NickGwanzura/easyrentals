import { supabase } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types';

type AccountSourceRecord = {
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
};

export interface AccountRecord extends AccountSourceRecord {}

interface SyncIdentityInput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
}

function mergeAccountRecords(
  primary: AccountSourceRecord | null,
  fallback: AccountSourceRecord | null
): AccountRecord | null {
  if (!primary && !fallback) {
    return null;
  }

  return {
    id: primary?.id || fallback?.id || '',
    email: primary?.email || fallback?.email || '',
    first_name: primary?.first_name || fallback?.first_name || '',
    last_name: primary?.last_name || fallback?.last_name || '',
    role: primary?.role || fallback?.role || 'tenant',
    avatar_url: primary?.avatar_url ?? fallback?.avatar_url ?? null,
    phone: primary?.phone ?? fallback?.phone ?? null,
    created_at: primary?.created_at || fallback?.created_at || new Date().toISOString(),
    updated_at: primary?.updated_at || fallback?.updated_at || new Date().toISOString(),
    primary_company_id: primary?.primary_company_id ?? fallback?.primary_company_id ?? null,
    current_company_id: primary?.current_company_id ?? fallback?.current_company_id ?? null,
  };
}

export async function getAccountRecord(userId: string): Promise<AccountRecord | null> {
  const [profileResult, legacyUserResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, avatar_url, phone, created_at, updated_at, primary_company_id, current_company_id')
      .eq('id', userId)
      .maybeSingle(),
    supabase
      .from('users')
      .select('id, email, first_name, last_name, role, avatar_url, phone, created_at, updated_at, primary_company_id, current_company_id')
      .eq('id', userId)
      .maybeSingle(),
  ]);

  return mergeAccountRecords(
    (profileResult.data as AccountSourceRecord | null) || null,
    (legacyUserResult.data as AccountSourceRecord | null) || null
  );
}

export function mapAccountToUser(authUser: any, account: AccountRecord | null): User {
  return {
    id: authUser.id,
    email: authUser.email || account?.email || '',
    firstName: account?.first_name || authUser.user_metadata.first_name || '',
    lastName: account?.last_name || authUser.user_metadata.last_name || '',
    role: (account?.role || authUser.user_metadata.role || 'tenant') as UserRole,
    avatar: account?.avatar_url || authUser.user_metadata.avatar_url || undefined,
    phone: account?.phone || authUser.user_metadata.phone || undefined,
    createdAt: account?.created_at || authUser.created_at,
    updatedAt: account?.updated_at || authUser.updated_at || authUser.created_at,
  };
}

export async function syncAccountIdentity(input: SyncIdentityInput): Promise<void> {
  const timestamp = new Date().toISOString();

  const { error } = await supabase.from('profiles').upsert(
    {
      id: input.id,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      role: input.role,
      phone: input.phone || null,
      avatar_url: input.avatarUrl || null,
      updated_at: timestamp,
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }
}

export async function syncAccountCompanyContext(
  userId: string,
  companyId: string,
  options?: { setPrimaryCompany?: boolean }
): Promise<void> {
  const updates: Record<string, string> = {
    current_company_id: companyId,
  };

  if (options?.setPrimaryCompany) {
    updates.primary_company_id = companyId;
  }

  const profileUpdate = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (profileUpdate.error) {
    console.warn('Unable to sync company context to profiles:', profileUpdate.error.message);
  }

  const legacyUpdate = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (legacyUpdate.error) {
    console.warn('Unable to sync company context to legacy users table:', legacyUpdate.error.message);
  }
}
