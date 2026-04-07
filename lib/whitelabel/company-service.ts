/**
 * Company Service - Neon-backed multi-tenant operations.
 * Auth is handled by Auth0; server routes use auth0.getSession().
 */
import { sql } from '@/lib/db/client';
import type { Company } from './server';
import { syncAccountCompanyContext } from '@/lib/auth/account-records';

export interface CreateCompanyInput {
  name: string;
  slug: string;
  custom_domain?: string;
  logo_url?: string;
  primary_color?: string;
  owner_id: string;
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

// ── Queries ─────────────────────────────────────────────────────────────────

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const rows = await sql`SELECT id FROM companies WHERE slug = ${slug} LIMIT 1`;
  return rows.length === 0;
}

export async function isDomainAvailable(domain: string): Promise<boolean> {
  const rows = await sql`SELECT id FROM companies WHERE custom_domain = ${domain} LIMIT 1`;
  return rows.length === 0;
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const available = await isSlugAvailable(input.slug);
  if (!available) throw new Error('Slug is already taken');

  const rows = await sql`
    INSERT INTO companies (name, slug, custom_domain, logo_url, primary_color, owner_id, status)
    VALUES (
      ${input.name},
      ${input.slug},
      ${input.custom_domain ?? null},
      ${input.logo_url ?? null},
      ${input.primary_color ?? '#2563eb'},
      ${input.owner_id}::uuid,
      'active'
    )
    RETURNING *
  `;
  const company = rows[0] as Company;

  // Add owner as active member
  await sql`
    INSERT INTO company_users (company_id, user_id, role, invitation_status)
    VALUES (${company.id}::uuid, ${input.owner_id}::uuid, 'owner', 'active')
    ON CONFLICT (company_id, user_id) DO NOTHING
  `;

  // Set as user's primary company
  await syncAccountCompanyContext(input.owner_id, company.id, { setPrimaryCompany: true });

  return company;
}

export async function updateCompany(companyId: string, input: UpdateCompanyInput): Promise<Company | null> {
  const fields = Object.entries(input)
    .filter(([, v]) => v !== undefined)
    .map(([k]) => k);

  if (fields.length === 0) return getCompanyById(companyId);

  const setClauses = fields.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
  const values = [companyId, ...fields.map(k => (input as any)[k])];

  const rows = await sql(
    `UPDATE companies SET ${setClauses}, updated_at = NOW() WHERE id = $1::uuid RETURNING *`,
    values
  );
  return (rows[0] as Company) ?? null;
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const rows = await sql`SELECT * FROM companies WHERE id = ${id}::uuid LIMIT 1`;
  return (rows[0] as Company) ?? null;
}

export async function getUserCompanies(userId: string): Promise<Company[]> {
  const rows = await sql`
    SELECT c.*, cu.role AS user_role
    FROM company_users cu
    JOIN companies c ON c.id = cu.company_id
    WHERE cu.user_id = ${userId}::uuid
      AND cu.invitation_status = 'active'
    ORDER BY cu.joined_at ASC
  `;
  return rows as Company[];
}

export async function getCompanyMembers(companyId: string): Promise<any[]> {
  const rows = await sql`
    SELECT cu.*,
           u.id AS user_id, u.first_name, u.last_name, u.email, u.avatar_url
    FROM company_users cu
    JOIN users u ON u.id = cu.user_id
    WHERE cu.company_id = ${companyId}::uuid
      AND cu.invitation_status = 'active'
  `;
  return rows;
}

export async function inviteUserToCompany(
  companyId: string,
  userId: string,
  role: string,
  invitedBy: string
): Promise<void> {
  await sql`
    INSERT INTO company_users (company_id, user_id, role, invitation_status, invited_by, invited_at)
    VALUES (
      ${companyId}::uuid, ${userId}::uuid, ${role}, 'pending',
      ${invitedBy}::uuid, NOW()
    )
    ON CONFLICT (company_id, user_id) DO NOTHING
  `;
}

export async function removeUserFromCompany(companyId: string, userId: string): Promise<void> {
  await sql`
    UPDATE company_users
    SET invitation_status = 'removed'
    WHERE company_id = ${companyId}::uuid AND user_id = ${userId}::uuid
  `;
}

export async function updateUserRole(companyId: string, userId: string, role: string): Promise<void> {
  await sql`
    UPDATE company_users
    SET role = ${role}
    WHERE company_id = ${companyId}::uuid AND user_id = ${userId}::uuid
  `;
}

export async function switchCompany(userId: string, companyId: string): Promise<void> {
  const rows = await sql`
    SELECT id FROM company_users
    WHERE user_id = ${userId}::uuid
      AND company_id = ${companyId}::uuid
      AND invitation_status = 'active'
    LIMIT 1
  `;
  if (rows.length === 0) throw new Error('You do not have access to that company.');
  await syncAccountCompanyContext(userId, companyId);
}

export async function deleteCompany(companyId: string): Promise<void> {
  await sql`UPDATE companies SET status = 'inactive' WHERE id = ${companyId}::uuid`;
}

export async function getAllCompanies(): Promise<Company[]> {
  const rows = await sql`SELECT * FROM companies ORDER BY created_at DESC`;
  return rows as Company[];
}
