/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        bg:      '#0B0B0B',
        surface: '#141414',
        card:    '#1A1A1A',
        border:  '#2A2A2A',
        cream:   '#F5E6D3',
        muted:   '#A1A1AA',
        accent:  '#D6B98C',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        pulse2: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.4' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease forwards',
        float:     'float 4s ease-in-out infinite',
        pulse2:    'pulse2 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
