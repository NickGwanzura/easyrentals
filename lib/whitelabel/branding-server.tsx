/**
 * Server-Side Branding Injection
 * 
 * This module provides utilities for injecting branding into the HTML
 * before it reaches the client, preventing the "flash of unbranded content".
 */

import { headers } from 'next/headers';
import { cache } from 'react';

export interface CompanyBranding {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  customCss?: string;
  emailSenderName: string;
  emailSenderEmail: string;
}

const DEFAULT_BRANDING: CompanyBranding = {
  id: 'default',
  name: 'EazyRentals',
  slug: 'default',
  tagline: 'Property Management Made Simple',
  colors: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
  },
  emailSenderName: 'EazyRentals',
  emailSenderEmail: 'noreply@eazyrentals.com',
};

/**
 * Get current company branding from request headers (server-side)
 * Uses React cache for deduplication during SSR
 */
export const getServerBranding = cache(async (): Promise<CompanyBranding> => {
  const headersList = await headers();
  
  const companyId = headersList.get('x-company-id');
  const companyName = headersList.get('x-company-name');
  const companySlug = headersList.get('x-company-slug');
  const brandPrimary = headersList.get('x-brand-primary');
  const brandLogo = headersList.get('x-brand-logo');
  
  // If no company context, return default branding
  if (!companyId) {
    return DEFAULT_BRANDING;
  }
  
  // Build branding from headers
  // In production, you might want to fetch full branding from cache/DB
  return {
    id: companyId,
    name: companyName || DEFAULT_BRANDING.name,
    slug: companySlug || 'default',
    logoUrl: brandLogo || undefined,
    colors: {
      ...DEFAULT_BRANDING.colors,
      primary: brandPrimary || DEFAULT_BRANDING.colors.primary,
    },
    emailSenderName: companyName || DEFAULT_BRANDING.emailSenderName,
    emailSenderEmail: DEFAULT_BRANDING.emailSenderEmail,
  };
});

/**
 * Generate CSS variables for branding
 */
export function generateBrandingCSS(branding: CompanyBranding): string {
  const { colors } = branding;
  
  return `
    :root {
      --brand-primary: ${colors.primary};
      --brand-primary-light: ${colors.primaryLight};
      --brand-primary-dark: ${colors.primaryDark};
      --brand-secondary: ${colors.secondary};
      --brand-accent: ${colors.accent};
      --brand-background: ${colors.background};
      --brand-surface: ${colors.surface};
      --brand-text: ${colors.text};
      --brand-text-muted: ${colors.textMuted};
      
      /* Generate color scale */
      ${generateColorScaleCSS(colors.primary)}
    }
    
    ${branding.customCss || ''}
  `.trim();
}

/**
 * Generate color scale (50-950) for Tailwind compatibility
 */
function generateColorScaleCSS(baseColor: string): string {
  const scale = generateColorScale(baseColor);
  return Object.entries(scale)
    .map(([key, value]) => `      --brand-primary-${key}: ${value};`)
    .join('\n');
}

function generateColorScale(baseColor: string): Record<string, string> {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const adjust = (value: number, percent: number) => {
    return Math.max(0, Math.min(255, value + (value * percent / 100)));
  };
  
  const toHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  return {
    50: toHex(adjust(r, 95), adjust(g, 95), adjust(b, 95)),
    100: toHex(adjust(r, 80), adjust(g, 80), adjust(b, 80)),
    200: toHex(adjust(r, 60), adjust(g, 60), adjust(b, 60)),
    300: toHex(adjust(r, 40), adjust(g, 40), adjust(b, 40)),
    400: toHex(adjust(r, 20), adjust(g, 20), adjust(b, 20)),
    500: baseColor,
    600: toHex(adjust(r, -15), adjust(g, -15), adjust(b, -15)),
    700: toHex(adjust(r, -25), adjust(g, -25), adjust(b, -25)),
    800: toHex(adjust(r, -35), adjust(g, -35), adjust(b, -35)),
    900: toHex(adjust(r, -45), adjust(g, -45), adjust(b, -45)),
    950: toHex(adjust(r, -55), adjust(g, -55), adjust(b, -55)),
  };
}

/**
 * Generate metadata for the page based on company branding
 */
export async function generateCompanyMetadata() {
  const branding = await getServerBranding();
  
  return {
    title: branding.name,
    description: branding.tagline,
    icons: branding.faviconUrl ? { icon: branding.faviconUrl } : undefined,
  };
}

/**
 * Server component that injects branding styles
 * Use this in your root layout.tsx
 */
export async function ServerBrandingStyles() {
  const branding = await getServerBranding();
  const css = generateBrandingCSS(branding);
  
  return (
    <style 
      id="server-branding" 
      dangerouslySetInnerHTML={{ __html: css }}
    />
  );
}

/**
 * Hook for server components to access branding
 */
export async function useServerBranding(): Promise<CompanyBranding> {
  return getServerBranding();
}
