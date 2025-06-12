/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#0a0a0f',
          purple: '#6366f1', 
          gold: '#fbbf24',
          blue: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}
