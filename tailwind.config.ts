import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        'gama-sans': ['Gama Sans', 'sans-serif'],
        'gama-serif': ['Gama Serif', 'serif'],
      },
      colors: {
        'ugm-blue': '#003d7a',
        'ugm-blue-soft': '#0066cc',
        'ugm-yellow': '#ffc107',
        'ugm-bg-light': '#f8f9fa',
        'ugm-main': '#1a202c',
        'ugm-muted': '#718096',
        'ugm-light': '#e2e8f0',
        'ugm-border-subtle': '#e2e8f0',
        'ugm-bg-subtle': '#f7fafc',
      },
    },
  },
  plugins: [],
} satisfies Config
