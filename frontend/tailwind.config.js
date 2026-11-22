/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        matte: {
          950: '#0B0B0C',
          900: '#131316',
          800: '#1C1C21',
          700: '#27272E',
        },
        marble: {
          50: '#FAF9F6',
          100: '#F3F0EA',
          200: '#E7E2D8',
          300: '#D4CEC1',
        },
        walnut: {
          950: '#1C120C',
          900: '#2C1B12',
          800: '#42281A',
          600: '#6E4730',
        },
        gold: {
          300: '#F0DCB3',
          400: '#D9B978',
          500: '#C59B4B',
          600: '#9F7A33',
        },
        navy: {
          950: '#09111E',
          900: '#0F1A2B',
        },
        teal: {
          950: '#0B2220',
          900: '#11322F',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
