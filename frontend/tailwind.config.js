/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        purple: {
          50: 'rgba(var(--accent-primary-rgb), 0.1)',
          100: 'rgba(var(--accent-primary-rgb), 0.15)',
          200: 'rgba(var(--accent-primary-rgb), 0.25)',
          300: 'rgba(var(--accent-primary-rgb), 0.4)',
          400: 'rgba(var(--accent-primary-rgb), 0.6)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-primary)',
          700: 'var(--accent-primary-hover)',
          800: 'var(--accent-primary-hover)',
          950: 'rgba(var(--accent-primary-rgb), 0.1)',
        },
        primary: {
          50: 'rgba(var(--accent-primary-rgb), 0.1)',
          600: 'var(--accent-primary)',
          700: 'var(--accent-primary-hover)',
        },
        pink: {
          400: 'var(--accent-primary)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-primary)',
          700: 'var(--accent-primary-hover)',
        },
        indigo: {
          500: 'var(--accent-primary)',
          600: 'var(--accent-primary-hover)',
        },
        rose: {
          500: 'var(--accent-primary)',
        },
        emerald: {
          500: 'var(--accent-primary)',
          600: 'var(--accent-primary)',
          700: 'var(--accent-primary-hover)',
        },
        cyan: {
          400: 'var(--accent-primary)',
          600: 'var(--accent-primary)',
        },
        yellow: {
          600: 'var(--accent-primary)',
        },
        red: {
          600: 'var(--accent-primary)',
        },
        blue: {
          50: 'rgba(var(--hydration-accent-rgb), 0.1)',
          100: 'rgba(var(--hydration-accent-rgb), 0.15)',
          600: 'var(--hydration-accent)',
          700: 'var(--hydration-accent)',
          800: 'var(--hydration-accent)',
          900: 'rgba(var(--hydration-accent-rgb), 0.3)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};
