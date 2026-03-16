const SYSTEM_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'staging', 'dev', 'demo'];
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';

export type ResolvedCompany = {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string | null;
  logo_url?: string | null;
  logo_dark_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  accent_color?: string | null;
  background_color?: string | null;
  surface_color?: string | null;
  text_color?: string | null;
  custom_css?: string | null;
  email_sender_name?: string | null;
  email_sender_email?: string | null;
  subscription_status?: string | null;
  subscription_tier?: string | null;
  max_users?: number | null;
  max_properties?: number | null;
  features?: string[] | null;
  owner_id?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function stripPort(hostname: string): string {
  return hostname.split(':')[0].toLowerCase();
}

function getBaseDomain(): string {
  return stripPort(MAIN_DOMAIN);
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isBaseHost(hostname: string): boolean {
  const cleanHostname = stripPort(hostname);
  const baseDomain = getBaseDomain();
  return cleanHostname === baseDomain || isLocalHost(cleanHostname);
}

export function getSubdomain(hostname: string): string | null {
  const cleanHostname = stripPort(hostname);
  const baseDomain = getBaseDomain();

  if (isBaseHost(cleanHostname) || !cleanHostname.endsWith(`.${baseDomain}`)) {
    return null;
  }

  const withoutBase = cleanHostname.slice(0, -(baseDomain.length + 1));
  const parts = withoutBase.split('.').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

function isCustomDomain(hostname: string): boolean {
  const cleanHostname = stripPort(hostname);
  const baseDomain = getBaseDomain();
  return !isLocalHost(cleanHostname) && cleanHostname !== baseDomain && !cleanHostname.endsWith(`.${baseDomain}`);
}

async function getDefaultCompany(supabase: any): Promise<ResolvedCompany | null> {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', 'default')
    .eq('status', 'active')
    .maybeSingle();

  return data;
}

export async function resolveCompanyForHostname(
  hostname: string | null | undefined,
  supabase: any
): Promise<ResolvedCompany | null> {
  if (!hostname) {
    return getDefaultCompany(supabase);
  }

  const cleanHostname = stripPort(hostname);

  if (isBaseHost(cleanHostname)) {
    return getDefaultCompany(supabase);
  }

  if (isCustomDomain(cleanHostname)) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('custom_domain', cleanHostname)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      return data;
    }
  }

  const subdomain = getSubdomain(cleanHostname);
  if (subdomain && !SYSTEM_SUBDOMAINS.includes(subdomain)) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', subdomain)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      return data;
    }
  }

  return getDefaultCompany(supabase);
}

export function applyCompanyHeaders(headers: Headers, company: ResolvedCompany | null) {
  if (!company) {
    headers.delete('x-company-id');
    headers.delete('x-company-name');
    headers.delete('x-company-slug');
    headers.delete('x-brand-primary');
    headers.delete('x-brand-logo');
    headers.delete('x-brand-favicon');
    return;
  }

  headers.set('x-company-id', company.id);
  headers.set('x-company-name', company.name);
  headers.set('x-company-slug', company.slug);

  if (company.primary_color) {
    headers.set('x-brand-primary', company.primary_color);
  } else {
    headers.delete('x-brand-primary');
  }

  if (company.logo_url) {
    headers.set('x-brand-logo', company.logo_url);
  } else {
    headers.delete('x-brand-logo');
  }

  if (company.favicon_url) {
    headers.set('x-brand-favicon', company.favicon_url);
  } else {
    headers.delete('x-brand-favicon');
  }
}
