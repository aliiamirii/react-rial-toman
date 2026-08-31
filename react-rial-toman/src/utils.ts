export type InputSize = 'sm' | 'md' | 'lg';
export type ColorToken = 'primary' | 'success' | 'danger' | 'neutral';

/** Joins truthy class names together, skipping falsy values. No Tailwind dependency required. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

const COLOR_PRESETS: Record<ColorToken, { color: string; ring: string }> = {
  primary: { color: '#6366f1', ring: 'rgba(99, 102, 241, 0.15)' },
  success: { color: '#16a34a', ring: 'rgba(22, 163, 74, 0.15)' },
  danger: { color: '#dc2626', ring: 'rgba(220, 38, 38, 0.15)' },
  neutral: { color: '#6b7280', ring: 'rgba(107, 114, 128, 0.15)' },
};

/**
 * Resolves a `color` prop into CSS custom-property values.
 * Accepts a known token ("primary" | "success" | "danger" | "neutral") or
 * any raw CSS color string (hex, rgb(), a CSS variable, etc.) for full
 * theming control without requiring a fixed palette.
 */
export function resolveColor(color?: string): { '--rrt-color': string; '--rrt-ring': string } {
  if (!color) {
    return { '--rrt-color': COLOR_PRESETS.primary.color, '--rrt-ring': COLOR_PRESETS.primary.ring };
  }
  const preset = COLOR_PRESETS[color as ColorToken];
  if (preset) {
    return { '--rrt-color': preset.color, '--rrt-ring': preset.ring };
  }
  // Arbitrary color string (e.g. "#ff6600", "rgb(0,150,80)"): use it directly,
  // and derive a soft focus ring from it via color-mix (modern browsers;
  // degrades gracefully to no ring on older ones).
  return {
    '--rrt-color': color,
    '--rrt-ring': `color-mix(in srgb, ${color} 15%, transparent)`,
  };
}
