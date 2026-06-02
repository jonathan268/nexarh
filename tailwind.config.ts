import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './electron/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surfaceElevated: 'var(--surface-elevated)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        primaryLight: 'var(--primary-light)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        accentHover: 'var(--accent-hover)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(13 148 136 / 0.08), 0 1px 2px -1px rgb(13 148 136 / 0.06)',
        elevated: '0 4px 6px -1px rgb(13 148 136 / 0.1), 0 2px 4px -2px rgb(13 148 136 / 0.05)',
        dialog: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }
    }
  },
  plugins: []
}

export default config
