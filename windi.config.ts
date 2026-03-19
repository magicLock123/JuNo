import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['src/**/*.{vue,html,jsx,tsx}'],
  },
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand-main)', 
          light: 'var(--brand-light)',
          min: '#c4c4c4',
          dark: '#303133',
        },
      },
    },
  },
})