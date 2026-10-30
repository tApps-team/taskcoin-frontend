import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // The palette of the promo landing, which is the source of truth for
        // the brand. Light, warm, green — chosen to read as a serious money
        // service rather than a game.
        //
        // Contrast matters here: `green` and `brown` clear 4.5:1 on white and
        // are safe for text, while `grass`, `tint`, `sand` and `stone` do not
        // and exist only as fills, borders and gradient partners.
        brand: {
          green: '#367A26',
          greenDeep: '#275C1B',
          grass: '#67A83F',
          tint: '#E9F1E3',
          sand: '#F3E9DC',
          beige: '#F4F2EE',
          brown: '#7B5234',
          stone: '#CFC9C0',
        },
        // The one ink the whole interface is written in. Tinted overlays are
        // built from it (bg-ink/5, border-ink/10) so nothing is pure black.
        ink: '#1D1B18',
      },
      fontFamily: {
        sans: ['Onest', 'Golos Text', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        hand: ['Caveat', 'Segoe Print', 'Bradley Hand', 'cursive'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl2: 'calc(var(--radius) + 6px)',
      },
      boxShadow: {
        // Soft lift instead of the old neon glow: on a light surface a glow
        // reads as a smudge, while a shadow reads as depth.
        card: '0 1px 2px rgba(29, 27, 24, .04), 0 8px 24px -12px rgba(29, 27, 24, .14)',
        lift: '0 2px 6px rgba(29, 27, 24, .06), 0 18px 40px -20px rgba(29, 27, 24, .22)',
        glow: '0 10px 28px -12px rgba(54, 122, 38, .45)',
        'glow-teal': '0 10px 28px -12px rgba(54, 122, 38, .35)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
}
