/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        harvest: {
          DEFAULT: '#2E5C3E',
          dark: '#1f4129',
          light: '#e8f0ea'
        }
      }
    }
  },
  plugins: []
}
