import type { Config } from 'tailwindcss';

// Design tokens extracted directly from the original Bloom mobile mockup —
// not invented. See project docs for the full token rationale.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary purple — buttons, active states, accents
        bloom: {
          50: '#F5F1FA',
          100: '#E9E1F2', // header/hero background lavender
          200: '#D4C4E8',
          400: '#9B7BC0',
          500: '#6B4E9E', // primary
          600: '#5A4085',
          700: '#48336B',
        },
        gold: {
          400: '#F5C518', // ratings/stars
        },
      },
      fontFamily: {
        // Rounded, friendly — matches the "bloom app" wordmark
        display: ['var(--font-baloo)', 'sans-serif'],
        // Clean, readable — body text and UI labels
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        button: '9999px', // pill-shaped buttons, matching mockup
      },
    },
  },
  plugins: [],
};

export default config;
