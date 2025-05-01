/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50: '#F5F4FF',
          100: '#E0DEFF',
          200: '#C1BDFF',
          300: '#A29CFF',
          400: '#847BFF',
          500: '#6C63FF',
          600: '#5046FF',
          700: '#3930E5',
          800: '#2820B8',
          900: '#1F1A94',
        },
        dark: {
          DEFAULT: '#0F0F23',
          50: '#f5f5f8',
          100: '#e5e5eb',
          200: '#c8c8d2',
          300: '#a4a4b2',
          400: '#818191',
          500: '#666675',
          600: '#51515D',
          700: '#3D3D47',
          800: '#292931',
          900: '#0F0F23',
          950: '#070714',
        },
        accent: {
          DEFAULT: '#FF5470',
          light: '#FF8FA3',
          dark: '#E63E5C',
        },
        editor: {
          bg: '#0A0A1B',
          line: '#1E1E3F',
          text: '#A9B7C6',
          keyword: '#CC7832',
          string: '#6A8759',
          number: '#6897BB',
          comment: '#808080',
          tag: '#FFC66D',
          attribute: '#9876AA',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(108, 99, 255, 0.4)',
        'accent-glow': '0 0 15px rgba(255, 84, 112, 0.35)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class',
}