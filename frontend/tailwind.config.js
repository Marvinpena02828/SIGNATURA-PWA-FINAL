/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'signatura-red': '#E63946',      // Main brand red
        'signatura-dark': '#1F2937',     // Dark gray for text
        'signatura-light': '#F8F9FA',    // Light background
        'signatura-accent': '#DC143C',   // Darker red for hover
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
