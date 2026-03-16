/**
 * Server-Side White-Label Utilities
 */

import { headers } from 'next/headers';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { resolveCompanyForHostname, type ResolvedCompany } from './tenant-resolver';

export interface Company {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  custom_css?: string;
  email_sender_name: string;
  email_sender_email: string;
  status?: string;
  subscription_status?: string;
  subscription_tier?: string;
  max_users?: number;
  max_properties?: number;
  features?: string[];
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
};

export const DEFAULT_COMPANY: Company = {
  id: 'default',
  name: 'EazyRentals',
  slug: 'default',
  primary_color: DEFAULT_COLORS.primary,
  secondary_color: DEFAULT_COLORS.secondary,
  accent_color: DEFAULT_COLORS.accent,
  background_color: DEFAULT_COLORS.background,
  surface_color: DEFAULT_COLORS.surface,
  text_color: DEFAULT_COLORS.text,
  email_sender_name: 'EazyRentals',
  email_sender_email: 'noreply@eazyrentals.com',
  status: 'active',
  subscription_status: 'active',
  subscription_tier: 'enterprise',
  max_users: 10,
  max_properties: 20,
  features: [],
};

function normalizeCompany(company: ResolvedCompany | null): Company | null {
  if (!company) {
    return null;
  }

  return {
    ...DEFAULT_COMPANY,
    ...company,
    custom_domain: company.custom_domain || undefined,
    logo_url: company.logo_url || undefined,
    logo_dark_url: company.logo_dark_url || undefined,
    favicon_url: company.favicon_url || undefined,
    primary_color: company.primary_color || DEFAULT_COMPANY.primary_color,
    secondary_color: company.secondary_color || DEFAULT_COMPANY.secondary_color,
    accent_color: company.accent_color || DEFAULT_COMPANY.accent_color,
    background_color: company.background_color || DEFAULT_COMPANY.background_color,
    surface_color: company.surface_color || DEFAULT_COMPANY.surface_color,
    text_color: company.text_color || DEFAULT_COMPANY.text_color,
    custom_css: company.custom_css || undefined,
    email_sender_name: company.email_sender_name || DEFAULT_COMPANY.email_sender_name,
    email_sender_email: company.email_sender_email || DEFAULT_COMPANY.email_sender_email,
    subscription_status: company.subscription_status || DEFAULT_COMPANY.subscription_status,
    subscription_tier: company.subscription_tier || DEFAULT_COMPANY.subscription_tier,
    max_users: company.max_users ?? DEFAULT_COMPANY.max_users,
    max_properties: company.max_properties ?? DEFAULT_COMPANY.max_properties,
    features: company.features || DEFAULT_COMPANY.features,
    owner_id: company.owner_id || undefined,
    status: company.status || DEFAULT_COMPANY.status,
    created_at: company.created_at || undefined,
    updated_at: company.updated_at || undefined,
  };
}

/**
 * Get current company from request headers (server-side only)
 */
export const getCurrentCompany = cache(async (): Promise<Company | null> => {
  const headersList = await headers();
  const companyId = headersList.get('x-company-id');
  const supabase = createClient();

  if (companyId) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      return normalizeCompany(data);
    }
  }

  const hostname = headersList.get('x-forwarded-host') || headersList.get('host');
  const resolvedCompany = await resolveCompanyForHostname(hostname, supabase);

  return normalizeCompany(resolvedCompany) || DEFAULT_COMPANY;
});

/**
 * Get company by slug (for public pages like login)
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  
  return data;
}

/**
 * Get company by custom domain
 */
export async function getCompanyByDomain(domain: string): Promise<Company | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('custom_domain', domain)
    .eq('status', 'active')
    .single();
  
  return data;
}

/**
 * Generate CSS variables for company branding
 */
export function generateBrandingCSS(company: Company | null): string {
  if (!company) {
    return generateDefaultCSS();
  }
  
  const colorScale = generateColorScale(company.primary_color);
  
  return `
    :root {
      --brand-primary: ${company.primary_color};
      --brand-primary-light: ${adjustBrightness(company.primary_color, 20)};
      --brand-primary-dark: ${adjustBrightness(company.primary_color, -15)};
      --brand-secondary: ${company.secondary_color};
      --brand-accent: ${company.accent_color};
      --brand-background: ${company.background_color};
      --brand-surface: ${company.surface_color};
      --brand-text: ${company.text_color};
      --brand-text-muted: ${adjustBrightness(company.text_color, 40)};
      
      /* Color scale */
      ${Object.entries(colorScale).map(([key, value]) => `--brand-primary-${key}: ${value};`).join('\n      ')}
    }
    
    ${company.custom_css || ''}
  `.trim();
}

function generateDefaultCSS(): string {
  return `
    :root {
      --brand-primary: ${DEFAULT_COLORS.primary};
      --brand-primary-light: #3b82f6;
      --brand-primary-dark: #1d4ed8;
      --brand-secondary: ${DEFAULT_COLORS.secondary};
      --brand-accent: ${DEFAULT_COLORS.accent};
      --brand-background: ${DEFAULT_COLORS.background};
      --brand-surface: ${DEFAULT_COLORS.surface};
      --brand-text: ${DEFAULT_COLORS.text};
      --brand-text-muted: #64748b;
    }
  `.trim();
}

/**
 * Generate color scale (50-950)
 */
function generateColorScale(baseColor: string): Record<string, string> {
  return {
    50: adjustBrightness(baseColor, 95),
    100: adjustBrightness(baseColor, 80),
    200: adjustBrightness(baseColor, 60),
    300: adjustBrightness(baseColor, 40),
    400: adjustBrightness(baseColor, 20),
    500: baseColor,
    600: adjustBrightness(baseColor, -15),
    700: adjustBrightness(baseColor, -25),
    800: adjustBrightness(baseColor, -35),
    900: adjustBrightness(baseColor, -45),
    950: adjustBrightness(baseColor, -55),
  };
}

/**
 * Adjust color brightness
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16)
    .slice(1);
}

/**
 * Generate metadata for the company
 */
export async function generateCompanyMetadata() {
  const company = await getCurrentCompany();
  
  return {
    title: company?.name || 'EazyRentals',
    description: 'Property Management Made Simple',
    icons: company?.favicon_url ? { icon: company.favicon_url } : undefined,
  };
}

/**
 * Server component: Inject branding styles
 */
export async function ServerBrandingStyles() {
  const company = await getCurrentCompany();
  const css = generateBrandingCSS(company);
  
  return (
    <style 
      id="server-branding" 
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}
