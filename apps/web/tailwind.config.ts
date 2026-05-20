import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#8B6914',
          light: '#A07820',
          dark: '#6B4F0A',
          50: '#FDF8EC',
          100: '#F7EDD0',
          200: '#EDD99A',
          300: '#D4AE50',
          400: '#C19A38',
          500: '#8B6914',
          600: '#6B4F0A',
          700: '#4F3A07',
          800: '#342605',
          900: '#1A1302',
        },
        cream: '#FAF6EE',
        'cream-dark': '#F0E8D8',
      },
    },
  },
  plugins: [],
};

export default config;
