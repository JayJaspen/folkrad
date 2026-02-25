import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
        },
        gold: {
          DEFAULT: '#c9a961',
          dark: '#b8956a',
        },
        light: {
          bg: '#f8fafc',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'strong': '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
export default config
