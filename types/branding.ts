// ============================================================================
// White-Label / Agency Branding Types
// ============================================================================

export interface BrandColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface BrandingSettings {
  // Agency Info
  agencyName: string;
  agencyTagline?: string;
  
  // Logo
  logoUrl?: string;
  logoDarkUrl?: string; // For dark backgrounds
  faviconUrl?: string;
  
  // Colors - Auto-extracted or manually set
  colors: BrandColors;
  
  // Custom CSS Overrides
  customCss?: string;
  
  // PDF Settings
  pdfHeaderText?: string;
  pdfFooterText?: string;
  showLogoOnPDFs: boolean;
  
  // Email Settings
  emailSenderName: string;
  emailSenderEmail: string;
  
  // Domain (for white-label)
  customDomain?: string;
  
  // Metadata
  lastUpdated: string;
  updatedBy: string;
}

export interface ColorExtractionResult {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  darkText: string;
  lightText: string;
  palette: string[];
}

export const DEFAULT_BRANDING: BrandingSettings = {
  agencyName: 'EazyRentals',
  agencyTagline: 'Property Management Made Simple',
  colors: {
    primary: '#2563eb',      // blue-600
    primaryLight: '#3b82f6', // blue-500
    primaryDark: '#1d4ed8',  // blue-700
    secondary: '#64748b',    // slate-500
    accent: '#f59e0b',       // amber-500
    background: '#f8fafc',   // slate-50
    surface: '#ffffff',      // white
    text: '#0f172a',         // slate-900
    textMuted: '#64748b',    // slate-500
  },
  showLogoOnPDFs: true,
  emailSenderName: 'EazyRentals',
  emailSenderEmail: 'noreply@eazyrentals.com',
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system',
};

// Helper to convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper to convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Helper to adjust brightness of a color
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value: number) => {
    return Math.max(0, Math.min(255, value + (value * percent / 100)));
  };
  
  return rgbToHex(
    adjust(rgb.r),
    adjust(rgb.g),
    adjust(rgb.b)
  );
}

// Helper to determine if text should be light or dark on a background
export function getContrastText(backgroundColor: string): 'light' | 'dark' {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'dark';
  
  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'dark' : 'light';
}
