import { ColorExtractionResult, BrandColors, rgbToHex, adjustBrightness, getContrastText } from '@/types/branding';

type RGB = {
  r: number;
  g: number;
  b: number;
};

type PaletteColor = RGB & {
  hex: string;
  brightness: number;
  saturation: number;
  count: number;
};

const DEFAULT_EXTRACTION: ColorExtractionResult = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: '#ffffff',
  darkText: '#0f172a',
  lightText: '#ffffff',
  palette: ['#2563eb', '#64748b', '#f59e0b', '#1e293b', '#f8fafc'],
};

function componentToHex(value: number): string {
  return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
}

function toHex({ r, g, b }: RGB): string {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function toBrightness({ r, g, b }: RGB): number {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function toSaturation({ r, g, b }: RGB): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function quantize(value: number): number {
  return Math.round(value / 32) * 32;
}

async function extractPalette(imageUrl: string): Promise<PaletteColor[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (!context) {
        reject(new Error('Unable to read image colors.'));
        return;
      }

      const maxDimension = 64;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
      canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
      canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

      for (let index = 0; index < data.length; index += 16) {
        const alpha = data[index + 3];
        if (alpha < 125) continue;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = toBrightness({ r, g, b });

        if (brightness > 245 || brightness < 12) {
          continue;
        }

        const key = `${quantize(r)}-${quantize(g)}-${quantize(b)}`;
        const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        bucket.count += 1;
        buckets.set(key, bucket);
      }

      const palette = Array.from(buckets.values())
        .filter(bucket => bucket.count > 0)
        .map((bucket) => {
          const color = {
            r: bucket.r / bucket.count,
            g: bucket.g / bucket.count,
            b: bucket.b / bucket.count,
          };

          return {
            ...color,
            hex: toHex(color),
            brightness: toBrightness(color),
            saturation: toSaturation(color),
            count: bucket.count,
          };
        })
        .sort((left, right) => right.count - left.count)
        .slice(0, 8);

      resolve(palette);
    };

    image.onerror = () => reject(new Error('Unable to load image for color extraction.'));
    image.src = imageUrl;
  });
}

function pickColor(
  palette: PaletteColor[],
  selector: (paletteColor: PaletteColor) => number
): PaletteColor | null {
  if (palette.length === 0) {
    return null;
  }

  return [...palette].sort((left, right) => selector(right) - selector(left))[0];
}

/**
 * Extract colors from an image URL using node-vibrant
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ColorExtractionResult> {
  try {
    const palette = await extractPalette(imageUrl);

    if (palette.length === 0) {
      return DEFAULT_EXTRACTION;
    }

    const vibrant = pickColor(palette, (color) => color.saturation * 100 + color.count);
    const muted = pickColor(palette, (color) => (1 - color.saturation) * 100 + color.count);
    const darkVibrant = pickColor(palette, (color) => color.saturation * 100 + (255 - color.brightness));
    const lightVibrant = pickColor(palette, (color) => color.saturation * 100 + color.brightness);
    const darkMuted = pickColor(palette, (color) => (1 - color.saturation) * 100 + (255 - color.brightness));
    const lightMuted = pickColor(palette, (color) => (1 - color.saturation) * 100 + color.brightness);

    const vibrantColor = vibrant?.hex || DEFAULT_EXTRACTION.primary;
    const mutedColor = muted?.hex || DEFAULT_EXTRACTION.secondary;
    const darkVibrantColor = darkVibrant?.hex || adjustBrightness(vibrantColor, -15);
    const lightVibrantColor = lightVibrant?.hex || adjustBrightness(vibrantColor, 15);
    const darkMutedColor = darkMuted?.hex || '#1e293b';
    const lightMutedColor = lightMuted?.hex || '#f8fafc';
    
    // Build a full palette
    const fullPalette = [
      vibrantColor,
      mutedColor,
      darkVibrantColor,
      lightVibrantColor,
      darkMutedColor,
      lightMutedColor,
    ];
    
    // Add additional variations
    if (vibrant) {
      fullPalette.push(
        adjustBrightness(vibrantColor, 20),
        adjustBrightness(vibrantColor, -20)
      );
    }
    
    return {
      primary: vibrantColor,
      secondary: mutedColor,
      accent: darkVibrantColor,
      background: '#ffffff',
      darkText: darkMutedColor,
      lightText: '#ffffff',
      palette: fullPalette,
    };
  } catch (error) {
    console.error('Failed to extract colors:', error);
    return DEFAULT_EXTRACTION;
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
