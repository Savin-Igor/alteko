import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  corePlugins: {
    // Payload CMS has its own CSS design system and breaks when Tailwind's
    // Preflight reset is applied globally (Next.js CSS is not route-scoped).
    preflight: false,
  },
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          dark: '#1D4ED8',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        },
        warning: {
          DEFAULT: '#EA580C',
          light: '#FFF7ED',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#F0FDF4',
        },
      },
      minHeight: {
        touch: '48px',
      },
      fontSize: {
        'metric-xl': ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'metric-lg': ['1.875rem', { lineHeight: '1.1', fontWeight: '700' }],
        metric: ['1.5rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
    },
  },
}

export default config
