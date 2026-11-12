/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F1E8',
          50: '#FDFCFA',
          100: '#FAF8F3',
          200: '#F5F1E8',
          300: '#EAE2D2',
          400: '#DED2BC',
        },
        charcoal: {
          DEFAULT: '#171717',
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#555555',
          600: '#333333',
          700: '#222222',
          800: '#171717',
          900: '#0F0F0F',
        },
        accent: {
          DEFAULT: '#C99738', // warm vintage brass/gold accent for collectibles
          light: '#DFC17B',
          dark: '#A67722',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 23, 23, 0.05)',
        'card': '0 10px 30px -5px rgba(23, 23, 23, 0.08)',
        'lift': '0 20px 40px -10px rgba(23, 23, 23, 0.12)',
      }
    },
  },
  plugins: [],
}

