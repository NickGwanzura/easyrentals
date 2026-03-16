'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrandingSettings, DEFAULT_BRANDING, BrandColors } from '@/types/branding';
import type { Company } from '@/lib/whitelabel/server';

interface BrandingContextType {
  branding: BrandingSettings;
  isLoading: boolean;
  updateBranding: (updates: Partial<BrandingSettings>) => Promise<void>;
  updateLogo: (file: File) => Promise<string>;
  applyColors: (colors: Partial<BrandColors>) => void;
  resetToDefaults: () => void;
  company: Company | null;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

const STORAGE_KEY = 'agency_branding_settings';

// Convert Company to BrandingSettings
function companyToBranding(company: Company | null): BrandingSettings {
  if (!company) return DEFAULT_BRANDING;
  
  return {
    agencyName: company.name,
    logoUrl: company.logo_url,
    logoDarkUrl: company.logo_dark_url,
    faviconUrl: company.favicon_url,
    colors: {
      primary: company.primary_color,
      primaryLight: adjustBrightness(company.primary_color, 20),
      primaryDark: adjustBrightness(company.primary_color, -15),
      secondary: company.secondary_color,
      accent: company.accent_color,
      background: company.background_color,
      surface: company.surface_color,
      text: company.text_color,
      textMuted: adjustBrightness(company.text_color, 40),
    },
    showLogoOnPDFs: true,
    emailSenderName: company.email_sender_name,
    emailSenderEmail: company.email_sender_email,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system',
  };
}

interface BrandingProviderProps {
  children: ReactNode;
  initialCompany?: Company | null;
}

export function BrandingProvider({ children, initialCompany }: BrandingProviderProps) {
  const [company, setCompany] = useState<Company | null>(initialCompany || null);
  const [branding, setBranding] = useState<BrandingSettings>(companyToBranding(initialCompany || null));
  const [isLoading, setIsLoading] = useState(!initialCompany);

  // Generate color scale
  const generateColorScale = (baseColor: string) => {
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
      500: toHex(adjust(r, 0), adjust(g, 0), adjust(b, 0)),
      600: toHex(adjust(r, -15), adjust(g, -15), adjust(b, -15)),
      700: toHex(adjust(r, -25), adjust(g, -25), adjust(b, -25)),
      800: toHex(adjust(r, -35), adjust(g, -35), adjust(b, -35)),
      900: toHex(adjust(r, -45), adjust(g, -45), adjust(b, -45)),
      950: toHex(adjust(r, -55), adjust(g, -55), adjust(b, -55)),
    };
  };

  // Apply CSS variables when branding changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const { colors } = branding;
    
    // Set CSS custom properties
    root.style.setProperty('--brand-primary', colors.primary);
    root.style.setProperty('--brand-primary-light', colors.primaryLight);
    root.style.setProperty('--brand-primary-dark', colors.primaryDark);
    root.style.setProperty('--brand-secondary', colors.secondary);
    root.style.setProperty('--brand-accent', colors.accent);
    root.style.setProperty('--brand-background', colors.background);
    root.style.setProperty('--brand-surface', colors.surface);
    root.style.setProperty('--brand-text', colors.text);
    root.style.setProperty('--brand-text-muted', colors.textMuted);
    
    // Generate and set color scale
    const colorScale = generateColorScale(colors.primary);
    Object.entries(colorScale).forEach(([key, value]) => {
      root.style.setProperty(`--brand-primary-${key}`, value);
    });
    
    // Update page title and favicon
    if (branding.agencyName) {
      document.title = branding.agencyName;
    }
    
    if (branding.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.faviconUrl;
      }
    }
    
    // Apply custom CSS
    if (branding.customCss) {
      let styleEl = document.getElementById('custom-branding-css') as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-branding-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = branding.customCss;
    }
  }, [branding]);

  const updateBranding = async (updates: Partial<BrandingSettings>): Promise<void> => {
    const updated = {
      ...branding,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    setBranding(updated);
    
    // Also save to localStorage as fallback
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save branding settings:', error);
    }
  };

  const updateLogo = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const applyColors = (colors: Partial<BrandColors>): void => {
    updateBranding({
      colors: { ...branding.colors, ...colors }
    });
  };

  const resetToDefaults = (): void => {
    setBranding(DEFAULT_BRANDING);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BRANDING));
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        isLoading,
        updateBranding,
        updateLogo,
        applyColors,
        resetToDefaults,
        company,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextType {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

// Hook for PDF generation
export function useBrandingForPDF() {
  const { branding } = useBranding();
  
  return {
    logoUrl: branding.showLogoOnPDFs ? branding.logoUrl : undefined,
    agencyName: branding.agencyName,
    colors: branding.colors,
    headerText: branding.pdfHeaderText,
    footerText: branding.pdfFooterText,
  };
}

// Helper to adjust brightness
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
