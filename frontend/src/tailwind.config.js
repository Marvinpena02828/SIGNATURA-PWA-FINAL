/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'signatura-red': '#FF2D55',
        'signatura-accent': '#FF6B9D',
        'signatura-dark': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        blob: 'blob 7s infinite',
        'blob-slow': 'blob 9s infinite',
        shimmer: 'shimmer 2s infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-50px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(255, 45, 85, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(255, 45, 85, 0)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 45, 85, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 45, 85, 0.4)',
      },
      backdropFilter: {
        none: 'none',
        blur: 'blur(10px)',
      },
      transitionDuration: {
        350: '350ms',
      },
    },
  },
  plugins: [],
}
