// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include both admin and employee folders
    "./src/admin/**/*.{js,ts,jsx,tsx}",
    "./src/employee/**/*.{js,ts,jsx,tsx}",
    "./src/shared/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Admin theme colors
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#2ecc71',
          600: '#1a9e52',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#0b3b0f',
        },
        secondary: {
          50: '#f5f5f5',
          100: '#eeeeee',
          200: '#e0e0e0',
          300: '#bdbdbd',
          400: '#9e9e9e',
          500: '#757575',
          600: '#616161',
          700: '#424242',
          800: '#212121',
          900: '#121212',
        },
        // Employee theme colors
        'primary-dark': '#1a9e52',
        'primary-light': '#d4f7e4',
        'danger': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db',
        'purple': '#9b59b6',
        'yellow': '#f1c40f',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '18px',
        'lg': '10px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 12px 32px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'slide-up': 'slideUp 0.2s ease',
      },
      keyframes: {
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}