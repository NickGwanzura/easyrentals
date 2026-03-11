import { supabase } from './client';
import { UserRole } from '@/types';

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export async function signUp({ email, password, firstName, lastName, role, phone }: SignUpCredentials) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        phone: phone || null,
      },
    },
  });

  if (authError) {
    throw authError;
  }

  // Create profile in profiles table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        phone: phone || null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't throw - user is created, profile can be updated later
    }
  }

  return authData;
}

export async function signIn({ email, password }: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get full profile from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email!,
    firstName: profile?.first_name || user.user_metadata.first_name || '',
    lastName: profile?.last_name || user.user_metadata.last_name || '',
    role: (profile?.role || user.user_metadata.role || 'tenant') as UserRole,
    avatar: profile?.avatar_url || user.user_metadata.avatar_url || null,
    phone: profile?.phone || user.user_metadata.phone || null,
    createdAt: profile?.created_at || user.created_at,
  };
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });

  if (error) {
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

export async function updateProfile(updates: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    throw error;
  }

  // Also update auth metadata
  await supabase.auth.updateUser({
    data: {
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      avatar_url: updates.avatarUrl,
    },
  });
}

// Listen for auth state changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}
