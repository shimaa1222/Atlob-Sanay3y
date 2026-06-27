module.exports = {
  darkMode: 'class', // ⚠️ لازم تكون 'class' مش 'media'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          100: '#dbeafe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        light: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
          border: '#e2e8f0',
        },
        dark: {
          DEFAULT: '#f1f5f9',
          muted: '#94a3b8',
          accent: '#334155',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
}