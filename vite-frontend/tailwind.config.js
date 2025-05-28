/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ], theme: {
    extend: {
      colors: {
        'primary': '#3B82F6', // Blue-500 của Tailwind
        'primary-dark': '#2563EB', // Blue-600
        'background': '#FFFFFF', // Trắng
        'card': '#F9FAFB', // Gray-50
        'text-main': '#1F2937', // Gray-800
        'text-secondary': '#6B7280', // Gray-500
        // New colors for sidebar redesign
        'sidebar-bg': '#3B82F6',
        'sidebar-hover': '#2563EB',
        'sidebar-active': '#FFFFFF',
        'sidebar-text': '#FFFFFF',
        'sidebar-icon': '#FFFFFF',
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
}

