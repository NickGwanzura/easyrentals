/**
 * Company Service - Database operations for multi-tenant functionality
 */

import { supabase } from '@/lib/supabase/client';
import type { Company } from './server';
import { syncAccountCompanyContext } from '@/lib/auth/account-records';

export interface CreateCompanyInput {
  name: string;
  slug: string;
  custom_domain?: string;
  logo_url?: string;
  primary_color?: string;
  owner_id?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  custom_domain?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  surface_color?: string;
  text_color?: string;
  custom_css?: string;
  email_sender_name?: string;
  email_sender_email?: string;
  subscription_status?: string;
  subscription_tier?: string;
  max_users?: number;
  max_properties?: number;
  features?: string[];
  status?: string;
}

export interface CompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';
  invitation_status: 'pending' | 'active' | 'removed';
  joined_at: string;
}

async function getAuthenticatedUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to perform this action.');
  }

  return user;
}

async function getCurrentUserRole(userId: string): Promise<string | null> {
  const profileResult = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (profileResult.data?.role) {
    return profileResult.data.role;
  }

  const userResult = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return userResult.data?.role ?? null;
}

async function requirePlatformAdmin() {
  const user = await getAuthenticatedUser();
  const role = await getCurrentUserRole(user.id);

  if (role !== 'admin') {
    throw new Error('Admin access required.');
  }

  return user;
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .single();
  
  return !data;
}

/**
 * Check if a custom domain is available
 */
export async function isDomainAvailable(domain: string): Promise<boolean> {
  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('custom_domain', domain)
    .single();
  
  return !data;
}

/**
 * Create a new company
 */
export async function createCompany(input: CreateCompanyInput): Promise<Company | null> {
  const user = await getAuthenticatedUser();

  // Check if slug is available
  const available = await isSlugAvailable(input.slug);
  if (!available) {
    throw new Error('Slug is already taken');
  }

  const ownerId = input.owner_id || user.id;
  
  // Create company
  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: input.name,
      slug: input.slug,
      custom_domain: input.custom_domain,
      logo_url: input.logo_url,
      primary_color: input.primary_color,
      owner_id: ownerId,
      status: 'active',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating company:', error);
    throw error;
  }
  
  // Add owner as company user if provided
  if (ownerId) {
    await supabase.from('company_users').insert({
      company_id: company.id,
      user_id: ownerId,
      role: 'owner',
      invitation_status: 'active',
    });
    
    // Update the active company context for the owner.
    await syncAccountCompanyContext(ownerId, company.id, { setPrimaryCompany: true });
  }
  
  return company;
}

/**
 * Update company
 */
export async function updateCompany(
  companyId: string, 
  input: UpdateCompanyInput
): Promise<Company | null> {
  await requirePlatformAdmin();

  const { data, error } = await supabase
    .from('companies')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', companyId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating company:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get company by ID
 */
export async function getCompanyById(id: string): Promise<Company | null> {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  
  return data;
}

/**
 * Get all companies for a user
 */
export async function getUserCompanies(userId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from('company_users')
    .select(`
      company_id,
      role,
      companies:company_id (*)
    `)
    .eq('user_id', userId)
    .eq('invitation_status', 'active');
  
  if (error) {
    console.error('Error fetching user companies:', error);
    return [];
  }
  
  return data?.map((item: any) => ({
    ...item.companies,
    user_role: item.role,
  })) || [];
}

/**
 * Get company members
 */
export async function getCompanyMembers(companyId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('company_users')
    .select(`
      *,
      user:user_id (id, first_name, last_name, email, avatar_url)
    `)
    .eq('company_id', companyId)
    .eq('invitation_status', 'active');
  
  if (error) {
    console.error('Error fetching company members:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Invite user to company
 */
export async function inviteUserToCompany(
  companyId: string,
  userId: string,
  role: string = 'member',
  invitedBy: string
): Promise<void> {
  const { error } = await supabase.from('company_users').insert({
    company_id: companyId,
    user_id: userId,
    role,
    invitation_status: 'pending',
    invited_by: invitedBy,
    invited_at: new Date().toISOString(),
  });
  
  if (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
}

/**
 * Remove user from company
 */
export async function removeUserFromCompany(
  companyId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('company_users')
    .update({ invitation_status: 'removed' })
    .eq('company_id', companyId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error removing user:', error);
    throw error;
  }
}

/**
 * Update user role in company
 */
export async function updateUserRole(
  companyId: string,
  userId: string,
  role: string
): Promise<void> {
  const { error } = await supabase
    .from('company_users')
    .update({ role })
    .eq('company_id', companyId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating role:', error);
    throw error;
  }
}

/**
 * Switch user's current company
 */
export async function switchCompany(userId: string, companyId: string): Promise<void> {
  const { data: membership, error: membershipError } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .eq('invitation_status', 'active')
    .maybeSingle();

  if (membershipError) {
    console.error('Error validating company membership:', membershipError);
    throw membershipError;
  }

  if (!membership) {
    throw new Error('You do not have access to that company.');
  }

  await syncAccountCompanyContext(userId, companyId);
}

/**
 * Delete company (soft delete)
 */
export async function deleteCompany(companyId: string): Promise<void> {
  await requirePlatformAdmin();

  const { error } = await supabase
    .from('companies')
    .update({ status: 'inactive' })
    .eq('id', companyId);
  
  if (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}

/**
 * Get all companies (admin only)
 */
export async function getAllCompanies(): Promise<Company[]> {
  await requirePlatformAdmin();

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get company stats
 */
export async function getCompanyStats(companyId: string) {
  const { data, error } = await supabase
    .from('company_dashboard_stats')
    .select('*')
    .eq('company_id', companyId)
    .single();
  
  if (error) {
    console.error('Error fetching company stats:', error);
    return null;
  }
  
  return data;
}
