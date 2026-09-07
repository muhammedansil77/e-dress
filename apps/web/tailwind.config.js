/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF8',  // Cards & tables
          100: '#F7F1E7', // Main background
          200: '#EFE5D5', // Soft containers
          300: '#E8D5B5', // Highlight / Badges
          400: '#DED2C2', // Borders
        },
        coffee: {
          900: '#2F241D', // Main text
          800: '#432C1D', // Primary hover
          700: '#5A3E2B', // Primary dark brown
          600: '#806F61', // Secondary text
          500: '#9B8777',
        },
        gold: {
          100: '#FAF4E8',
          200: '#F3E5C8',
          400: '#C9A35E',
          500: '#B58B45', // Gold accent
          600: '#9E7432',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
