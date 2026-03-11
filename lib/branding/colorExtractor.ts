import { ColorExtractionResult, BrandColors, rgbToHex, adjustBrightness, getContrastText } from '@/types/branding';

// Dynamic import for node-vibrant (browser version)
async function getVibrant() {
  const Vibrant = await import('node-vibrant/browser');
  return Vibrant;
}

/**
 * Extract colors from an image URL using node-vibrant
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ColorExtractionResult> {
  try {
    const Vibrant = await getVibrant();
    const palette = await Vibrant.from(imageUrl).getPalette();
    
    // Extract the main swatches
    const vibrantColor = palette.Vibrant?.hex || '#2563eb';
    const mutedColor = palette.Muted?.hex || '#64748b';
    const darkVibrant = palette.DarkVibrant?.hex || '#1d4ed8';
    const lightVibrant = palette.LightVibrant?.hex || '#3b82f6';
    const darkMuted = palette.DarkMuted?.hex || '#1e293b';
    const lightMuted = palette.LightVibrant?.hex || '#f8fafc';
    
    // Build a full palette
    const fullPalette = [
      vibrantColor,
      mutedColor,
      darkVibrant,
      lightVibrant,
      darkMuted,
      lightMuted,
    ];
    
    // Add additional variations
    if (palette.Vibrant) {
      fullPalette.push(
        adjustBrightness(vibrantColor, 20),
        adjustBrightness(vibrantColor, -20)
      );
    }
    
    return {
      primary: vibrantColor,
      secondary: mutedColor,
      accent: darkVibrant,
      background: '#ffffff',
      darkText: darkMuted,
      lightText: '#ffffff',
      palette: fullPalette,
    };
  } catch (error) {
    console.error('Failed to extract colors:', error);
    // Return default colors on error
    return {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      darkText: '#0f172a',
      lightText: '#ffffff',
      palette: ['#2563eb', '#64748b', '#f59e0b', '#1e293b', '#f8fafc'],
    };
  }
}

/**
 * Generate a complete brand color palette from extracted colors
 */
export function generateBrandColors(extracted: ColorExtractionResult): BrandColors {
  const primary = extracted.primary;
  
  return {
    primary: primary,
    primaryLight: adjustBrightness(primary, 20),
    primaryDark: adjustBrightness(primary, -15),
    secondary: extracted.secondary,
    accent: extracted.accent,
    background: '#f8fafc',
    surface: '#ffffff',
    text: extracted.darkText,
    textMuted: adjustBrightness(extracted.darkText, 40),
  };
}

/**
 * Generate a full color scale (50-950) from a base color
 * Similar to Tailwind's color scale
 */
export function generateColorScale(baseColor: string): Record<string, string> {
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
 * Preview how colors will look together
 */
export function generateColorPreview(colors: BrandColors): {
  primaryButton: string;
  secondaryButton: string;
  cardBackground: string;
  headerBackground: string;
  textOnPrimary: string;
  textOnSecondary: string;
} {
  return {
    primaryButton: colors.primary,
    secondaryButton: colors.secondary,
    cardBackground: colors.surface,
    headerBackground: colors.background,
    textOnPrimary: getContrastText(colors.primary) === 'light' ? '#ffffff' : colors.text,
    textOnSecondary: getContrastText(colors.secondary) === 'light' ? '#ffffff' : colors.text,
  };
}

/**
 * Validate if a color is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Convert a color name or shorthand to full hex
 */
export function normalizeColor(color: string): string {
  // If already valid hex, return as-is
  if (isValidHexColor(color)) {
    return color.toLowerCase();
  }
  
  // Handle 3-digit hex
  if (/^#([A-Fa-f0-9]{3})$/.test(color)) {
    const [, hex] = color.match(/^#([A-Fa-f0-9]{3})$/)!;
    return '#' + hex.split('').map(c => c + c).join('').toLowerCase();
  }
  
  // Return default if invalid
  return '#2563eb';
}

/**
 * Suggest complementary colors based on primary color
 */
export function suggestComplementaryColors(primaryColor: string): {
  secondary: string;
  accent: string;
} {
  // Simple complementary color logic
  // In a real app, you might use a more sophisticated color theory algorithm
  
  const rgb = primaryColor
    .replace('#', '')
    .match(/.{2}/g)
    ?.map(x => parseInt(x, 16));
    
  if (!rgb) return { secondary: '#64748b', accent: '#f59e0b' };
  
  const [r, g, b] = rgb;
  
  // Calculate complementary (opposite on color wheel)
  const complementary = rgbToHex(255 - r, 255 - g, 255 - b);
  
  // Calculate analogous (neighbors on color wheel)
  const accent = rgbToHex(
    Math.min(255, r + 50),
    Math.max(0, g - 30),
    Math.min(255, b + 30)
  );
  
  return {
    secondary: complementary,
    accent: accent,
  };
}
