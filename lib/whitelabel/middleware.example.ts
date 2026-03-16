/**
 * White-Label Middleware Example
 * 
 * This file should be copied to `middleware.ts` in the project root
 * after the companies table and database schema are ready.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Subdomains to ignore (system routes)
const SYSTEM_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'staging', 'dev'];

// Main domain - change to your production domain
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'eazyrentals.app';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // Skip for static files and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.match(/\.(.*)$/) // File extensions
  ) {
    return NextResponse.next();
  }
  
  // Determine the company based on hostname
  const company = await identifyCompany(hostname);
  
  if (!company) {
    // No company found - redirect to main site or show error
    if (isCustomDomain(hostname)) {
      // Custom domain without registered company
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
    // Subdomain doesn't exist - continue to main app
    return NextResponse.next();
  }
  
  // Add company info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-company-id', company.id);
  requestHeaders.set('x-company-slug', company.slug);
  requestHeaders.set('x-company-name', company.name);
  
  // Add branding info
  if (company.primary_color) {
    requestHeaders.set('x-brand-primary', company.primary_color);
  }
  if (company.logo_url) {
    requestHeaders.set('x-brand-logo', company.logo_url);
  }
  
  // Rewrite URL to remove subdomain (internal routing)
  // e.g., company1.eazyrentals.com/dashboard → eazyrentals.com/dashboard
  // But keep company context in headers
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Identify company based on hostname
 */
async function identifyCompany(hostname: string) {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0];
  
  // Check if it's a custom domain
  if (isCustomDomain(cleanHostname)) {
    return await getCompanyByDomain(cleanHostname);
  }
  
  // Check for subdomain
  const subdomain = getSubdomain(cleanHostname);
  if (subdomain && !SYSTEM_SUBDOMAINS.includes(subdomain)) {
    return await getCompanyBySlug(subdomain);
  }
  
  return null;
}

/**
 * Check if hostname is a custom domain (not our main domain)
 */
function isCustomDomain(hostname: string): boolean {
  return !hostname.endsWith(MAIN_DOMAIN) && hostname !== MAIN_DOMAIN;
}

/**
 * Extract subdomain from hostname
 * e.g., company1.eazyrentals.com → company1
 */
function getSubdomain(hostname: string): string | null {
  if (!hostname.endsWith(MAIN_DOMAIN)) return null;
  
  const parts = hostname.replace(`.${MAIN_DOMAIN}`, '').split('.');
  
  // Handle nested subdomains (e.g., blog.company1.eazyrentals.com)
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  
  return parts[0] || null;
}

/**
 * Fetch company by slug (subdomain)
 * TODO: Implement with Supabase
 */
async function getCompanyBySlug(slug: string) {
  // Example implementation:
  // const { data } = await supabase
  //   .from('companies')
  //   .select('*')
  //   .eq('slug', slug)
  //   .eq('status', 'active')
  //   .single();
  // return data;
  
  // For now, return mock data
  return {
    id: 'mock-company-id',
    slug,
    name: 'Mock Company',
    primary_color: '#2563eb',
    logo_url: null,
  };
}

/**
 * Fetch company by custom domain
 * TODO: Implement with Supabase
 */
async function getCompanyByDomain(domain: string) {
  // Example implementation:
  // const { data } = await supabase
  //   .from('companies')
  //   .select('*')
  //   .eq('custom_domain', domain)
  //   .eq('status', 'active')
  //   .single();
  // return data;
  
  return null;
}

/**
 * Configure which paths the middleware runs on
 */
export const config = {
  matcher: [
    // Skip all internal paths
    '/((?!_next|api|static|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
