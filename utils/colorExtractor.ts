import { ExtractedColors } from '@types/index';

export class ColorExtractor {
  /**
   * Extract dominant colors from an image using canvas
   */
  static async extractColorsFromImage(imageSource: string | File): Promise<ExtractedColors | null> {
    try {
      const imageData = await this.getImageData(imageSource);
      if (!imageData) return null;

      const pixels = imageData.data;
      const colorMap = new Map<string, number>();
      const rgbValues: Array<[number, number, number]> = [];

      // Sample every 4th pixel for performance
      for (let i = 0; i < pixels.length; i += 16) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
        rgbValues.push([r, g, b]);
      }

      // Get dominant colors
      const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          return { r, g, b, hex: this.rgbToHex(r, g, b) };
        });

      if (sorted.length === 0) return null;

      const dominant = sorted[0];
      const secondary = sorted[Math.min(1, sorted.length - 1)];
      const accent = sorted[Math.min(3, sorted.length - 1)];

      // Analyze properties
      const brightness = this.calculateBrightness(dominant.r, dominant.g, dominant.b);
      const tone = this.calculateTone(dominant.r, dominant.g, dominant.b);
      const saturation = this.calculateSaturation(dominant.r, dominant.g, dominant.b);
      const mood = this.calculateMood(brightness, saturation, tone);

      return {
        dominant: dominant.hex,
        secondary: secondary.hex,
        accent: accent.hex,
        brightness,
        tone,
        saturation,
        mood,
      };
    } catch (error) {
      console.error('Color extraction failed:', error);
      return null;
    }
  }

  /**
   * Get image data from file or URL
   */
  private static async getImageData(source: string | File): Promise<ImageData | null> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const img = new Image();
      img.crossOrigin = 'anonymous';

      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        };
        img.onerror = () => resolve(null);

        if (source instanceof File) {
          img.src = URL.createObjectURL(source);
        } else {
          img.src = source;
        }
      });
    } catch (error) {
      console.error('Failed to get image data:', error);
      return null;
    }
  }

  /**
   * Convert RGB to Hex
   */
  private static rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Calculate brightness level
   */
  private static calculateBrightness(r: number, g: number, b: number): 'light' | 'dark' | 'medium' {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness > 155) return 'light';
    if (brightness < 100) return 'dark';
    return 'medium';
  }

  /**
   * Calculate color tone (warm/cool/neutral)
   */
  private static calculateTone(r: number, g: number, b: number): 'warm' | 'cool' | 'neutral' {
    const warmth = r + g - b;
    if (warmth > 50) return 'warm';
    if (warmth < -50) return 'cool';
    return 'neutral';
  }

  /**
   * Calculate saturation level
   */
  private static calculateSaturation(r: number, g: number, b: number): 'high' | 'medium' | 'low' {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    if (sat > 0.5) return 'high';
    if (sat > 0.2) return 'medium';
    return 'low';
  }

  /**
   * Determine overall mood based on color properties
   */
  private static calculateMood(
    brightness: 'light' | 'dark' | 'medium',
    saturation: 'high' | 'medium' | 'low',
    tone: 'warm' | 'cool' | 'neutral'
  ): 'energetic' | 'calm' | 'passionate' | 'peaceful' {
    if (saturation === 'high' && brightness === 'light') return 'energetic';
    if (saturation === 'low' && (brightness === 'dark' || brightness === 'medium')) return 'peaceful';
    if (tone === 'warm' && saturation === 'high') return 'passionate';
    return 'calm';
  }

  /**
   * Generate complementary colors for theme
   */
  static generateThemeColors(baseHex: string, mood: 'energetic' | 'calm' | 'passionate' | 'peaceful'): Record<string, string> {
    const rgb = this.hexToRgb(baseHex);
    if (!rgb) return this.getDefaultTheme(mood);

    const { r, g, b } = rgb;
    const hsl = this.rgbToHsl(r, g, b);

    return {
      primary: baseHex,
      secondary: this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 95)),
      accent: this.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
      background: this.hslToHex(hsl.h, 10, 96),
      foreground: this.hslToHex(hsl.h, 10, 15),
      glassLight: this.adjustOpacity(baseHex, 0.1),
      glassDark: this.adjustOpacity(baseHex, 0.2),
      highlight: this.hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l),
      shadow: this.adjustOpacity(baseHex, 0.3),
    };
  }

  /**
   * Convert hex to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convert RGB to HSL
   */
  private static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  /**
   * Convert HSL to Hex
   */
  private static hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) [r, g] = [c, x];
    else if (h < 120) [r, g] = [x, c];
    else if (h < 180) [g, b] = [c, x];
    else if (h < 240) [g, b] = [x, c];
    else if (h < 300) [r, b] = [c, x];
    else [r, b] = [x, c];

    return this.rgbToHex(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    );
  }

  /**
   * Adjust opacity of hex color
   */
  private static adjustOpacity(hex: string, opacity: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  /**
   * Get default theme for mood
   */
  private static getDefaultTheme(mood: string): Record<string, string> {
    const themes = {
      energetic: {
        primary: '#ff6b8a',
        secondary: '#ff8aa0',
        accent: '#fbbf24',
        background: '#fff5f7',
        foreground: '#1a1d23',
        glassLight: 'rgba(255, 107, 138, 0.1)',
        glassDark: 'rgba(255, 107, 138, 0.2)',
        highlight: '#fcd34d',
        shadow: 'rgba(255, 107, 138, 0.3)',
      },
      calm: {
        primary: '#0ea5e9',
        secondary: '#38bdf8',
        accent: '#06b6d4',
        background: '#f0f9ff',
        foreground: '#0c3d66',
        glassLight: 'rgba(14, 165, 233, 0.1)',
        glassDark: 'rgba(14, 165, 233, 0.2)',
        highlight: '#7dd3fc',
        shadow: 'rgba(14, 165, 233, 0.3)',
      },
      passionate: {
        primary: '#dc2626',
        secondary: '#ef4444',
        accent: '#f97316',
        background: '#fef2f2',
        foreground: '#7f1d1d',
        glassLight: 'rgba(220, 38, 38, 0.1)',
        glassDark: 'rgba(220, 38, 38, 0.2)',
        highlight: '#fbbf24',
        shadow: 'rgba(220, 38, 38, 0.3)',
      },
      peaceful: {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#06b6d4',
        background: '#f0fdf4',
        foreground: '#134e4a',
        glassLight: 'rgba(16, 185, 129, 0.1)',
        glassDark: 'rgba(16, 185, 129, 0.2)',
        highlight: '#86efac',
        shadow: 'rgba(16, 185, 129, 0.3)',
      },
    };

    return themes[mood as keyof typeof themes] || themes.calm;
  }
}
