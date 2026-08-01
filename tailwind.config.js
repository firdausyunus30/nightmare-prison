/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prison: {
          darkest: '#09090b', // Zinc 950
          dark: '#121214',
          metal: '#1e1e24',
          iron: '#2d2d34',
          blood: '#7f1d1d', // Dark red
          danger: '#dc2626', // Bright red
          accent: '#ef4444',
          safe: '#10b981', // Emerald 500
          investigate: '#3b82f6', // Blue 500
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'alarm': 'alarm-glow 2s ease-in-out infinite',
        'flicker': 'flicker-anim 1.5s infinite alternate',
        'heartbeat': 'heartbeat-anim 1.2s infinite',
      },
      keyframes: {
        'alarm-glow': {
          '0%, 100%': { backgroundColor: 'rgba(127, 29, 29, 0.1)', borderColor: 'rgba(220, 38, 38, 0.2)' },
          '50%': { backgroundColor: 'rgba(127, 29, 29, 0.4)', borderColor: 'rgba(220, 38, 38, 0.8)' },
        },
        'flicker-anim': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: 0.99 },
          '20%, 24%, 55%': { opacity: 0.4 },
          '22%': { opacity: 0.1 },
        },
        'heartbeat-anim': {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.12)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
