/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f2942',
          blue: '#1e3a8a',
          lightBlue: '#3b82f6',
          slate: '#f8fafc',
          card: '#ffffff',
          dark: '#0f172a',
          emerald: '#059669',
          green: '#10b981',
          gold: '#d97706',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
