/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        accent: '#f59e0b',
        surface: '#0f172a',
        panel: '#1e293b',
        border: '#334155'
      }
    }
  },
  plugins: []
};
