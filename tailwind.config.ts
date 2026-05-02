import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        danger: '#DC2626',
        warning: '#EA580C',
        success: '#16A34A',
      },
      minHeight: {
        touch: '48px',
      },
    },
  },
  plugins: [],
}

export default config
