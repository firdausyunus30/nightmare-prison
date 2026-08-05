/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forest / full-moon night palette (werewolf village)
        moon: {
          darkest: '#06080d',
          dark: '#0c1118',
          mist: '#141c26',
          bark: '#1c2733',
          metal: '#141c26',
          iron: '#1c2733',
          blood: '#7f1d1d',
          danger: '#dc2626',
          accent: '#ef4444',
          safe: '#34d399',
          investigate: '#60a5fa',
          silver: '#9db0c7',
        },
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
        },
      },
    },
  },
  plugins: [],
}
