/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        emerald: 'rgb(var(--color-emerald) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        sand: 'rgb(var(--color-sand) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
        data: ['Space Grotesk', 'monospace'],
      },
      borderRadius: {
        xl2: '1.5rem',
        xl3: '1.875rem',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(4, 10, 18, 0.22)',
      },
      backgroundImage: {
        'aurora-shell':
          'radial-gradient(circle at top left, rgba(16, 185, 129, 0.22), transparent 38%), radial-gradient(circle at top right, rgba(234, 179, 8, 0.12), transparent 32%), linear-gradient(180deg, rgba(4, 10, 18, 0.98), rgba(7, 20, 28, 0.98))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -8px, 0)' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        reveal: 'reveal 0.7s ease both',
      },
    },
  },
  plugins: [],
};