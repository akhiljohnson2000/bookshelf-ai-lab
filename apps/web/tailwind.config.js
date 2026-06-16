/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FBF7EF',
          dark: '#F1E7D6',
        },
        brown: {
          light: '#A47551',
          DEFAULT: '#6F4E37',
          dark: '#4E3629',
        },
        forest: {
          light: '#3E7D6A',
          DEFAULT: '#2F5D50',
          dark: '#234A40',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
