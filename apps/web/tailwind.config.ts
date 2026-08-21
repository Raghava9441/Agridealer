import type { Config } from 'tailwindcss'

/**
 * Colours/spacing/radius are CSS custom properties (styles/tailwind.css);
 * Tailwind just maps to them. Per-tenant branding becomes a runtime
 * variable override rather than a rebuild (docs §5.6.1).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: 'hsl(var(--color-brand) / <alpha-value>)',
        'brand-fg': 'hsl(var(--color-brand-fg) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        danger: 'hsl(var(--color-danger) / <alpha-value>)',
        // Registers the `text-foreground`/`text-muted-foreground` classes already used throughout the app —
        // they previously resolved to no CSS rule at all since these tokens were never defined (see tailwind.css).
        foreground: 'hsl(var(--color-text) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--color-text-muted) / <alpha-value>)',
      },
      borderRadius: { DEFAULT: 'var(--radius)' },
      fontFamily: { sans: 'var(--font-ui)' },
    },
  },
  plugins: [],
} satisfies Config
